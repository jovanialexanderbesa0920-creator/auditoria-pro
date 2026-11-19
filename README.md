# Auditoría Pro

Plataforma web para auditorías de calidad en planta: reemplaza los registros en papel y Excel por inspecciones en tiempo real, con indicadores de cumplimiento automáticos.

Parte del ecosistema de productos de **Atreum Tech**.

## Qué hace
- **Nueva auditoría** guiada: identificación del auditor, selección de línea y proceso, y marcado de seis criterios por formato (legible, firmado, sin vacíos, frecuencias, especificación y correcciones).
- **Dashboard y consolidado** con indicadores y semaforización de cumplimiento por área y por mes.
- **Historial** de auditorías con búsqueda y filtros.
- **Sincronización en tiempo real** entre dispositivos con Firebase Firestore. Existe además una app móvil nativa en SwiftUI con el mismo modelo de datos.

## Stack
React 18, Vite, Tailwind CSS, Framer Motion, Recharts, Firebase Firestore. API opcional en Azure Functions con Cosmos DB (carpeta `api/`).

## Cómo correrlo
```bash
npm install
cp .env.example .env   # completa las variables de tu proyecto Firebase
npm run dev
```

## Nota
La estructura de formatos de `src/constants.js` es un ejemplo genérico. Los datos reales de clientes no hacen parte de este repositorio.
