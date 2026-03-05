

## Plan: Corregir build error y desplegar

### 1. Fix del error en `send-auth-email/index.ts`

El error es que la librería Resend v2 devuelve `{ data, error }` en lugar de un objeto directo con `.id`.

**Línea 221 — cambiar:**
```typescript
// Antes:
emailId: emailResponse?.id
// Después:
emailId: (emailResponse as any)?.data?.id || (emailResponse as any)?.id
```

También la línea 218 del log.

### 2. Ejecutar la migración SQL de productos

Usar la herramienta de migración para crear la tabla `products` con las políticas RLS ya definidas en el archivo de migración.

### 3. Desplegar la edge function `send-auth-email`

Una vez corregido el error de tipos, desplegar la función.

### Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `supabase/functions/send-auth-email/index.ts` | Fix tipo `CreateEmailResponse` → acceder a `.data?.id` |

