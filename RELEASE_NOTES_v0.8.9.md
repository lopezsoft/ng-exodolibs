# Release v0.8.9

Fecha: 2025-11-12

## Resumen

Esta versión corrige un bug crítico en el componente `exodo-grid` donde los parámetros iniciales pasados al método `onLoad()` se perdían al realizar operaciones de paginación, búsqueda, filtros u ordenamiento.

## Problema Resuelto

Cuando se cargaba el grid con parámetros específicos mediante:

```typescript
this.personBranchGrid.onLoad({
  person_id: this.persons.currentPerson.id,
  companyId: this.api.currentToken?.currentCompany?.id ?? 0,
});
```

Estos parámetros funcionaban correctamente en la carga inicial, pero se perdían al:
- Cambiar de página en la paginación
- Realizar búsquedas
- Aplicar filtros
- Ordenar columnas
- Refrescar el grid

## Solución Implementada

### Cambios en `grid.component.ts`:

1. **Nueva propiedad `baseParams`**: Se agregó una propiedad protegida para almacenar los parámetros base que deben persistir a través de todas las operaciones del grid.

2. **Método `onLoad` mejorado**: Ahora guarda una copia de los parámetros iniciales en `baseParams` que se preservan en todas las operaciones subsecuentes.

3. **Métodos actualizados**:
   - `searchQuery()`: Construye parámetros desde `baseParams` + parámetros de búsqueda
   - `onRefreshPagination()`: Combina `baseParams` con parámetros de paginación
   - `inputSearch()`: Preserva `baseParams` al resetear paginación en búsquedas
   - `applyGridFilter()`: Combina `baseParams` con filtros aplicados
   - `sort()`: Combina `baseParams` con parámetros de ordenamiento

## Archivos Modificados

- `projects/exodolibs/src/lib/components/grid/grid.component.ts`

## Commit

```
fix(grid): preserve initial params across all grid operations

- Add baseParams property to store initial parameters
- Update onLoad to save base parameters separately
- Modify searchQuery, onRefreshPagination, applyGridFilter, and sort methods to always include baseParams
- Ensures parameters like person_id and companyId persist through pagination, search, filters, and sorting
```

## Cómo Actualizar

Para actualizar a esta versión en tu proyecto:

```bash
npm update exodolibs
```

O especificar la versión exacta:

```bash
npm install exodolibs@0.8.9
```

## Compatibilidad

- Compatible con Angular 18, 19 y 20
- No introduce breaking changes
- Mantiene retrocompatibilidad con versiones anteriores

## Notas Adicionales

Esta corrección es esencial para aplicaciones que dependen de parámetros de contexto (como IDs de usuario, empresa, etc.) que deben mantenerse en todas las operaciones del grid.

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
git tag v0.8.9
git push origin v0.8.9
```
