# Release v0.8.11 - Refactorización Final

Fecha: 2025-11-12

## Resumen

Esta versión implementa una **refactorización completa y simplificada** de la gestión de parámetros en el componente `exodo-grid`, eliminando complejidad innecesaria y aplicando una separación clara de responsabilidades.

## Mejora Arquitectónica

### Problema en Versiones Anteriores (0.8.9 y 0.8.10)

Las versiones anteriores tenían una lógica confusa donde:
- `baseParams` y `queryParams` se mezclaban constantemente
- `queryParams` contenía duplicación de `baseParams`
- Se hacían copias y combinaciones innecesarias en cada operación
- El código era difícil de mantener y entender

### Solución Implementada (0.8.11)

Se implementó una **separación clara y simple**:

**`baseParams` (Inmutable):**
- Se establece UNA VEZ en `onLoad()`
- NUNCA se modifica después
- Contiene parámetros que deben persistir siempre (ej: `person_id`, `companyId`)

**`queryParams` (Mutable):**
- Se inicializa vacío en `onLoad()`
- Solo contiene parámetros variables: búsqueda, filtros, ordenamiento, paginación
- Se modifica directamente en cada operación

**Peticiones:**
- SIEMPRE combinan: `{ ...baseParams, ...queryParams }`
- Patrón simple y consistente en todos los métodos

## Cambios en el Código

### Antes (v0.8.10)

```typescript
onLoad(params) {
  this.baseParams = { ...params };
  this.queryParams = { ...this.baseParams }; // ❌ Duplicación
}

searchQuery(query) {
  const params = { 
    ...this.baseParams,  // ❌ Mezcla confusa
    ...this.queryParams, 
    query 
  };
  this.queryParams = params; // ❌ Guarda todo mezclado
}
```

### Ahora (v0.8.11)

```typescript
onLoad(params) {
  this.baseParams = { ...params };  // ✅ Inmutable
  this.queryParams = {};            // ✅ Vacío, solo variables
}

searchQuery(query) {
  this.queryParams.query = query;   // ✅ Modifica directamente
  const params = { 
    ...this.baseParams,              // ✅ Patrón simple
    ...this.queryParams 
  };
  this.onRefreshLoad(params);
}
```

## Beneficios

✅ **Simplicidad**: Patrón único y claro en todos los métodos  
✅ **Separación de responsabilidades**: Inmutable vs Mutable  
✅ **Sin duplicación**: `baseParams` no se copia en `queryParams`  
✅ **Mantenible**: Código más fácil de entender y extender  
✅ **Eficiente**: Modificaciones directas sin copias innecesarias  
✅ **Predecible**: `baseParams` nunca cambia, `queryParams` solo variables  

## Flujo de Operaciones

```typescript
// 1. Carga inicial
onLoad({ person_id: 123, companyId: 456 })
// baseParams: { person_id: 123, companyId: 456 } ← Inmutable
// queryParams: {} ← Vacío

// 2. Búsqueda
searchQuery("Juan")
// queryParams: { query: "Juan", page: 1 }
// Petición: { person_id: 123, companyId: 456, query: "Juan", page: 1 }

// 3. Paginación
onRefreshPagination(2)
// queryParams: { query: "Juan", page: 2, skip: 15 }
// Petición: { person_id: 123, companyId: 456, query: "Juan", page: 2, skip: 15 }

// 4. Limpiar búsqueda
searchQuery("")
// queryParams: { page: 1 } ← query eliminado
// Petición: { person_id: 123, companyId: 456, page: 1 }

// 5. Resetear todo
clearFilters()
// queryParams: {} ← Vacío
// Petición: { person_id: 123, companyId: 456 }
```

## Archivos Modificados

- `projects/exodolibs/src/lib/components/grid/grid.component.ts`

## Métodos Actualizados

- `onLoad()` - Inicializa baseParams y resetea queryParams
- `searchQuery()` - Modifica queryParams directamente
- `onRefreshPagination()` - Modifica queryParams directamente
- `applyGridFilter()` - Modifica queryParams directamente
- `sort()` - Modifica queryParams directamente
- `clearFilters()` - Resetea queryParams a objeto vacío
- `getQueryParams()` - Ahora combina baseParams + queryParams

## Compatibilidad

- Compatible con Angular 18, 19 y 20
- No introduce breaking changes en la API pública
- Mejora interna de arquitectura sin afectar el uso externo

## Actualización

```bash
npm install exodolibs@0.8.11
```

## Nota Importante

Esta es la versión **definitiva y correcta** de la gestión de parámetros. Las versiones 0.8.9 y 0.8.10 tenían enfoques más complejos. Se recomienda actualizar a 0.8.11 para beneficiarse de la simplicidad y claridad del código.

## Agradecimientos

Esta refactorización es resultado de una revisión crítica y mejora continua del código, aplicando principios de simplicidad y separación de responsabilidades.
