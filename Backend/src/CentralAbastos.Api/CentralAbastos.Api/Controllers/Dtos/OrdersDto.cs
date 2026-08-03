using System.ComponentModel.DataAnnotations;

namespace CentralAbastos.Api.Controllers.Dtos;

public class OrderItemCreateDto
{
    [Required]
    public int ProductId { get; set; }

    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }

    [Range(0, 1_000_000)]
    public decimal UnitPrice { get; set; }
}

public class OrderItemResponseDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}

public class OrderCreateDto
{
    [Required]
    public int ClientId { get; set; }

    public int? CreatedByUserId { get; set; }

    [Required]
    [StringLength(200)]
    public string DeliveryAddress { get; set; } = string.Empty;

    public double? DeliveryLatitude { get; set; }
    public double? DeliveryLongitude { get; set; }

    [StringLength(500)]
    public string? Notes { get; set; }

    [Required]
    [MinLength(1)]
    public List<OrderItemCreateDto> Items { get; set; } = new();
}

public class OrderUpdateDto
{
    [StringLength(200)]
    public string? DeliveryAddress { get; set; }

    public double? DeliveryLatitude { get; set; }
    public double? DeliveryLongitude { get; set; }

    [StringLength(500)]
    public string? Notes { get; set; }

    public List<OrderItemCreateDto>? Items { get; set; }
}

public class OrderStatusUpdateDto
{
    [Required]
    public string Status { get; set; } = string.Empty;
}

public class OrderResponseDto
{
    public int Id { get; set; }
    public int ClientId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public DateTime OrderDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public int? AssignedTruckId { get; set; }
    public string? TruckPlateNumber { get; set; }
    public int CreatedByUserId { get; set; }
    public string CreatedByUsername { get; set; } = string.Empty;
    public string? DeliveryAddress { get; set; }
    public double? DeliveryLatitude { get; set; }
    public double? DeliveryLongitude { get; set; }
    public string? Notes { get; set; }
    public List<OrderItemResponseDto> Items { get; set; } = new();
}

public class DriverTruckDto
{
    public int Id { get; set; }
    public string PlateNumber { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public double CapacityKg { get; set; }
    public bool IsActive { get; set; }
}

public class DriverDashboardDto
{
    public DriverTruckDto? Truck { get; set; }
    public List<OrderResponseDto> Orders { get; set; } = new();
}
