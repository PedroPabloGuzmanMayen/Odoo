# Dulces Delicias S.A.: guía de validación

Documentación oficial de Odoo 17: <https://www.odoo.com/documentation/17.0/es/>

Recorrido para comprobar, pantalla por pantalla, que cada numeral del enunciado está cumplido en
Odoo. Cada sección indica el requisito, el menú donde se ve y lo que debe aparecer. El detalle de
cómo se configuró cada punto está en la [Guía técnica](GUIA_TECNICA.md).

## Antes de empezar

1. Instale el sistema con `./scripts/instalar.sh` y entre a <http://localhost:8069> con
   **admin / admin**.
2. Abra el menú **Dulces Delicias > Configuración > Simular caso de estudio**, deje los 8 pasos
   marcados y pulse **Ejecutar simulación**. Tarda unos 10 segundos y al terminar cada paso dice
   "completado". Cada paso se ejecuta una sola vez.
3. Abra el asistente siempre desde el menú. Si se abre pegando su dirección en la barra del
   navegador, al cerrarlo no queda una pantalla debajo y Odoo lo vuelve a mostrar.

Los números de documento (P00007, S00001, etc.) pueden variar entre instalaciones. Por ejemplo,
si el servidor arrancó antes de la simulación, el planificador crea solicitudes de compra
provisionales que la simulación descarta, y la numeración de compras empieza más adelante. Los
importes, cantidades y estados deben coincidir exactamente con esta guía.

Para volver a empezar: `./scripts/reiniciar.sh` y luego `./scripts/instalar.sh`.

## 1. Productos y materias primas

Requisito: tres productos, las materias primas de cada uno, sus unidades de medida y el stock
mínimo y máximo.

- [ ] **Inventario > Productos > Productos**: hay 3 productos terminados (código `PT-`) y 8
  materias primas (código `MP-`). En la vista de tarjetas cada producto muestra su imagen.
- [ ] Abra **Cacao en polvo**: la unidad de medida es kg. La leche, el colorante y el saborizante
  están en L, y los huevos en unidades.
- [ ] **Manufactura > Productos > Listas de materiales**: hay 3 recetas.

| Producto | Componentes |
| ---------- | ------------- |
| Caramelos surtidos de frutas | Azúcar, colorante, saborizante |
| Chocolates de leche | Cacao, leche, azúcar |
| Galletas de mantequilla | Harina, azúcar, mantequilla, huevos |

- [ ] Abra una receta y revise la pestaña **Operaciones**: tiene 3 operaciones con centro de
  trabajo y tiempo estándar.
- [ ] **Dulces Delicias > Reportes > Reabastecimiento (mín./máx.)**: las 8 materias primas
  tienen mínimo y máximo (por ejemplo, cacao: 30 kg y 150 kg).

## 2. Gestión de inventarios

Requisito: inventario inicial, almacenes de materias primas, productos en proceso y productos
terminados, y una orden de compra por bajo stock.

- [ ] **Dulces Delicias > Reportes > Existencias por ubicación**: aparecen las ubicaciones
  *Materias Primas* y *Productos Terminados*, además de *Producto No Conforme* para las
  devoluciones. *Productos en Proceso* queda vacía al terminar la producción. Se ve en el
  numeral 3.
- [ ] **Inventario > Reportes > Historial de movimientos**: filtre por "Inventario inicial" para
  ver la carga de las 8 materias primas. El cacao (20 kg) y la leche (25 L) quedan por debajo del
  mínimo a propósito.
- [ ] **Compras > Órdenes > Órdenes de compra**: hay 2 compras confirmadas, recibidas, facturadas
  y pagadas.

| Proveedor | Producto | Cantidad | Total |
| ----------- | ---------- | ---------- | ------- |
| Cacao Maya Verapaz | Cacao en polvo | 130 kg (150 - 20) | Q5,850.00 |
| Lácteos San Isidro | Leche entera | 125 L (150 - 25) | Q1,250.00 |

- [ ] **Compras > Órdenes > Solicitudes de cotización**: hay una solicitud en borrador a
  **Avícola Los Pinos** por 900 huevos (**Q1,125.00**). Odoo la creó solo, porque la producción
  dejó los huevos en 100 unidades, por debajo del mínimo de 200.

## 3. Planificación y ejecución de la producción

Requisito: un lote de cada producto, órdenes de trabajo con consumo de materias primas y tiempo,
cierre del lote e impacto en inventario.

- [ ] **Manufactura > Operaciones > Órdenes de fabricación**: hay 3 órdenes en estado **Hecho**.

