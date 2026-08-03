-- Datos de desarrollo para una base creada con las migraciones de Entity Framework.
-- Contraseña de TODOS los usuarios de demostración: Demo123!
-- No usar estas credenciales en producción.

USE central_abastos;

INSERT INTO Roles (Id, Name, Description) VALUES
    (1, 'Admin', 'System administrator'),
    (2, 'LevantaPedido', 'Creates orders'),
    (3, 'Bodega', 'Warehouse manager'),
    (4, 'Chofer', 'Driver')
ON DUPLICATE KEY UPDATE
    Name = VALUES(Name),
    Description = VALUES(Description);

SET @demo_password_hash = '$2a$12$9cEL8YqVgZMXgjkpK1EX0OFa8LvNnno/nmVJe6UNISY/VwdcfyXD.';

INSERT INTO Users (Id, Username, PasswordHash, RoleId) VALUES
    (1, 'admin', @demo_password_hash, 1),
    (2, 'levanta1', @demo_password_hash, 2),
    (3, 'bodega1', @demo_password_hash, 3),
    (4, 'chofer1', @demo_password_hash, 4)
ON DUPLICATE KEY UPDATE
    Username = VALUES(Username),
    PasswordHash = VALUES(PasswordHash),
    RoleId = VALUES(RoleId);

INSERT INTO Clients (Id, Name, Phone, Address, IsActive) VALUES
    (1, 'Tienda La Esperanza', '981-100-1001', 'Candelaria, Campeche', 1),
    (2, 'Abarrotes del Centro', '981-100-1002', 'Centro, Candelaria', 1)
ON DUPLICATE KEY UPDATE
    Name = VALUES(Name),
    Phone = VALUES(Phone),
    Address = VALUES(Address),
    IsActive = VALUES(IsActive);

INSERT INTO Products (Id, Name, Description, Price, Stock, IsActive) VALUES
    (1, 'Arroz blanco', 'Saco de arroz de grano largo', 650.00, 40, 1),
    (2, 'Frijol negro', 'Saco de frijol negro', 820.00, 25, 1),
    (3, 'Aceite vegetal', 'Caja con botellas de aceite', 560.00, 18, 1),
    (4, 'Azúcar blanca', 'Saco de azúcar refinada', 710.00, 30, 1)
ON DUPLICATE KEY UPDATE
    Name = VALUES(Name),
    Description = VALUES(Description),
    Price = VALUES(Price),
    Stock = VALUES(Stock),
    IsActive = VALUES(IsActive);

INSERT INTO Trucks (Id, PlateNumber, Model, Year, CapacityKg, IsActive, DriverId) VALUES
    (1, 'ABC-123', 'Camión de reparto', 2022, 3500, 1, 4)
ON DUPLICATE KEY UPDATE
    PlateNumber = VALUES(PlateNumber),
    Model = VALUES(Model),
    Year = VALUES(Year),
    CapacityKg = VALUES(CapacityKg),
    IsActive = VALUES(IsActive),
    DriverId = VALUES(DriverId);
