using System.ComponentModel.DataAnnotations;

namespace CentralAbastos.Api.Controllers.Dtos;

public class StockAdjustmentDto
{
    [Range(-1000000, 1000000)]
    public int QuantityChange { get; set; }
}
