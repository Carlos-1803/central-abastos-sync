using System.ComponentModel.DataAnnotations;
using CentralAbastos.Api.Models;

namespace CentralAbastos.Api.Controllers.Dtos
{
    public class UserResponseDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public int RoleId { get; set; }
        public string RoleName { get; set; } = string.Empty;
    }
}