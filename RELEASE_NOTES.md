# Release v0.8.0

Fecha: 2025-09-18

Resumen
-------
Esta versión introduce mejoras importantes en el componente `DataGrid` de la librería `exodolibs`:

- Filtros por columna con UI integrada.
- Ordenamiento por columna (click en cabeceras, alterna asc/desc).
- Paginación remota y local con soporte para `dataAdapter` (adaptador para mapear la respuesta de cualquier API al formato que espera la grilla).
- Soporte mejorado para temas y traducciones en `exodo-pagination`.
- Actualización de ejemplos y documentación (README).

Commits relevantes
------------------
- 1cdfdd5 feat: actualizar README.md con nuevas instrucciones, ejemplos y soporte para temas y traducciones en el componente exodo-pagination
- 54a2468 Merge branch 'feature/upgrade' into main [ci skip]
- c499eea feat: agregar nuevas funcionalidades al DataGrid, incluyendo filtros, ordenamiento y soporte para adaptadores de datos
- 56faeaf feat: mejorar estilos y funcionalidad del componente de cuadrícula y paginación, agregar soporte de traducción
- dda8a98 feat: agregar soporte para paginación y adaptación de datos en el componente de cuadrícula
- c3be9dd feat: agregar componente de filtro a la cuadrícula y habilitar filtrado y ordenamiento en ejemplos

Cambios destacados
------------------
- `exodo-grid`:
  - Nuevos inputs: `allowFiltering`, `allowSorting`, `dataAdapter`, `labels`, `lang`.
  - UI mejorada: fila de filtros en el header y cabeceras clicables para ordenamiento.
  - Compatibilidad remota/local: si `mode="remote"` la grilla hace llamadas al `proxy` y usa `dataAdapter` si está presente para transformar la respuesta.

- Documentación:
  - `projects/exodolibs/README.md` actualizado con ejemplos de uso, `dataAdapter`, i18n y pasos de publicación.

- Internals:
  - `exodo-pagination` intentará resolver traducciones vía Transloco y cae a valores por defecto si no existe.

Cómo publicar
-------------
1. Asegúrate de que todos los tests pasen:

```bash
npm install
npm run test
```

2. Construye la librería y copia assets:

```bash
npm run lib
```

3. Verifica `dist/exodolibs/package.json` contiene la versión `0.8.0`.

4. Publica en npm (desde `dist/exodolibs`):

```bash
cd dist/exodolibs
npm publish --access public
```

5. Crea una Release en GitHub (si no está creada):

- Web: https://github.com/lopezsoft/ng-exodolibs/releases/new?tag=v0.8.0&title=v0.8.0
- CLI (si tienes gh):

```bash
gh release create v0.8.0 --title "v0.8.0" --notes "Nuevas funcionalidades: filtros por columna, ordenamiento, paginación remota y local con dataAdapter. Ver README para detalles." 
```

Notas finales
-------------
- Si prefieres publicar una versión distinta, actualiza la versión en `projects/exodolibs/package.json`, crea el tag correspondiente y sube el tag a `origin`.
- Si tienes un pipeline de CI (GitHub Actions), automatiza `npm publish` en el job que se dispare sobre tags `v*`.