| Orden | Producto | Cantidad | Lote |
| ------- | ---------- | ---------- | ------ |
| DD/MO/00001 | Caramelos | 200 | L-CAR-AAAAMMDD |
| DD/MO/00002 | Chocolates | 100 | L-CHO-AAAAMMDD |
| DD/MO/00003 | Galletas | 150 | L-GAL-AAAAMMDD |

- [ ] Abra una orden y revise la pestaña **Componentes** (lo consumido) y la pestaña **Órdenes
  de trabajo** (el tiempo real de cada operación).
- [ ] **Manufactura > Operaciones > Órdenes de trabajo**: hay 9 órdenes terminadas, 3 por
  producto.
- [ ] En la orden, el botón inteligente de **Traslados** muestra el paso de las materias primas a
  *Productos en Proceso* y del producto terminado a *Productos Terminados*.
- [ ] Impacto en inventario: en **Existencias por ubicación**, *Materias Primas* quedó con cacao
  135 kg, leche 140 L, harina 90 kg, mantequilla 35 kg, huevos 100 u. y azúcar 190 kg.

## 4. Gestión de clientes (CRM)

Requisito: los tres clientes con tipo, contacto, historial y preferencias, y oportunidades con
seguimientos, recordatorios y etapas prospecto, negociación y cierre.

- [ ] **Dulces Delicias > Postventa > Clientes**: aparecen Confitería La Dulzura, Supermercado
  Delicias y Distribuidora Dulce Sabor.
- [ ] Abra cada cliente y revise:
  - La pestaña **Perfil Dulces Delicias**: tipo de cliente, productos preferidos, preferencias y
    frecuencia de compra.
  - La pestaña **Historial de compras**: sus pedidos y el total comprado.
  - El contacto (persona de compras), teléfono y correo.
- [ ] **CRM > Ventas > Mi flujo**: el tablero tiene una oportunidad en cada etapa.

| Etapa | Cliente | Oportunidad | Ingreso esperado |
| ------- | --------- | ------------- | ------------------ |
| Prospecto | Confitería La Dulzura | Surtido navideño para 2 tiendas | Q8,000 |
| Negociación | Supermercado Delicias | Contrato anual de suministro | Q120,000 |
| Cierre (ganado) | Distribuidora Dulce Sabor | Pedido mayorista región occidente | Q3,166 |

- [ ] Abra una oportunidad: en el panel de la derecha aparecen las actividades programadas
  (llamadas, correos, reuniones) con fecha. Esos son los seguimientos y recordatorios.
- [ ] **CRM > Ventas > Mis actividades**: lista de recordatorios pendientes.

## 5. Gestión de ventas

Requisito: un pedido por cliente con cantidades distintas, términos de pago, condiciones de
entrega y seguimiento.

- [ ] **Ventas > Órdenes > Órdenes**: hay 3 pedidos confirmados.

| Cliente | Total | Plazo de pago | Incoterm | Transportista |
| --------- | ------- | --------------- | ---------- | --------------- |
| Confitería La Dulzura | Q3,200.00 | Pago inmediato | DAP | Reparto propio |
| Supermercado Delicias | Q7,550.00 | 30 días | DAP | Reparto propio |
| Distribuidora Dulce Sabor | Q3,166.25 | 15 días | CPT | Transporte a departamentos |

- [ ] En el pedido de Dulce Sabor, cada línea tiene 5 % de descuento por ser mayorista.
- [ ] Pestaña **Otra información**: incoterm, fecha de entrega comprometida y política de envío.
- [ ] Seguimiento: los botones inteligentes **Entrega** y **Factura** del pedido, y las columnas
  de estado de entrega y de facturación en la lista.

## 6. Facturación y pagos

Requisito: generar y enviar las facturas, y registrar pagos por transferencia, tarjeta y contra
entrega.

- [ ] **Facturación > Clientes > Facturas de clientes**: hay 3 facturas publicadas y marcadas
  como enviadas.

| Cliente | Total | Estado | Diario de pago |
| --------- | ------- | -------- | ---------------- |
| Confitería La Dulzura | Q3,200.00 | Pagado | Tarjeta de crédito |
| Supermercado Delicias | Q7,550.00 | Pago parcial (saldo Q3,775.00) | Banco - Transferencia bancaria |
| Distribuidora Dulce Sabor | Q3,166.25 | Pagado | Pago contra entrega |

- [ ] **Facturación > Clientes > Pagos**: hay 3 cobros, uno por cada diario.
- [ ] **Facturación > Configuración > Contabilidad > Diarios**: existen los diarios *Banco -
  Transferencia bancaria*, *Tarjeta de crédito* y *Pago contra entrega*.
