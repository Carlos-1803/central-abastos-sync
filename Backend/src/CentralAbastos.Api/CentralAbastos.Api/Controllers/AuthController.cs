using CentralAbastos.Api.Controllers.Dtos;
using CentralAbastos.Api.Data;
using CentralAbastos.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CentralAbastos.Api.Controllers;

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
        if (string.IsNullOrWhiteSpace(dto.Username) || string.IsNullOrWhiteSpace(dto.Password))
        {
            return BadRequest(new { message = "El usuario y la contraseña son obligatorios." });
        }

        var normalizedUsername = dto.Username.Trim().ToLower();
        var user = await _context.Users
            .Include(item => item.Role)
            .FirstOrDefaultAsync(item => item.Username.ToLower() == normalizedUsername);

        if (user is null)
        {
            return Unauthorized(new { message = "Usuario o contraseña incorrectos." });
        }

        bool isValidPassword;
        try
        {
            isValidPassword = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);
        }
        catch (Exception)
        {
            isValidPassword = false;
        }

        if (!isValidPassword)
        {
            return Unauthorized(new { message = "Usuario o contraseña incorrectos." });
        }

        if (user.Role is null)
        {
            return Unauthorized(new { message = "La cuenta no tiene un rol válido asignado." });
        }

        var roleName = user.Role.Name;
        var token = _tokenService.CreateToken(user.Id, user.Username, roleName);

        return Ok(new AuthResponseDto(user.Id, user.Username, roleName, token));
    }
}
