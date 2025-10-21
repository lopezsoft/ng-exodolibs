# Release 0.8.7

## Compatibilidad Mejorada

### Soporte explícito para Angular 18+

Esta versión hace explícita la compatibilidad con **Angular 18, 19 y 20**, permitiendo usar la librería en proyectos que no han migrado a las versiones más recientes de Angular.

## Cambios

### Peer Dependencies actualizados
- Actualizado `peerDependencies` para especificar soporte explícito: `^18.0.0 || ^19.0.0 || ^20.0.0`
- Añadido `rxjs` como peer dependency (`^7.0.0`) para mayor claridad
- Mejorada la descripción del paquete para indicar compatibilidad con Angular 18+

### Documentación actualizada
- Añadida sección de **Compatibilidad** en el README
- Documentación clara de versiones de Angular soportadas (18.x, 19.x, 20.x)
- Instrucciones de instalación para cada versión de Angular

## Compatibilidad

✅ **Angular 18.x** - Totalmente compatible  
✅ **Angular 19.x** - Totalmente compatible  
✅ **Angular 20.x** - Totalmente compatible

## Instalación

```bash
# Para cualquier versión de Angular 18+
npm install exodolibs
```

## Notas Técnicas

- La librería usa solo características estándar de Angular que son compatibles desde la versión 18
- No se requieren migraciones ni cambios en tu código existente
- Compilación en modo `partial` para máxima compatibilidad
- Peer dependencies flexibles que permiten actualizar Angular sin actualizar la librería

## Migración desde v0.8.6

No se requieren cambios en tu código. Esta es una actualización de metadatos que mejora la compatibilidad declarada sin cambios funcionales.

```bash
npm update exodolibs
```
