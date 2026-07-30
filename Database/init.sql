-- Database schema for central-abastos-sync
-- Order management and truck fleet management

CREATE DATABASE IF NOT EXISTS central_abastos;
USE central_abastos;

-- Roles table
CREATE TABLE IF NOT EXISTS Roles (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(50) NOT NULL UNIQUE,
    Description VARCHAR(200)
);

-- Users table
CREATE TABLE IF NOT EXISTS Users (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    Username VARCHAR(100) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    RoleId INT NOT NULL,
    FOREIGN KEY (RoleId) REFERENCES Roles(Id)
);

-- Clients table
CREATE TABLE IF NOT EXISTS Clients (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(150) NOT NULL,
    Phone VARCHAR(20),
    Address VARCHAR(200),
    IsActive BIT NOT NULL DEFAULT 1
);

-- Trucks table  camiones
CREATE TABLE IF NOT EXISTS Trucks (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    PlateNumber VARCHAR(20) NOT NULL UNIQUE,
    Model VARCHAR(50) NOT NULL,
    Year INT NOT NULL,
    CapacityKg DECIMAL(10,2) NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    DriverId INT NULL,
    FOREIGN KEY (DriverId) REFERENCES Users(Id)
);

-- Products table (catalog)
CREATE TABLE IF NOT EXISTS Products (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(150) NOT NULL,
    Description TEXT,
    Price DECIMAL(10,2) NOT NULL,
    Stock INT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1
);

-- Orders table
CREATE TABLE IF NOT EXISTS Orders (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    ClientId INT NOT NULL,
    OrderDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Status VARCHAR(20) NOT NULL DEFAULT 'Pending', -- Pending, Confirmed, Shipped, Delivered, Cancelled
    TotalAmount DECIMAL(12,2) NOT NULL DEFAULT 0,
    AssignedTruckId INT NULL,
    DeliveryAddress VARCHAR(200),
    DeliveryLatitude DECIMAL(9,6),
    DeliveryLongitude DECIMAL(9,6),
    FOREIGN KEY (ClientId) REFERENCES Clients(Id),
    FOREIGN KEY (AssignedTruckId) REFERENCES Trucks(Id)
);

-- OrderItems table
CREATE TABLE IF NOT EXISTS OrderItems (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    OrderId INT NOT NULL,
    ProductId INT NOT NULL,
    Quantity DECIMAL(10,2) NOT NULL,
    UnitPrice DECIMAL(10,2) NOT NULL,
    Subtotal DECIMAL(12,2) AS (Quantity * UnitPrice) STORED,
    FOREIGN KEY (OrderId) REFERENCES Orders(Id) ON DELETE CASCADE,
    FOREIGN KEY (ProductId) REFERENCES Products(Id)
);

-- Indexes for performance
CREATE INDEX IX_Orders_Status ON Orders(Status);
CREATE INDEX IX_Orders_AssignedTruckId ON Orders(AssignedTruckId);
CREATE INDEX IX_Orders_ClientId ON Orders(ClientId);
CREATE INDEX IX_OrderItems_OrderId ON OrderItems(OrderId);
CREATE INDEX IX_OrderItems_ProductId ON OrderItems(ProductId);
CREATE INDEX IX_Trucks_DriverId ON Trucks(DriverId);

-- Sample data (optional)
INSERT INTO Roles (Name, Description) VALUES
('Admin', 'System administrator'),
('LevantaPedido', 'Creates orders'),
('Bodega', 'Warehouse manager'),
('Chofer', 'Driver');

INSERT INTO Users (Username, PasswordHash, RoleId) VALUES
('admin', 'hashed_password_here', 1),
('levanta1', 'hashed_password_here', 2),
('bodega1', 'hashed_password_here', 3),
('chofer1', 'hashed_password_here', 4);

INSERT INTO Clients (Name, Phone, Address, IsActive) VALUES
('Tienda A', '555-1234', 'Calle 123, Ciudad', 1),
('Tienda B', '555-5678', 'Avenida 456, Pueblo', 1);

INSERT INTO Products (Name, Description, Price, Stock, IsActive) VALUES
('Arroz Blanca', 'Arroz de grano largo', 25.50, 100, 1),
('Frijol Negro', 'Frijol cocido', 18.00, 80, 1),
('Aceite Vegetal', 'Aceite de soja 1L', 32.00, 50, 1),
('Azúcar Blanca', 'Azúcar refinada', 22.00, 120, 1);

INSERT INTO Trucks (PlateNumber, Model, Year, CapacityKg, IsActive, DriverId) VALUES
('ABC-123', 'Camioneta de Carga', 2020, 1500.00, 1, 4), -- assigned to chofer1
('XYZ-789', 'Camión de reparto', 2019, 2000.00, 1, NULL),
('DEF-456', 'Camión viejo', 2015, 1800.00, 0, NULL);