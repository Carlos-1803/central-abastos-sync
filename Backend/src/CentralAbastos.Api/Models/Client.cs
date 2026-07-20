using System.ComponentModel.DataAnnotations;

namespace CentralAbastos.Api.Models
{
    public class Client
    {
        public int Id { get; set; }
        [Required, MaxLength(150)]
        public string Name { get; set; } = string.Empty;
        [Phone]
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
