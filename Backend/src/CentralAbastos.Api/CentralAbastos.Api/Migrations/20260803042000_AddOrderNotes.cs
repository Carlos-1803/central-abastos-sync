using CentralAbastos.Api.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CentralAbastos.Api.Migrations;

[DbContext(typeof(ApplicationDbContext))]
[Migration("20260803042000_AddOrderNotes")]
public partial class AddOrderNotes : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "Orders",
                type: "varchar(500)",
                maxLength: 500,
                nullable: true)
            .Annotation("MySql:CharSet", "utf8mb4");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "Notes",
            table: "Orders");
    }
}
