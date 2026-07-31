using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CentralAbastos.Api.Models;
using CentralAbastos.Api.Data;
using CentralAbastos.Api.Controllers.Dtos;
using CentralAbastos.Api.Services;

namespace CentralAbastos.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ITokenService _tokenService;

        public AuthController(ApplicationDbContext context, ITokenService tokenService)
        {
            _context = context;
            _tokenService = tokenService;
        }

        [HttpPost("login")]
public async Task<ActionResult<AuthResponseDto>> Login(LoginDto dto)
{
    // Imprimir en la consola del backend lo que llega desde React
    Console.WriteLine($"===> Intento de login recibido: Username='{dto.Username}', Password='{dto.Password}'");

    // Buscamos cualquier usuario en la base de datos para depurar
    var totalUsers = await _context.Users.CountAsync();
    Console.WriteLine($"===> Total de usuarios en la tabla Users: {totalUsers}");

    var user = await _context.Users
        .Include(u => u.Role)
        .FirstOrDefaultAsync(u => u.Username.ToLower() == dto.Username.ToLower());

    if (user == null)
    {
        Console.WriteLine($"===> ERROR: No se encontró el usuario '{dto.Username}' en la BD.");
        return Unauthorized($"El usuario '{dto.Username}' no existe en la base de datos.");
    }

    Console.WriteLine($"===> Usuario encontrado: Id={user.Id}, Username='{user.Username}', Hash='{user.PasswordHash}'");

    // Forzamos aceptar la contraseña 'hola123' mientras arreglamos el flujo
    bool isValid = (dto.Password == "hola123") || BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);

    if (!isValid)
    {
        Console.WriteLine("===> ERROR: La contraseña no coincide con el Hash.");
        return Unauthorized("Contraseña incorrecta.");
    }

    var roleName = user.Role?.Name ?? "ADMIN";
    var token = _tokenService.CreateToken(user.Id, user.Username, roleName);

    Console.WriteLine("===> LOGIN EXITOSO!");
    return Ok(new AuthResponseDto(user.Id, user.Username, roleName, token));
        }
    }
}