# Central Abastos Sync

Sistema logístico full stack para registrar pedidos, surtirlos en bodega, asignarlos a una unidad y confirmar su entrega.

## Tecnologías

- Backend: ASP.NET Core Web API, .NET 8, C# y Entity Framework Core 8.
- Base de datos: MySQL con Pomelo.EntityFrameworkCore.MySql.
- Seguridad: JWT, autorización por roles y contraseñas BCrypt.
- Frontend: React 18 con Create React App, React Router, Axios y Tailwind CSS.

## Roles y vistas

| Rol de base de datos | Ruta principal | Funciones |
|---|---|---|
| `Admin` | `/` | Usuarios, clientes, productos, flotilla, pedidos y asignación de camiones. |
| `LevantaPedido` | `/levanta-pedidos` | Registrar clientes, capturar pedidos, consultar sus pedidos y cancelar un pedido pendiente. |
| `Bodega` | `/bodega` | Confirmar pedidos, iniciar surtido, liberar pedidos y ajustar existencias. |
| `Chofer` | `/chofer` | Consultar unidad y pedidos asignados, abrir la ubicación, iniciar entrega y registrar el resultado. |

El frontend normaliza variantes antiguas como `ADMIN`, `DRIVER`, `LOGISTICS` y `LEVANTA_PEDIDOS`, pero la base actual usa los cuatro nombres de la tabla anterior.

## Flujo de un pedido

```text
Levanta pedidos
    Pending
       ↓
Bodega confirma
    Confirmed
       ↓
Bodega inicia surtido
    Preparing
       ↓
Bodega libera y descuenta inventario
    ReadyForDispatch
       ↓
Administrador asigna camión + chofer
       ↓
Chofer inicia recorrido
    Out for Delivery
       ↓
Chofer registra resultado
    Delivered / Delivery Failed
```

Reglas principales:

- El precio se toma del catálogo del servidor; el frontend no decide el precio final.
- El inventario se descuenta cuando Bodega cambia el pedido a `ReadyForDispatch`.
- Un pedido no puede salir a ruta sin camión asignado.
- Un chofer solo puede modificar pedidos de su propia unidad.
- Levanta pedidos solo consulta sus propios registros y solo puede cancelar mientras estén pendientes.
- Un usuario con rol Chofer no puede estar asignado a dos camiones.

## Endpoints agregados para los roles

| Método | Ruta | Uso |
|---|---|---|
| `GET` | `/api/orders/mine` | Pedidos creados por el usuario LevantaPedido autenticado. |
| `GET` | `/api/orders/warehouse` | Cola operativa de Bodega. |
| `GET` | `/api/orders/driver-dashboard` | Unidad y pedidos del Chofer autenticado. |
| `PATCH` | `/api/orders/{id}/status` | Cambio de estado validado según el rol. |
| `PUT` | `/api/orders/{id}/assign-truck?truckId={id}` | Asignación de unidad al pedido. |
| `PATCH` | `/api/products/{id}/stock` | Ajuste de existencias por Admin o Bodega. |

## Configuración del backend

Proyecto:

```text
Backend/src/CentralAbastos.Api/CentralAbastos.Api
```

Configura `appsettings.json` o secretos de usuario con una conexión válida:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=central_abastos;User=root;Password=TU_PASSWORD;"
  },
  "Jwt": {
    "Key": "UNA_CLAVE_LARGA_Y_PRIVADA_DE_AL_MENOS_32_CARACTERES",
    "Issuer": "CentralAbastos.Api",
    "Audience": "CentralAbastos.Client",
    "ExpireDays": "7"
  }
}
```

Aplica las migraciones, incluida la columna de notas de pedidos:

```bash
cd Backend/src/CentralAbastos.Api/CentralAbastos.Api
dotnet restore
dotnet ef database update
dotnet run
```

Swagger estará disponible en la URL que muestre la terminal, normalmente bajo `/swagger` en ambiente Development.

## Datos de demostración

Después de crear la base mediante migraciones, puedes cargar datos locales:

```bash
mysql -u root -p central_abastos < Database/seed-dev.sql
```

Usuarios de desarrollo:

| Usuario | Rol | Contraseña |
|---|---|---|
| `admin` | Admin | `Demo123!` |
| `levanta1` | LevantaPedido | `Demo123!` |
| `bodega1` | Bodega | `Demo123!` |
| `chofer1` | Chofer | `Demo123!` |

Estas credenciales son únicamente para desarrollo.

## Configuración del frontend

Proyecto:

```text
client
```

Copia el ejemplo de variables:

```bash
cd client
cp .env.example .env
```

Contenido predeterminado:

```env
REACT_APP_API_URL=http://localhost:5247/api
```

Cambia el puerto si el backend inicia en otro. Después ejecuta:

```bash
npm install
npm start
```

Para generar producción:

```bash
npm run build
```

El backend permite por CORS los orígenes `http://localhost:3000` y `http://localhost:5173`.

## Prueba funcional recomendada

1. Inicia sesión como `levanta1`, registra o selecciona un cliente y crea un pedido.
2. Entra como `bodega1` y avanza el pedido: Confirmado → Preparando → Listo para salida.
3. Entra como `admin`, abre Pedidos y asigna el camión `ABC-123`.
4. Entra como `chofer1`, inicia la entrega y márcala como Entregada o Entrega fallida.
5. Comprueba en Bodega que el stock se descontó al liberar el pedido.

## Estructura relevante

```text
Backend/src/CentralAbastos.Api/
├── CentralAbastos.Api/
│   ├── Authorization/RoleNames.cs
│   ├── Controllers/
│   ├── Domain/OrderStatuses.cs
│   ├── Migrations/
│   └── Program.cs
├── Data/ApplicationDbContext.cs
└── Models/

client/src/
├── components/
├── context/AuthContext.jsx
├── pages/
│   ├── DriverDashboard.jsx
│   ├── OrderTakerDashboard.jsx
│   └── WarehouseDashboard.jsx
├── services/
└── utils/
```
