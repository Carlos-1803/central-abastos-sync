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
public class ClientsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ClientsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [Authorize(Roles = RoleNames.AdminOrOrderTaker)]
    public async Task<ActionResult<IEnumerable<ClientResponseDto>>> GetClients()
    {
        var clients = await _context.Clients
            .AsNoTracking()
            .OrderBy(client => client.Name)
            .Select(client => new ClientResponseDto
            {
                Id = client.Id,
                Name = client.Name,
                Phone = client.Phone ?? string.Empty,
                Address = client.Address ?? string.Empty,
                IsActive = client.IsActive
            })
            .ToListAsync();

        return Ok(clients);
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = RoleNames.AdminOrOrderTaker)]
    public async Task<ActionResult<ClientResponseDto>> GetClient(int id)
    {
        var client = await _context.Clients
            .AsNoTracking()
            .Where(item => item.Id == id)
            .Select(item => new ClientResponseDto
            {
                Id = item.Id,
                Name = item.Name,
                Phone = item.Phone ?? string.Empty,
                Address = item.Address ?? string.Empty,
                IsActive = item.IsActive
            })
            .FirstOrDefaultAsync();

        return client is null ? NotFound("Cliente no encontrado.") : Ok(client);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = RoleNames.Admin)]
    public async Task<IActionResult> PutClient(int id, ClientUpdateDto dto)
    {
        var client = await _context.Clients.FindAsync(id);
        if (client is null)
        {
            return NotFound("Cliente no encontrado.");
        }

        client.Name = dto.Name.Trim();
        client.Phone = string.IsNullOrWhiteSpace(dto.Phone) ? null : dto.Phone.Trim();
        client.Address = string.IsNullOrWhiteSpace(dto.Address) ? null : dto.Address.Trim();
        client.IsActive = dto.IsActive;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost]
    [Authorize(Roles = RoleNames.AdminOrOrderTaker)]
    public async Task<ActionResult<ClientResponseDto>> PostClient(ClientCreateDto dto)
    {
        var normalizedName = dto.Name.Trim();
        var duplicate = await _context.Clients.AnyAsync(client =>
            client.Name.ToUpper() == normalizedName.ToUpper() && client.IsActive);
        if (duplicate)
        {
            return BadRequest(new { message = "Ya existe un cliente activo con ese nombre." });
        }

        var client = new Client
        {
            Name = normalizedName,
            Phone = string.IsNullOrWhiteSpace(dto.Phone) ? null : dto.Phone.Trim(),
            Address = string.IsNullOrWhiteSpace(dto.Address) ? null : dto.Address.Trim(),
            IsActive = dto.IsActive
        };

        _context.Clients.Add(client);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetClient), new { id = client.Id }, ToDto(client));
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = RoleNames.Admin)]
    public async Task<IActionResult> DeleteClient(int id)
    {
        var client = await _context.Clients.FindAsync(id);
        if (client is null)
        {
            return NotFound("Cliente no encontrado.");
        }

        _context.Clients.Remove(client);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    private static ClientResponseDto ToDto(Client client)
    {
        return new ClientResponseDto
        {
            Id = client.Id,
            Name = client.Name,
            Phone = client.Phone ?? string.Empty,
            Address = client.Address ?? string.Empty,
            IsActive = client.IsActive
        };
    }
}
