namespace CentralAbastos.Api.Authorization;

public static class RoleNames
{
    public const string Admin = "Admin,ADMIN,Administrador,ADMINISTRADOR";
    public const string Driver = "Chofer,CHOFER,Driver,DRIVER";
    public const string OrderTaker = "LevantaPedido,LEVANTAPEDIDO,LevantaPedidos,LEVANTA_PEDIDOS";
    public const string Warehouse = "Bodega,BODEGA,Logistics,LOGISTICS";

    public const string AdminOrDriver = Admin + "," + Driver;
    public const string AdminOrOrderTaker = Admin + "," + OrderTaker;
    public const string AdminOrWarehouse = Admin + "," + Warehouse;
    public const string AllOperationalRoles = Admin + "," + Driver + "," + OrderTaker + "," + Warehouse;

    public static bool IsAdmin(string? role) => Normalize(role) == "ADMIN";
    public static bool IsDriver(string? role) => Normalize(role) == "CHOFER";
    public static bool IsOrderTaker(string? role) => Normalize(role) == "LEVANTAPEDIDOS";
    public static bool IsWarehouse(string? role) => Normalize(role) == "BODEGA";

    private static string Normalize(string? role)
    {
        if (string.IsNullOrWhiteSpace(role))
        {
            return string.Empty;
        }

        return new string(role
            .Trim()
            .ToUpperInvariant()
            .Where(char.IsLetterOrDigit)
            .ToArray()) switch
        {
            "ADMIN" or "ADMINISTRADOR" => "ADMIN",
            "CHOFER" or "DRIVER" => "CHOFER",
            "LEVANTAPEDIDO" or "LEVANTAPEDIDOS" or "ORDERTAKER" => "LEVANTAPEDIDOS",
            "BODEGA" or "LOGISTICS" or "LOGISTICA" or "WAREHOUSE" => "BODEGA",
            var normalized => normalized
        };
    }
}
