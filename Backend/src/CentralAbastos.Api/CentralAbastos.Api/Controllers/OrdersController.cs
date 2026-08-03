using System.Security.Claims;
using CentralAbastos.Api.Authorization;
using CentralAbastos.Api.Controllers.Dtos;
using CentralAbastos.Api.Data;
using CentralAbastos.Api.Domain;
using CentralAbastos.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CentralAbastos.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public OrdersController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [Authorize(Roles = RoleNames.AdminOrWarehouse)]
    public async Task<ActionResult<IEnumerable<OrderResponseDto>>> GetOrders()
    {
        var orders = await ProjectOrders(_context.Orders)
            .OrderByDescending(order => order.OrderDate)
            .ToListAsync();

        return Ok(orders);
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = RoleNames.AllOperationalRoles)]
    public async Task<ActionResult<OrderResponseDto>> GetOrder(int id)
    {
        var accessData = await _context.Orders
            .Where(order => order.Id == id)
            .Select(order => new
            {
                order.CreatedByUserId,
                DriverId = order.AssignedTruck != null ? order.AssignedTruck.DriverId : null
            })
            .FirstOrDefaultAsync();

        if (accessData is null)
        {
            return NotFound("Orden no encontrada.");
        }

        var role = User.FindFirstValue(ClaimTypes.Role);
        var currentUserId = GetCurrentUserId();

        if (RoleNames.IsOrderTaker(role) &&
            (currentUserId is null || accessData.CreatedByUserId != currentUserId.Value))
        {
            return Forbid();
        }

        if (RoleNames.IsDriver(role) &&
            (currentUserId is null || accessData.DriverId != currentUserId.Value))
        {
            return Forbid();
        }

        var order = await ProjectOrders(_context.Orders.Where(item => item.Id == id))
            .FirstAsync();

        return Ok(order);
    }

    [HttpGet("mine")]
    [Authorize(Roles = RoleNames.AdminOrOrderTaker)]
    public async Task<ActionResult<IEnumerable<OrderResponseDto>>> GetMyOrders()
    {
        var userId = GetCurrentUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var orders = await ProjectOrders(
                _context.Orders.Where(order => order.CreatedByUserId == userId.Value))
            .OrderByDescending(order => order.OrderDate)
            .ToListAsync();

        return Ok(orders);
    }

    [HttpGet("warehouse")]
    [Authorize(Roles = RoleNames.AdminOrWarehouse)]
    public async Task<ActionResult<IEnumerable<OrderResponseDto>>> GetWarehouseQueue()
    {
        var warehouseStatuses = new[]
        {
            OrderStatuses.Pending,
            OrderStatuses.Confirmed,
            OrderStatuses.Preparing,
            OrderStatuses.ReadyForDispatch
        };

        var orders = await ProjectOrders(
                _context.Orders.Where(order => warehouseStatuses.Contains(order.Status)))
            .OrderBy(order => order.OrderDate)
            .ToListAsync();

        return Ok(orders);
    }

    [HttpGet("driver-dashboard")]
    [Authorize(Roles = RoleNames.AdminOrDriver)]
    public async Task<ActionResult<DriverDashboardDto>> GetDriverDashboard([FromQuery] int? driverId = null)
    {
        var currentUserId = GetCurrentUserId();
        if (currentUserId is null)
        {
            return Unauthorized();
        }

        var role = User.FindFirstValue(ClaimTypes.Role);
        var targetDriverId = RoleNames.IsAdmin(role) && driverId.HasValue
            ? driverId.Value
            : currentUserId.Value;

        var driver = await _context.Users
            .Include(user => user.Role)
            .FirstOrDefaultAsync(user => user.Id == targetDriverId);

        if (driver?.Role is null || !RoleNames.IsDriver(driver.Role.Name))
        {
            return NotFound(new { message = "El usuario no está registrado con el rol Chofer." });
        }

        var truck = await _context.Trucks
            .AsNoTracking()
            .FirstOrDefaultAsync(item => item.DriverId == targetDriverId && item.IsActive);

        if (truck is null)
        {
            return NotFound(new { message = "No tienes un camión activo asignado." });
        }

        var orders = await ProjectOrders(
                _context.Orders.Where(order =>
                    order.AssignedTruckId == truck.Id &&
                    order.Status != OrderStatuses.Cancelled))
            .OrderBy(order => order.Status == OrderStatuses.Delivered)
            .ThenBy(order => order.OrderDate)
            .Take(50)
            .ToListAsync();

        return Ok(new DriverDashboardDto
        {
            Truck = new DriverTruckDto
            {
                Id = truck.Id,
                PlateNumber = truck.PlateNumber,
                Model = truck.Model,
                Year = truck.Year,
                CapacityKg = truck.CapacityKg,
                IsActive = truck.IsActive
            },
            Orders = orders
        });
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = RoleNames.AdminOrOrderTaker)]
    public async Task<IActionResult> PutOrder(int id, OrderUpdateDto dto)
    {
        var order = await _context.Orders
            .Include(item => item.Items)
            .FirstOrDefaultAsync(item => item.Id == id);

        if (order is null)
        {
            return NotFound("Orden no encontrada.");
        }

        var role = User.FindFirstValue(ClaimTypes.Role);
        var currentUserId = GetCurrentUserId();
        if (RoleNames.IsOrderTaker(role) &&
            (currentUserId is null ||
             order.CreatedByUserId != currentUserId.Value ||
             (OrderStatuses.Normalize(order.Status) ?? order.Status) != OrderStatuses.Pending))
        {
            return Forbid();
        }

        if (!string.IsNullOrWhiteSpace(dto.DeliveryAddress))
        {
            order.DeliveryAddress = dto.DeliveryAddress.Trim();
        }

        order.DeliveryLatitude = dto.DeliveryLatitude ?? order.DeliveryLatitude;
        order.DeliveryLongitude = dto.DeliveryLongitude ?? order.DeliveryLongitude;
        if (dto.Notes is not null)
        {
            order.Notes = string.IsNullOrWhiteSpace(dto.Notes) ? null : dto.Notes.Trim();
        }

        if (dto.Items is not null)
        {
            var productIds = dto.Items.Select(item => item.ProductId).Distinct().ToList();
            var products = await _context.Products
                .Where(product => productIds.Contains(product.Id) && product.IsActive)
                .ToDictionaryAsync(product => product.Id);

            if (products.Count != productIds.Count)
            {
                return BadRequest(new { message = "Uno o más productos no existen o están inactivos." });
            }

            _context.OrderItems.RemoveRange(order.Items);
            order.Items = dto.Items.Select(item => new OrderItem
            {
                ProductId = item.ProductId,
                Quantity = item.Quantity,
                UnitPrice = products[item.ProductId].Price
            }).ToList();
        }

        order.TotalAmount = order.Items.Sum(item => item.Quantity * item.UnitPrice);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost]
    [Authorize(Roles = RoleNames.AdminOrOrderTaker)]
    public async Task<ActionResult<OrderResponseDto>> PostOrder(OrderCreateDto dto)
    {
        var currentUserId = GetCurrentUserId();
        if (currentUserId is null)
        {
            return Unauthorized();
        }

        var role = User.FindFirstValue(ClaimTypes.Role);
        var creatorId = RoleNames.IsAdmin(role) && dto.CreatedByUserId.HasValue
            ? dto.CreatedByUserId.Value
            : currentUserId.Value;

        var clientExists = await _context.Clients.AnyAsync(client =>
            client.Id == dto.ClientId && client.IsActive);
        if (!clientExists)
        {
            return BadRequest(new { message = $"El cliente con ID {dto.ClientId} no existe o está inactivo." });
        }

        var userExists = await _context.Users.AnyAsync(user => user.Id == creatorId);
        if (!userExists)
        {
            return BadRequest(new { message = "El usuario que crea la orden no existe." });
        }

        var productIds = dto.Items.Select(item => item.ProductId).Distinct().ToList();
        var products = await _context.Products
            .Where(product => productIds.Contains(product.Id) && product.IsActive)
            .ToDictionaryAsync(product => product.Id);

        if (products.Count != productIds.Count)
        {
            return BadRequest(new { message = "Uno o más productos no existen o están inactivos." });
        }

        var order = new Order
        {
            ClientId = dto.ClientId,
            CreatedByUserId = creatorId,
            DeliveryAddress = dto.DeliveryAddress.Trim(),
            DeliveryLatitude = dto.DeliveryLatitude,
            DeliveryLongitude = dto.DeliveryLongitude,
            Notes = string.IsNullOrWhiteSpace(dto.Notes) ? null : dto.Notes.Trim(),
            OrderDate = DateTime.UtcNow,
            Status = OrderStatuses.Pending,
            Items = dto.Items.Select(item => new OrderItem
            {
                ProductId = item.ProductId,
                Quantity = item.Quantity,
                UnitPrice = products[item.ProductId].Price
            }).ToList()
        };

        order.TotalAmount = order.Items.Sum(item => item.Quantity * item.UnitPrice);

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        var response = await ProjectOrders(_context.Orders.Where(item => item.Id == order.Id))
            .FirstAsync();

        return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, response);
    }

    [HttpPatch("{id:int}/status")]
    [Authorize(Roles = RoleNames.AllOperationalRoles)]
    public async Task<IActionResult> UpdateOrderStatus(int id, OrderStatusUpdateDto dto)
    {
        var nextStatus = OrderStatuses.Normalize(dto.Status);
        if (nextStatus is null)
        {
            return BadRequest(new { message = "El estatus solicitado no es válido." });
        }

        var order = await _context.Orders
            .Include(item => item.Items)
                .ThenInclude(item => item.Product)
            .Include(item => item.AssignedTruck)
            .FirstOrDefaultAsync(item => item.Id == id);

        if (order is null)
        {
            return NotFound(new { message = "Orden no encontrada." });
        }

        var role = User.FindFirstValue(ClaimTypes.Role);
        var currentUserId = GetCurrentUserId();

        if (RoleNames.IsDriver(role))
        {
            if (currentUserId is null || order.AssignedTruck?.DriverId != currentUserId.Value)
            {
                return Forbid();
            }

            if (!IsValidDriverTransition(order.Status, nextStatus))
            {
                return BadRequest(new { message = "El chofer no puede realizar ese cambio de estatus." });
            }
        }
        else if (RoleNames.IsWarehouse(role))
        {
            if (!IsValidWarehouseTransition(order.Status, nextStatus))
            {
                return BadRequest(new { message = "La transición solicitada no corresponde al flujo de bodega." });
            }
        }
        else if (RoleNames.IsOrderTaker(role))
        {
            var currentStatus = OrderStatuses.Normalize(order.Status) ?? order.Status;
            if (currentUserId is null ||
                order.CreatedByUserId != currentUserId.Value ||
                nextStatus != OrderStatuses.Cancelled ||
                currentStatus != OrderStatuses.Pending)
            {
                return Forbid();
            }
        }
        else if (!RoleNames.IsAdmin(role))
        {
            return Forbid();
        }

        if (nextStatus == OrderStatuses.OutForDelivery && order.AssignedTruckId is null)
        {
            return BadRequest(new { message = "La orden necesita un camión asignado antes de iniciar la entrega." });
        }

        if (nextStatus == OrderStatuses.ReadyForDispatch &&
            !string.Equals(order.Status, OrderStatuses.ReadyForDispatch, StringComparison.OrdinalIgnoreCase))
        {
            var insufficientItems = order.Items
                .Where(item => item.Product.Stock < item.Quantity)
                .Select(item => $"{item.Product.Name} (existencia {item.Product.Stock}, solicitado {item.Quantity})")
                .ToList();

            if (insufficientItems.Count > 0)
            {
                return BadRequest(new
                {
                    message = "No hay existencia suficiente para liberar el pedido.",
                    products = insufficientItems
                });
            }

            foreach (var item in order.Items)
            {
                item.Product.Stock -= item.Quantity;
            }
        }

        order.Status = nextStatus;
        await _context.SaveChangesAsync();

        return Ok(new { order.Id, order.Status });
    }

    [HttpGet("routes/{driverId:int}")]
    [Authorize(Roles = RoleNames.AdminOrDriver)]
    public async Task<ActionResult<IEnumerable<object>>> GetRoutesForDriver(int driverId)
    {
        var role = User.FindFirstValue(ClaimTypes.Role);
        var currentUserId = GetCurrentUserId();
        if (RoleNames.IsDriver(role) &&
            (currentUserId is null || currentUserId.Value != driverId))
        {
            return Forbid();
        }

        var user = await _context.Users
            .Include(item => item.Role)
            .FirstOrDefaultAsync(item => item.Id == driverId);

        if (user?.Role is null || !RoleNames.IsDriver(user.Role.Name))
        {
            return NotFound(new { message = $"El usuario con ID {driverId} no es un chofer." });
        }

        var truck = await _context.Trucks.FirstOrDefaultAsync(item => item.DriverId == driverId && item.IsActive);
        if (truck is null)
        {
            return NotFound(new { message = $"No hay un camión asignado al chofer con ID {driverId}." });
        }

        var orders = await _context.Orders
            .Where(order => order.AssignedTruckId == truck.Id &&
                (order.Status == OrderStatuses.ReadyForDispatch ||
                 order.Status == OrderStatuses.OutForDelivery))
            .Select(order => new
            {
                orderId = order.Id,
                deliveryAddress = order.DeliveryAddress,
                latitude = order.DeliveryLatitude,
                longitude = order.DeliveryLongitude,
                customerName = order.Client.Name,
                orderDate = order.OrderDate,
                status = order.Status
            })
            .ToListAsync();

        return Ok(orders);
    }

    [HttpPut("{id:int}/assign-truck")]
    [Authorize(Roles = RoleNames.AdminOrWarehouse)]
    public async Task<IActionResult> AssignTruckToOrder(int id, [FromQuery] int truckId)
    {
        var order = await _context.Orders.FindAsync(id);
        if (order is null)
        {
            return NotFound(new { message = "Orden no encontrada." });
        }

        var currentStatus = OrderStatuses.Normalize(order.Status) ?? order.Status;
        if (currentStatus == OrderStatuses.Delivered || currentStatus == OrderStatuses.Cancelled)
        {
            return BadRequest(new { message = "No se puede asignar una unidad a un pedido cerrado." });
        }

        var truck = await _context.Trucks.FirstOrDefaultAsync(item => item.Id == truckId && item.IsActive);
        if (truck is null)
        {
            return BadRequest(new { message = "El camión no existe o está inactivo." });
        }

        if (truck.DriverId is null)
        {
            return BadRequest(new { message = "El camión debe tener un chofer asignado." });
        }

        order.AssignedTruckId = truckId;
        await _context.SaveChangesAsync();

        return Ok(new { order.Id, order.AssignedTruckId, order.Status });
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = RoleNames.Admin)]
    public async Task<IActionResult> DeleteOrder(int id)
    {
        var order = await _context.Orders.FindAsync(id);
        if (order is null)
        {
            return NotFound("Orden no encontrada.");
        }

        _context.Orders.Remove(order);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private int? GetCurrentUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(claim, out var userId) ? userId : null;
    }

    private static bool IsValidWarehouseTransition(string currentStatus, string nextStatus)
    {
        var current = OrderStatuses.Normalize(currentStatus) ?? currentStatus;

        return (current, nextStatus) switch
        {
            (OrderStatuses.Pending, OrderStatuses.Confirmed) => true,
            (OrderStatuses.Pending, OrderStatuses.Cancelled) => true,
            (OrderStatuses.Confirmed, OrderStatuses.Preparing) => true,
            (OrderStatuses.Confirmed, OrderStatuses.Cancelled) => true,
            (OrderStatuses.Preparing, OrderStatuses.ReadyForDispatch) => true,
            (OrderStatuses.Preparing, OrderStatuses.Cancelled) => true,
            _ => false
        };
    }

    private static bool IsValidDriverTransition(string currentStatus, string nextStatus)
    {
        var current = OrderStatuses.Normalize(currentStatus) ?? currentStatus;

        return (current, nextStatus) switch
        {
            (OrderStatuses.ReadyForDispatch, OrderStatuses.OutForDelivery) => true,
            (OrderStatuses.DeliveryFailed, OrderStatuses.OutForDelivery) => true,
            (OrderStatuses.OutForDelivery, OrderStatuses.Delivered) => true,
            (OrderStatuses.OutForDelivery, OrderStatuses.DeliveryFailed) => true,
            _ => false
        };
    }

    private static IQueryable<OrderResponseDto> ProjectOrders(IQueryable<Order> query)
    {
        return query.Select(order => new OrderResponseDto
        {
            Id = order.Id,
            ClientId = order.ClientId,
            ClientName = order.Client.Name,
            OrderDate = order.OrderDate,
            Status = order.Status,
            TotalAmount = order.TotalAmount,
            AssignedTruckId = order.AssignedTruckId,
            TruckPlateNumber = order.AssignedTruck != null ? order.AssignedTruck.PlateNumber : null,
            CreatedByUserId = order.CreatedByUserId,
            CreatedByUsername = order.CreatedByUser.Username,
            DeliveryAddress = order.DeliveryAddress,
            DeliveryLatitude = order.DeliveryLatitude,
            DeliveryLongitude = order.DeliveryLongitude,
            Notes = order.Notes,
            Items = order.Items.Select(item => new OrderItemResponseDto
            {
                Id = item.Id,
                ProductId = item.ProductId,
                ProductName = item.Product.Name,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice
            }).ToList()
        });
    }
}
