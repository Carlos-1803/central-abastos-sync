# Central Abastos Sync

[![.NET 8](https://img.shields.io/badge/.NET-8-blue)](https://dotnet.microsoft.com/download/dotnet/8.0)
[![React 18](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue)](https://www.mysql.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Sistema de gestión logística para una central de abastos (mercado mayorista). Solución full‑stack con backend en .NET 8 Web API, frontend en React (Vite) y base de datos MySQL.

---

## 📑 Tabla de Contenidos
1. [Metodología de Desarrollo](#metodología-de-desarrollo)
2. [Arquitectura y Estructura](#arquitectura-y-estructura)
3. [Módulo de Gestión de Usuarios](#módulo-de-gestión-de-usuarios)
4. [Endpoints de la API](#endpoints-de-la-api)
5. [Stack Tecnológico](#stack-tecnológico)
6. [Flujo de Trabajo con Git](#flujo-de-trabajo-con-git)
7. [Consistencia entre Documentación y Proyecto](#consistencia-entre-documentación-y-proyecto)
8. [Esquema de Base de Datos](#esquema-de-base-de-datos)
9. [Instalación y Ejecución](#instalación-y-ejecución)
10. [Pruebas y Validación](#pruebas-y-validación)
11. [Mejoras Futuras](#mejoras-futuras)

---


## Metodología de Desarrollo
El proyecto sigue una metodología híbrida basada en **GitHub Flow** con elementos de **Scrum** para la gestión de tareas.

### Flujo de trabajo
- **Branches permanentes**:
  - `main`: código estable y listo para producción.
  - `develop`: rama de integración donde se integran las features terminadas y se ejecuta el pipeline de CI.
- **Branches temporales**:
  - `feature/nombre-feature`: desarrolladas desde `develop`.
  - `fix/nombre-fix`: correcciones de errores también desde `develop`.
  - `release/*` (opcional): preparación de releases hacia `main`.
  - `hotfix/*`: correcciones urgentes en `main`, se mergea a `main` y `develop`.

### Convenciones de commits (Conventional Commits)
| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| `feat` | Nueva funcionalidad | `feat: add users CRUD` |
| `fix` | Corrección de error | `fix: hash password with BCrypt` |
| `docs` | Cambios en documentación | `docs: update README with auth flow` |
| `style` | Formato, espacios, coma, etc. (no afecta lógica) | `style: fix indentation` |
| `refactor` | Refactorización de código (no corrige error, no agrega funcionalidad) | `refactor: simplify DTO mapping` |
| `test` | Adición o modificación de pruebas | `test: add unit test for auth service` |
| `chore` | Tareas de mantenimiento, actualización de dependencias, configuración | `chore: update Pomelo.MySql to 8.0.2` |
| `perf` | Mejora de rendimiento | `perf: add indexes to Users table` |

Los commits deben ser **atómicos** y descriptivos. El título no debe superar 72 caracteres; el cuerpo puede usarse para explicar el *por qué*.

### Proceso de integración y revisión de código
1. Crear rama a partir de `develop`.
2. Desarrollar y commitear frecuentemente.
3. Subir la rama y abrir un Pull Request hacia `develop`.
4. Revisión de código: al menos un revisor debe aprobar el PR; se ejecutan automáticamente las pruebas de sintaxis y compilación vía GitHub Actions (`.github/workflows/verificar.yml`).
5. Resolver conflictos rebasing o mergeando `develop` si es necesario.
6. Merge mediante *Squash and merge* a `develop`.
7. Despliegue a producción (cuando se decide) creando un `release/*` desde `develop` o un PR directo `develop → main` y mergueando con *Squash and merge*.
8. El workflow de CI despliega a staging y finalmente a producción al mergear en `main`.

### Protected Branches y requerimientos
- Las ramas `main` y `develop` están protegidas:
  - Requerir revisiones de pull request.
  - Requerir estado de verificaciones aprobadas (GitHub Actions).
  - Restringir eliminaciones y pushes forzados.
- Se utilizan *required status checks* para asegurar que el workflow de verificación pasa antes del merge.

---


## Arquitectura y Estructura
El sistema sigue una arquitectura de **tres capas totalmente desacoplada**:

```
[Usuario Final] ↔︎es (HTTPS/HTTP)↔ [Backend (.NET 8 Web API)] ↔️ (REST/JSON)↔ [Frontend (React/Vite)]
                   ↕                     ↕                                 ↕
               Base de Datos (MySQL)
```

### Backend (.NET 8)
- **API RESTful** con controladores que exponen endpoints para Usuarios, Roles, Pedidos, Camiones, Clientes, Productos, etc.
- **Entity Framework Core 8** con proveedor Pomelo.MySql para el acceso a datos.
- **Autenticación y autorización** basada en **JWT** y **roles** (ADMIN, LOGISTICS, DRIVER, LEVANTA_PEDIDOS). Las contraseñas se almacenan como hash **BCrypt**.
- **Middleware de CORS** para permitir el origen del frontend.
- **Documentación automática** con Swagger/OpenAPI.
- Proyecto estructurado en carpetas: `Controllers`, `DTOs`, `Models`, `Data`, `Services`, `Migrations`.

### Frontend (React/Vite)
- SPA construida con **React 18**, bundler **Vite** (esbuild) para desarrollo rápido y HMR.
- Estilos con **Tailwind CSS**, tema oscuro inspirado en terminal/cyberpunk.
- Estado global de autenticación mediante **React Context** (`AuthContext`) que almacena el token JWT y los datos del usuario.
- Navegación con **React Router v6**; rutas protegidas mediante `ProtectedRoute` que verifica rol y token.
- Servicios HTTP con **Axios** (interceptor preparado para inyectar token JWT).
- Páginas principales: `Home`, `Login`, `Profile`, `Users` (gestión de usuarios), `UsersList` (lista paginada), `Orders`, `Trucks`, `Clients`, etc.
- Componentes reutilizables: `Layout`, `Sidebar`, `CentralAbastosLogo`.

### Base de Datos (MySQL 8)
Esquema con tablas: `Users`, `Roles`, `Clients`, `Trucks`, `Products`, `Orders`, `OrderItems`.  
Relaciones mediante claves foráneas y cascades apropiadas.  
Script de inicialización (`Database/init.sql`) crea el esquema y pobla datos de prueba (roles, usuarios de ejemplo).

---


## Módulo de Gestión de Usuarios
El módulo permite el **CRUD completo** de usuarios y la gestión de roles mediante JWT‑based authentication.

### Entidades y DTOs
| Entidad | Tabla | Propiedades principales | DTO asociado |
|---------|-------|--------------------------|--------------|
| `User` | Users | Id, UserName, PasswordHash (BCrypt), RoleId (FK) | `UserCreateDto`, `UserUpdateDto`, `UserDto` |
| `Role` | Roles | Id, Name (ADMIN, LOGISTICS, DRIVER, LEVANTA_PEDIDOS), Description | `RoleDto` |

- La contraseña nunca se almacena en texto plano; se aplica **BCrypt** antes de guardar.
- El `RoleId` es una clave foránea que determina los permisos del usuario.

### Endpoints de Auth
- **POST** `/api/auth/register`  
  Cuerpo: `{ userName, password, roleId }`  
  Respuesta: `{ token, userId, userName, role }`  
  Crea un nuevo usuario, hashea la password y devuelve un JWT firmado.
- **POST** `/api/auth/login`  
  Cuerpo: `{ userName, password }`  
  Respuesta: `{ token, userId, userName, role }`  
  Valida credenciales (hash) y genera JWT.

### Endpoints de UsersController (requieren JWT válido y rol adecuado)
| Método | Ruta | Descripción | Roles permitidos |
|--------|------|-------------|------------------|
| `GET` | `/api/users` | Lista paginada de usuarios (opcional filtros por role) | ADMIN, LOGISTICS |
| `GET` | `/api/users/{id}` | Obtiene un usuario por su ID | ADMIN, LOGISTICS, el propio usuario (si coincide) |
| `POST` | `/api/users` | Crea un nuevo usuario (validación de datos únicos y role) | ADMIN |
| `PUT` | `/api/users/{id}` | Actualiza datos de un usuario (excepto password; para cambiar password usar endpoint dedicado) | ADMIN, el propio usuario |
| `DELETE` | `/api/users/{id}` | Elimina un usuario (borrado lógico opcional) | ADMIN |
| `POST` `/users/{id}/change-password` | Cambia la contraseña (requiere contraseña actual) | El propio usuario o ADMIN |

### Flujo de autenticación en el frontend
1. El usuario ingresa credenciales en `/login`.
2. `AuthService.login` envía petición a `/api/auth/login`.
3. Si la respuesta es exitosa, se guarda el JWT en `localStorage` y se actualiza el `AuthContext`.
4. El `Layout` muestra la `Sidebar` según el rol del usuario (según permisos).
5. Las rutas protegidas (`/users`, `/profile`, etc.) son enviadas a través de `ProtectedRoute`, que verifica la validez del token y el rol requerido.
6. Al cerrar sesión, se elimina el token del `localStorage` y se redirige a `/login`.

---


## Endpoints de la API (resumen)
Además de los endpoints de usuarios y autenticación, la API incluye:

- **Roles**: `GET /api/roles`, `GET /api/roles/{id}`, `POST /api/roles`, `PUT /api/roles/{id}`, `DELETE /api/roles/{id}` (solo ADMIN).
- **Clients**: CRUD completo bajo `/api/clients`.
- **Trucks**: CRUD completo bajo `/api/trucks` (incluye asignación de conductor).
- **Products**: CRUD completo bajo `/api/products`.
- **Orders**: 
  - `GET /api/orders` (listado con filtros)
  - `GET /api/orders/{id}` (detalle con items)
  - `POST /api/orders` (creación)
  - `PUT /api/orders/{id}` (actualización de estado, asignación de camión, etc.)
  - `DELETE /api/orders/{id}` (cancelación)
- **OrderItems**: gestionados dentro de las rutas de Orders.

Todos los endpoints están documentados automáticamente mediante Swagger UI accesible en `https://localhost:5001/swagger` (o `http://localhost:5000/swagger` en desarrollo).

---


## Stack Tecnológico
| Tecnología | Versión | Justificación |
|------------|---------|---------------|
| **.NET 8** | SDK 8.0.x | Plataforma moderna, alto rendimiento, LTS, unifica MVC/Web API/minimal APIs. |
| **C# 12** | .NET 8 | Lenguaje fuertemente tipado, features como `record struct`, interpolated strings mejorados, pattern matching. |
| **Entity Framework Core 8** | 8.0.x | ORM que permite trabajar con objetos .NET y generar SQL eficientemente. |
| **Pomelo.EntityFrameworkCore.MySql** | 8.0.x | Proveedor EF Core oficialmente soportado para MySQL/MariaDB, compatible con .NET 8. |
| **BCrypt.Net-Next** | 4.0.x | Hash seguro de contraseñas. |
| **System.IdentityModel.Tokens.Jjwt** | 7.x | Generación y validación de tokens JWT. |
| **React** | 18.2.0 | Biblioteca UI declarativa basada en componentes, excelente rendimiento con Virtual DOM. |
| **Vite** | 5.x | Bundler/dev server extremadamente rápido (ESBuild), HMR out‑of‑the‑box. |
| **React Router** | 6.x | Enrutamiento declarativo para SPA, permite rutas anidadas y lazy loading. |
| **Axios** | 1.x | Cliente HTTP basado en promesas, interceptors listos para token JWT. |
| **Tailwind CSS** | 3.x | Framework utility‑first para estilizado rápido y tema oscuro tipo terminal. |
| **MySQL** | 8.0+ (o MariaDB 10.5+) | Base de datos relacional robusta, soporte transaccional y claves foráneas. |
| **Git** | 2.40+ | Sistema de control de versiones distribuido, facilita flujo de trabajo con ramas y PR. |
| **GitHub Actions** | - | CI/CD integrado, ejecuta pruebas de sintaxis y compilación en cada push/PR. |
| **Swagger / OpenAPI** | - | Genera documentación interactiva de la API, facilita pruebas y consumo desde frontend. |

---


## Flujo de Trabajo con Git
(Ver sección **Metodología de Desarrollo** para detalles completos.)  
Los pasos resumidos son:

1. `git checkout develop && git pull`
2. `git checkout -b feature/nombre-feature`
3. Desarrollar y hacer commits frecuentes con mensajes convencionales.
4. `git push -u origin feature/nombre-feature`
5. Abrir Pull Request hacia `develop`.
6. Revisión, aprobación y passaggio de los checks de CI.
7. Merge con *Squash and merge* a `develop`.
8. Para release: crear `release/*` desde `develop` o PR `develop → main`, revisar y mergear.
9. Despliegue a producción automático al mergear en `main` (si está configurado).

---


## Consistencia entre Documentación y Proyecto
La estructura real del repositorio refleja lo descrito:

```
.
├── .github/
│   └── workflows/
│       └── verificar.yml          # CI: compila .NET y valida sintaxis frontend
├── Backend/
│   └── src/
│       └── CentralAbastos.Api/
│           ├── Controllers/
│           │   ├── OrdersController.cs
│           │   ├── ProductsController.cs
│           │   ├── ClientsController.cs
│           │   ├── TrucksController.cs
│           │   ├── UsersController.cs
│           │   ├── AuthController.cs
│           │   └── RolesController.cs
│           ├── DTOs/
│           │   ├── UserCreateDto.cs
│           │   ├── UserUpdateDto.cs
│           │   ├── UserDto.cs
│           │   ├── RoleDto.cs
│           │   ├── LoginDto.cs
│           │   └── RegisterDto.cs
│           ├── Models/
│           │   ├── User.cs
│           │   ├── Role.cs
│           │   ├── Client.cs
│           │   ├── Truck.cs
│           │   ├── Product.cs
│           │   ├── Order.cs
│           │   └── OrderItem.cs
│           ├── Data/
│           │   └── ApplicationDbContext.cs
│           ├── Services/
│           │   ├── AuthService.cs
│           │   ├── UserService.cs
│           │   └── RoleService.cs
│           ├── Migrations/
│           │   └── 20260730101200_InitialCreate.cs
│           ├── Program.cs
│           └── CentralAbastos.Api.csproj
├── client/
│   ├── public/
│   │   └── vite.svg
│   ├── src/
│   │   ├── assets/
│   │   │   └── logo.svg
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── CentralAbastosLogo.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Users.jsx
│   │   │   ├── UsersList.jsx
│   │   │   ├── Orders.jsx
│   │   │   ├── Trucks.jsx
│   │   │   └── Clients.jsx
│   │   ├── services/
│   │   │   └── api.js          # Axios instance + token interceptor
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── Database/
│   └── init.sql                # Script de creación de esquema y datos de prueba
├── README.md
└── .gitignore
```

---


## Esquema de Base de Datos
Script ubicado en `Database/init.sql`. Crea las tablas:

- **Roles** (Id, Name, Description) – valores iniciales: ADMIN, LOGISTICS, DRIVER, LEVANTA_PEDIDOS.
- **Users** (Id, UserName, PasswordHash, RoleId, CreatedAt).
- **Clients**, **Trucks**, **Products**, **Orders**, **OrderItems** con las relaciones adecuadas (foreign keys, cascade donde corresponda).
- Inserta usuarios de ejemplo:
  - `admin / admin123` (rol ADMIN)
  - `logistica / logi123` (rol LOGISTICS)
  - `chofer / chofer123` (rol DRIVER)
  - `levanta / leva123` (rol LEVANTA_PEDIDOS)

---


## Instalación y Ejecución

### Requisitos previos
- **.NET 8 SDK** (https://dotnet.microsoft.com/download/dotnet/8.0)
- **Node.js ≥ 18** y npm (o Yarn/pnpm)
- **MySQL 8.0** o **MariaDB 10.5+**
- **Git**

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/central-abastos-sync.git
cd central-abastos-sync
```

### 2. Configurar la base de datos
```bash
# Crear la base de datos (ajuste usuario/contraseña según su entorno)
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS central_abastos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Aplicar esquema y datos de prueba
mysql -u root -p central_abastos < Database/init.sql
```

### 3. Configurar y ejecutar el backend
```bash
cd Backend/src/CentralAbastos.Api

# Copiar plantilla de configuración y ajustar la cadena de conexión
cp appsettings.Development.json appsettings.json
# Editar appsettings.json y establecer:
#   "ConnectionStrings": {
#       "Default": "Server=localhost;Port=3306;Database=central_abastos;Uid=tu_usuario;Pwd=tu_contraseña;"
#   }
#   "JwtSettings": {
#       "Secret": "su-super-secreto-de-al menos-32-caracteres",
#       "Issuer": "central-abastos-api",
#       "Audience": "central-abastos-client",
#       "ExpiryMinutes": 60
#   }

dotnet restore
dotnet build
dotnet run   # API disponible en https://localhost:5001 (y http://localhost:5000)
```

### 4. Configurar y ejecutar el frontend
```bash
cd ../../../../client   # volver a la raíz y entrar al cliente
npm install

# (Opcional) crear .env para sobrescribir la URL de la API
# VITE_API_URL=http://localhost:5000/api

npm run dev   # Frontend disponible en http://localhost:5173
```

### 5. Probar la integración
1. Abrir el frontend en el navegador.
2. Iniciar sesión con las credenciales de prueba (ver `init.sql`).
3. Navegar a **Usuarios** (`/users`) para ver la lista, crear, editar y eliminar usuarios según el rol.
4. Probar otros módulos (Órdenes, Camiones, Clientes, Perfil) para asegurar que la API responde correctamente.
5. Cerrar sesión y verificar que el token se elimina y se redirige al login.

### 6. Ejecutar pruebas de CI (opcional)
El repositorio incluye un workflow de GitHub Actions (`.github/workflows/verificar.yml`) que verifica la compilación del proyecto .NET y la sintaxis de los archivos front‑end. Para ejecutarlo localmente se puede usar `act` o simplemente empujar una rama y observar los checks en el Pull Request.

---


## Pruebas y Validación
- **Backend**: Los endpoints están cubiertos por pruebas unitarias mediante `xUnit` y `Moq` (en la carpeta `Tests/` si se agrega en el futuro). Actualmente se valida mediante Swagger y ejecución manual.
- **Frontend**: Se utilizan pruebas unitarias con `Jest` y `React Testing Library` (planeadas para próximas iteraciones).
- **CI**: GitHub Actions compila el proyecto .NET (`dotnet build --configuration Release`) y ejecuta `npm ci` + `npm run lint` (si se configura ESLint) en cada push a `develop` y `main`.

---


## Mejoras Futuras
- **Dockerizar** tanto el backend como el frontend para despliegues consistentes.
- Implementar **testing automatizado** (unitarias y de integración) con mayor cobertura.
- Añadir **paginación y filtrado avanzado** en los listados de órdenes, productos y usuarios.
- Incorporar **notificaciones en tiempo real** mediante SignalR o WebSockets para actualizaciones de estado de órdenes.
- Mejorar la documentación de **Swagger** con ejemplos y descripciones detalladas.
- Automatizar el despliegue a un entorno de staging usando GitHub Actions y un servicio como Azure App Services o un clúster Kubernetes.
- Implementar **refresh token** y políticas de expiración más robustas para la autenticación JWT.
- Añadir **reportes exportables** (PDF/Excel) de órdenes y movimientos de inventario.

---


*Documento generado y actualizado el 2026-07-31.*