using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CentralAbastos.Api.Models;
using CentralAbastos.Api.Data;
using CentralAbastos.Api.Controllers.Dtos;

namespace CentralAbastos.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public OrdersController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Orders
        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrderResponseDto>>> GetOrders()
        {
            var orders = await _context.Orders
                .Select(o => new OrderResponseDto
                {
                    Id = o.Id,
                    ClientId = o.ClientId,
                    ClientName = o.Client != null ? o.Client.Name : string.Empty,
                    OrderDate = o.OrderDate,
                    Status = o.Status,
                    TotalAmount = o.TotalAmount,
                    AssignedTruckId = o.AssignedTruckId,
                    TruckPlateNumber = o.AssignedTruck != null ? o.AssignedTruck.PlateNumber : null,
                    DeliveryAddress = o.DeliveryAddress,
                    DeliveryLatitude = o.DeliveryLatitude,
                    DeliveryLongitude = o.DeliveryLongitude,
                    Items = o.Items.Select(i => new OrderItemResponseDto
                    {
                        Id = i.Id,
                        ProductId = i.ProductId,
                        ProductName = i.Product != null ? i.Product.Name : string.Empty,
                        Quantity = i.Quantity,
                        UnitPrice = i.UnitPrice
                    }).ToList()
                })
                .ToListAsync();

            return Ok(orders);
        }

        // GET: api/Orders/5
        [HttpGet("{id}")]
        public async Task<ActionResult<OrderResponseDto>> GetOrder(int id)
        {
            var order = await _context.Orders
                .Select(o => new OrderResponseDto
                {
                    Id = o.Id,
                    ClientId = o.ClientId,
                    ClientName = o.Client != null ? o.Client.Name : string.Empty,
                    OrderDate = o.OrderDate,
                    Status = o.Status,
                    TotalAmount = o.TotalAmount,
                    AssignedTruckId = o.AssignedTruckId,
                    TruckPlateNumber = o.AssignedTruck != null ? o.AssignedTruck.PlateNumber : null,
                    DeliveryAddress = o.DeliveryAddress,
                    DeliveryLatitude = o.DeliveryLatitude,
                    DeliveryLongitude = o.DeliveryLongitude,
                    Items = o.Items.Select(i => new OrderItemResponseDto
                    {
                        Id = i.Id,
                        ProductId = i.ProductId,
                        ProductName = i.Product != null ? i.Product.Name : string.Empty,
                        Quantity = i.Quantity,
                        UnitPrice = i.UnitPrice
                    }).ToList()
                })
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
            {
                return NotFound();
            }

            return Ok(order);
        }

        // PUT: api/Orders/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutOrder(int id, OrderUpdateDto dto)
        {
            var order = await _context.Orders
                .Include(o => o.Items)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
            {
                return NotFound();
            }

            order.DeliveryAddress = dto.DeliveryAddress;
            order.DeliveryLatitude = dto.DeliveryLatitude;
            order.DeliveryLongitude = dto.DeliveryLongitude;

            if (dto.Items != null)
            {
                _context.OrderItems.RemoveRange(order.Items);

                order.Items = new List<OrderItem>();
                foreach (var itemDto in dto.Items)
                {
                    var productExists = await _context.Products.AnyAsync(p => p.Id == itemDto.ProductId);
                    if (!productExists)
                    {
                        return BadRequest($"El ProductId {itemDto.ProductId} no existe.");
                    }

                    var orderItem = new OrderItem
                    {
                        ProductId = itemDto.ProductId,
                        Quantity = itemDto.Quantity,
                        UnitPrice = itemDto.UnitPrice
                    };

                    order.Items.Add(orderItem);
                }
            }

            order.TotalAmount = order.Items.Sum(oi => oi.Quantity * oi.UnitPrice);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!OrderExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Orders
        [HttpPost]
        public async Task<ActionResult<OrderResponseDto>> PostOrder(OrderCreateDto dto)
        {
            var clientExists = await _context.Clients.AnyAsync(c => c.Id == dto.ClientId);
            if (!clientExists)
            {
                return BadRequest($"El ClientId {dto.ClientId} no existe.");
            }

            if (dto.Items != null)
            {
                foreach (var itemDto in dto.Items)
                {
                    var productExists = await _context.Products.AnyAsync(p => p.Id == itemDto.ProductId);
                    if (!productExists)
                    {
                        return BadRequest($"El ProductId {itemDto.ProductId} no existe.");
                    }
                }
            }

            var order = new Order
            {
                ClientId = dto.ClientId,
                DeliveryAddress = dto.DeliveryAddress,
                DeliveryLatitude = dto.DeliveryLatitude,
                DeliveryLongitude = dto.DeliveryLongitude,
                OrderDate = DateTime.UtcNow,
                Status = "Pending",
                Items = new List<OrderItem>()
            };

            if (dto.Items != null)
            {
                foreach (var itemDto in dto.Items)
                {
                    var orderItem = new OrderItem
                    {
                        ProductId = itemDto.ProductId,
                        Quantity = itemDto.Quantity,
                        UnitPrice = itemDto.UnitPrice
                    };

                    order.Items.Add(orderItem);
                }
            }

            order.TotalAmount = order.Items.Sum(oi => oi.Quantity * oi.UnitPrice);

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            return await GetOrder(order.Id);
        }

        // DELETE: api/Orders/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null)
            {
                return NotFound();
            }

            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/orders/routes/{choferId}
        [HttpGet("routes/{choferId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetRoutesForDriver(int choferId)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == choferId);

            if (user == null || user.Role == null || user.Role.Name != "Chofer")
            {
                return NotFound($"El usuario con ID {choferId} no es un chofer.");
            }

            var truck = await _context.Trucks
                .FirstOrDefaultAsync(t => t.DriverId == choferId);

            if (truck == null)
            {
                return NotFound($"No hay un camión asignado al chofer con ID {choferId}.");
            }

            var orders = await _context.Orders
                .Where(o => o.AssignedTruckId == truck.Id &&
                            (o.Status == "Shipped" || o.Status == "Out for Delivery"))
                .Select(o => new
                {
                    orderId = o.Id,
                    deliveryAddress = o.DeliveryAddress,
                    latitude = o.DeliveryLatitude,
                    longitude = o.DeliveryLongitude,
                    customerName = o.Client != null ? o.Client.Name : string.Empty,
                    orderDate = o.OrderDate
                })
                .ToListAsync();

            return Ok(orders);
        }

        private bool OrderExists(int id)
        {
            return _context.Orders.Any(e => e.Id == id);
        }
    }
}