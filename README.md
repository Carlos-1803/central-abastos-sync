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
---

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
