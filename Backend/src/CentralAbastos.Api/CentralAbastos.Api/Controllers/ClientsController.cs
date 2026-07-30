using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CentralAbastos.Api.Models;
using CentralAbastos.Api.Data;
using CentralAbastos.Api.Controllers.Dtos;

namespace CentralAbastos.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ClientsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ClientsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Clients
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ClientResponseDto>>> GetClients()
        {
            var clients = await _context.Clients
                .Select(c => new ClientResponseDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Phone = c.Phone,
                    Address = c.Address,
                    IsActive = c.IsActive
                })
                .ToListAsync();

            return Ok(clients);
        }

        // GET: api/Clients/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ClientResponseDto>> GetClient(int id)
        {
            var client = await _context.Clients.FindAsync(id);

            if (client == null)
            {
                return NotFound();
            }

            var clientDto = new ClientResponseDto
            {
                Id = client.Id,
                Name = client.Name,
                Phone = client.Phone,
                Address = client.Address,
                IsActive = client.IsActive
            };

            return Ok(clientDto);
        }

        // PUT: api/Clients/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutClient(int id, ClientUpdateDto clientDto)
        {
            if (id == 0) // Assuming ID must be positive, but actually id from route should match
            {
                return BadRequest("Client ID is required");
            }

            var client = await _context.Clients.FindAsync(id);
            if (client == null)
            {
                return NotFound();
            }

            // Map DTO to entity
            client.Name = clientDto.Name;
            client.Phone = clientDto.Phone;
            client.Address = clientDto.Address;
            client.IsActive = clientDto.IsActive;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ClientExists(id))
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

        // POST: api/Clients
        [HttpPost]
        public async Task<ActionResult<ClientResponseDto>> PostClient(ClientCreateDto clientDto)
        {
            var client = new Client
            {
                Name = clientDto.Name,
                Phone = clientDto.Phone,
                Address = clientDto.Address,
                IsActive = clientDto.IsActive
            };

            _context.Clients.Add(client);
            await _context.SaveChangesAsync();

            var clientDtoResult = new ClientResponseDto
            {
                Id = client.Id,
                Name = client.Name,
                Phone = client.Phone,
                Address = client.Address,
                IsActive = client.IsActive
            };

            return CreatedAtAction(nameof(GetClient), new { id = client.Id }, clientDtoResult);
        }

        // DELETE: api/Clients/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteClient(int id)
        {
            var client = await _context.Clients.FindAsync(id);
            if (client == null)
            {
                return NotFound();
            }

            _context.Clients.Remove(client);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ClientExists(int id)
        {
            return _context.Clients.Any(e => e.Id == id);
        }
    }
}