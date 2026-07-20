using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CentralAbastos.Api.Models;
using CentralAbastos.Api.Data;

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
        public async Task<ActionResult<IEnumerable<Order>>> GetOrders()
        {
            return await _context.Orders
                .Include(o => o.Client)
                .Include(o => o.AssignedTruck)
                .ThenInclude(t => t.Driver)
                .Include(o => o.CreatedByUser)
                .ThenInclude(u => u.Role)
                .Include(o => o.Items)
                .ThenInclude(oi => oi.Product)
                .ToListAsync();
        }

        // GET: api/Orders/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Order>> GetOrder(int id)
        {
            var order = await _context.Orders
                .Include(o => o.Client)
                .Include(o => o.AssignedTruck)
                .ThenInclude(t => t.Driver)
                .Include(o => o.CreatedByUser)
                .ThenInclude(u => u.Role)
                .Include(o => o.Items)
                .ThenInclude(oi => oi.Product)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
            {
                return NotFound();
            }

            return order;
        }

        // PUT: api/Orders/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutOrder(int id, Order order)
        {
            if (id != order.Id)
            {
                return BadRequest();
            }

            _context.Entry(order).State = EntityState.Modified;

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
        public async Task<ActionResult<Order>> PostOrder(Order order)
        {
            if (order.Items == null || !order.Items.Any())
            {
                return BadRequest("Order must contain at least one item.");
            }

            // Calculate total amount from items
            order.TotalAmount = order.Items.Sum(oi => oi.Quantity * oi.UnitPrice);
            // Ensure order date is set
            order.OrderDate = order.OrderDate == default ? DateTime.UtcNow : order.OrderDate;

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, order);
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