# Dulces Delicias S.A.: pendientes para la entrega

Referencias completas: [TOGAF - The Open Group](https://www.opengroup.org/togaf) (bibliografía del
enunciado) y [documentación oficial de Odoo 17](https://www.odoo.com/documentation/17.0/es/).

Revisado el 14/10/2026. Este documento reúne lo que falta para entregar, según lo detectado al
validar la instancia de Odoo, el enunciado y las grabaciones de clase. Para comprobar lo que ya
funciona, use la [Guía de validación](GUIA_VALIDACION.md).

## Resumen

| Parte | Estado |
| ------- | -------- |
| Implementación en Odoo (numerales 1 a 9) | Completa y verificada, con un defecto de moneda en compras (pendiente 1) |
| Documentación técnica y de validación | Completa |
| Presentación grupal por Zoom | No iniciada |
| PDF con las diapositivas | No iniciado |
| Relación con TOGAF | No incluida en ningún material |

## Lo que dijo el profesor

### Clase del 05/10/2026

Fuente: `local-ai-stack/audio/output/2026-10-05 19-57-01.*`. Es un fragmento de 2 minutos y 21
segundos, no la clase completa.

- Presentó el caso como una oportunidad para aprender qué es Odoo, cómo funciona y qué hace.
- Las áreas del caso (inventario, fabricación, ventas, gestión de clientes, facturación y
  postventa) **no se eligieron al azar**: vienen del framework TOGAF, una arquitectura empresarial
  de The Open Group que ayuda a alinear la estrategia de tecnología con los objetivos de la
  organización. Lo comparó con ITIL (la transcripción dice "ETL", pero por el contexto es ITIL):
  un conjunto de conceptos, recomendaciones y bloques para alinear las operaciones con el negocio.
- Sobre la fecha: dijo que ya había publicado la tarea, que **se puede cambiar la fecha** y que
  prefería explicarla antes. En el fragmento no se menciona ninguna fecha concreta.

### Clase del 14/10/2026

Fuente: `local-ai-stack/audio/output/video_2026-10-14_09-43-46.*` (93 minutos). No menciona el
caso. Trató DevOps, certificaciones de AWS y CI/CD con GitHub Actions, y anunció para la siguiente
semana el tema "inicio, alcance y justificación de un proyecto".

### Lo que ninguna fuente aclara

- La fecha de entrega definitiva.
- La duración de la presentación y si cada integrante debe exponer.
- Si se espera una demostración en vivo de Odoo o basta con capturas.
- Los criterios de evaluación.

## Pendientes

### 1. Corregir la moneda de las compras (USD en lugar de GTQ)

Prioridad alta: es visible en la demostración y en las capturas.

- **Síntoma**: las órdenes de compra y sus facturas de proveedor aparecen con "Divisa USD" y el
  símbolo "$", mientras que ventas, facturas de clientes y reportes usan quetzales.
- **Causa**: los precios de proveedor (`product.supplierinfo` en
  `addons/dulces_delicias/data/product_data.xml`) se crean al cargar los datos, cuando la empresa
  todavía tiene USD, la moneda por defecto de Odoo. El plan contable guatemalteco cambia la
  moneda a GTQ después, en `post_init_hook`, y esos precios se quedan en USD.
- **Impacto en las cifras**: ninguno. No hay tasas de cambio cargadas, así que Odoo convierte 1 a
  1 y el estado de resultados coincide con la guía. El problema es de presentación y de
  coherencia: una empresa guatemalteca comprando en dólares sin motivo.
- **Corrección propuesta**: en `hooks.py`, después de `_cargar_plan_contable`, pasar todos los
  precios de proveedor a la moneda de la empresa.
- **Después de corregir**: `./scripts/reiniciar.sh`, `./scripts/instalar.sh`, volver a simular y
  repetir las capturas afectadas (pendiente 5).

### 2. Presentación grupal por Zoom

El enunciado pide una presentación "detallada con cada uno de los numerales".

- [ ] Partir del guion de la sección 11 de la [Guía técnica](GUIA_TECNICA.md), que ya tiene 16
  diapositivas con la captura que corresponde a cada una.
- [ ] Agregar una diapositiva de TOGAF al inicio (pendiente 3).
- [ ] Repartir los numerales entre los integrantes. La guía técnica recomienda que cada uno
  practique su numeral en modo manual, sin la simulación.
- [ ] Decidir si se hace demostración en vivo. Si se hace:
  - Reinstalar y simular el mismo día, y tener abierta la [Guía de validación](GUIA_VALIDACION.md).
  - Tener las capturas como respaldo si algo falla durante la llamada.
- [ ] Ensayar el tiempo total.

### 3. Integrar TOGAF en la presentación

Según la clase del 05/10, las áreas del caso salen de TOGAF, y el enunciado lo cita como única
bibliografía. Hoy no aparece en ningún material del proyecto.

Propuesta de relación entre los dominios de arquitectura de TOGAF y el proyecto:

| Dominio TOGAF | En el caso Dulces Delicias |
| --------------- | ---------------------------- |
| Arquitectura de negocio | Procesos del enunciado: compras, inventario, fabricación, CRM, ventas, facturación, entregas y postventa |
| Arquitectura de datos | Datos maestros: productos, listas de materiales, clientes, proveedores, plan contable guatemalteco |
| Arquitectura de aplicaciones | Módulos estándar de Odoo 17 más el módulo propio `dulces_delicias` (Postventa y reportes) |
| Arquitectura tecnológica | Odoo 17 Community, PostgreSQL 15 y Docker Compose |

- [ ] Una diapositiva al inicio con esta tabla y el objetivo de TOGAF: alinear la tecnología con
  los objetivos del negocio.
- [ ] En las conclusiones, conectar la integración entre módulos (sección 10 de la guía técnica)
  con esa alineación.
- [ ] Citar <https://www.opengroup.org/togaf> en la diapositiva de bibliografía.

### 4. PDF con las diapositivas

- [ ] Exportar la presentación terminada a PDF.
- [ ] Revisar que las capturas se lean bien en el PDF.

### 5. Repetir las capturas afectadas

Las capturas de `docs/capturas/` son de una ejecución anterior. Al menos
`07_orden_compra.png` muestra "Divisa USD" y "$ 5.850,00". Después de corregir el pendiente 1:

- [ ] Revisar las 22 capturas y repetir las que muestren compras o facturas de proveedor en USD
  (como mínimo la 07 y la 08).
- [ ] Comprobar que los números de documento de las capturas coincidan con los de la
  demostración en vivo, si se hace.

### 6. Preparar respuestas a preguntas probables

| Pregunta | Respuesta |
| ---------- | ----------- |
| ¿Por qué tres ubicaciones y no tres almacenes? | En Odoo, "almacén" es la bodega física. Materias primas, productos en proceso y productos terminados son ubicaciones dentro de la planta, que es lo que permite mover materiales a producción y sacar el producto terminado a venta |
| ¿Por qué un módulo propio? | Odoo Community no incluye Helpdesk ni el estado de resultados; ambos son de la edición Enterprise |
| ¿Cómo se calcula el estado de resultados? | Suma los apuntes contables publicados del período, agrupados por tipo de cuenta del plan guatemalteco |
| ¿Cómo se integran los módulos? | Cada operación genera su asiento contable automático: recepción, producción, entrega, factura y pago (sección 10 de la guía técnica) |

### 7. Confirmar con el profesor

- [ ] Fecha de entrega definitiva.
- [ ] Duración y formato de la presentación.
- [ ] Si quiere demostración en vivo.
- [ ] Criterios de evaluación.

### 8. Guardar los cambios en git

- [x] `addons/dulces_delicias/models/dd_simulacion.py`: corrección del paso de compras cuando el
  planificador crea solicitudes provisionales antes de simular (commit `fc5fb1d`).
- [ ] `docs/TODO.md`: lista de tareas del equipo.
- [ ] `docs/GUIA_VALIDACION.md`: guía de validación nueva.
- [ ] `docs/PENDIENTES_ENTREGA.md`: este documento.
- [ ] `README.md`: enlaces a los documentos nuevos.

## Ya resuelto

- Los 9 numerales del enunciado están implementados y se comprobaron en la instancia del
  14/10/2026; las cifras coinciden con la guía técnica.
- La simulación funciona desde el menú aunque el servidor haya arrancado antes y el planificador
  haya creado solicitudes de compra provisionales.
- Los 4 reportes se generan en pantalla y en PDF.
