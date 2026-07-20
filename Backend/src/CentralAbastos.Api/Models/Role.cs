namespace CentralAbastos.Api.Models
{
    public class Role
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!; // Admin, LevantaPedido, Bodega, Chofer
        public string Description { get; set; } = string.Empty;
    }
}
