# Dulces Delicias S.A.: TODO del equipo

Bibliografía del enunciado: [TOGAF - The Open Group](https://www.opengroup.org/togaf).
Documentación oficial: [Odoo 17](https://www.odoo.com/documentation/17.0/es/).

Lista única de tareas del equipo. `[x]` es hecho y `[ ]` es pendiente. Actualizado el 14/10/2026.
El detalle de cada pendiente está en [Pendientes para la entrega](PENDIENTES_ENTREGA.md).

## Qué hay que entregar

- [ ] Presentación grupal por Zoom, detallada con cada uno de los numerales del caso
- [ ] Documento PDF con las diapositivas de la presentación

Fecha de entrega: hoy, 14/10/2026. Duración: 10 minutos como máximo. La demostración en vivo en
Odoo es obligatoria; las capturas son solo respaldo.

## Sistema en Odoo

- [x] Entorno con Docker: Odoo 17 Community, PostgreSQL 15 y scripts para instalar, simular y
  reiniciar
- [x] Localización de Guatemala: GTQ, IVA 12 %, plan contable guatemalteco, español y zona horaria
- [x] Numeral 1, productos: 3 productos terminados, 11 materias primas (8 ingredientes y 3 empaques) con unidades de medida,
  recetas y stock mínimo y máximo
- [x] Numeral 2, inventarios: ubicaciones de materias primas, productos en proceso y productos
  terminados; inventario inicial; compra por bajo stock
- [x] Numeral 3, producción: centros de trabajo, operaciones con tiempos, órdenes de fabricación
  por lote y órdenes de trabajo
- [x] Numeral 4, CRM: 3 clientes con perfil, oportunidades en prospecto, negociación y cierre, con
  actividades
- [x] Numeral 5, ventas: 3 pedidos con plazo de pago, incoterm, transportista y fecha de entrega
- [x] Numeral 6, facturación: facturas y pagos por transferencia, tarjeta y contra entrega
- [x] Numeral 7, entregas: entregas con guía, transportista y dirección de entrega
- [x] Numeral 8, postventa: módulo propio de casos con etapas, devolución, merma, reposición y nota
  de crédito
- [x] Numeral 9, reportes: inventario, clientes, proveedores y estado de resultados por período,
  en pantalla y PDF
- [x] Documentación: guía técnica con guion de presentación, 22 capturas y 4 PDF de ejemplo
- [x] Validación completa en una instancia limpia; las cifras coinciden con la guía técnica
  (14/10)
- [x] Corrección de la simulación cuando el servidor arranca antes de simular, con commit
  `fc5fb1d` (14/10)
- [x] [Guía de validación](GUIA_VALIDACION.md) pantalla por pantalla (14/10)
- [x] Revisión de lo dicho en clase sobre el caso y sobre TOGAF (14/10)
- [x] Moneda de las compras corregida: compras y facturas de proveedor en GTQ (14/10)
- [x] Imágenes en los 14 productos: fotos de Wikimedia Commons con licencia libre e ilustraciones
  propias de los empaques (14/10)
- [x] Realismo del caso (14/10):
  - Recetas que cuadran con el peso del producto y leche en polvo en lugar de líquida.
  - Empaques como materia prima, con su proveedor y su regla de mínimo y máximo.
  - Costo por hora en los centros de trabajo y asiento de planilla de producción.
  - Operación repartida en las dos semanas anteriores a la simulación, no en un mismo segundo.
- [x] Reinstalación con la simulación completa sobre la versión corregida (14/10)
- [x] Recorridos guiados de Odoo desactivados: su puntero morado tapaba campos en la demostración
  y en las capturas (14/10)
- [x] Las 22 capturas y los 4 PDF de ejemplo rehechos sobre la versión final (14/10)

## Presentación

- [ ] Repartir los bloques de la presentación entre los integrantes.
  [Pendiente 1](PENDIENTES_ENTREGA.md#1-presentación-de-10-minutos-con-demostración-en-vivo)
- [ ] Cada integrante practica su bloque en Odoo con la [Guía de validación](GUIA_VALIDACION.md).
- [ ] Dejar las pantallas de la demostración abiertas en pestañas, en el orden del recorrido.
- [ ] Diapositiva de TOGAF: relación de sus cuatro dominios de arquitectura con el caso.
  [Pendiente 2](PENDIENTES_ENTREGA.md#2-integrar-togaf)
- [ ] Armar pocas diapositivas de apoyo: portada, TOGAF, una por bloque, conclusiones y
  bibliografía. Base: sección 11 de la [Guía técnica](GUIA_TECNICA.md).
- [x] Documento de [preguntas y respuestas](PREGUNTAS_Y_RESPUESTAS.md) con ITIL, TOGAF, métricas y
  realismo del caso (14/10)
- [ ] Cada integrante estudia las preguntas y respuestas de su bloque.
- [ ] Ensayo con cronómetro: 10 minutos como máximo, con demostración en vivo.
- [ ] Exportar las diapositivas a PDF y revisar que las capturas se lean bien.

## Entrega

- [ ] Presentar por Zoom.
- [ ] Subir el PDF de las diapositivas.

## Orden sugerido

1. Repartir los bloques y practicar, en paralelo con la diapositiva de TOGAF y las diapositivas de
   apoyo.
2. Preparar preguntas y ensayar con cronómetro.
3. Exportar el PDF, presentar y entregar.

## Cómo actualizar esta lista

- Al terminar una tarea, cambie `[ ]` por `[x]` y agregue la fecha entre paréntesis.
- Si aparece una tarea nueva, agréguela como `- [ ]` en su sección.
