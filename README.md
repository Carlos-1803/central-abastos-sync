# Central Abastos Sync

Sistema web para la administración y seguimiento del proceso logístico de una central de abastos.

La aplicación permite registrar clientes, productos, pedidos, usuarios y unidades de transporte. También controla el flujo de los pedidos desde su captura, preparación en bodega, asignación de camión y entrega final al cliente.

---

## Estado actual del proyecto

El sistema cuenta con autenticación mediante JWT y control de acceso basado en roles.

Actualmente están disponibles las vistas para:

- Administrador.
- Levanta pedidos.
- Bodega.
- Chofer.

Cada usuario visualiza únicamente las funciones correspondientes a su rol.

---

## Tecnologías utilizadas

### Backend

- ASP.NET Core Web API.
- .NET 8.
- C#.
- Entity Framework Core 8.
- Pomelo Entity Framework Core para MariaDB.
- JWT para autenticación.
- BCrypt para el almacenamiento seguro de contraseñas.
- Swagger para documentación y pruebas de la API.

### Frontend

- React 18.
- React Router DOM.
- Axios.
- Tailwind CSS.
- Leaflet y React Leaflet.
- IndexedDB para pedidos sin conexión.
- Create React App.

### Base de datos

- MariaDB.
- Base de datos utilizada: `central_abastos`.

---

## Funciones principales

### Autenticación y seguridad

- Inicio de sesión mediante nombre de usuario y contraseña.
- Generación de token JWT.
- Protección de rutas en el frontend.
- Protección de endpoints en el backend.
- Autorización según el rol del usuario.
- Contraseñas almacenadas con BCrypt.
- Normalización de nombres de roles entre la base de datos, el backend y React.

### Administración de usuarios

- Registrar usuarios.
- Consultar usuarios.
- Editar usuarios.
- Cambiar el rol de un usuario.
- Restablecer la contraseña de un usuario.
- Eliminar usuarios.
- Consultar los roles disponibles.

### Administración de clientes

- Registrar clientes.
- Consultar clientes.
- Editar clientes.
- Eliminar o desactivar clientes.
- Seleccionar clientes al crear un pedido.

### Administración de productos

- Registrar productos.
- Consultar productos.
- Editar información de productos.
- Consultar existencias.
- Ajustar el inventario.
- Desactivar o eliminar productos.
- Validar existencias antes de liberar un pedido.

### Administración de camiones

- Registrar unidades.
- Consultar unidades.
- Editar unidades.
- Asignar un chofer a un camión.
- Consultar camiones activos.
- Evitar que un mismo chofer sea asignado a más de una unidad.
- Asignar una unidad a un pedido listo para entrega.

### Administración de pedidos

- Crear pedidos.
- Seleccionar cliente.
- Agregar productos y cantidades.
- Calcular el total utilizando los precios del backend.
- Registrar ubicación geográfica de entrega.
- Agregar notas al pedido.
- Consultar pedidos.
- Modificar pedidos permitidos.
- Cancelar pedidos.
- Asignar camión y chofer.
- Controlar el estado operativo del pedido.
- Registrar entregas exitosas o fallidas.

---

## Roles del sistema

| Rol en la base de datos | Vista principal | Funciones |
|---|---|---|
| `Admin` | `/` | Gestiona usuarios, clientes, productos, inventario, camiones, pedidos y asignaciones. |
| `LevantaPedido` | `/levanta-pedidos` | Registra clientes, captura pedidos, consulta sus pedidos y cancela pedidos pendientes. |
| `Bodega` | `/bodega` | Confirma pedidos, inicia el surtido, libera pedidos y ajusta existencias. |
| `Chofer` | `/chofer` | Consulta su unidad, visualiza pedidos asignados, inicia recorridos y registra entregas. |

El frontend también reconoce variantes de roles antiguas como:

- `ADMIN`
- `ADMINISTRADOR`
- `DRIVER`
- `LEVANTA_PEDIDOS`
- `ORDER_TAKER`
- `LOGISTICS`
- `WAREHOUSE`

Estas variantes son normalizadas internamente a los cuatro roles principales.

---

## Rutas del frontend

### Rutas generales

| Ruta | Acceso |
|---|---|
| `/login` | Pública |
| `/` | Todos los usuarios autenticados |
| `/profile` | Todos los usuarios autenticados |

