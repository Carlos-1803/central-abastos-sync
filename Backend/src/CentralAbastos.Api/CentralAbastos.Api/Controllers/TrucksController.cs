using CentralAbastos.Api.Authorization;
using CentralAbastos.Api.Controllers.Dtos;
using CentralAbastos.Api.Data;
using CentralAbastos.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CentralAbastos.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TrucksController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public TrucksController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [Authorize(Roles = RoleNames.AdminOrWarehouse)]
    public async Task<ActionResult<IEnumerable<TruckResponseDto>>> GetTrucks()
    {
        var trucks = await _context.Trucks
            .AsNoTracking()
            .OrderBy(truck => truck.PlateNumber)
            .Select(truck => new TruckResponseDto
            {
                Id = truck.Id,
                PlateNumber = truck.PlateNumber,
                Model = truck.Model,
                Year = truck.Year,
                CapacityKg = truck.CapacityKg,
                IsActive = truck.IsActive,
                DriverId = truck.DriverId,
                DriverName = truck.Driver != null ? truck.Driver.Username : null
            })
            .ToListAsync();

        return Ok(trucks);
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = RoleNames.AdminOrWarehouse)]
    public async Task<ActionResult<TruckResponseDto>> GetTruck(int id)
    {
        var truck = await _context.Trucks
            .AsNoTracking()
            .Where(item => item.Id == id)
            .Select(item => new TruckResponseDto
            {
                Id = item.Id,
                PlateNumber = item.PlateNumber,
                Model = item.Model,
                Year = item.Year,
                CapacityKg = item.CapacityKg,
                IsActive = item.IsActive,
                DriverId = item.DriverId,
                DriverName = item.Driver != null ? item.Driver.Username : null
            })
            .FirstOrDefaultAsync();

        return truck is null ? NotFound("Camión no encontrado.") : Ok(truck);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = RoleNames.Admin)]
    public async Task<IActionResult> PutTruck(int id, TruckUpdateDto dto)
    {
        var truck = await _context.Trucks.FindAsync(id);
        if (truck is null)
        {
            return NotFound("Camión no encontrado.");
        }

        var driverError = await ValidateDriverAsync(dto.DriverId, id);
        if (driverError is not null)
        {
            return BadRequest(new { message = driverError });
        }

        var normalizedPlate = dto.PlateNumber.Trim().ToUpperInvariant();
        var plateExists = await _context.Trucks.AnyAsync(item =>
            item.Id != id && item.PlateNumber.ToUpper() == normalizedPlate);
        if (plateExists)
        {
            return BadRequest(new { message = "Ya existe otra unidad con esas placas." });
        }

        truck.PlateNumber = normalizedPlate;
        truck.Model = dto.Model.Trim();
        truck.Year = dto.Year;
        truck.CapacityKg = dto.CapacityKg;
        truck.IsActive = dto.IsActive;
        truck.DriverId = dto.DriverId;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost]
    [Authorize(Roles = RoleNames.Admin)]
    public async Task<ActionResult<TruckResponseDto>> PostTruck(TruckCreateDto dto)
    {
        var driverError = await ValidateDriverAsync(dto.DriverId);
        if (driverError is not null)
        {
            return BadRequest(new { message = driverError });
        }

        var normalizedPlate = dto.PlateNumber.Trim().ToUpperInvariant();
        if (await _context.Trucks.AnyAsync(item => item.PlateNumber.ToUpper() == normalizedPlate))
        {
            return BadRequest(new { message = "Ya existe una unidad con esas placas." });
        }

        var truck = new Truck
        {
            PlateNumber = normalizedPlate,
            Model = dto.Model.Trim(),
            Year = dto.Year,
            CapacityKg = dto.CapacityKg,
            IsActive = dto.IsActive,
            DriverId = dto.DriverId
        };

        _context.Trucks.Add(truck);
        await _context.SaveChangesAsync();

        var response = await _context.Trucks
            .Where(item => item.Id == truck.Id)
            .Select(item => new TruckResponseDto
            {
                Id = item.Id,
                PlateNumber = item.PlateNumber,
                Model = item.Model,
                Year = item.Year,
                CapacityKg = item.CapacityKg,
                IsActive = item.IsActive,
                DriverId = item.DriverId,
                DriverName = item.Driver != null ? item.Driver.Username : null
            })
            .FirstAsync();

        return CreatedAtAction(nameof(GetTruck), new { id = truck.Id }, response);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = RoleNames.Admin)]
    public async Task<IActionResult> DeleteTruck(int id)
    {
        var truck = await _context.Trucks.FindAsync(id);
        if (truck is null)
        {
            return NotFound("Camión no encontrado.");
        }

        _context.Trucks.Remove(truck);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    private async Task<string?> ValidateDriverAsync(int? driverId, int? excludedTruckId = null)
    {
        if (driverId is null)
        {
            return "Selecciona un chofer para la unidad.";
        }

        var driver = await _context.Users
            .Include(user => user.Role)
            .FirstOrDefaultAsync(user => user.Id == driverId.Value);

        if (driver?.Role is null || !RoleNames.IsDriver(driver.Role.Name))
        {
            return "El usuario seleccionado no existe o no tiene el rol Chofer.";
        }

        var alreadyAssigned = await _context.Trucks.AnyAsync(truck =>
            truck.DriverId == driverId.Value &&
            (!excludedTruckId.HasValue || truck.Id != excludedTruckId.Value));

        return alreadyAssigned
            ? "El chofer seleccionado ya está asignado a otra unidad."
            : null;
    }
}
