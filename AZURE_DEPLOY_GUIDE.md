# Guía de Despliegue en Microsoft Azure - AuditoriaPro

Has migrado con éxito la lógica de Firebase a una arquitectura nativa de Azure. Aquí tienes los pasos finales para ponerla en marcha.

## 1. Configuración de la Base de Datos (Cosmos DB)
1. Entra al [Azure Portal](https://portal.azure.com).
2. Crea un nuevo recurso de **Azure Cosmos DB** (elige la opción **Azure Cosmos DB for NoSQL**).
3. Asegúrate de activar el **Free Tier** (si es tu primera cuenta) para que sea gratis.
4. Una vez creado, ve a **Data Explorer** y crea:
   - Base de datos: `AuditoriaDB`
   - Contenedor: `audits`
   - Clave de partición (Partition Key): `/category`

## 2. Creación de la Static Web App
1. Crea un nuevo recurso de **Static Web App**.
2. En los detalles del despliegue:
   - **Source**: GitHub (o tu repositorio preferido).
   - **App location**: `AuditoriaPro Final`
   - **Api location**: `AuditoriaPro Final/api`
   - **Output location**: `dist`
3. Finaliza la creación y espera a que Azure termine el primer despliegue.

## 3. Conexión de la Base de Datos
1. Ve a tu recurso de Cosmos DB y copia la **Primary Connection String** (está en la sección "Keys").
2. Ve a tu recurso de **Static Web App** -> **Configuration**.
3. Añade una nueva variable de entorno:
   - Nombre: `COSMOS_CONNECTION_STRING`
   - Valor: (Pega la cadena de conexión que copiaste).
4. Guarda los cambios.

## 4. ¡Listo!
Tu aplicación ahora se comunica con Azure Functions, las cuales guardan y leen datos de Cosmos DB. El diseño y la experiencia de usuario siguen siendo los mismos, pero ahora bajo la infraestructura de Microsoft.

---
**Nota Técnica**: La carpeta `api/` contiene funciones de Node.js que actúan como puente. No necesitas configurar un servidor por separado; Azure Static Web Apps gestiona el despliegue de estas funciones automáticamente.