### Administrador

| Ruta | Función |
|---|---|
| `/orders` | Administración de pedidos |
| `/orders/new` | Crear pedido |
| `/clients` | Administración de clientes |
| `/products` | Administración de productos |
| `/inventory` | Administración de inventario |
| `/fleet` | Administración de flotilla |
| `/fleet/active` | Camiones activos |
| `/users` | Administración de usuarios |

### Levanta pedidos

| Ruta | Función |
|---|---|
| `/levanta-pedidos` | Panel principal |
| `/orders/new` | Captura de pedidos |

### Bodega

| Ruta | Función |
|---|---|
| `/bodega` | Cola operativa de pedidos |
| `/inventory` | Consulta y ajuste de inventario |

### Chofer

| Ruta | Función |
|---|---|
| `/chofer` | Unidad, ruta y pedidos asignados |

---

## Flujo de un pedido

El flujo operativo implementado es el siguiente:

```text
Levanta pedidos crea el pedido
             │
             ▼
          Pending
             │
             ▼
Bodega confirma el pedido
             │
             ▼
         Confirmed
             │
             ▼
Bodega inicia el surtido
             │
             ▼
         Preparing
             │
             ▼
Bodega libera el pedido y descuenta inventario
             │
             ▼
     ReadyForDispatch
             │
             ▼
Administrador asigna camión y chofer
             │
             ▼
Chofer inicia el recorrido
             │
             ▼
     Out for Delivery
             │
        ┌────┴────┐
        ▼         ▼
   Delivered  Delivery Failed
```

El pedido también puede cambiar al estado:

```text
Cancelled
```

cuando la cancelación está permitida.

---

## Estados de los pedidos

| Estado interno | Descripción |
|---|---|
| `Pending` | Pedido capturado y pendiente de revisión. |
| `Confirmed` | Pedido confirmado por Bodega. |
| `Preparing` | Pedido en proceso de surtido. |
| `ReadyForDispatch` | Pedido surtido y listo para asignar a una unidad. |
| `Out for Delivery` | Pedido en ruta de entrega. |
| `Delivered` | Pedido entregado correctamente. |
| `Delivery Failed` | No fue posible completar la entrega. |
| `Cancelled` | Pedido cancelado. |

El backend también reconoce nombres equivalentes en español, por ejemplo:

- Pendiente.
- Confirmado.
- Preparando.
- Listo para salir.
- En ruta.
- Entregado.
- Entrega fallida.
- Cancelado.

---

## Reglas de negocio

- El precio final de cada producto se obtiene desde el backend.
- El frontend no puede modificar directamente el precio del pedido.
- Bodega descuenta el inventario al liberar un pedido.
- No se puede liberar un pedido si no existe suficiente inventario.
- Un pedido no puede iniciar recorrido sin tener un camión asignado.
- El camión debe estar activo.
- El camión debe tener asignado un usuario con rol Chofer.
- Un chofer no puede estar asignado a dos camiones.
- Un chofer solo puede modificar pedidos asignados a su unidad.
- Levanta pedidos solamente puede consultar sus propios pedidos.
- Levanta pedidos solamente puede cancelar pedidos que todavía estén pendientes.
- Bodega no puede realizar acciones exclusivas del Administrador.
- Las acciones operativas se validan tanto en React como en la API.

---

## Funcionamiento sin conexión

La captura de pedidos incluye soporte básico sin conexión mediante IndexedDB.

Cuando el dispositivo pierde conexión:

1. El pedido se guarda localmente en el navegador.
2. El sistema muestra la cantidad de pedidos pendientes.
3. Al recuperar la conexión se intenta realizar la sincronización.
4. Los pedidos aceptados por el backend se eliminan de la cola local.
5. Los pedidos rechazados permanecen pendientes para su revisión.

La base local utilizada por el navegador se llama:

```text
CentralAbastosSyncDB
```

El almacén de pedidos pendientes se llama:

```text
pendingOrders
```

---

## Estructura del proyecto

