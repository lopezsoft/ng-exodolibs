# Notas de Versión v0.9.0

Fecha: 2026-11-21

## Resumen

Esta versión fortalece de forma integral la seguridad, estabilidad, accesibilidad, rendimiento y compatibilidad de la librería de grillas y paginación, manteniendo compatibilidad con las integraciones existentes en aplicaciones modernas.

## Mejoras Destacadas

### Seguridad en Celdas y Contenido Personalizado
- Las columnas de texto plano ahora se muestran siempre como texto seguro, evitando que datos ingresados por usuarios puedan ejecutar acciones no deseadas al visualizar una tabla.
- El contenido enriquecido personalizado se depura automáticamente para bloquear código malicioso.
- **Nota de actualización:** Los estilos en línea (`style="..."`) escritos directamente dentro de renderizadores personalizados se eliminan por seguridad; se recomienda utilizar clases de estilo.

### Mayor Estabilidad y Velocidad en Tablas
- Al navegar rápido entre páginas, buscar u ordenar, las solicitudes anteriores que ya no son necesarias se cancelan automáticamente para evitar resultados desactualizados o bloqueos del indicador de carga.
- Los filtros por columna y la búsqueda ahora funcionan de forma consistente tanto en tablas locales como remotas, y la acción de limpiar filtros reinicia todos los campos visibles.
- La edición rápida en celdas ahora revierte los cambios al presionar `Escape`, respeta las restricciones de longitud y evita editar casillas bloqueadas.
- Los mensajes emergentes de ayuda se mantienen alineados incluso al desplazarse por la pantalla, responden al teclado y se cierran correctamente al cambiar de vista.

### Paginación, Temas y Accesibilidad
- La paginación valida entradas inválidas o fuera de rango y deshabilita correctamente los botones en los extremos.
- Las traducciones globales funcionan de forma consistente en toda la aplicación.
- Se corrigió el contraste en el pie de tabla en modo oscuro, se activó el tema claro por instancia y se mejoró la adaptación en pantallas pequeñas.
- Se mejoró el etiquetado accesible de controles de paginación y filtros.

### Actualización

```bash
npm install exodolibs@0.9.0
```
