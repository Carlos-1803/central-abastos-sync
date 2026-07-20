using Microsoft.EntityFrameworkCore;
using CentralAbastos.Api.Models;

namespace CentralAbastos.Api.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Role> Roles { get; set; } = null!;
        public DbSet<Client> Clients { get; set; } = null!;
        public DbSet<Truck> Trucks { get; set; } = null!;
        public DbSet<Product> Products { get; set; } = null!;
        public DbSet<Order> Orders { get; set; } = null!;
        public DbSet<OrderItem> OrderItems { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Seed roles
            modelBuilder.Entity<Role>().HasData(
                new Role { Id = 1, Name = "Admin", Description = "System administrator" },
                new Role { Id = 2, Name = "LevantaPedido", Description = "Creates orders" },
                new Role { Id = 3, Name = "Bodega", Description = "Warehouse manager" },
                new Role { Id = 4, Name = "Chofer", Description = "Driver" }
            );

            // Configure relationships and constraints
            modelBuilder.Entity<User>()
                .HasOne(u => u.Role)
                .WithMany()
                .HasForeignKey(u => u.RoleId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Order>()
                .HasOne(o => o.Client)
                .WithMany()
                .HasForeignKey(o => o.ClientId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Order>()
                .HasOne(o => o.AssignedTruck)
                .WithMany()
                .HasForeignKey(o => o.AssignedTruckId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Order>()
                .HasOne(o => o.CreatedByUser)
                .WithMany()
                .HasForeignKey(o => o.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.Order)
                .WithMany(o => o.Items)
                .HasForeignKey(oi => oi.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.Product)
                .WithMany()
                .HasForeignKey(oi => oi.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            // Truck-Driver relationship
            modelBuilder.Entity<Truck>()
                .HasOne(t => t.Driver)
                .WithMany()
                .HasForeignKey(t => t.DriverId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}