```text
central-abastos-sync/
├── .github/
│   └── workflows/
├── Backend/
│   ├── CentralAbastos.sln
│   └── src/
│       └── CentralAbastos.Api/
│           ├── CentralAbastos.Api/
│           │   ├── Authorization/
│           │   ├── Controllers/
│           │   ├── Domain/
│           │   ├── Migrations/
│           │   ├── Services/
│           │   ├── Program.cs
│           │   └── appsettings.json
│           ├── Data/
│           └── Models/
├── client/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       ├── services/
│       └── utils/
├── Database/
│   ├── init.sql
│   └── seed-dev.sql
└── README.md
```

---

# Instalación y ejecución

## Requisitos

Antes de ejecutar el proyecto se necesita:

- Git.
- .NET SDK 8.
- Node.js.
- npm.
- MariaDB.
- Herramienta `dotnet-ef`.
- Navegador web moderno.

Para revisar las versiones:

```bash
git --version
dotnet --version
node --version
npm --version
mariadb --version
```

---

## 1. Clonar el repositorio

```bash
git clone https://github.com/Carlos-1803/central-abastos-sync.git
cd central-abastos-sync
```

Para trabajar con las vistas por rol:

```bash
git switch feature/vistas-roles
```

---

## 2. Configurar MariaDB

Entrar a MariaDB como administrador:

```bash
sudo mariadb
```

Crear la base de datos:

```sql
CREATE DATABASE IF NOT EXISTS central_abastos
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

Crear un usuario para la aplicación:

```sql
CREATE USER IF NOT EXISTS 'abastos_user'@'localhost'
IDENTIFIED BY 'TU_PASSWORD';
```

Otorgar permisos:

```sql
GRANT ALL PRIVILEGES ON central_abastos.*
TO 'abastos_user'@'localhost';

FLUSH PRIVILEGES;
```

Comprobar la base:

```sql
SHOW DATABASES;
```

Salir:

```sql
EXIT;
```

---

## 3. Configurar la conexión del backend

Editar:

```text
Backend/src/CentralAbastos.Api/CentralAbastos.Api/appsettings.json
```

Ejemplo:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "server=localhost;port=3306;database=central_abastos;user=abastos_user;password=TU_PASSWORD;"
  },
  "Jwt": {
    "Key": "ClaveSecretaSuperSeguraCentralAbastosSync2026_JWT_Key!",
    "Issuer": "CentralAbastosApi",
    "Audience": "CentralAbastosClient",
    "ExpireDays": 7
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

La contraseña del archivo debe coincidir con la contraseña configurada en MariaDB.

No se recomienda publicar contraseñas reales ni claves JWT de producción en GitHub.

---

## 4. Instalar Entity Framework CLI

```bash
dotnet tool install --global dotnet-ef --version 8.0.11
```

En Linux, agregar la herramienta al `PATH`:

```bash
export PATH="$PATH:$HOME/.dotnet/tools"
```

Para conservarlo en Zsh:

```bash
echo 'export PATH="$PATH:$HOME/.dotnet/tools"' >> ~/.zshrc
source ~/.zshrc
```

Comprobar:

```bash
dotnet ef --version
```

---

## 5. Crear las tablas

Entrar al proyecto del backend:

```bash
cd Backend/src/CentralAbastos.Api/CentralAbastos.Api
```

Restaurar dependencias:

```bash
dotnet restore
```

Aplicar migraciones:

```bash
dotnet ef database update
```

Las migraciones crean las tablas y agregan los cambios más recientes, incluyendo las notas de los pedidos.

Para comprobar las tablas:

```bash
mariadb -u abastos_user -p central_abastos
```

Dentro de MariaDB:

```sql
SHOW TABLES;
SELECT Id, Username, RoleId FROM Users;
SELECT Id, Name FROM Roles;
```

---

## 6. Datos de demostración opcionales

Después de aplicar las migraciones se pueden insertar datos de prueba.

Desde la raíz del proyecto:

```bash
mariadb -u abastos_user -p central_abastos < Database/seed-dev.sql
```

Este archivo agrega los siguientes usuarios:

| Usuario | Rol | Contraseña |
|---|---|---|
| `admin` | Admin | `Demo123!` |
| `levanta1` | LevantaPedido | `Demo123!` |
| `bodega1` | Bodega | `Demo123!` |
| `chofer1` | Chofer | `Demo123!` |

También agrega:

- Clientes de prueba.
- Productos de prueba.
- Existencias iniciales.
- Un camión con placa `ABC-123`.
- El usuario `chofer1` asignado al camión.

Estas credenciales son únicamente para desarrollo.

El archivo no es obligatorio cuando ya existe información en la base de datos.

---

## 7. Ejecutar el backend

Desde:

```text
Backend/src/CentralAbastos.Api/CentralAbastos.Api
```

Ejecutar:

```bash
dotnet run --launch-profile http
```

Dirección predeterminada:

```text
http://localhost:5247
```

Swagger:

```text
http://localhost:5247/swagger
```

---

## Autenticación de la API

El inicio de sesión se realiza mediante:

```http
POST /api/Auth/login
```

Ejemplo de cuerpo:

```json
{
  "username": "admin",
  "password": "Demo123!"
}
```

La respuesta contiene un token JWT.

Los endpoints protegidos necesitan el encabezado:

```http
Authorization: Bearer TU_TOKEN
```

Una respuesta:

```text
401 Unauthorized
```

significa que la petición no envió un token válido o que el token expiró.

Una respuesta:

```text
403 Forbidden
```

significa que el usuario está autenticado, pero su rol no tiene permiso para ejecutar la acción.

El endpoint:

```http
GET /api/Users
```

solo puede ser consultado por un Administrador.

---

## 8. Configurar el frontend

Abrir otra terminal y entrar a:

```bash
cd client
```

Crear el archivo `.env`:

```bash
cp .env.example .env
```

Contenido:

```env
REACT_APP_API_URL=http://localhost:5247/api
```

Si el backend utiliza otro puerto, se debe modificar esta variable.

---

## 9. Ejecutar el frontend

Instalar dependencias:

```bash
npm install
```

Iniciar React:

```bash
npm start
```

Dirección predeterminada:

```text
http://localhost:3000
```

Para compilar una versión de producción:

```bash
npm run build
```

Las advertencias de `npm audit` no necesariamente impiden iniciar el proyecto.

No se recomienda ejecutar automáticamente:

```bash
npm audit fix --force
```

porque puede actualizar dependencias con cambios incompatibles.

---

## CORS

El backend permite peticiones desde:

```text
http://localhost:3000
http://localhost:5173
```

Si el frontend se ejecuta en otro puerto, debe agregarse el origen correspondiente en `Program.cs`.

---

# Endpoints principales

## Autenticación

| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/api/Auth/login` | Iniciar sesión y obtener el token JWT. |

