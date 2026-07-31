namespace CentralAbastos.Api.Controllers.Dtos
{
    public record RegisterDto(string Username, string Password, int RoleId = 1);

    public record LoginDto(string Username, string Password);

    public record AuthResponseDto(int Id, string Username, string RoleName, string Token);

    public record UpdateUserDto(string Username, int RoleId, string? NewPassword = null);
}