using System.ComponentModel.DataAnnotations;

namespace CentralAbastos.Api.Controllers.Dtos
{
    public class TruckCreateDto
    {
        [Required]
        [StringLength(20)]
        public string PlateNumber { get; set; }

        [Required]
        [StringLength(50)]
        public string Model { get; set; }

        [Range(1900, 2100)]
        public int Year { get; set; }

        [Range(0, 50000)]
        public double CapacityKg { get; set; }

        public bool IsActive { get; set; } = true;

        [Required]
        public int? DriverId { get; set; }
    }

    public class TruckUpdateDto
    {
        [Required]
        [StringLength(20)]
        public string PlateNumber { get; set; }

        [Required]
        [StringLength(50)]
        public string Model { get; set; }

        [Range(1900, 2100)]
        public int Year { get; set; }

        [Range(0, 50000)]
        public double CapacityKg { get; set; }

        public bool IsActive { get; set; }

        [Required]
        public int? DriverId { get; set; }
    }

    public class TruckResponseDto
    {
        public int Id { get; set; }
        public string PlateNumber { get; set; }
        public string Model { get; set; }
        public int Year { get; set; }
        public double CapacityKg { get; set; }
        public bool IsActive { get; set; }
        public int? DriverId { get; set; }
        public string? DriverName { get; set; } // Populated via Join in GET
    }
}