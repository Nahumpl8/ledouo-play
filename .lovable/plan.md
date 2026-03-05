

## Plan: Crear la tabla `products` y desplegarla

### Paso 1: Ejecutar la migración SQL

Usar la herramienta de migración de base de datos para ejecutar el contenido de `supabase/migrations/20260304000000_create_products_table.sql`, que incluye:

- Crear tabla `products` con columnas: `id`, `name`, `description`, `long_description`, `price`, `category`, `images`, `stock_status`, `is_active`, `sort_order`, `created_at`, `updated_at`
- Crear 3 índices (category, is_active, sort_order)
- Habilitar RLS con 5 políticas:
  - Cualquiera puede ver productos activos
  - Admins pueden ver todos, insertar, actualizar y eliminar
- Crear trigger para auto-actualizar `updated_at`

### Verificación

Confirmar que la tabla existe y que las políticas RLS están correctas después de la migración.

### Archivos involucrados

| Archivo | Acción |
|---------|--------|
| `supabase/migrations/20260304000000_create_products_table.sql` | Ejecutar migración (ya existe el archivo) |

