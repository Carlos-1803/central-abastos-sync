using System.ComponentModel.DataAnnotations;

namespace CentralAbastos.Api.Controllers.Dtos
{
    public class ProductCreateDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        [StringLength(200)]
        public string Description { get; set; }

        [Range(0, 1000000)]
        public decimal Price { get; set; }

        [Range(0, int.MaxValue)]
        public int Stock { get; set; }

        public bool IsActive { get; set; } = true;
    }

    public class ProductUpdateDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        [StringLength(200)]
        public string Description { get; set; }

        [Range(0, 1000000)]
        public decimal Price { get; set; }

        [Range(0, int.MaxValue)]
        public int Stock { get; set; }

        public bool IsActive { get; set; }
    }

    public class ProductResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public int Stock { get; set; }
        public bool IsActive { get; set; }
    }
}