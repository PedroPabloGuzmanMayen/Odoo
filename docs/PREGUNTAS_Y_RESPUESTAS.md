# Dulces Delicias S.A.: preguntas y respuestas para la defensa

Referencias completas: [ITIL 4 - PeopleCert/AXELOS](https://www.axelos.com/certifications/itil-service-management),
[TOGAF - The Open Group](https://www.opengroup.org/togaf) y
[documentación oficial de Odoo 17](https://www.odoo.com/documentation/17.0/es/).

Preguntas probables del profesor, con respuestas cortas que usan el vocabulario del curso. Las
cifras salen de la instalación con la simulación completa; el detalle está en la
[Guía técnica](GUIA_TECNICA.md) y en la [Guía de validación](GUIA_VALIDACION.md).

## Antes de responder

Lo que el profesor ha repetido en clase sobre cómo presentar:

- **No venda la herramienta, venda el resultado.** El error más frecuente que señala es "tiene
  tal módulo, funciona en tal cosa". Hay que decir qué gana el usuario o el negocio.
- **El público tiene que entender.** En exposiciones anteriores, el 25 % de la nota dependió de
  que la audiencia comprendiera el tema.
- **Administrar es medir.** Toda afirmación con datos; una métrica sin unidad no sirve, y una
  métrica vale por la decisión que permite tomar.
- **Teoría y práctica juntas.** No acepta teoría sin demostración ni demostración sin sustento.
- **Menos texto de IA en las diapositivas.** Prefiere conceptos aplicados al caso.

Cada respuesta debería durar 20 a 30 segundos.

## 1. Valor y negocio

### ¿Qué valor genera Odoo para Dulces Delicias?

Con la fórmula vista en clase, **valor = resultados − (costos + riesgos)**:

- **Resultados**: la planta sabe qué comprar y cuándo (la regla de mínimo y máximo pidió cacao,
  leche en polvo y huevos sin que nadie lo revisara), cada caja vendida se rastrea hasta su lote y
  el estado de resultados sale en segundos.
- **Costos que se eliminan**: conteos manuales, conciliaciones a mano y compras de emergencia.
- **Riesgos que se reducen**: quedarse sin insumos (el servicio más crítico de un negocio de
  comida, como vimos con la cafetería), vender lo que no hay y perder el rastro de un reclamo.

### ¿Qué tipo de resultados logra?

- **Funcional**: el pedido llega completo y a tiempo. Las tres entregas se hicieron en o antes de
  la fecha comprometida.
- **De experiencia**: el cliente con un problema recibe respuesta en menos de un día. El reclamo de
  los chocolates se resolvió en 18 horas y el cliente calificó "Muy satisfecho".
- **Estratégico**: la dirección conoce su margen por producto y puede negociar el contrato anual
  con el supermercado, que está en el CRM por Q120,000, sabiendo cuánto puede descontar.

### ¿Por qué Odoo y no SAP?

Por la idea de TOGAF que vimos en clase: la tecnología debe apoyar al negocio, no al revés. No se
elige SAP "porque es el que manda". Para una confitería mediana, Odoo Community cubre los
procesos que pide el caso, es de código abierto (sin costo de licencias) y se puede extender. Lo
que no trae la edición Community, la mesa de ayuda y el estado de resultados, lo agregamos con un
módulo propio. El costo de licencias de SAP no se justifica para este tamaño de empresa.

### ¿Cuál es la diferencia entre el producto y el servicio aquí?

El **producto** es Odoo configurado: módulos, recetas, reglas. El **servicio** es lo que recibe
el cliente: pedidos que llegan completos, a tiempo y con atención si algo sale mal. Como dijo el
profesor, optimizar el producto no es lo mismo que mejorar el servicio.

## 2. TOGAF

### ¿Qué relación tiene el caso con TOGAF?

El profesor explicó que las áreas del caso vienen de TOGAF. TOGAF sirve para alinear la
tecnología con los objetivos de la empresa y se apoya en cuatro dominios:

| Dominio | En el caso |
| --- | --- |
| Negocio | Procesos de compras, inventario, fabricación, CRM, ventas, facturación, entregas y postventa |
| Datos | Productos, recetas, clientes, proveedores, lotes y plan contable guatemalteco |
| Aplicaciones | Módulos de Odoo 17 más el módulo propio (postventa y reportes) |
| Tecnología | Odoo 17 Community, PostgreSQL 15 y Docker |

### ¿Cuál era el estado actual y cuál es el estado futuro?

Es el ciclo ADM de TOGAF: del estado actual (as is) al estado futuro (to be).

- **Estado actual**: inventario contado a mano, compras cuando "se nota" que falta, pedidos en
  cuadernos o hojas de cálculo, reclamos que no se registran y utilidad conocida solo a fin de mes.
- **Estado futuro**: un solo sistema donde cada operación alimenta a la siguiente y termina en la
  contabilidad, con reglas automáticas de reposición y casos postventa con seguimiento.

### ¿Cuáles son las fases del ADM? (solo si lo preguntan)

Preliminar, A Visión de arquitectura, B Arquitectura de negocio, C Arquitectura de sistemas de
información (datos y aplicaciones), D Arquitectura tecnológica, E Oportunidades y soluciones,
F Planificación de la migración, G Gobierno de la implementación y H Gestión del cambio de
arquitectura, con la gestión de requisitos al centro. El caso cubre sobre todo de A a D:
entendimos el negocio, definimos los datos maestros, elegimos las aplicaciones y montamos la
tecnología.

### ¿Por qué TOGAF habla de estandarización?

Porque reduce costos y riesgos. En el caso, todos los procesos siguen el mismo flujo estándar de
Odoo, y la automatización impone el procedimiento: no se puede facturar lo que no se entregó ni
fabricar sin receta. "El sistema no lo permite" es una forma de estandarizar.

## 3. ITIL aplicado al caso

### ¿Cómo se ven las cuatro dimensiones de ITIL?

| Dimensión | En el caso |
| --- | --- |
| Organizaciones y personas | Roles de compras, producción, ventas, postventa y contabilidad; responsable de cada caso postventa |
| Información y tecnología | Odoo como medio para generar valor, no como el valor en sí |
| Socios y proveedores | Siete proveedores de materia prima y dos de servicios, con precio, plazo de entrega y plazo de pago; transportistas |
| Flujos de valor y procesos | De la compra al pago del cliente, con la postventa como retroalimentación |

La similitud con los cuatro dominios de TOGAF no es casual, como dijo el profesor.

### ¿Dónde está la cadena de valor del servicio?

| Actividad | En el caso |
| --- | --- |
| Planificar | Reglas de mínimo y máximo, plan de producción semanal |
| Involucrar | CRM: oportunidades, actividades de seguimiento, perfil del cliente |
| Diseñar y transicionar | Recetas, operaciones y centros de trabajo configurados |
| Obtener y construir | Compras a proveedores y fabricación por lotes |
| Entregar y soportar | Entregas con guía y atención postventa |
| Mejorar | Causa raíz del reclamo y acción correctiva (hieleras térmicas) |

Las actividades no son secuenciales: planificar y mejorar atraviesan todo.

### ¿El reclamo de los chocolates es incidente, problema, solicitud o cambio?

- **Incidente**: las 5 cajas derretidas son una reducción de la calidad del servicio entregado. Se
  registró, se clasificó (producto dañado), se priorizó y se resolvió con devolución y reposición.
- **Problema**: si se repitiera, varios incidentes con la misma causa raíz (transporte sin
  empaque térmico) serían un problema. Ya registramos esa causa raíz en el caso.
- **Cambio**: la acción correctiva, usar hieleras térmicas para el chocolate, es un cambio en el
  proceso de entrega.
- La **consulta** de La Dulzura sobre la fecha de vencimiento no es un incidente: no hay nada
  roto. Es una solicitud de información, por eso es de tipo "consulta" y queda abierta.

### ¿Quién asume el costo del reclamo?

Según el criterio visto en clase, en un incidente lo asume quien presta el servicio. Por eso la
reposición se envió sin costo y las 5 cajas dañadas se registraron como merma (Q58.30 en el estado
de resultados). Si el cliente pidiera otra cosa, como cambiar la presentación, sería un cambio y
lo asumiría el cliente.

### ¿Dónde está la gestión de solicitudes de servicio?

En la reposición automática de stock. En las notas del curso, uno de los disparadores de una
solicitud es el propio sistema, "por ejemplo, reposición automática de stock cuando un insumo baja
del umbral". Eso hace la regla de mínimo y máximo: al confirmar la orden de galletas, los huevos
quedaron en 30 unidades (mínimo 60) y Odoo generó solo la solicitud de cotización por 330 huevos.

### ¿Dónde está el SLA?

- **Con el cliente**: la fecha de entrega comprometida de cada pedido y la fecha límite de
  respuesta de cada caso postventa.
- **Con los proveedores**: el plazo de entrega de cada uno. Por ejemplo, Cacao Maya Verapaz tiene
  4 días y entregó en 2.
- Como dijo el profesor, un SLA que no se mide no existe: por eso lo mostramos con datos.

### ¿Cuál es el punto único de contacto (service desk)?

La app Postventa. Cada caso tiene responsable, etapa, fecha límite y un historial visible, de modo
que el cliente siempre sabe qué sigue. Es la idea que el profesor repitió sobre el service desk.

### ¿Utilidad y garantía?

- **Utilidad**: el pedido sirve para lo que el cliente necesita (los productos y cantidades
  correctas).
- **Garantía**: llega en condiciones y a tiempo. El reclamo de los chocolates fue una falla de
  garantía, no de utilidad.

### ¿El inventario de Odoo es una CMDB?

No. El profesor lo distinguió así: un inventario dice que algo existe; una CMDB dice qué pasa si
algo se rompe. El inventario de Odoo se acerca a la gestión de activos ("qué tenemos y cuánto
vale"). Lo que sí aporta es **trazabilidad por lote**: del reclamo se llega al lote L-CHO, a su
orden de fabricación y a los insumos que se usaron.

## 4. Métricas: cómo comprobamos que funciona

Cada métrica con su unidad, su cálculo y la decisión que permite tomar, como pidió el profesor en
la rúbrica de prácticas.

| Métrica | Unidad y cálculo | Valor en el caso | Meta | Decisión que permite |
| --- | --- | --- | --- | --- |
| Entregas a tiempo | % = entregas en o antes de la fecha comprometida / entregas | 100 % (3 de 3) | 95 % o más | Cambiar de transportista o ajustar la fecha que se promete |
| Tiempo de resolución de reclamos | Horas desde que se abre el caso hasta que se resuelve | 18 h | 48 h o menos | Asignar más personal a postventa |
| Tasa de reclamos por producto | % = unidades reclamadas / unidades vendidas | Chocolates: 5.3 % (5 de 95) | 1 % o menos | Cambiar el empaque o el transporte del chocolate |
| Satisfacción del cliente | Escala de 1 a 5 al cerrar el caso | 5 | 4 o más | Revisar el proceso de atención si baja |
| Margen bruto por producto | % = (precio sin IVA − costo) / precio sin IVA | Caramelos 64.5 %, chocolates 71.0 %, galletas 69.6 % | Según la estrategia | Qué producto impulsar y cuánto descuento ofrecer en el contrato anual |
| Insumos bajo mínimo | Cantidad de reglas de mínimo y máximo disparadas en el período | 3 (cacao, leche en polvo, huevos) | Las mínimas posibles | Ajustar mínimos y máximos o cambiar de proveedor |

Y el resultado de negocio: utilidad neta de Q1,922.62 (15.5 % de las ventas) en el período.

## 5. Realismo del caso

### ¿Una confitería tendría solo tres productos?

El enunciado pide tres tipos de producto y los respetamos. Una confitería real tendría sabores y
presentaciones. Odoo lo resuelve con **atributos y variantes**: el mismo producto "Caramelos" con
variantes de sabor y tamaño, cada una con su receta. Lo dejamos en uno por línea para que la
demostración se concentre en el flujo completo.

### ¿Por qué los empaques son materia prima?

Porque sin bolsa o caja no se puede despachar el producto, y su costo es parte del costo de cada
unidad. El enunciado da los ingredientes "por ejemplo"; agregamos los empaques sin quitar ninguno
de los que pide.

### ¿Por qué leche en polvo y no leche líquida?

Porque el chocolate no admite agua: con leche líquida se arruina. La industria usa leche en polvo.
El enunciado pide "leche" y lo cumplimos con la forma que se usa de verdad.

### ¿Cuadran las recetas?

Sí. Los ingredientes de cada lote pesan lo mismo que el producto terminado. Por ejemplo, 100
bolsas de 500 g de caramelos son 50 kg y llevan 50 kg de azúcar más colorante y saborizante. Las
galletas llevan un poco más porque pierden agua en el horno.

### ¿El costo incluye la mano de obra?

Sí. Cada centro de trabajo tiene un costo por hora (de Q120 a Q200), y Odoo lo suma al costo del
lote según el tiempo de cada operación. Un paquete de galletas cuesta Q9.51: Q5.64 de ingredientes
y empaque más Q3.87 de mano de obra. Esa mano de obra se pagó con el asiento de planilla de
producción (Q1,585).

### ¿No es muy alto un margen bruto del 68 %?

Para dulces artesanales de marca propia es alto pero posible. Además, el período es corto (dos
semanas) y con pocas ventas, mientras que el alquiler y la energía son del mes completo. Por eso el
margen neto baja a 15.5 %. Con más volumen el margen neto subiría, porque los gastos fijos se
reparten entre más ventas.

### ¿Por qué tres ubicaciones y no tres almacenes?

En Odoo, "almacén" es la bodega física completa. Materias primas, productos en proceso y productos
terminados son áreas dentro de la misma planta. Con ubicaciones, Odoo mueve los insumos a
producción y el producto terminado a despacho dentro de un mismo almacén, que es como funciona una
planta real.

### ¿Por qué hicieron un módulo propio?

Porque Odoo Community no incluye la mesa de ayuda (Helpdesk) ni el estado de resultados: son de la
edición Enterprise, que es de pago. El módulo agrega la app Postventa y los reportes que pide el
enunciado.

### ¿Cómo cargaron los datos? ¿Es real?

Los datos maestros (productos, recetas, clientes, proveedores) se cargan al instalar el módulo.
Las transacciones se generan con una simulación que hace los mismos pasos que un usuario en
pantalla, repartidos en las dos semanas anteriores. En la demostración en vivo se puede crear un
pedido nuevo a mano para mostrar que el flujo es real.

## 6. Odoo y la demostración

### ¿Cómo se integran los módulos?

Cada operación genera su asiento contable automático:

- la recepción de la compra sube el inventario de materias primas;
- la fabricación lo pasa a producto terminado, con la mano de obra incluida;
- la entrega y la factura reconocen el costo de ventas y el ingreso;
- el pago cierra la cuenta del cliente.

Por eso el estado de resultados sale sin hacer ningún cálculo a mano.

### ¿Cómo se calcula el estado de resultados?

Suma los asientos contables publicados del período elegido, agrupados por tipo de cuenta del plan
contable guatemalteco: ingresos, costo de ventas y gastos. Si se cambian las fechas, el reporte se
recalcula. Eso cumple el "para un periodo dado" del enunciado.

### ¿Qué pasa si un cliente pide más de lo que hay?

Odoo reserva el producto al confirmar el pedido. Si no hay existencias, la entrega queda "En
espera" hasta que se fabrique o se reciba el producto, y el pedido muestra el pronóstico de
disponibilidad. Es el bloqueo de inventario que vimos en el service blueprint, para no sobrevender.

### ¿Qué pasa si Odoo falla durante la demostración?

Tenemos las 22 capturas de pantalla como respaldo. Es una aplicación del principio de "la
esperanza no es una estrategia": planificamos qué hacer si algo falla.

## 7. Para cerrar

Una frase que resume el caso con las ideas del curso: "Odoo no es el valor; es el medio. El valor
está en que Dulces Delicias compra a tiempo, sabe cuánto le cuesta cada producto, entrega a tiempo
y atiende a su cliente cuando algo sale mal, y todo eso se puede medir".