## Usuarios

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/Users` | Consultar usuarios. |
| `GET` | `/api/Users/{id}` | Consultar un usuario. |
| `POST` | `/api/Users` | Registrar usuario. |
| `PUT` | `/api/Users/{id}` | Editar usuario. |
| `DELETE` | `/api/Users/{id}` | Eliminar usuario. |

## Roles

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/Roles` | Consultar roles. |
| `POST` | `/api/Roles` | Registrar rol. |

## Clientes

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/Clients` | Consultar clientes. |
| `GET` | `/api/Clients/{id}` | Consultar cliente. |
| `POST` | `/api/Clients` | Registrar cliente. |
| `PUT` | `/api/Clients/{id}` | Editar cliente. |
| `DELETE` | `/api/Clients/{id}` | Eliminar cliente. |

## Productos

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/Products` | Consultar productos. |
| `GET` | `/api/Products/{id}` | Consultar producto. |
| `POST` | `/api/Products` | Registrar producto. |
| `PUT` | `/api/Products/{id}` | Editar producto. |
| `PATCH` | `/api/Products/{id}/stock` | Ajustar existencias. |
| `DELETE` | `/api/Products/{id}` | Eliminar producto. |

## Camiones

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/Trucks` | Consultar camiones. |
| `GET` | `/api/Trucks/{id}` | Consultar camión. |
| `POST` | `/api/Trucks` | Registrar camión. |
| `PUT` | `/api/Trucks/{id}` | Editar camión o asignar chofer. |
| `DELETE` | `/api/Trucks/{id}` | Eliminar camión. |

## Pedidos

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/Orders` | Consultar pedidos para Administración o Bodega. |
| `GET` | `/api/Orders/{id}` | Consultar un pedido. |
| `POST` | `/api/Orders` | Crear pedido. |
| `PUT` | `/api/Orders/{id}` | Editar pedido. |
| `DELETE` | `/api/Orders/{id}` | Eliminar pedido como Administrador. |
| `GET` | `/api/Orders/mine` | Consultar pedidos propios de LevantaPedido. |
| `GET` | `/api/Orders/warehouse` | Consultar cola de Bodega. |
| `GET` | `/api/Orders/driver-dashboard` | Consultar unidad y pedidos del Chofer autenticado. |
| `GET` | `/api/Orders/routes/{driverId}` | Consultar pedidos asignados a un chofer. |
| `PATCH` | `/api/Orders/{id}/status` | Cambiar el estado de un pedido. |
| `PUT` | `/api/Orders/{id}/assign-truck?truckId={id}` | Asignar un camión a un pedido. |

