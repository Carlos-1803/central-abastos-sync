# Central Abastos Logistics System

This repository contains a full-stack logistics management system for a central de abastos (wholesale market). The solution includes:

- **Backend**: .NET 8 Web API with Entity Framework Core and Pomelo.MySql provider
- **Database**: MariaDB schema with tables for roles, users, clients, trucks, products, orders, and order items
- **Frontend**: React 18 application with React Router, Axios, and a clean, minimalist UI

## Table of Contents
1. [Database Schema](#database-schema)
2. [Backend API](#backend-api)
3. [Frontend Application](#frontend-application)
4. [Testing & Validation](#testing--validation)
5. [Setup & Execution](#setup--execution)
6. [Future Improvements](#future-improvements)

---

## Database Schema

The script `Database/init.sql` creates the database `central_abastos` and the following tables:

| Table | Key Columns | Relationships |
|-------|-------------|---------------|
| **Roles** | Id (PK), Name, Description | – |
| **Users** | Id (PK), Username, PasswordHash, RoleId (FK) | RoleId → Roles.Id |
| **Clients** | Id (PK), Name, Phone, Address, IsActive | – |
| **Trucks** | Id (PK), PlateNumber, Model, Year, CapacityKg, IsActive, DriverId (FK) | DriverId → Users.Id |
| **Products** | Id (PK), Name, Description, Price, Stock, IsActive | – |
| **Orders** | Id (PK), ClientId (FK), OrderDate, Status, TotalAmount, AssignedTruckId (FK), DeliveryAddress, DeliveryLatitude, DeliveryLongitude | ClientId → Clients.Id; AssignedTruckId → Trucks.Id |
| **OrderItems** | Id (PK), OrderId (FK), ProductId (FK), Quantity, UnitPrice, Substore (computed) | OrderId → Orders.Id (CASCADE); ProductId → Products.Id |

### Sample Data (Inserted on DB creation)

- **Roles**: Admin, LevantaPedido, Bodega, Chofer (4 rows)
- **Users**: admin, levanta1, bodega1, choferi (one per role)
- **Clients**: Tienda A, Tienda B (2 rows)
- **Trucks**: ABC‑123 (assigned to chofer1), XYZ‑789 (unassigned), DEF‑456 (inactive) (3 rows)
- **Products**: Arroz Blanca, Frijol Negro, Aceite Vegetal, Azúcar Blanca (4 rows)

### Indexes for Performance

- IX_Orders_Status
- IX_Orders_AssignedTruckId
- IX_Orders_ClientId
- IX_OrderItems_OrderId
- IX_OrderItems_ProductId
- IX_Trucks_DriverId

---

## Backend API

Built with .NET 8 Web API, following a clean controller‑model‑data structure.

### Key Controllers

- **UsersController** – CRUD for system users and role assignment
- **ClientsController** – CRUD for client information
- **ProductsController** – CRUD for product catalog (price, stock)
- **TrucksController** – CRUD for fleet management, driver assignment
- **OrdersController** – Full CRUD plus:
  - `POST /api/orders` – creates an order and **automatically calculates** `TotalAmount` from line items
  - `GET /api/routes/{choferId}` – returns delivery points (latitude/longitude) for the truck assigned to the given driver, intended for map rendering on the driver’s frontend

### Data Access

- `ApplicationDbContext` configures DbSets for all entities, seeds role data, and defines relationships with proper cascade rules.
- Uses `Pomelo.EntityFrameworkCore.MySql` provider; connection string sourced from `appsettings.json`.

### Validation & Safety

- Parameterized queries (EF Core) prevent SQL injection.
- Model validation (DataAnnotations) on entities.
- Order creation validates at least one item exists and computes total before persisting.

---

## Frontend Application

A React (Vite) SPA with a responsive layout.

### Core Components

- **Layout.jsx** – outer shell with collapsible sidebar and main outlet
- **Sidebar.jsx** – role‑based navigation (Admin, LevantaPedido, Bodega, Chofer)
- **CentralAbastosLogo.svg** – custom geometric logo (truck/box motif) in corporate colors
- **Pages**
  - **Home.jsx** – dashboard with stats (orders today, revenue, active trucks, pending)
  - **Orders.jsx** – list view with filters, pagination, delete
  - **CreateOrder.jsx** – form to select client, add product lines (with quantities), optional delivery lat/long, notes; auto‑calculates total
  - **Trucks.jsx** – fleet table with status, driver assignment, edit/delete
  - **Clients.jsx** – customer directory with contact info, active/inactive flag
  - **Profile.jsx** – view/edit user details
- **Services/api.js** – Axios instance:
  - Base URL from `VITE_API_URL` env (defaults to `http://localhost:5000/api`)
  - Request interceptor attaches JWT token from `localStorage` (`Bearer <token>`)
  - Response interceptor handles errors globally

### Styling

- CSS variables for primary (deep blue `#2563eb`), secondary (slate `#64748b`), success (emerald `#10b981`), warning (amber `#f59e0b`), danger (red `#ef4444`).
- Card‑based layout, subtle shadows, rounded corners, hover effects.
- Responsive sidebar: collapses to icons on narrow screens; hamburger toggle.

### Role‑Based UI

| Role | Visible Menu Items |
|------|--------------------|
| **Admin** | Dashboard, Orders, Trucks, Clients, Users, Analytics, Settings, Logout |
| **LevantaPedido** | Dashboard, Orders (New & List), Clients, Profile |
| **Bodega** | Dashboard, Orders, Trucks, Profile |
| **Chofer** | Dashboard, My Routes (via `/routes/:id`), Profile |

---

## Testing & Validation (Updated)

### 1. Database

- Verified table creation, foreign keys, indexes.
- Confirmed sample data inserts:
  - Roles: 4
  - Users: 4 (one per role)
  - Clients: 2
  - Trucks: 3
  - Products: 4
  - Orders/OrderItems: 0 (ready for transactional data)

### 2. Backend

- **DbContext**: `using CentralAbastos.Api.Data;` in `Program.cs` correctly matches namespace `namespace CentralAbastos.Api.Data`.
- **POST /api/orders**: Updated to compute `TotalAmount` as sum of `Quantity * UnitPrice` from `order.Items`. Handles null/empty items with a 0 total and validation.
- **GET /api/routes/{choferId}**: Returns JSON array of objects:
  ```json
  [
    {
      "orderId": 1,
      "deliveryAddress": "Calle 123, Ciudad",
      "latitude": 19.4326,
      "longitude": -99.1332,
      "customerName": "Tienda A",
      "orderDate": "2026-07-19T10:30:00Z"
    }
  ]
  ```
  This matches the frontend expectation for map pin rendering.
- All CRUD operations compiled and passed basic sanity checks (no compile errors).

### 3. Frontend

- **Layout.jsx** – provides consistent structure with `<Outlet />` for child routes.
- **Sidebar.jsx** – role‑based rendering; icons imported correctly; collapsible behavior.
- **CreateOrder.jsx**:
  - Fetches clients/products on mount.
  - Dynamic line‑item addition/removal.
  - Computes total cost before submission (mirrors backend logic).
  - Sends `deliveryLatitude`/`deliveryLongitude` as numeric values.
  - Form validation prevents empty required fields.
- **services/api.js**:
  - Request interceptor attaches JWT token from `localStorage` if present.
  - Response interceptor propagates errors for handling in components.
  - Base URL configurable via `VITE_API_URL` environment variable.

No linting errors were observed in the reviewed files.

### Summary

All three layers integrate correctly:
- The frontend can call `/api/orders` with a JSON payload containing `clientId`, `items`, and optional geolocation; the backend persists the order and returns the created order with ID.
- The driver can call `/api/routes/{choferId}` to receive an array of delivery points with lat/long for map plotting.
- Role‑based navigation ensures users only see relevant sections.

---

## Setup & Execution

### Prerequisites

- **.NET 8 SDK**
- **MariaDB 10.5+** (or MySQL compatible)
- **Node.js >= 18** and **npm** (or `yarn`/`pnpm`)
- **Git**

### 1. Database

```bash
# Create database and apply schema
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS central_abastos;"
mysql -u root -p central_abastos < Database/init.sql
```

> Verify sample data:
> ```sql
> USE central_abastos;
> SELECT 'Roles' AS Table, COUNT(*) AS C FROM Roles UNION ALL
> SELECT 'Users', COUNT(*) FROM Users UNION ALL
> SELECT 'Clients', COUNT(*) FROM Clients UNION ALL
> SELECT 'Trucks', COUNT(*) FROM Trucks UNION ALL
> SELECT 'Products', COUNT(*) FROM Products;
> ```

### 2. Backend

```bash
cd Backend/src/CentralAbastos.Api
# Ensure correct project file: CentralAbastos.Api.csproj
dotnet restore        # Restore NuGet packages
dotnet build          # Build solution (should succeed)
dotnet run            # Starts API on https://localhost:5001 (and http://localhost:5000)
```

- Swagger UI available at `https://localhost:5001/swagger`.
- Update `appsettings.json` if your MariaDB connection differs:
  ```json
  {
    "ConnectionStrings": {
      "DefaultConnection": "server=localhost;port=3306;database=central_abastos;user=root;password=your_password;"
    }
  }
  ```

### 3. Frontend

```bash
cd client
npm install          # or yarn install
# Create .env file (optional) to override API URL:
# VITE_API_URL=https://your-backend-domain/api
npm run dev          # Vite dev server, usually http://localhost:5173
```

- The app will proxy API calls to the backend (adjust `VITE_API_URL` if needed).
- Login is not yet implemented; for testing you can manually set `localStorage.setItem('token', 'fake-jwt')` to satisfy the axios interceptor, or remove the auth requirement in the backend for early testing.

### 4. Verify Endpoints (using curl or Postman)

- **Create Order**:
  ```bash
  curl -X POST https://localhost:5001/api/orders \
    -H "Content-Type: application/json" \
    -d '{
          "clientId":1,
          "items":[{"productId":1,"quantity":2},{"productId":2,"quantity":1}],
          "deliveryAddress":"Calle 123, Ciudad",
          "deliveryLatitude":19.4326,
          "deliveryLongitude":-99.1332,
          "notes":"Leave at gate"
        }'
  ```
  Response includes `id` and generated `totalAmount`.

- **Get Driver Routes** (assuming driver ID = 4 and truck assigned):
  ```bash
  curl -X GET https://localhost:5001/api/routes/4
  ```

---

## Future Improvements

1. **Authentication** – Implement JWT issue/refresh on `/auth/login`, protect endpoints with `[Authorize]` and role policies.
2. **Real‑time Updates** – SignalR/WebSocket for live order status pushed to drivers/dispatch.
3. **Advanced Filtering & Pagination** – Server‑side paging, sorting, search on lists.
4. **Map Integration** – Embed Leaflet or Google Maps in driver view to render routes from `/routes/:id`.
5. **Inventory Alerts** – Low‑stock notifications, automatic reorder suggestions.
6. **Offline Capability** – Service Worker + IndexedDB for intermittent connectivity.
7. **CI/CD** – GitHub Actions workflow to build/test Docker containers.
8. **Comprehensive Testing** – Unit tests (xUnit) for services/Controllers, Jest/React Testing Library for frontend components.

---

## Troubleshooting

- **Database connection failure** – Verify `appsettings.json` connection string, ensure MariaDB service is reachable, user has rights.
- **API 401** – Ensure a valid JWT is stored in `localStorage` (if auth enabled) or temporarily disable `[Authorize]` on controllers for testing.
- **CORS issues** – Backend currently allows any origin (default). Adjust `CorsPolicy` in `Program.cs` if needed.
- **Frontend not showing data** – Check browser console for network errors; validate `VITE_API_URL` points to correct backend host/port.

---
*Last updated: 2026-07-27*  
*Version: 1.0.0 (initial feature-complete release)*

## 🛡️ Reglas de Calidad y Políticas de Integración (Branch Protection)

Para mantener el código del sistema de gestión libre de errores y asegurar que la logística de la flota de camiones nunca se detenga, se han configurado reglas estrictas de protección en las ramas `develop` y `main`.

### 1. Reglas Obligatorias de GitHub (Branch Protection Rules)
Cualquier intento de subir código a las ramas principales debe cumplir con los siguientes requisitos del repositorio:
*   **Bloqueo de Push Directo:** Está estrictamente prohibido subir cambios directamente (*direct push*) a `develop` o `main`. Todo debe pasar por un Pull Request.
*   **Pruebas Automáticas Exigidas (Status Checks):** El flujo de trabajo automatizado de GitHub Actions (`Validacion de Codigo`) debe completarse con éxito (check verde) para que se habilite el botón de integración.
*   **Aprobación Obligatoria:** Se requiere al menos **1 revisión aprobada** para poder fusionar el código.

---

### 🤖 2. Integración de CodeRabbit AI (Revisión Automatizada con IA)

Para agilizar el proceso de revisión, optimizar los tiempos de entrega y apoyar a los desarrolladores cuando trabajan de forma individual, el repositorio cuenta con un agente de IA integrado llamado **CodeRabbit**.

El bot actúa como un revisor de código (Code Reviewer) virtual activo las 24 horas y tiene las siguientes responsabilidades:

#### ¿Qué hace el bot automáticamente?
*   **Análisis de cambios (Diff Analysis):** En cuanto se abre un Pull Request, CodeRabbit examina cada línea de código modificada.
*   **Retroalimentación en tiempo real:** Deja comentarios detallados directamente en el código sugiriendo mejoras de rendimiento, detectando posibles bugs lógicos o alertando sobre malas prácticas.

#### Comandos interactivos del bot (ChatOps)
Cualquier desarrollador del equipo puede comunicarse con la IA directamente desde los comentarios del Pull Request utilizando los siguientes comandos:

*   **`@coderabbitai review`**: Obliga al bot a realizar una nueva inspección completa del código en la rama (útil si se subieron nuevos cambios o si el Pull Request apunta a una rama secundaria como `develop`).
*   **`@coderabbitai approve`**: Una vez que se han resuelto los comentarios y la IA valida que el código cumple con los estándares, este comando le indica al bot que otorgue su **aprobación formal**. Al contar con permisos de escritura, el voto de CodeRabbit satisfará el requisito de aprobación de GitHub, liberando el botón verde de **Merge** de forma automática.

---
