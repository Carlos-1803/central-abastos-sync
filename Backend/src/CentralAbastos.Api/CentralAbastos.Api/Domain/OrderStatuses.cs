namespace CentralAbastos.Api.Domain;

public static class OrderStatuses
{
    public const string Pending = "Pending";
    public const string Confirmed = "Confirmed";
    public const string Preparing = "Preparing";
    public const string ReadyForDispatch = "ReadyForDispatch";
    public const string OutForDelivery = "Out for Delivery";
    public const string Delivered = "Delivered";
    public const string DeliveryFailed = "Delivery Failed";
    public const string Cancelled = "Cancelled";

    public static readonly HashSet<string> ValidStatuses = new(StringComparer.OrdinalIgnoreCase)
    {
        Pending,
        Confirmed,
        Preparing,
        ReadyForDispatch,
        OutForDelivery,
        Delivered,
        DeliveryFailed,
        Cancelled
    };

    public static string? Normalize(string? status)
    {
        if (string.IsNullOrWhiteSpace(status))
        {
            return null;
        }

        var key = new string(status
            .Trim()
            .ToUpperInvariant()
            .Where(char.IsLetterOrDigit)
            .ToArray());

        return key switch
        {
            "PENDING" or "PENDIENTE" => Pending,
            "CONFIRMED" or "CONFIRMADO" => Confirmed,
            "PREPARING" or "PREPARANDO" => Preparing,
            "READYFORDISPATCH" or "LISTOPARASALIR" => ReadyForDispatch,
            "SHIPPED" or "OUTFORDELIVERY" or "ENRUTA" => OutForDelivery,
            "DELIVERED" or "ENTREGADO" => Delivered,
            "DELIVERYFAILED" or "ENTREGAFALLIDA" => DeliveryFailed,
            "CANCELLED" or "CANCELED" or "CANCELADO" => Cancelled,
            _ => null
        };
    }
}