---

# Prueba completa del flujo

## 1. Levanta pedidos

Iniciar sesión como un usuario con rol `LevantaPedido`.

- Registrar o seleccionar un cliente.
- Crear un pedido.
- Agregar productos.
- Registrar la ubicación.
- Guardar el pedido.

El pedido debe quedar en:

```text
Pending
```

## 2. Bodega

Iniciar sesión como un usuario con rol `Bodega`.

Cambiar el pedido en el siguiente orden:

```text
Pending
Confirmed
Preparing
ReadyForDispatch
```

Al liberar el pedido, el inventario debe descontarse.

## 3. Administrador

Iniciar sesión como un usuario con rol `Admin`.

- Abrir la administración de pedidos.
- Seleccionar un pedido listo.
- Asignar un camión con chofer.

## 4. Chofer

Iniciar sesión como el chofer asignado.

- Consultar la unidad.
- Consultar el pedido.
- Abrir la ubicación.
- Iniciar el recorrido.
- Registrar la entrega.

Resultado final:

```text
Delivered
```

o:

```text
Delivery Failed
```

---

# Solución de problemas

## `401 Unauthorized`

La petición no contiene un token JWT válido.

Solución:

- Iniciar sesión.
- Copiar el token.
- Enviar `Authorization: Bearer TOKEN`.
- Desde React, revisar que el token exista en la sesión.

## `403 Forbidden`

El usuario inició sesión, pero su rol no tiene permisos para el endpoint.

## No aparece `central_abastos`

Entrar como administrador:

```bash
sudo mariadb
```

Después crear la base y otorgar permisos.

## `dotnet ef` no existe

Instalar la herramienta:

```bash
dotnet tool install --global dotnet-ef --version 8.0.11
```

## Error de conexión a MariaDB

Revisar:

- Que MariaDB esté ejecutándose.
- Que la base exista.
- Que el usuario tenga permisos.
- Que la contraseña de `appsettings.json` sea correcta.
- Que el puerto sea `3306`.

Estado del servicio:

```bash
sudo systemctl status mariadb
```

## Ver usuarios de la base

```bash
mariadb -u abastos_user -p central_abastos
```

Después:

```sql
SELECT Id, Username, RoleId
FROM Users;
```

La columna `PasswordHash` contiene un hash BCrypt. La contraseña original no puede recuperarse a partir del hash; solamente puede restablecerse.

## El frontend no conecta con la API

Revisar `client/.env`:

```env
REACT_APP_API_URL=http://localhost:5247/api
```

Después reiniciar React:

```bash
npm start
```

## El puerto está ocupado

Backend:

```bash
dotnet run --urls=http://localhost:5250
```

Frontend:

```bash
PORT=3001 npm start
```

En ese caso también deben actualizarse CORS y la variable `REACT_APP_API_URL`.

---

## Seguridad

Para un entorno de producción se recomienda:

- No guardar contraseñas reales en GitHub.
- Utilizar secretos de usuario o variables de entorno.
- Cambiar la clave JWT.
- Cambiar las contraseñas de demostración.
- Utilizar HTTPS.
- Restringir los orígenes de CORS.
- Mantener MariaDB fuera del acceso público.
- Aplicar copias de seguridad.
- Configurar expiración y renovación de sesiones.

---

## Autor

Proyecto desarrollado para la administración logística de Central Abastos Sync.

Repositorio:

```text
https://github.com/Carlos-1803/central-abastos-sync
```
