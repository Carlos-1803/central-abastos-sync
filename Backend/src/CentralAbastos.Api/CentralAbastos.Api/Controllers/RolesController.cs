using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CentralAbastos.Api.Data; // Ajusta según tu namespace de DbContext
using CentralAbastos.Api.Models; // Ajusta según tu namespace de modelos

namespace CentralAbastos.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RolesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public RolesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Role>>> GetRoles()
        {
            return await _context.Roles.ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Role>> PostRole(Role role)
        {
            _context.Roles.Add(role);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetRoles), new { id = role.Id }, role);
        }
    }
}