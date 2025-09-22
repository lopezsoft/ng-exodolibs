# Release 0.8.6

## Nuevas Funcionalidades

### Método `rebuildGrid()` público
- Añadido método público `rebuildGrid()` para reconstruir completamente el grid (headers, columnas y datos)
- Útil para resolver problemas de visualización después del refresh del navegador
- Permite reconstrucción manual cuando las columnas cambian dinámicamente

### Mejoras en detección de cambios
- Implementado `OnChanges` para detectar automáticamente cambios en `@Input() columns` y `@Input() dataSource`
- El grid se reconstruye automáticamente cuando los inputs críticos cambian
- Método auxiliar `refreshDataRows()` para refrescar datos de forma segura

### Validaciones y safeguards
- Validaciones para evitar errores cuando `columns` está vacío o `dataSource` es null
- Manejo seguro de estados durante la reconstrucción del grid
- Mejor control del ciclo de vida del componente

## Casos de uso resueltos

- **Refresh del navegador**: El grid mantiene la estructura correcta después del refresh
- **Columnas dinámicas**: Detección automática cuando las columnas cambian programáticamente  
- **Datos vacíos**: Manejo robusto de casos edge con datos null/undefined
- **Reconstrucción manual**: API pública para forzar reconstrucción cuando sea necesario

## API Actualizada

```typescript
// Método público nuevo
rebuildGrid(): void

// Uso programático
@ViewChild('myGrid') grid: ExodoGridComponent;
this.grid.rebuildGrid(); // Reconstruye completamente el grid
```

## Changelog

- feat(grid): add rebuildGrid() method and improve change detection
- docs(grid): update README with rebuildGrid() documentation and usage examples
- fix(grid): resolve visualization issues after browser refresh
- improve(grid): better handling of dynamic column changes

## Tests

- Todos los tests existentes siguen pasando (19/19 SUCCESS)
- Build exitoso sin errores de compilación