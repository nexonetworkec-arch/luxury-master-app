
# 🛡️ Luxury Master® AI - Guía de Despliegue Seguro

Este documento detalla los pasos necesarios para desplegar la aplicación cumpliendo con los estándares de seguridad "Zero Client-Side Secrets".

## 1. Configuración del Backend (Firebase Functions)

Es imperativo configurar la clave de Gemini en el entorno seguro del servidor:

```bash
# Configurar clave de API en el servidor
firebase functions:secrets:set GEMINI_API_KEY
```

## 2. Despliegue de Reglas de Seguridad

Las reglas de la base de datos han sido endurecidas para prohibir accesos no administrativos a nodos sensibles.

```bash
firebase deploy --only database
```

## 3. Preparación del Frontend

Asegúrese de que el archivo `.env.production` (o el entorno de CI/CD) tenga la variable `VITE_API_BASE` apuntando a la URL de su función desplegada.

```bash
# Compilar para producción
npm run build
# Desplegar hosting
firebase deploy --only hosting
```

## 4. Auditoría Post-Despliegue

1. Verifique en las DevTools del navegador que **no existan** llamadas a `generativelanguage.googleapis.com`.
2. Todas las peticiones de IA deben ir a su dominio `/api/...`.
3. Verifique que el header `Authorization: Bearer <token>` esté presente en todas las llamadas al backend.
