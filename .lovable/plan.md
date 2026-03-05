

## Plan: Mejoras al Menú Móvil, Inventario con Unidades y Categorías Dinámicas

### 1. Mejorar el Menú Móvil para Admin/Staff

**Problema actual:** El menú móvil muestra todos los items en un grid plano de 2 columnas sin agrupación. Cuando el usuario es admin, hay ~12 items que se ven desordenados.

**Solución:** Agrupar los items del menú móvil por secciones con separadores visuales:
- **General:** Inicio, Eventos, Tienda
- **Mi Cuenta:** Mi Cuenta, Mis Datos, Ruleta
- **Staff:** Scan (solo staff/admin)
- **Admin:** Eventos Admin, Productos, Clientes, Promociones, Roles (solo admin)

Cada sección tendrá un label pequeño arriba (ej: "ADMIN") y se mantendrá el estilo liquid glass actual.

**Archivo:** `src/components/layout/Header.jsx`

### 2. Agregar Campo `stock_quantity` a la Tabla Products

**Migración SQL:**
```sql
ALTER TABLE public.products ADD COLUMN stock_quantity INTEGER DEFAULT NULL;
```

- `NULL` = sin control de inventario (stock ilimitado)
- Número = unidades disponibles
- Lógica: si `stock_quantity <= 2` → mostrar "¡Quedan pocas!" al público
- Si `stock_quantity = 0` → marcar como agotado automáticamente

**Archivos afectados:**
- `src/components/admin/ProductFormModal.jsx` — agregar campo numérico "Unidades disponibles"
- `src/pages/Tienda.jsx` — mostrar badge "¡Quedan pocas!" cuando `stock_quantity` es 1-2
- `src/pages/admin/AdminProducts.jsx` — mostrar cantidad en cada tarjeta

### 3. Tabla de Inventario para Admin

Agregar debajo del grid de productos en `AdminProducts.jsx` una tabla responsive con:
- Columnas: Producto, Categoría, Precio, Unidades, Estado, Última actualización
- Estilo: tabla con bordes suaves, responsive (scroll horizontal en móvil)
- Badges de color para estado de stock
- Ordenable por nombre o unidades

### 4. Categorías Dinámicas (tabla `product_categories`)

**Migración SQL:**
```sql
CREATE TABLE public.product_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  value TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  icon TEXT DEFAULT 'Package',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insertar categorías actuales
INSERT INTO public.product_categories (value, label, icon, sort_order) VALUES
  ('ceramica', 'Cerámica', 'Palette', 0),
  ('merch', 'Merch', 'Shirt', 1),
  ('cafe', 'Café', 'Coffee', 2),
  ('otro', 'Otro', 'Package', 3);

-- RLS
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active categories" ON public.product_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage categories" ON public.product_categories FOR ALL USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'admin_events')));
```

- Quitar el `CHECK` constraint de la columna `category` en `products` para permitir valores dinámicos
- En `AdminProducts.jsx` agregar un botón "Gestionar Categorías" que abra un modal simple para crear/editar/eliminar categorías
- `ProductFormModal.jsx` cargará categorías desde la BD en vez de hardcodearlas
- `Tienda.jsx` cargará los filtros dinámicamente

### Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/layout/Header.jsx` | Menú móvil con secciones agrupadas |
| `src/pages/admin/AdminProducts.jsx` | Tabla de inventario, botón gestionar categorías |
| `src/components/admin/ProductFormModal.jsx` | Campo unidades, categorías dinámicas desde BD |
| `src/pages/Tienda.jsx` | Badge "¡Quedan pocas!", filtros dinámicos |
| `src/data/productCategories.js` | Mantener como fallback, agregar helper para mapear iconos |
| **Nuevo:** `src/components/admin/CategoryManagerModal.jsx` | Modal para CRUD de categorías |
| **Migración SQL** | Agregar `stock_quantity`, crear `product_categories`, quitar CHECK constraint |

