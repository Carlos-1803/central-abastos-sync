using System.ComponentModel.DataAnnotations;

namespace CentralAbastos.Api.Models
{
    public class Truck
    {
        public int Id { get; set; }
        [Required, MaxLength(20)]
        public string PlateNumber { get; set; } = string.Empty;
        [Required, MaxLength(50)]
        public string Model { get; set; } = string.Empty;
        public int Year { get; set; }
        public double CapacityKg { get; set; } // capacity in kg
        public bool IsActive { get; set; } = true;

        // Foreign key to Driver (User with role Chofer)
        public int? DriverId { get; set; }
        public User? Driver { get; set; }
    }
}