using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CentralAbastos.Api.Models
{
    public class Order
    {
        public int Id { get; set; }
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;
        public int ClientId { get; set; }
        public Client Client { get; set; } = null!;
        public int? AssignedTruckId { get; set; }
        public Truck? AssignedTruck { get; set; }
        public int CreatedByUserId { get; set; } // Levanta Pedido user
        public User CreatedByUser { get; set; } = null!;
        public string Status { get; set; } = "Pending"; // Pending, Confirmed, Shipped, Delivered, Cancelled
        public decimal TotalAmount { get; set; }
        public string? DeliveryAddress { get; set; }
        public double? DeliveryLatitude { get; set; }
        public double? DeliveryLongitude { get; set; }

        public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    }
}
