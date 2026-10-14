"""Simulación de punta a punta del caso de estudio "Dulces Delicias S.A.".

Cada paso replica lo que un usuario haría desde la interfaz y puede ejecutarse desde
Dulces Delicias > Configuración > Simular caso de estudio. Los pasos son idempotentes:
un paso ya ejecutado no se vuelve a ejecutar.
"""
import logging
from contextlib import contextmanager
from datetime import datetime, time, timedelta

from odoo import _, api, fields, models
from odoo.exceptions import UserError
from odoo.tools import float_is_zero

try:
    from freezegun import freeze_time
except ImportError:  # sin freezegun todo queda con la fecha de hoy
    freeze_time = None

_logger = logging.getLogger(__name__)

PASOS = [
    ("inventario", "1-2. Inventario inicial de materias primas"),
    ("compras", "2. Orden de compra por bajo stock (recepción, factura y pago) y gastos"),
    ("produccion", "3. Producción de un lote de caramelos, chocolates y galletas"),
    ("crm", "4. Oportunidades CRM con etapas, seguimientos y recordatorios"),
    ("ventas", "5. Pedidos de venta con términos de pago y condiciones de entrega"),
    ("entregas", "7. Entregas a clientes"),
    ("facturacion", "6. Facturas y pagos (transferencia, tarjeta, contra entrega)"),
    ("postventa", "8. Casos de atención postventa"),
]

INVENTARIO_INICIAL = {
    "mp_azucar": 250,
    "mp_colorante": 3,
    "mp_saborizante": 5,
    "mp_cacao": 6,       # bajo el mínimo (10 kg) -> simula bajo stock
    "mp_leche": 5,       # bajo el mínimo (8 kg)  -> simula bajo stock
    "mp_harina": 60,
    "mp_mantequilla": 25,
    "mp_huevos": 90,     # tras producir galletas queda bajo el mínimo (60) -> compra automática
    "mp_bolsa_caramelos": 500,
    "mp_caja_bombones": 200,
    "mp_bolsa_galletas": 400,
}

# Línea de tiempo: cada lote se fabrica en un día distinto (días antes de hoy)
PRODUCCION = [("pt_caramelos", 200, 9), ("pt_chocolates", 100, 8), ("pt_galletas", 150, 7)]

PEDIDOS = {
    "cliente_la_dulzura": {
        "lineas": [("pt_caramelos", 50, 0), ("pt_chocolates", 20, 0), ("pt_galletas", 30, 0)],
        "plazo": "account.account_payment_term_immediate",
        "transportista": "carrier_reparto_propio",
        "incoterm": "account.incoterm_DAP",
        "politica": "direct",
        "dias_entrega": 2,
        "ref": "OC-LD-0457",
        "nota": "Entregar el lunes entre 8:00 y 11:00 en tienda central. Pago con tarjeta de crédito.",
        "diario_pago": "TARJ",
        "porcentaje_pago": 100,
        "dia_pedido": (6, 10, 0), "dia_entrega": (4, 9, 30), "dia_pago": (4, 15, 0),
    },
    "cliente_supermercado_delicias": {
        "lineas": [("pt_caramelos", 100, 0), ("pt_chocolates", 50, 0), ("pt_galletas", 80, 0)],
        "plazo": "account.account_payment_term_30days",
        "transportista": "carrier_reparto_propio",
        "incoterm": "account.incoterm_DAP",
        "politica": "one",
        "dias_entrega": 3,
        "ref": "SD-PO-2026-1188",
        "nota": "Entrega completa en el centro de distribución (Villa Nueva) con cita previa. "
                "Vida útil mínima de 60 días. Pago por transferencia bancaria a 30 días.",
        "entrega": "entrega_supermercado_delicias",
        "diario_pago": "BNK1",
        "porcentaje_pago": 50,
        "dia_pedido": (5, 10, 30), "dia_entrega": (3, 8, 0), "dia_pago": (1, 11, 0),
    },
    "cliente_dulce_sabor": {
        "lineas": [("pt_caramelos", 40, 5), ("pt_chocolates", 25, 5), ("pt_galletas", 30, 5)],
        "plazo": "account.account_payment_term_15days",
        "transportista": "carrier_departamentos",
        "incoterm": "account.incoterm_CPT",
        "politica": "direct",
        "dias_entrega": 4,
        "ref": "DDS-0932",
        "nota": "Despacho a Quetzaltenango por transporte tercerizado. Descuento mayorista 5%. "
                "Pago en efectivo contra entrega.",
        "diario_pago": "PCE",
        "porcentaje_pago": 100,
        "dia_pedido": (5, 15, 0), "dia_entrega": (2, 10, 0), "dia_pago": (2, 16, 0),
    },
}


