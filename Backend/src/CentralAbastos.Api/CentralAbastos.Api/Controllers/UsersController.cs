using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CentralAbastos.Api.Data;
using CentralAbastos.Api.Models;
using CentralAbastos.Api.Controllers.Dtos;

namespace CentralAbastos.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "ADMIN,Admin")] // Solo administradores pueden gestionar empleados
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UsersController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/users (Listar todos los empleados)
        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users
                .Include(u => u.Role)
                .Select(u => new
                {
                    u.Id,
                    u.Username,
                    u.RoleId,
                    RoleName = u.Role.Name
                })
                .ToListAsync();

            return Ok(users);
        }

        // GET: api/users/5 (Obtener un empleado por ID)
        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
            {
                return NotFound("Usuario no encontrado.");
            }

            return Ok(new
            {
                user.Id,
                user.Username,
                user.RoleId,
                RoleName = user.Role.Name
            });
        }

        // POST: api/users (Crear nuevo empleado)
        [HttpPost]
        public async Task<IActionResult> CreateUser(RegisterDto dto)
        {
            if (await _context.Users.AnyAsync(u => u.Username.ToLower() == dto.Username.ToLower()))
            {
                return BadRequest("El nombre de usuario ya existe.");
            }

            var role = await _context.Roles.FindAsync(dto.RoleId);
            if (role == null)
            {
                return BadRequest("El rol asignado no existe.");
            }

            var user = new User
            {
                Username = dto.Username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                RoleId = dto.RoleId
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUserById), new { id = user.Id }, new
            {
                user.Id,
                user.Username,
                user.RoleId,
                RoleName = role.Name
            });
        }

        // PUT: api/users/5 (Editar empleado existente)
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserDto dto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound("El usuario a editar no existe.");
            }

            // Validar si cambio el Username y que no choque con otro existente
            if (!string.Equals(user.Username, dto.Username, StringComparison.OrdinalIgnoreCase))
            {
                if (await _context.Users.AnyAsync(u => u.Username.ToLower() == dto.Username.ToLower()))
                {
                    return BadRequest("El nuevo nombre de usuario ya está en uso.");
                }
                user.Username = dto.Username;
            }

            // Validar el rol
            var role = await _context.Roles.FindAsync(dto.RoleId);
            if (role == null)
            {
                return BadRequest("El rol especificado no existe.");
            }
            user.RoleId = dto.RoleId;

            // Si se proporciona una contraseña nueva, re-hashearla
            if (!string.IsNullOrWhiteSpace(dto.NewPassword))
            {
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            }

            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Usuario '{user.Username}' actualizado correctamente." });
        }

        // DELETE: api/users/5 (Eliminar empleado)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound("El usuario especificado no existe.");
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"El usuario '{user.Username}' fue eliminado correctamente." });
        }
    }
}