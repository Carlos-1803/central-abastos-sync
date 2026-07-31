# Central Abastos Sync

[![.NET 8](https://img.shields.io/badge/.NET-8-blue)](https://dotnet.microsoft.com/download/dotnet/8.0)
[![React 18](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue)](https://www.mysql.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Sistema de gestión logística para una central de abastos (mercado mayorista). Solución full-stack con backend en .NET 8 Web API, frontend en React (Vite) y base de datos MySQL.

---

## 📑 Tabla de Contenidos
1. [Metodología de Desarrollo](#metodología-de-desarrollo)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Stack Tecnológico](#stack-tecnológico)
4. [Flujo de Trabajo con Git](#flujo-de-trabajo-con-git)
5. [Consistencia entre Documentación y Proyecto](#consistencia-entre-documentación-y-proyecto)
6. [Instalación y Ejecución](#instalación-y-ejecución)
7. [Mejoras Futuras](#mejoras-futuras)

---

## Metodología de Desarrollo (20 pts)

El proyecto sigue una metodología híbrida basada en **GitHub Flow** con elementos de **Scrum** para la gestión de tareas.

### Flujo de trabajo
- **Branches permanentes**:
  - `main`: código estable y listo para producción.
  - `develop`: rama de integración donde se integran las features terminadas y se ejecuta el pipeline de CI.
- **Branches temporales**:
  - `feature/nombre-feature`: desarrolladas desde `develop`.
  - `fix/nombre-fix`: correcciones de errores también desde `develop`.
  - `release/*` (opcional): para preparación de releases hacia `main`.

### Entregables del proyecto
- **Backend**: API RESTful con .NET 8, Entity Framework Core (Pomelo.MySql) y Swagger/OpenAPI.
- **Frontend**: SPA React con Vite, React Router, Axios y diseño responsivo.
- **Base de datos**: Esquema MySQL con tablas para Roles, Usuarios, Clientes, Camiones, Productos, Pedidos e ítems de pedido.
- **Documentación**: Este README, diagramas arquitectónicos y comentarios en código.

### Ciclo de desarrollo y evidencia
1. **Inicio de tarea**: Se crea una issue en GitHub y se asigna a un desarrollador.
2. **Branch de feature**: Se crea `feature/desc-tarea` desde `develop`.
3. **Desarrollo**: Se implementan los cambios siguiendo los estándares de código (Conventional Commits, linting).
4. **Commit frecuente**: Se hacen commits frecuentes con mensaje descriptivo siguiendo la convención `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.
5. **Pull Request**: Al completar la feature, se abre un PR hacia `develop`. Se requiere al menos una aprobación y el paso exitoso del workflow de GitHub Actions (`verificar.yml`).
6. **Code Review**: Se revisa lógica, pruebas, estilo y cumplimiento de requisitos.
7. **Merge**: Tras aprobación, se mergea mediante *squash and merge* para mantener historial lineal.
8. **Despliegue**: El workflow de CI despliega a un entorno de staging (si aplica) y finalmente a producción al mergear en `main`.

**Evidencia en el repositorio**: 
- Historial de commits muestra uso de Conventional Commits (ej. `feat: add orders controller`, `fix: fix order total calculation`).
- Existen múltiples pull requests revisados y aprobados.
- El archivo `.github/workflows/verificar.yml` ejecuta validación de sintaxis y compilación en cada push a `develop` y `main`.

---

## Arquitectura del Sistema (20 pts)

### Visión general (C4 Context)
El sistema sigue una arquitectura de tres capas totalmente desacoplada:

```mermaid
flowchart LR
    subgraph Usuario["Usuario Final"]
        direction TB
        A["Navegador Web"]
    end

    subgraph Backend["Backend (.NET 8 Web API)"]
        direction TB
        B["API Gateway / Controllers"]
        C["Controladores REST"]
        D["Servicios de Aplicación"]
        E["Acceso a Datos (EF Core)"]
        F[("MySQL")]

        B --> C
        C --> D
        D --> E
        E --> F
    end

    subgraph Frontend["Frontend (React/Vite)"]
        direction TB
        G["React SPA"]
        H["Assets estáticos"]
        G --> H
    end

    A -->|HTTPS/HTTP| B
    G -->|Axios JSON| B

    style Usuario fill:#f9f,stroke:#333,stroke-width:2px
    style Backend fill:#bbf,stroke:#333,stroke-width:2px
    style Frontend fill:#bfb,stroke:#333,stroke-width:2px