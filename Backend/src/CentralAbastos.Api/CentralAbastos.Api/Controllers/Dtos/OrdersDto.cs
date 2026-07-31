using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace CentralAbastos.Api.Controllers.Dtos
{
    public class OrderItemCreateDto
    {
        [Required]
        public int ProductId { get; set; }

        [Required]
        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }

        [Required]
        [Range(0, 1000000)]
        public decimal UnitPrice { get; set; }
    }

    public class OrderItemResponseDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }

    public class OrderCreateDto
    {
        [Required]
        public int ClientId { get; set; }

        // Campo para vincular el usuario que genera la orden
        [Required]
        public int CreatedByUserId { get; set; }

        [Required]
        [StringLength(200)]
        public string DeliveryAddress { get; set; }

        public double? DeliveryLatitude { get; set; }

        public double? DeliveryLongitude { get; set; }

        [StringLength(500)]
        public string Notes { get; set; }

        [Required]
        public List<OrderItemCreateDto> Items { get; set; } = new List<OrderItemCreateDto>();
    }

    public class OrderUpdateDto
    {
        [StringLength(200)]
        public string DeliveryAddress { get; set; }

        public double? DeliveryLatitude { get; set; }

        public double? DeliveryLongitude { get; set; }

        [StringLength(500)]
        public string Notes { get; set; }

        public List<OrderItemCreateDto> Items { get; set; } = new List<OrderItemCreateDto>();
    }

    public class OrderResponseDto
    {
        public int Id { get; set; }
        public int ClientId { get; set; }
        public string ClientName { get; set; }
        public System.DateTime OrderDate { get; set; }
        public string Status { get; set; }
        public decimal TotalAmount { get; set; }
        public int? AssignedTruckId { get; set; }
        public string TruckPlateNumber { get; set; }
        public string DeliveryAddress { get; set; }
        public double? DeliveryLatitude { get; set; }
        public double? DeliveryLongitude { get; set; }
        public string Notes { get; set; }
        public List<OrderItemResponseDto> Items { get; set; } = new List<OrderItemResponseDto>();
    }
}