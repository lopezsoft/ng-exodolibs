# Release v0.8.4

Fecha: 2025-09-18

Resumen
-------
Versión menor con mejoras en la paginación del componente `exodo-grid`, documentación ampliada y pequeños ajustes relacionados con la búsqueda remota.

Cambios principales
------------------

- feat: mejorar la gestión de búsqueda en modo remoto y asignar ID único al campo de búsqueda (6700be9)
- chore(release): 0.8.4 docs + pagination limit/skip (2d85b6f)

Detalles
-------

- Se añadieron dos `@Input()` a `ExodoGridComponent` para soportar paginación por offset:
  - `limit` — número de elementos por página (se enviará como `limit` en las peticiones remotas).
  - `skip` — offset inicial; si no se proporciona, se calcula a partir de `page` y `limit`.

- Comportamiento actualizado:
  - Al cambiar de página se envían `page` y, cuando corresponde, `limit` y `skip` calculado.
  - Al aplicar búsqueda, filtros u ordenamiento, la paginación se reinicia (`page=1`, `skip=0`).
  - Documentación actualizada con ejemplos en `projects/exodolibs/README.md`.

Notas adicionales
----------------

- La publicación del paquete se realizó como `exodolibs@0.8.4`.

Cómo crear la Release en GitHub (opcional)
----------------------------------------

Si prefieres crear la Release directamente desde la máquina local con la CLI de GitHub (`gh`), ejecuta:

```bash
cd /ruta/al/repositorio/ng-exodolibs
gh release create v0.8.4 dist/exodolibs/exodolibs-0.8.4.tgz -t "v0.8.4" -n "$(cat RELEASE_NOTES_v0.8.4.md)"
```

Si no tienes `gh` instalado, puedes crear la Release manualmente en GitHub UI y pegar el contenido de este archivo como notas de la release.
