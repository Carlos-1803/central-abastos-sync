using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CentralAbastos.Api.Models;
using CentralAbastos.Api.Data;

namespace CentralAbastos.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TrucksController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TrucksController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Trucks
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Truck>>> GetTrucks()
        {
            return await _context.Trucks.ToListAsync();
        }

        // GET: api/Trucks/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Truck>> GetTruck(int id)
        {
            var truck = await _context.Trucks.FindAsync(id);

            if (truck == null)
            {
                return NotFound();
            }

            return truck;
        }

        // PUT: api/Trucks/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTruck(int id, Truck truck)
        {
            if (id != truck.Id)
            {
                return BadRequest();
            }

            _context.Entry(truck).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TruckExists(id))
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

        // POST: api/Trucks
        [HttpPost]
        public async Task<ActionResult<Truck>> PostTruck(Truck truck)
        {
            _context.Trucks.Add(truck);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTruck), new { id = truck.Id }, truck);
        }

        // DELETE: api/Trucks/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTruck(int id)
        {
            var truck = await _context.Trucks.FindAsync(id);
            if (truck == null)
            {
                return NotFound();
            }

            _context.Trucks.Remove(truck);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TruckExists(int id)
        {
            return _context.Trucks.Any(e => e.Id == id);
        }
    }
}