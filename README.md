# central-abastos-sync
---

## 🛠️ Flujo de Trabajo y Control de Versiones (Git Flow Simplificado)

Para garantizar la estabilidad del sistema de gestión de pedidos y la flota de camiones, el repositorio está protegido y sigue un flujo de trabajo estructurado basado en ramas y revisión de código.

### 🌿 Estructura de Ramas

*   **`main` (Producción):** Contiene exclusivamente código 100% estable y probado. Es la versión que se encuentra activa operando en la bodega.
*   **`develop` (Integración):** Rama principal de desarrollo. Aquí se unifican las nuevas características de todo el equipo y se realizan las pruebas generales.
*   **`feature/nombre-tarea` (Características):** Ramas temporales que se crean para desarrollar una funcionalidad específica (ej. `feature/gestion-camiones`, `feature/registro-pedidos`). Nacen a partir de `develop` y se eliminan tras ser integradas.

---

### 🚀 Ciclo de Desarrollo Diario

Ningún miembro del equipo puede realizar cambios directos (*push*) sobre las ramas `main` o `develop`. El proceso obligatorio para agregar código es el siguiente:

1. **Crear una rama de trabajo:**
   Actualiza tu entorno local con los últimos cambios de la bodega y crea una rama descriptiva desde `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/tu-funcionalidad

   @coderabbitai approve
