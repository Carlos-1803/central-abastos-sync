using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CentralAbastos.Api.Models;
using CentralAbastos.Api.Data;
using CentralAbastos.Api.Controllers.Dtos;

namespace CentralAbastos.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UsersController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Users
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserResponseDto>>> GetUsers()
        {
            var users = await _context.Users
                .Include(u => u.Role)
                .Select(u => new UserResponseDto
                {
                    Id = u.Id,
                    Username = u.Username,
                    RoleId = u.RoleId,
                    RoleName = u.Role.Name
                })
                .ToListAsync();

            return Ok(users);
        }

        // GET: api/Users/5
        [HttpGet("{id}")]
        public async Task<ActionResult<UserResponseDto>> GetUser(int id)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .Where(u => u.Id == id)
                .Select(u => new UserResponseDto
                {
                    Id = u.Id,
                    Username = u.Username,
                    RoleId = u.RoleId,
                    RoleName = u.Role.Name
                })
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound();
            }

            return Ok(user);
        }

        // PUT: api/Users/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutUser(int id, UserUpdateDto dto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound("El usuario no existe.");
            }

            var roleExists = await _context.Roles.AnyAsync(r => r.Id == dto.RoleId);
            if (!roleExists)
            {
                return BadRequest("El RoleId especificado no existe.");
            }

            user.Username = dto.Username;
            user.PasswordHash = dto.Password;
            user.RoleId = dto.RoleId;

            await _context.SaveChangesAsync();

            return NoContent(); // Devuelve 204 No Content cuando la actualización es exitosa
        }

        // POST: api/Users
        [HttpPost]
        public async Task<ActionResult<UserResponseDto>> PostUser(UserCreateDto dto)
        {
            var roleExists = await _context.Roles.AnyAsync(r => r.Id == dto.RoleId);
            if (!roleExists)
            {
                return BadRequest("El RoleId especificado no existe.");
            }

            var user = new User
            {
                Username = dto.Username,
                PasswordHash = dto.Password,
                RoleId = dto.RoleId
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var userDto = new UserResponseDto
            {
                Id = user.Id,
                Username = user.Username,
                RoleId = user.RoleId,
                RoleName = _context.Roles.FirstOrDefault(r => r.Id == user.RoleId)?.Name ?? string.Empty
            };

            return CreatedAtAction(nameof(GetUser), new { id = user.Id }, userDto);
        }

        // DELETE: api/Users/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool UserExists(int id)
        {
            return _context.Users.Any(e => e.Id == id);
        }
    }
}