- [ ] **Facturación > Proveedores > Facturas (proveedores)**: hay 4 facturas pagadas: las 2
  compras, la de energía eléctrica (Q1,680.00) y la de alquiler de planta (Q5,600.00).

## 7. Gestión de entregas

Requisito: planificar las entregas y registrarlas como completadas.

- [ ] **Inventario > Operaciones > Traslados**, con el filtro **Entregas**: hay 4 entregas
  `DD/OUT/...` en estado **Hecho**.
- [ ] Tres entregas tienen número de guía `GUIA-DD-OUT-...`, transportista y dirección de entrega.
  La de Supermercado Delicias va a su centro de distribución.
- [ ] La cuarta entrega es la reposición sin costo del caso postventa (numeral 8).

## 8. Atención postventa

Requisito: configurar la atención al cliente, registrar un caso sobre un pedido concreto (producto
en mal estado), darle seguimiento y resolverlo.

- [ ] **Dulces Delicias > Configuración > Etapas postventa**: existen las etapas Nuevo, En
  análisis, En resolución, Resuelto y Cerrado.
- [ ] **Dulces Delicias > Postventa > Casos postventa**: el tablero muestra dos casos.
  - **PV/2026/0001**, en *Resuelto*: "Cajas de chocolates recibidas derretidas", de Supermercado
    Delicias.
  - **PV/2026/0002**, en *Nuevo*: consulta de La Dulzura sobre la fecha de vencimiento, con una
    llamada pendiente.
- [ ] Abra PV/2026/0001 y compruebe:
  - Está vinculado al pedido, la entrega, la factura, el producto y el lote `L-CHO-...`.
  - Los botones inteligentes llevan a la **devolución** (hacia *Producto No Conforme*) y a la
    **reposición** (entrega sin costo de 5 cajas).
  - La pestaña **Resolución** trae la causa raíz, la acción correctiva y la satisfacción del
    cliente ("Muy satisfecho").
  - El panel de la derecha guarda el historial de seguimiento: cambios de etapa, notas y
    actividades.

## 9. Reportes

Requisito: estado del inventario, listado de clientes, listado de proveedores y estado de
resultados para un período dado.

- [ ] **Dulces Delicias > Reportes > Estado de resultados**: con el período del 1 de enero a la
  fecha, muestra estas cifras.

| Concepto | Importe | % de ventas |
| ---------- | --------- | ------------- |
| Ingresos por ventas (sin IVA) | Q12,425.22 | 100.0 % |
| Costo de ventas (incluye merma) | Q2,836.59 | 22.8 % |
| Utilidad bruta | Q9,588.63 | 77.2 % |
| Gastos de operación | Q6,500.00 | 52.3 % |
| Utilidad neta del período | Q3,088.63 | 24.9 % |

- [ ] Cambie las fechas del período: el reporte se recalcula. Esto cumple el requisito de "para
  un período dado".
- [ ] **Dulces Delicias > Reportes > Imprimir reportes (PDF)**: elija cada tipo (estado de
  resultados, estado del inventario, listado de clientes, listado de proveedores). Cada uno se ve
  en pantalla y se descarga en PDF.

## Resultados esperados del enunciado

| Resultado esperado | Dónde se demuestra |
| -------------------- | -------------------- |
| Flujo completo, de la compra de materias primas a la postventa | Numerales 2 a 8, en ese orden |
| Gestión de clientes: perfiles, oportunidades y postventa | Numerales 4 y 8 |
| Integración entre módulos | Sección 10 de la [Guía técnica](GUIA_TECNICA.md): cada operación genera su asiento contable automático |
| Gestión empresarial con un ERP | Estado de resultados (numeral 9) alimentado por todas las operaciones anteriores |

## Si algo no coincide

| Síntoma | Causa probable | Solución |
| --------- | ---------------- | ---------- |
| No hay compras de cacao ni leche y faltan los gastos | La simulación se ejecutó con una versión anterior del módulo | `./scripts/reiniciar.sh`, `./scripts/instalar.sh` y volver a simular |
| La ventana de simulación reaparece al cerrarla | Se abrió pegando su dirección en el navegador | Vaya a <http://localhost:8069/web> y use los menús |
| El asistente dice "ya ejecutado anteriormente" | La simulación ya corrió en esta base de datos | Es normal; para repetirla hay que reiniciar |
| Los importes difieren | Se hicieron transacciones manuales además de la simulación | Reiniciar y simular sobre una base limpia |
