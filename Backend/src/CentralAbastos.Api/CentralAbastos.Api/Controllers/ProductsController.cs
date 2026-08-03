using CentralAbastos.Api.Authorization;
using CentralAbastos.Api.Controllers.Dtos;
using CentralAbastos.Api.Data;
using CentralAbastos.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CentralAbastos.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProductsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ProductsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [Authorize(Roles = RoleNames.AllOperationalRoles)]
    public async Task<ActionResult<IEnumerable<ProductResponseDto>>> GetProducts()
    {
        var products = await _context.Products
            .OrderBy(product => product.Name)
            .Select(product => new ProductResponseDto
            {
                Id = product.Id,
                Name = product.Name,
                Description = product.Description,
                Price = product.Price,
                Stock = product.Stock,
                IsActive = product.IsActive
            })
            .ToListAsync();

        return Ok(products);
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = RoleNames.AllOperationalRoles)]
    public async Task<ActionResult<ProductResponseDto>> GetProduct(int id)
    {
        var product = await _context.Products
            .Where(item => item.Id == id)
            .Select(item => new ProductResponseDto
            {
                Id = item.Id,
                Name = item.Name,
                Description = item.Description,
                Price = item.Price,
                Stock = item.Stock,
                IsActive = item.IsActive
            })
            .FirstOrDefaultAsync();

        return product is null ? NotFound("Producto no encontrado.") : Ok(product);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = RoleNames.AdminOrWarehouse)]
    public async Task<IActionResult> PutProduct(int id, ProductUpdateDto dto)
    {
        var product = await _context.Products.FindAsync(id);
        if (product is null)
        {
            return NotFound("Producto no encontrado.");
        }

        product.Name = dto.Name.Trim();
        product.Description = dto.Description;
        product.Price = dto.Price;
        product.Stock = dto.Stock;
        product.IsActive = dto.IsActive;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPatch("{id:int}/stock")]
    [Authorize(Roles = RoleNames.AdminOrWarehouse)]
    public async Task<ActionResult<ProductResponseDto>> AdjustStock(int id, StockAdjustmentDto dto)
    {
        if (dto.QuantityChange == 0)
        {
            return BadRequest(new { message = "El ajuste de existencia no puede ser cero." });
        }

        var product = await _context.Products.FindAsync(id);
        if (product is null)
        {
            return NotFound(new { message = "Producto no encontrado." });
        }

        var newStock = product.Stock + dto.QuantityChange;
        if (newStock < 0)
        {
            return BadRequest(new { message = "La existencia no puede quedar en números negativos." });
        }

        product.Stock = newStock;
        await _context.SaveChangesAsync();

        return Ok(ToDto(product));
    }

    [HttpPost]
    [Authorize(Roles = RoleNames.AdminOrWarehouse)]
    public async Task<ActionResult<ProductResponseDto>> PostProduct(ProductCreateDto dto)
    {
        var product = new Product
        {
            Name = dto.Name.Trim(),
            Description = dto.Description,
            Price = dto.Price,
            Stock = dto.Stock,
            IsActive = dto.IsActive
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, ToDto(product));
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = RoleNames.Admin)]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product is null)
        {
            return NotFound("Producto no encontrado.");
        }

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private static ProductResponseDto ToDto(Product product)
    {
        return new ProductResponseDto
        {
            Id = product.Id,
            Name = product.Name,
            Description = product.Description,
            Price = product.Price,
            Stock = product.Stock,
            IsActive = product.IsActive
        };
    }
}
