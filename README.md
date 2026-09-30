# DMD Perú · Control de Producción

Portal independiente del CRM comercial. Esta versión de revisión inicia sin datos precargados: permite registrar proyectos y bitácoras de prueba en el navegador, sin mezclar información con el portal comercial.

Incluye:

- Panel ejecutivo con curva S, avance físico frente a lo programado, desviación en días, PPC, hitos críticos y alertas de materiales.
- Proyectos con presupuesto contractual, costo meta, avance y desviación.
- Bitácora diaria para avance, costo devengado, horas-hombre e incidencias.
- Recursos, subcontratistas, calidad, punch list y seguridad.

## Abrir localmente

```powershell
cd 'C:\Users\maria\OneDrive\Documentos\ChatGPT\Mini Agencia de automatizaciones\dmd-produccion'
pnpm dev
```

Abrir `http://127.0.0.1:3102`.

## Validar

```powershell
pnpm typecheck
pnpm build
```

## Siguiente etapa

Para uso real se creará una base de datos exclusiva de Producción, con cuentas para dirección, jefe de proyectos y residentes. No se reutilizará la base, las rutas ni los datos del portal comercial.
