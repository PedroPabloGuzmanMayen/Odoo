# Dulces Delicias S.A. — Caso de estudio en Odoo 17

Implementación completa del caso de estudio **"Dulces Delicias S.A."** (fabricación de caramelos,
chocolates y galletas) sobre **Odoo 17 Community**, lista para levantarse con Docker.

Incluye un módulo propio, `dulces_delicias`, que deja configurados todos los numerales del caso:

| # | Numeral del caso | Qué deja listo el módulo |
|---|------------------|--------------------------|
| 1 | Productos y materias primas | 3 productos terminados, 11 materias primas (8 ingredientes y 3 empaques) con unidades de medida (kg, L, unidades), listas de materiales con mano de obra y stock mínimo/máximo |
| 2 | Inventarios | Almacenes de **Materias Primas**, **Productos en Proceso** y **Productos Terminados**, inventario inicial y orden de compra por bajo stock |
| 3 | Producción | Centros de trabajo, operaciones con tiempos, órdenes de fabricación por lote con órdenes de trabajo |
| 4 | Clientes (CRM) | 3 clientes con perfil (tipo, contacto, preferencias, historial), oportunidades en etapas Prospecto / Negociación / Cierre con actividades |
| 5 | Ventas | Pedidos con términos de pago, incoterm, transportista y fecha de entrega comprometida |
| 6 | Facturación | Facturas y pagos por **transferencia bancaria**, **tarjeta de crédito** y **pago contra entrega** |
| 7 | Entregas | Entregas con guía, dirección de entrega y política de envío |
| 8 | Postventa | App **Postventa** (casos/reclamaciones con etapas, devolución, merma, reposición y nota de crédito) |
| 9 | Reportes | Estado del inventario, listado de clientes, listado de proveedores y **estado de resultados por período** (pantalla y PDF) |

## Inicio rápido

Requisitos: [Docker Desktop](https://www.docker.com/products/docker-desktop/) (o Docker Engine + Compose).

```bash
# 1. Instalar Odoo + el módulo (crea la base de datos "dulces_delicias")
./scripts/instalar.sh            # sólo configuración (para hacer las transacciones a mano)
./scripts/instalar.sh --simular  # configuración + todas las transacciones del caso ya ejecutadas

# 2. Abrir http://localhost:8069   usuario: admin   contraseña: admin
```

En Windows (PowerShell), si no tiene `bash`, ejecute los mismos pasos a mano:

```powershell
docker compose up -d db
docker compose run --rm odoo odoo -d dulces_delicias -i dulces_delicias --load-language=es_419 --without-demo=all --stop-after-init
docker compose up -d odoo
```

La simulación también puede ejecutarse desde la interfaz: **Dulces Delicias → Configuración → Simular caso de estudio**.

## Documentación

- **[Guía técnica de configuración y uso](docs/GUIA_TECNICA.md)**: paso a paso de cada numeral, con menús, datos y capturas.
- **[Guía de validación](docs/GUIA_VALIDACION.md)**: lista de comprobación, pantalla por pantalla, de cada numeral del enunciado con las cifras esperadas.
- **[TODO del equipo](docs/TODO.md)**: lo que ya se hizo y lo que falta.
- **[Preguntas y respuestas](docs/PREGUNTAS_Y_RESPUESTAS.md)**: preparación para la defensa con ITIL, TOGAF, métricas y realismo del caso.
- **[Pendientes para la entrega](docs/PENDIENTES_ENTREGA.md)**: lo que falta para entregar y lo que se dijo en clase sobre el caso.
- `docs/capturas/`: capturas de pantalla de cada proceso (útiles para la presentación).
- `docs/ejemplos/`: PDF de ejemplo de los cuatro reportes.

## Estructura

```
docker-compose.yml           Odoo 17 + PostgreSQL 15
config/odoo.conf             Configuración del servidor
addons/dulces_delicias/      Módulo del caso de estudio
scripts/instalar.sh          Instalación (y simulación opcional)
scripts/simular.py           Simulación del flujo completo vía "odoo shell"
scripts/reiniciar.sh         Borra todos los datos para empezar de cero
docs/                        Guía técnica, capturas y reportes de ejemplo
```
