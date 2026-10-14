# Dulces Delicias S.A.: pendientes para la entrega

Referencias completas: [TOGAF - The Open Group](https://www.opengroup.org/togaf) (bibliografía del
enunciado) y [documentación oficial de Odoo 17](https://www.odoo.com/documentation/17.0/es/).

Revisado el 14/10/2026. Este documento reúne lo que falta para entregar y el contexto dado en
clase. La lista de tareas está en el [TODO del equipo](TODO.md) y la comprobación de cada numeral
en la [Guía de validación](GUIA_VALIDACION.md).

## Condiciones de la entrega

| Tema | Definición |
| --- | --- |
| Fecha | Hoy, 14/10/2026 |
| Duración | 10 minutos como máximo; cuanto más breve, mejor |
| Demostración | En vivo en Odoo, obligatoria. Las capturas son solo respaldo |
| Entregables | Presentación grupal por Zoom, numeral por numeral, y PDF con las diapositivas |
| Criterios de evaluación | No se conocen. En las clases grabadas no se mencionaron |

## Resumen

| Parte | Estado |
| --- | --- |
| Implementación en Odoo (numerales 1 a 9) | Completa y verificada |
| Moneda de las compras | Corregida: compras y facturas de proveedor en GTQ |
| Imágenes de productos | Cargadas en los 11 productos |
| Documentación técnica y de validación | Completa |
| Capturas de pantalla | Rehechas: montos en Q, productos con imagen y sin el puntero de los recorridos guiados |
| Presentación y PDF | No iniciados |
| Relación con TOGAF | Por incluir en la presentación |

## Lo que dijo el profesor

### Clase del 21/09/2026: TOGAF

- TOGAF sirve para alinear la tecnología con los objetivos de la empresa: la tecnología debe
  apoyar al negocio y no al revés. Ejemplo que dio: no imponer SAP "porque es el que manda".
- Beneficios que mencionó: reducir costos y riesgos mediante la estandarización, mejorar la toma
  de decisiones y tener una visión global de la organización.
- Se basa en cuatro dominios: negocio, datos, aplicaciones y tecnología. Lo comparó con las
  dimensiones de ITIL.
- Su núcleo es el ADM (Architecture Development Method), un ciclo iterativo que lleva del estado
  actual (as is) al estado futuro deseado (to be).

### Clase del 05/10/2026: el caso

- Presentó el caso como una oportunidad para aprender qué es Odoo, cómo funciona y qué hace.
- Las áreas del caso (bodega y almacenamiento, desarrollo, fabricación, ventas, gestión de
  clientes, facturación y postventa) **no se eligieron al azar**: vienen de TOGAF.

### Clase del 14/10/2026

No habló del caso.

## Pendientes

### 1. Presentación de 10 minutos con demostración en vivo

Con 10 minutos no alcanza para recorrer todo en vivo. Propuesta de reparto del tiempo:

| Bloque | Tiempo | Contenido |
| --- | --- | --- |
| Introducción y TOGAF | 1 min | Empresa, objetivo y los cuatro dominios de TOGAF aplicados al caso |
| Numerales 1 a 3 | 2 min | Productos con receta, inventario por ubicaciones, compra automática y fabricación |
| Numerales 4 a 7 | 3 min | Embudo del CRM, un pedido, su entrega y su factura con pago |
| Numeral 8 | 1.5 min | El caso postventa resuelto, con devolución y reposición |
| Numeral 9 | 1.5 min | Estado de resultados por período y un reporte en PDF |
| Conclusiones | 1 min | Integración entre módulos: cada operación genera su asiento contable |

- [ ] Preparar la demostración con la simulación ya ejecutada. Tener las pantallas abiertas en
  pestañas en el orden del recorrido, para no navegar menús durante la llamada.
- [ ] Repartir los bloques entre los integrantes.
- [ ] Armar pocas diapositivas: portada, TOGAF, una por bloque como apoyo, conclusiones y
  bibliografía. El guion de la sección 11 de la [Guía técnica](GUIA_TECNICA.md) sirve de base.
- [ ] Ensayar con cronómetro.
- [ ] Tener las capturas a mano como respaldo si Odoo falla durante la llamada.

### 2. Integrar TOGAF

| Dominio TOGAF | En el caso Dulces Delicias |
| --- | --- |
| Arquitectura de negocio | Procesos del enunciado: compras, inventario, fabricación, CRM, ventas, facturación, entregas y postventa |
| Arquitectura de datos | Datos maestros: productos, listas de materiales, clientes, proveedores y plan contable guatemalteco |
| Arquitectura de aplicaciones | Módulos estándar de Odoo 17 más el módulo propio `dulces_delicias` (Postventa y reportes) |
| Arquitectura tecnológica | Odoo 17 Community, PostgreSQL 15 y Docker Compose |

- [ ] Una diapositiva con esta tabla. Si hay tiempo, mencionar el ADM: del estado actual (procesos
  sin ERP) al estado futuro (operación integrada en Odoo).
- [ ] Citar <https://www.opengroup.org/togaf> en la bibliografía.

### 3. PDF con las diapositivas

- [ ] Exportar la presentación a PDF y revisar que las capturas se lean bien.

### 4. Preparar respuestas a preguntas probables

| Pregunta | Respuesta |
| --- | --- |
| ¿Por qué tres ubicaciones y no tres almacenes? | En Odoo, "almacén" es la bodega física. Materias primas, productos en proceso y productos terminados son ubicaciones dentro de la planta; así se mueven los materiales a producción y el producto terminado a venta |
| ¿Por qué un módulo propio? | Odoo Community no incluye Helpdesk ni el estado de resultados; ambos son de la edición Enterprise |
| ¿Cómo se calcula el estado de resultados? | Suma los apuntes contables publicados del período, agrupados por tipo de cuenta del plan guatemalteco |
| ¿Cómo se integran los módulos? | Cada operación genera su asiento contable automático: recepción, producción, entrega, factura y pago (sección 10 de la guía técnica) |
| ¿De dónde salen las imágenes de los productos? | De Wikimedia Commons, con licencias libres; los créditos están en `addons/dulces_delicias/static/img/CREDITOS.md` |

## Ya resuelto

- Los 9 numerales del enunciado están implementados y verificados; las cifras coinciden con la
  guía técnica.
- La simulación funciona desde el menú aunque el servidor haya arrancado antes y el planificador
  haya creado solicitudes de compra provisionales.
- Las compras y las facturas de proveedor salen en quetzales. Antes salían en USD porque los
  precios de proveedor se cargaban cuando la empresa aún tenía la moneda por defecto de Odoo.
- Los 11 productos (8 materias primas y 3 productos terminados) tienen imagen.
- Los recorridos guiados de Odoo están desactivados; su puntero morado ya no tapa campos.
- Las 22 capturas de `docs/capturas/` están rehechas sobre la versión corregida.
- Los 4 reportes se generan en pantalla y en PDF.
