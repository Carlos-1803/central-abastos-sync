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
                    ClientName = o.Client.Name,
                    OrderDate = o.OrderDate,
                    Status = o.Status,
                    TotalAmount = o.TotalAmount,
                    AssignedTruckId = o.AssignedTruckId,
                    TruckPlateNumber = o.AssignedTruck != null ? o.AssignedTruck.PlateNumber : null,
                    DeliveryAddress = o.DeliveryAddress,
                    DeliveryLatitude = o.DeliveryLatitude,
                    DeliveryLongitude = o.DeliveryLongitude,
                    Notes = o.Notes,
                    Items = o.Items.Select(i => new OrderItemResponseDto
                    {
                        Id = i.Id,
                        ProductId = i.ProductId,
                        ProductName = i.Product.Name,
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
                    ClientName = o.Client.Name,
                    OrderDate = o.OrderDate,
                    Status = o.Status,
                    TotalAmount = o.TotalAmount,
                    AssignedTruckId = o.AssignedTruckId,
                    TruckPlateNumber = o.AssignedTruck != null ? o.AssignedTruck.PlateNumber : null,
                    DeliveryAddress = o.DeliveryAddress,
                    DeliveryLatitude = o.DeliveryLatitude,
                    DeliveryLongitude = o.DeliveryLongitude,
                    Notes = o.Notes,
                    Items = o.Items.Select(i => new OrderItemResponseDto
                    {
                        Id = i.Id,
                        ProductId = i.ProductId,
                        ProductName = i.Product.Name,
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

            // Update scalar properties
            order.DeliveryAddress = dto.DeliveryAddress;
            order.DeliveryLatitude = dto.DeliveryLatitude;
            order.DeliveryLongitude = dto.DeliveryLongitude;
            order.Notes = dto.Notes;

            // Validate and update items
            if (dto.Items != null)
            {
                // Remove existing items
                _context.OrderItems.RemoveRange(order.Items);

                // Add new items
                order.Items = new List<OrderItem>();
                foreach (var itemDto in dto.Items)
                {
                    // Validate ProductId exists
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

            // Recalculate total amount
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
            // Validate ClientId exists
            var clientExists = await _context.Clients.AnyAsync(c => c.Id == dto.ClientId);
            if (!clientExists)
            {
                return BadRequest($"El ClientId {dto.ClientId} no existe.");
            }

            // Validate each item's ProductId exists
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
                Notes = dto.Notes,
                OrderDate = DateTime.UtcNow,
                Status = "Pending",
                // Note: AssignedTruckId and CreatedByUserId are left as default (0) and should be set elsewhere.
                Items = new List<OrderItem>()
            };

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

            // Calculate total amount
            order.TotalAmount = order.Items.Sum(oi => oi.Quantity * oi.UnitPrice);

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            // Get the client name for the response DTO
            var clientName = await _context.Clients
                .Where(c => c.Id == dto.ClientId)
                .Select(c => c.Name)
                .FirstOrDefaultAsync();

            // Return DTO
            var orderDto = new OrderResponseDto
            {
                Id = order.Id,
                ClientId = order.ClientId,
                ClientName = clientName ?? string.Empty,
                OrderDate = order.OrderDate,
                Status = order.Status,
                TotalAmount = order.TotalAmount,
                AssignedTruckId = order.AssignedTruckId,
                TruckPlateNumber = order.AssignedTruck != null ? order.AssignedTruck.PlateNumber : null,
                DeliveryAddress = order.DeliveryAddress,
                DeliveryLatitude = order.DeliveryLatitude,
                DeliveryLongitude = order.DeliveryLongitude,
                Notes = order.Notes,
                Items = order.Items.Select(i => new OrderItemResponseDto
                {
                    Id = i.Id,
                    ProductId = i.ProductId,
                    ProductName = i.Product.Name,
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPrice
                }).ToList()
            };

            return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, orderDto);
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
        // Returns the delivery locations (latitude, longitude) for the orders assigned to the truck of the given driver
        [HttpGet("routes/{choferId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetRoutesForDriver(int choferId)
        {
            // Verify that the user exists and is a driver (role Chofer)
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == choferId);

            if (user == null || user.Role.Name != "Chofer")
            {
                return NotFound($"User with id {choferId} is not a driver.");
            }

            // Find the truck assigned to this driver
            var truck = await _context.Trucks
                .FirstOrDefaultAsync(t => t.DriverId == choferId);

            if (truck == null)
            {
                return NotFound($"No truck assigned to driver with id {choferId}.");
            }

            // Get orders assigned to this truck that are in a status ready for delivery
            // We consider statuses: "Shipped" or "Out for Delivery"
            var orders = await _context.Orders
                .Where(o => o.AssignedTruckId == truck.Id &&
                            (o.Status == "Shipped" || o.Status == "Out for Delivery"))
                .Select(o => new
                {
                    orderId = o.Id,
                    deliveryAddress = o.DeliveryAddress,
                    latitude = o.DeliveryLatitude,
                    longitude = o.DeliveryLongitude,
                    customerName = o.Client.Name,
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