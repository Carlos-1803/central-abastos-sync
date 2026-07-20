using System.ComponentModel.DataAnnotations;

namespace CentralAbastos.Api.Models
{
    public class User
    {
        public int Id { get; set; }
        [Required, MaxLength(100)]
        public string Username { get; set; } = string.Empty;
        [Required, MaxLength(100)]
        public string PasswordHash { get; set; } = string.Empty;
        public int RoleId { get; set; }
        public Role Role { get; set; } = null!;
    }
}
