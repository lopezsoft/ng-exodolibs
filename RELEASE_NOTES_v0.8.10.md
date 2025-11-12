# Release v0.8.10 - Hotfix

Fecha: 2025-11-12

## Resumen

Esta es una versión de corrección urgente (hotfix) que soluciona un problema crítico introducido en la versión 0.8.9 donde los parámetros iniciales aún se perdían en ciertos escenarios del grid.

## Problema Corregido

En la versión 0.8.9, aunque se implementó el sistema de `baseParams`, la lógica de acumulación de parámetros no era correcta:

- Al hacer una búsqueda, se perdían los filtros aplicados previamente
- Al cambiar de página, podían perderse búsquedas o filtros
- Los parámetros acumulados (búsqueda + filtros + ordenamiento) no se preservaban correctamente

## Solución Implementada

### Mejoras en la acumulación de parámetros

Se corrigió la lógica en todos los métodos para que **siempre** combinen:
1. `baseParams`: Parámetros iniciales inmutables (ej: person_id, companyId)
2. `queryParams`: Parámetros acumulados (búsqueda, filtros, ordenamiento)
3. Nuevos parámetros: Los específicos de cada operación

### Métodos corregidos

1. **`searchQuery()`**
   - Ahora preserva `baseParams` + `queryParams` previos
   - Solo actualiza los parámetros de búsqueda
   - Resetea correctamente la paginación a página 1

2. **`onRefreshPagination()`**
   - Mantiene todos los parámetros acumulados
   - Solo actualiza `page`, `limit` y `skip`

3. **`inputSearch()`**
   - Simplificado para delegar toda la lógica al debounce de `searchQuery()`
   - No modifica `queryParams` directamente

4. **`applyGridFilter()`**
   - Preserva `baseParams` + `queryParams` previos
   - Agrega/actualiza solo los filtros nuevos
   - Resetea paginación correctamente

5. **`sort()`**
   - Mantiene todos los parámetros (base + acumulados)
   - Agrega/actualiza solo `sort` y `dir`
   - Resetea paginación correctamente

## Archivos Modificados

- `projects/exodolibs/src/lib/components/grid/grid.component.ts`

## Commits

```
fix(grid): correct parameter accumulation logic in all operations

- Fix searchQuery to preserve all accumulated parameters
- Fix onRefreshPagination to maintain search, filters, and sorting
- Simplify inputSearch to delegate to searchQuery via debounce
- Fix applyGridFilter to preserve previous parameters
- Fix sort to maintain all accumulated state
- Ensures baseParams + queryParams are always combined correctly
```

## Escenarios Ahora Funcionales

✅ **Parámetros iniciales** (person_id, companyId) se mantienen siempre  
✅ **Búsqueda + Paginación**: Los parámetros iniciales persisten al paginar durante una búsqueda  
✅ **Filtros + Búsqueda**: Los filtros no se pierden al buscar  
✅ **Ordenamiento + Búsqueda + Filtros**: Todos se mantienen combinados correctamente  
✅ **Refresh de paginación**: Mantiene búsqueda, filtros y ordenamiento activos  

## Cómo Actualizar

Para actualizar a esta versión en tu proyecto:

```bash
npm update exodolibs
```

O especificar la versión exacta:

```bash
npm install exodolibs@0.8.10
```

## Compatibilidad

- Compatible con Angular 18, 19 y 20
- No introduce breaking changes
- Hotfix crítico recomendado para todos los usuarios de 0.8.9

## Nota Importante

Si instalaste la versión 0.8.9, se recomienda **actualizar inmediatamente** a la 0.8.10 para evitar problemas con la persistencia de parámetros en el grid.

## Publicación

Para publicar esta versión:

1. Construir la librería:

```bash
npm run lib
```

2. Publicar desde dist/exodolibs:

```bash
cd dist/exodolibs
npm publish --access public
```

3. Crear tag y release en GitHub:

```bash
git tag v0.8.10
git push origin v0.8.10
```
