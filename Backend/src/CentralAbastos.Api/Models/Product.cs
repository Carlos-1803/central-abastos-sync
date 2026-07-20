using System.ComponentModel.DataAnnotations;

namespace CentralAbastos.Api.Models
{
    public class Product
    {
        public int Id { get; set; }
        [Required, MaxLength(150)]
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public int Stock { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
