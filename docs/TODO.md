# Dulces Delicias S.A.: TODO del equipo

Bibliografía del enunciado: [TOGAF - The Open Group](https://www.opengroup.org/togaf).
Documentación oficial: [Odoo 17](https://www.odoo.com/documentation/17.0/es/).

Lista única de tareas del equipo. `[x]` es hecho y `[ ]` es pendiente. Actualizado el 14/10/2026.
El detalle de cada pendiente está en [Pendientes para la entrega](PENDIENTES_ENTREGA.md).

## Qué hay que entregar

- [ ] Presentación grupal por Zoom, detallada con cada uno de los numerales del caso
- [ ] Documento PDF con las diapositivas de la presentación

Fecha de entrega: por confirmar. El profesor dijo el 05/10 que se puede mover.

## Sistema en Odoo

- [x] Entorno con Docker: Odoo 17 Community, PostgreSQL 15 y scripts para instalar, simular y
  reiniciar
- [x] Localización de Guatemala: GTQ, IVA 12 %, plan contable guatemalteco, español y zona horaria
- [x] Numeral 1, productos: 3 productos terminados, 8 materias primas con unidades de medida,
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
- [x] Revisión de las grabaciones de clase del 05/10 y del 14/10 (14/10)
- [ ] Corregir la moneda de las compras: hoy salen en USD y deben salir en GTQ.
  [Pendiente 1](PENDIENTES_ENTREGA.md#1-corregir-la-moneda-de-las-compras-usd-en-lugar-de-gtq)
- [ ] Reinstalar y volver a simular con la corrección: `./scripts/reiniciar.sh`,
  `./scripts/instalar.sh` y simular desde el menú.
- [ ] Repetir las capturas que muestran USD (como mínimo la 07 y la 08) y revisar las 22.
  [Pendiente 5](PENDIENTES_ENTREGA.md#5-repetir-las-capturas-afectadas)
- [ ] Hacer commit de la documentación nueva (`docs/TODO.md`, `docs/GUIA_VALIDACION.md`,
  `docs/PENDIENTES_ENTREGA.md` y `README.md`).

## Presentación

- [ ] Confirmar con el profesor la fecha, la duración, el formato, si quiere demostración en vivo
  y los criterios de evaluación.
- [ ] Repartir los numerales entre los integrantes.
- [ ] Cada integrante practica su numeral en Odoo con la [Guía de validación](GUIA_VALIDACION.md).
- [ ] Diapositiva de TOGAF: relación de sus cuatro dominios de arquitectura con el caso.
  [Pendiente 3](PENDIENTES_ENTREGA.md#3-integrar-togaf-en-la-presentación)
- [ ] Armar las diapositivas: introducción, TOGAF, numerales 1 a 9, integración entre módulos,
  conclusiones y bibliografía. Base: sección 11 de la [Guía técnica](GUIA_TECNICA.md).
- [ ] Preparar respuestas a preguntas probables. [Pendiente 6](PENDIENTES_ENTREGA.md#6-preparar-respuestas-a-preguntas-probables)
- [ ] Ensayo general con control de tiempo, demostración en vivo y capturas de respaldo.
- [ ] Exportar las diapositivas a PDF y revisar que las capturas se lean bien.

## Entrega

- [ ] Presentar por Zoom.
- [ ] Subir el PDF de las diapositivas.

## Orden sugerido

1. Confirmar con el profesor la fecha y el formato, antes de invertir tiempo.
2. Corregir la moneda, reinstalar, repetir las capturas y hacer commit, para que el sistema quede
   definitivo.
3. Repartir numerales y practicar, en paralelo con la diapositiva de TOGAF y el armado de la
   presentación.
4. Preparar preguntas y ensayar.
5. Exportar el PDF, presentar y entregar.

## Cómo actualizar esta lista

- Al terminar una tarea, cambie `[ ]` por `[x]` y agregue la fecha entre paréntesis.
- Si aparece una tarea nueva, agréguela como `- [ ]` en su sección.
