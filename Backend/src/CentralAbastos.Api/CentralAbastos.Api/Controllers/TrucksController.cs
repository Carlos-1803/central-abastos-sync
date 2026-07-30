using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CentralAbastos.Api.Data;
using CentralAbastos.Api.Controllers.Dtos;

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

        // GET: api/trucks
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TruckResponseDto>>> GetTrucks()
        {
            var trucks = await _context.Trucks
                .Include(t => t.Driver) // Include driver to get driver name
                .Select(t => new TruckResponseDto
                {
                    Id = t.Id,
                    PlateNumber = t.PlateNumber,
                    Model = t.Model,
                    Year = t.Year,
                    CapacityKg = t.CapacityKg,
                    IsActive = t.IsActive,
                    DriverId = t.DriverId,
                    DriverName = t.Driver != null ? $"{t.Driver.Username}" : null // Assuming Username or we need Name? Users table has Username, not Name. Let's use Username.
                })
                .ToListAsync();

            return Ok(trucks);
        }

        // GET: api/trucks/5
        [HttpGet("{id}")]
        public async Task<ActionResult<TruckResponseDto>> GetTruck(int id)
        {
            var truck = await _context.Trucks
                .Include(t => t.Driver)
                .Where(t => t.Id == id)
                .Select(t => new TruckResponseDto
                {
                    Id = t.Id,
                    PlateNumber = t.PlateNumber,
                    Model = t.Model,
                    Year = t.Year,
                    CapacityKg = t.CapacityKg,
                    IsActive = t.IsActive,
                    DriverId = t.DriverId,
                    DriverName = t.Driver != null ? t.Driver.Username : null
                })
                .FirstOrDefaultAsync();

            if (truck == null)
            {
                return NotFound();
            }

            return truck;
        }

        // PUT: api/trucks/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTruck(int id, TruckUpdateDto dto)
        {
            // Validate DriverId exists
            if (!await _context.Users.AnyAsync(u => u.Id == dto.DriverId))
            {
                return BadRequest($"El DriverId {dto.DriverId} especificado no existe.");
            }

            var truck = await _context.Trucks.FindAsync(id);
            if (truck == null)
            {
                return NotFound();
            }

            truck.PlateNumber = dto.PlateNumber;
            truck.Model = dto.Model;
            truck.Year = dto.Year;
            truck.CapacityKg = dto.CapacityKg;
            truck.IsActive = dto.IsActive;
            truck.DriverId = dto.DriverId;

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

        // POST: api/trucks
        [HttpPost]
        public async Task<ActionResult<TruckResponseDto>> PostTruck(TruckCreateDto dto)
        {
            // Validate DriverId exists
            if (!await _context.Users.AnyAsync(u => u.Id == dto.DriverId))
            {
                return BadRequest($"El DriverId {dto.DriverId} especificado no existe.");
            }

            var truck = new Truck
            {
                PlateNumber = dto.PlateNumber,
                Model = dto.Model,
                Year = dto.Year,
                CapacityKg = dto.CapacityKg,
                IsActive = dto.IsActive,
                DriverId = dto.DriverId
            };

            _context.Trucks.Add(truck);
            await _context.SaveChangesAsync();

            var truckDto = new TruckResponseDto
            {
                Id = truck.Id,
                PlateNumber = truck.PlateNumber,
                Model = truck.Model,
                Year = truck.Year,
                CapacityKg = truck.CapacityKg,
                IsActive = truck.IsActive,
                DriverId = truck.DriverId,
                DriverName = await _context.Users.Where(u => u.Id == truck.DriverId).Select(u => u.Username).FirstOrDefaultAsync()
            };

            return CreatedAtAction(nameof(GetTruck), new { id = truck.Id }, truckDto);
        }

        // DELETE: api/trucks/5
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