class DdSimulacion(models.AbstractModel):
    _name = "dd.simulacion"
    _description = "Simulación del caso Dulces Delicias"

    # ------------------------------------------------------------------
    # Utilidades
    # ------------------------------------------------------------------
    def _ref(self, xmlid):
        if "." not in xmlid:
            xmlid = "dulces_delicias.%s" % xmlid
        return self.env.ref(xmlid)

    def _hecho(self, paso):
        return bool(self.env["ir.config_parameter"].sudo().get_param("dulces_delicias.sim.%s" % paso))

    def _marcar(self, paso):
        self.env["ir.config_parameter"].sudo().set_param(
            "dulces_delicias.sim.%s" % paso, fields.Datetime.now())

    def _hoy_real(self):
        hoy = self.env.context.get("dd_hoy")
        return fields.Date.to_date(hoy) if hoy else fields.Date.context_today(self)

    @contextmanager
    def _reloj(self, dias_antes, hora=8, minuto=0):
        """Ejecuta el bloque con el reloj de Odoo puesto en un día anterior a hoy (hora de
        Guatemala), para que la operación quede repartida en las dos semanas previas como en
        una empresa real y no toda en el mismo segundo."""
        if not freeze_time:
            yield
            return
        local = datetime.combine(self._hoy_real() - timedelta(days=dias_antes), time(hora, minuto))
        momento = local + timedelta(hours=6)  # America/Guatemala es UTC-6 todo el año
        self.env.flush_all()
        cr = self.env.cr
        with freeze_time(momento):
            cr._now = momento
            try:
                yield
                self.env.flush_all()
            finally:
                cr._now = None

    def _warehouse(self):
        return self.env.ref("stock.warehouse0")

    def _journal(self, code):
        return self.env["account.journal"].search(
            [("code", "=", code), ("company_id", "=", self.env.company.id)], limit=1)

    def _validar_picking(self, picking, lote=None):
        """Valida una transferencia completa, como el botón Validar."""
        if picking.state == "done":
            return picking
        if picking.state == "draft":
            picking.action_confirm()
        picking.action_assign()
        for move in picking.move_ids.filtered(lambda m: m.state not in ("done", "cancel")):
            if move.has_tracking != "none" and lote and not move.move_line_ids.lot_id:
                move.move_line_ids.unlink()
                self.env["stock.move.line"].create({
                    "move_id": move.id,
                    "picking_id": picking.id,
                    "product_id": move.product_id.id,
                    "product_uom_id": move.product_uom.id,
                    "location_id": move.location_id.id,
                    "location_dest_id": move.location_dest_id.id,
                    "lot_id": lote.id,
                    "quantity": move.product_uom_qty,
                })
            else:
                move.quantity = move.product_uom_qty
            move.picked = True
        res = picking.with_context(skip_sms=True).button_validate()
        if isinstance(res, dict) and res.get("res_model"):
            wizard = self.env[res["res_model"]].with_context(res.get("context", {}))
            if res["res_model"] == "stock.backorder.confirmation":
                wizard.create({"pick_ids": [(6, 0, picking.ids)]}).process_cancel_backorder()
            elif res["res_model"] == "stock.immediate.transfer":
                wizard.create({"pick_ids": [(6, 0, picking.ids)]}).process()
        if picking.state != "done":
            raise UserError(_("No se pudo validar la transferencia %s.", picking.name))
        return picking

    def _pagar(self, moves, journal, monto=None, memo=None):
        ctx = {"active_model": "account.move", "active_ids": moves.ids}
        vals = {"journal_id": journal.id, "payment_date": fields.Date.context_today(self)}
        if monto:
            vals["amount"] = monto
        if memo:
            vals["communication"] = memo
        wizard = self.env["account.payment.register"].with_context(**ctx).create(vals)
        return wizard._create_payments()

    # ------------------------------------------------------------------
    # Pasos
    # ------------------------------------------------------------------
    @api.model
    def ejecutar(self, pasos=None):
        if self.env.su:
            # Desde "odoo shell" se ejecuta como el administrador para que los documentos
            # queden a su nombre (y no de OdooBot)
            self = self.with_user(self.env.ref("base.user_admin")).with_context(
                lang="es_419", tz="America/Guatemala")
        self = self.with_context(dd_hoy=fields.Date.to_string(fields.Date.context_today(self)))
        pasos = pasos or [p[0] for p in PASOS]
        resultados = []
        for paso, nombre in PASOS:
            if paso not in pasos:
                continue
            if self._hecho(paso):
                resultados.append(_("%s: ya ejecutado anteriormente", nombre))
                continue
            _logger.info("Simulación Dulces Delicias - %s", nombre)
            getattr(self, "_paso_%s" % paso)()
            self._marcar(paso)
            resultados.append(_("%s: completado", nombre))
        return resultados

    def _paso_inventario(self):
        with self._reloj(13, 8, 0):
            self._inventario_inicial()

    def _inventario_inicial(self):
        mp = self._ref("location_materias_primas")
        Quant = self.env["stock.quant"].with_context(inventory_mode=True, inventory_name=_("Inventario inicial"))
        quants = Quant
        for xmlid, cantidad in INVENTARIO_INICIAL.items():
            quant = Quant.create({
                "product_id": self._ref(xmlid).id,
                "location_id": mp.id,
                "inventory_quantity": cantidad,
            })
            quants |= quant
        quants.action_apply_inventory()

    def _paso_compras(self):
        self._compras_bajo_stock()
        self._gastos_operacion()

    def _compras_bajo_stock(self):
        mp = self._ref("location_materias_primas")
        orderpoints = self.env["stock.warehouse.orderpoint"].search([("location_id", "=", mp.id)])
        with self._reloj(12, 9, 0):
            # Si el servidor arrancó antes de la simulación, el planificador ya creó solicitudes
            # en borrador con el inventario en cero. Odoo las cuenta como "en camino" y la cantidad
            # a pedir queda en 0, así que se eliminan para recalcular con el inventario real.
            provisionales = self.env["purchase.order.line"].search([
                ("orderpoint_id", "in", orderpoints.ids), ("order_id.state", "=", "draft")]).order_id
            provisionales = provisionales.filtered(lambda po: all(po.order_line.mapped("orderpoint_id")))
            provisionales.button_cancel()
            provisionales.unlink()
            orderpoints._compute_qty_to_order()
            bajos = orderpoints.filtered(lambda o: o.qty_to_order > 0)
            if not bajos:
                return
            productos = bajos.product_id
            bajos.action_replenish()
            lineas = self.env["purchase.order.line"].search([
                ("product_id", "in", productos.ids), ("order_id.state", "in", ("draft", "sent"))])
            compras = lineas.order_id
            for po in compras:
                po.notes = _("Reabastecimiento generado por regla de stock mínimo (simulación de bajo stock).")
                po.button_confirm()
        # Recepción dos días después, factura del proveedor el mismo día y pago dos días más tarde
        with self._reloj(10, 10, 0):
            for po in compras:
                for picking in po.picking_ids:
                    self._validar_picking(picking)
        with self._reloj(10, 11, 0):
            for po in compras:
                po.action_create_invoice()
                for bill in po.invoice_ids.filtered(lambda m: m.state == "draft"):
                    bill.write({"invoice_date": fields.Date.context_today(self),
                                "ref": "FAC-%s" % po.name.replace("/", "")})
                    bill.action_post()
        with self._reloj(8, 10, 0):
            for po in compras:
                for bill in po.invoice_ids.filtered(lambda m: m.payment_state == "not_paid"):
                    self._pagar(bill, self._journal("BNK1"), memo=po.name)

    def _gastos_operacion(self):
        """Gastos de operación del período (servicios): alquiler al inicio del mes y energía
        cuando llega el recibo. (partner, producto, monto, días antes de la factura y del pago)"""
        mes = self._hoy_real()
        gastos = [
            ("prov_inmobiliaria", "srv_alquiler", 5600.00, "ALQ-%s" % mes.strftime("%Y%m"), 13, 13),
            ("prov_energia", "srv_energia", 1680.00, "EC-%s" % mes.strftime("%Y-%m"), 5, 4),
        ]
        for partner, producto, monto, ref, dia_factura, dia_pago in gastos:
            with self._reloj(dia_factura, 9, 30):
                bill = self.env["account.move"].create({
                    "move_type": "in_invoice",
                    "partner_id": self._ref(partner).id,
                    "invoice_date": fields.Date.context_today(self),
                    "ref": ref,
                    "invoice_line_ids": [(0, 0, {
                        "product_id": self._ref(producto).id,
                        "quantity": 1,
                        "price_unit": monto,
                    })],
                })
                bill.action_post()
            with self._reloj(dia_pago, 11, 0):
                self._pagar(bill, self._journal("BNK1"), memo=ref)

    def _paso_produccion(self):
        for xmlid, cantidad, dias_antes in PRODUCCION:
            self._fabricar_lote(xmlid, cantidad, dias_antes)
        with self._reloj(7, 17, 0):
            self._planilla_produccion()

    def _fabricar_lote(self, xmlid, cantidad, dias_antes):
        producto = self._ref(xmlid)
        # Al inicio del turno: orden de fabricación, traslado de materias primas y lote
        with self._reloj(dias_antes, 6, 30):
            hoy = fields.Date.context_today(self)
            inicio = datetime.combine(hoy, time(13, 0))  # 7:00 hora de Guatemala (UTC-6)
            bom = self.env["mrp.bom"]._bom_find(producto)[producto]
            mo = self.env["mrp.production"].create({
                "product_id": producto.id,
                "product_qty": cantidad,
                "bom_id": bom.id,
                "origin": _("Plan de producción semanal"),
                "date_start": inicio,
            })
            mo.action_confirm()
            # Traslado de materias primas al almacén de productos en proceso
            for picking in mo.picking_ids.filtered(lambda p: p.state not in ("done", "cancel")):
                self._validar_picking(picking)
            mo.action_assign()
            lote = self.env["stock.lot"].create({
                "name": "L-%s-%s" % (producto.default_code.split("-")[-1], hoy.strftime("%Y%m%d")),
                "product_id": producto.id,
                "company_id": mo.company_id.id,
            })
            mo.lot_producing_id = lote
            mo.qty_producing = cantidad
            mo._set_qty_producing()
        # Al terminar el turno: órdenes de trabajo con el tiempo estándar de cada operación
        with self._reloj(dias_antes, 11, 30):
            momento = inicio
            for wo in mo.workorder_ids.sorted("id"):
                wo.button_start()
                wo.button_finish()
                duracion = wo.duration_expected or 30
                wo.time_ids.write({"date_start": momento, "date_end": momento + timedelta(minutes=duracion)})
                momento += timedelta(minutes=duracion)
            for move in mo.move_raw_ids:
                move.picked = True
            res = mo.button_mark_done()
            if isinstance(res, dict) and res.get("res_model") == "mrp.consumption.warning":
                self.env["mrp.consumption.warning"].with_context(res["context"]).create({
                    "mrp_production_ids": [(6, 0, mo.ids)],
                }).action_confirm()
            elif isinstance(res, dict) and res.get("res_model") == "mrp.production.backorder":
                self.env["mrp.production.backorder"].with_context(res["context"]).create({
                    "mrp_production_ids": [(6, 0, mo.ids)],
                }).action_close_mo()
            if mo.state != "done":
                raise UserError(_("No se pudo finalizar la orden de fabricación %s.", mo.name))
            # Odoo toma como inicio el momento en que se arrancó la primera orden de trabajo y no
            # permite cambiar una orden terminada: se dejan por SQL las horas reales del turno
            self.env.flush_all()
            momento = inicio
            for wo in mo.workorder_ids.sorted("id"):
                fin = momento + timedelta(minutes=wo.duration_expected or 30)
                self.env.cr.execute(
                    "UPDATE mrp_workorder SET date_start = %s, date_finished = %s WHERE id = %s",
                    (momento, fin, wo.id))
                momento = fin
            self.env.cr.execute(
                "UPDATE mrp_production SET date_start = %s, date_finished = %s WHERE id = %s",
                (inicio, momento, mo.id))
            self.env.invalidate_all()

    def _planilla_produccion(self):
        """La mano de obra entra al costo de cada lote por el costo por hora de los centros de
        trabajo, con contrapartida en la cuenta de productos en proceso. Este asiento registra el
        pago de esa planilla de operarios y deja la cuenta de productos en proceso en cero."""
        company = self.env.company
        wip = self.env["account.account"].search(
            [("code", "=", "1.1.04.02"), ("company_id", "=", company.id)], limit=1)
        saldo = sum(self.env["account.move.line"].search(
            [("account_id", "=", wip.id), ("parent_state", "=", "posted")]).mapped("balance"))
        if not wip or float_is_zero(saldo, precision_rounding=company.currency_id.rounding):
            return
        banco = self._journal("BNK1")
        diario = self.env["account.journal"].search(
            [("type", "=", "general"), ("company_id", "=", company.id)], limit=1)
        concepto = _("Planilla de operarios de producción (mano de obra aplicada a los lotes)")
        asiento = self.env["account.move"].create({
            "move_type": "entry",
            "journal_id": diario.id,
            "date": fields.Date.context_today(self),
            "ref": concepto,
            "line_ids": [
                (0, 0, {"account_id": wip.id, "name": concepto, "debit": -saldo if saldo < 0 else 0,
                        "credit": saldo if saldo > 0 else 0}),
                (0, 0, {"account_id": banco.default_account_id.id, "name": concepto,
                        "debit": saldo if saldo > 0 else 0, "credit": -saldo if saldo < 0 else 0}),
            ],
        })
        asiento.action_post()

    def _paso_crm(self):
        # Fechas límite y recordatorios se calculan desde hoy para que estén vigentes en la demo
        hoy = self._hoy_real()
        team = self.env.ref("sales_team.team_sales_department")
        admin = self.env.ref("base.user_admin")
        Lead = self.env["crm.lead"]
        llamada = self.env.ref("mail.mail_activity_data_call")
        reunion = self.env.ref("mail.mail_activity_data_meeting")
        correo = self.env.ref("mail.mail_activity_data_email")
        tarea = self.env.ref("mail.mail_activity_data_todo")
        oportunidades = [
            {
                "partner": "cliente_la_dulzura",
                "contacto": "contacto_la_dulzura",
                "name": "Surtido navideño para 2 tiendas",
                "revenue": 8000, "prob": 20, "stage": "crm.stage_lead1", "prioridad": "1", "dias": 45,
                "creado": (3, 10, 0), "etapa_el": (3, 10, 0),
                "descripcion": "Interés en cajas de regalo con caramelos y galletas para la temporada navideña.",
                "actividades": [
                    (llamada, 2, "Llamar para presentar el catálogo navideño"),
                    (correo, 3, "Enviar catálogo y lista de precios de temporada"),
                ],
            },
            {
                "partner": "cliente_supermercado_delicias",
                "contacto": "contacto_supermercado_delicias",
                "name": "Contrato anual de suministro - góndola de chocolates",
                "revenue": 120000, "prob": 60, "stage": "crm.stage_lead3", "prioridad": "3", "dias": 20,
                "creado": (11, 9, 0), "etapa_el": (7, 15, 0),
                "descripcion": "Negociación de contrato anual con entregas quincenales a 8 sucursales.",
                "actividades": [
                    (reunion, 5, "Reunión para negociar descuento por volumen y calendario de entregas"),
                    (tarea, 1, "Preparar propuesta económica con 5% de descuento por volumen"),
                ],
            },
            {
                "partner": "cliente_dulce_sabor",
                "contacto": "contacto_dulce_sabor",
                "name": "Pedido mayorista región occidente",
                "revenue": 3166, "prob": 100, "stage": "crm.stage_lead4", "prioridad": "2", "dias": 0,
                "creado": (8, 11, 0), "etapa_el": (5, 14, 30),
                "descripcion": "Primer pedido mayorista para tiendas de barrio de Quetzaltenango.",
                "actividades": [
                    (llamada, 7, "Llamada de seguimiento post-entrega y satisfacción"),
                ],
            },
        ]
        for datos in oportunidades:
            partner = self._ref(datos["partner"])
            with self._reloj(*datos["creado"]):
                lead = Lead.create({
                    "type": "opportunity",
                    "name": datos["name"],
                    "partner_id": partner.id,
                    "contact_name": self._ref(datos["contacto"]).name,
                    "function": self._ref(datos["contacto"]).function,
                    "expected_revenue": datos["revenue"],
                    "probability": datos["prob"],
                    "priority": datos["prioridad"],
                    "team_id": team.id,
                    "user_id": admin.id,
                    "date_deadline": hoy + timedelta(days=datos["dias"]),
                    "description": datos["descripcion"],
                })
            with self._reloj(*datos["etapa_el"]):
                stage = self.env.ref(datos["stage"])
                if stage.is_won:
                    lead.action_set_won()
                else:
                    lead.stage_id = stage
                    lead.probability = datos["prob"]
                for tipo, dias, resumen in datos["actividades"]:
                    lead.activity_schedule(
                        activity_type_id=tipo.id, summary=resumen,
                        date_deadline=hoy + timedelta(days=dias), user_id=admin.id)
            partner.dd_productos_preferidos_ids = [(6, 0, [
                self._ref(x).id for x in {
                    "cliente_la_dulzura": ["pt_caramelos", "pt_galletas"],
                    "cliente_supermercado_delicias": ["pt_chocolates", "pt_galletas"],
                    "cliente_dulce_sabor": ["pt_caramelos", "pt_chocolates", "pt_galletas"],
                }[datos["partner"]]
            ])]

    def _paso_ventas(self):
        for partner_xmlid, datos in PEDIDOS.items():
            with self._reloj(*datos["dia_pedido"]):
                self._crear_pedido(partner_xmlid, datos)

    def _crear_pedido(self, partner_xmlid, datos):
        hoy = fields.Date.context_today(self)
        partner = self._ref(partner_xmlid)
        oportunidad = self.env["crm.lead"].search([("partner_id", "=", partner.id)], limit=1)
        vals = {
            "partner_id": partner.id,
            "partner_shipping_id": self._ref(datos.get("entrega", partner_xmlid)).id,
            "payment_term_id": self.env.ref(datos["plazo"]).id,
            "picking_policy": datos["politica"],
            "commitment_date": datetime.combine(hoy + timedelta(days=datos["dias_entrega"]), time(23, 0)),  # 17:00 en Guatemala
            "client_order_ref": datos["ref"],
            "note": datos["nota"],
            "order_line": [(0, 0, {
                "product_id": self._ref(p).id,
                "product_uom_qty": q,
                "discount": desc,
            }) for p, q, desc in datos["lineas"]],
        }
        incoterm = self.env.ref(datos["incoterm"], raise_if_not_found=False)
        if incoterm:
            vals["incoterm"] = incoterm.id
        if oportunidad and oportunidad.stage_id.is_won:
            vals["opportunity_id"] = oportunidad.id
        order = self.env["sale.order"].create(vals)
        carrier = self._ref(datos["transportista"])
        tarifa = carrier.rate_shipment(order)
        order.set_delivery_line(carrier, tarifa.get("price", carrier.fixed_price))
        order.action_confirm()

    def _paso_entregas(self):
        for partner_xmlid in PEDIDOS:
            order = self.env["sale.order"].search(
                [("partner_id", "=", self._ref(partner_xmlid).id), ("state", "=", "sale")],
                order="id desc", limit=1)
            with self._reloj(*PEDIDOS[partner_xmlid]["dia_entrega"]):
                for picking in order.picking_ids.filtered(lambda p: p.state not in ("done", "cancel")):
                    picking.carrier_tracking_ref = "GUIA-%s" % picking.name.replace("/", "-")
                    self._validar_picking(picking)

    def _paso_facturacion(self):
        for partner_xmlid, datos in PEDIDOS.items():
            order = self.env["sale.order"].search(
                [("partner_id", "=", self._ref(partner_xmlid).id), ("state", "=", "sale")],
                order="id desc", limit=1)
            # Se factura el mismo día de la entrega
            with self._reloj(datos["dia_entrega"][0], 14, 0):
                facturas = order.invoice_ids.filtered(lambda m: m.move_type == "out_invoice")
                if not facturas:
                    facturas = order._create_invoices()
                facturas.filtered(lambda m: m.state == "draft").action_post()
                # Equivale a "Enviar e imprimir": deja la factura marcada como enviada
                facturas.write({"is_move_sent": True})
                for factura in facturas:
                    factura.message_post(body=_("Factura enviada al cliente por correo electrónico."))
            with self._reloj(*datos["dia_pago"]):
                for factura in facturas:
                    monto = factura.amount_residual * datos["porcentaje_pago"] / 100.0
                    self._pagar(factura, self._journal(datos["diario_pago"]), monto=monto, memo=factura.name)

    def _paso_postventa(self):
        # El reclamo llega al día siguiente de la entrega al supermercado
        with self._reloj(2, 16, 0):
            caso = self._reclamo_chocolates()
        with self._reloj(1, 10, 0):
            self._resolver_reclamo_chocolates(caso)
        # Consulta de hoy, abierta en el tablero
        with self._reloj(0, 9, 30):
            self._consulta_galletas()

    def _reclamo_chocolates(self):
        hoy = fields.Date.context_today(self)
        admin = self.env.ref("base.user_admin")
        Reclamo = self.env["dd.reclamo"]
        # Caso 1: producto en mal estado, resuelto con devolución y reposición
        cliente = self._ref("cliente_supermercado_delicias")
        order = self.env["sale.order"].search([("partner_id", "=", cliente.id), ("state", "=", "sale")],
                                              order="id desc", limit=1)
        chocolates = self._ref("pt_chocolates")
        caso = Reclamo.create({
            "asunto": _("Cajas de chocolates recibidas derretidas"),
            "partner_id": cliente.id,
            "sale_order_id": order.id,
            "tipo": "producto_danado",
            "canal": "correo",
            "prioridad": "2",
            "product_id": chocolates.id,
            "cantidad": 5,
            "user_id": admin.id,
            "fecha_limite": hoy + timedelta(days=3),
            "descripcion": _("<p>El jefe de compras reporta que 5 cajas de chocolates de leche llegaron "
                             "derretidas al centro de distribución. Adjunta fotografías del producto.</p>"),
        })
        caso._onchange_sale_order_id()
        caso._onchange_lote()
        caso.activity_schedule(
            "dulces_delicias.activity_seguimiento_postventa",
            summary=_("Confirmar recepción de la reposición con el cliente"),
            date_deadline=hoy + timedelta(days=2), user_id=admin.id)
        caso.stage_id = self._ref("etapa_analisis")
        caso.message_post(body=_("Se revisaron las fotografías: el empaque no tenía protección térmica."))
        return caso

    def _resolver_reclamo_chocolates(self, caso):
        caso.write({"solucion": "reposicion", "stage_id": self._ref("etapa_en_resolucion").id})
        caso.action_crear_devolucion()
        self._validar_picking(caso.devolucion_id, lote=caso.lot_id)
        caso.action_desechar()
        caso.action_crear_reposicion()
        self._validar_picking(caso.reposicion_id)
        caso.write({
            "causa_raiz": _("Transporte en horas de calor sin empaque térmico para chocolates."),
            "resolucion": _("<p>Se recogieron las 5 cajas dañadas (ubicación Producto No Conforme), se "
                            "registraron como merma y se entregaron 5 cajas nuevas sin costo. Se incorporan hieleras térmicas para "
                            "despachos de chocolate.</p>"),
            "satisfaccion": "5",
        })
        caso.action_resolver()

    def _consulta_galletas(self):
        hoy = fields.Date.context_today(self)
        admin = self.env.ref("base.user_admin")
        Reclamo = self.env["dd.reclamo"]
        cliente2 = self._ref("cliente_la_dulzura")
        order2 = self.env["sale.order"].search([("partner_id", "=", cliente2.id), ("state", "=", "sale")],
                                               order="id desc", limit=1)
        caso2 = Reclamo.create({
            "asunto": _("Consulta sobre fecha de vencimiento de galletas"),
            "partner_id": cliente2.id,
            "sale_order_id": order2.id,
            "tipo": "consulta",
            "canal": "whatsapp",
            "prioridad": "1",
            "product_id": self._ref("pt_galletas").id,
            "cantidad": 30,
            "fecha_limite": hoy + timedelta(days=1),
            "descripcion": _("<p>La cliente pregunta cuál es la vida útil de las galletas del último lote.</p>"),
        })
        caso2._onchange_sale_order_id()
        caso2.activity_schedule(
            "mail.mail_activity_data_call",
            summary=_("Llamar a la cliente para confirmar la fecha de vencimiento"),
            date_deadline=hoy + timedelta(days=1), user_id=admin.id)
