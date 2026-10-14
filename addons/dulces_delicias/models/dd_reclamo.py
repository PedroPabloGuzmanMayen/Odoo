from odoo import _, api, fields, models
from odoo.exceptions import UserError


class DdReclamoEtapa(models.Model):
    _name = "dd.reclamo.etapa"
    _description = "Etapa de caso postventa"
    _order = "sequence, id"

    name = fields.Char(required=True, translate=True)
    sequence = fields.Integer(default=10)
    fold = fields.Boolean(string="Plegada en kanban")
    es_resuelto = fields.Boolean(string="Etapa de resolución")
    es_cerrado = fields.Boolean(string="Etapa de cierre")


class DdReclamo(models.Model):
    _name = "dd.reclamo"
    _description = "Caso de atención postventa"
    _inherit = ["mail.thread", "mail.activity.mixin"]
    _order = "prioridad desc, fecha desc, id desc"

    name = fields.Char(string="Número", readonly=True, copy=False, default="/")
    asunto = fields.Char(required=True, tracking=True)
    fecha = fields.Datetime(default=fields.Datetime.now, required=True)
    tipo = fields.Selection(
        [
            ("producto_danado", "Producto en mal estado / dañado"),
            ("producto_incorrecto", "Producto incorrecto"),
            ("faltante", "Faltante en la entrega"),
            ("retraso", "Retraso en la entrega"),
            ("facturacion", "Error de facturación"),
            ("consulta", "Consulta general"),
        ],
        required=True,
        default="producto_danado",
        tracking=True,
    )
    canal = fields.Selection(
        [("telefono", "Teléfono"), ("correo", "Correo electrónico"), ("whatsapp", "WhatsApp"),
         ("visita", "Visita del vendedor"), ("portal", "Portal web")],
        default="telefono",
    )
    prioridad = fields.Selection(
        [("0", "Baja"), ("1", "Media"), ("2", "Alta"), ("3", "Urgente")], default="1", tracking=True
    )
    partner_id = fields.Many2one("res.partner", string="Cliente", required=True, tracking=True)
    sale_order_id = fields.Many2one(
        "sale.order", string="Pedido de venta",
        domain="[('partner_id', 'child_of', partner_id), ('state', '=', 'sale')]", tracking=True,
    )
    picking_id = fields.Many2one(
        "stock.picking", string="Entrega",
        domain="[('sale_id', '=', sale_order_id), ('picking_type_code', '=', 'outgoing')]",
    )
    invoice_id = fields.Many2one(
        "account.move", string="Factura",
        domain="[('move_type', '=', 'out_invoice'), ('partner_id', 'child_of', partner_id)]",
    )
    product_id = fields.Many2one("product.product", string="Producto afectado")
    lot_id = fields.Many2one("stock.lot", string="Lote", domain="[('product_id', '=', product_id)]")
    cantidad = fields.Float(string="Cantidad afectada", default=1.0)
    descripcion = fields.Html(string="Descripción del problema")
    user_id = fields.Many2one("res.users", string="Responsable", default=lambda self: self.env.user, tracking=True)
    fecha_limite = fields.Date(string="Fecha límite de respuesta", tracking=True)
    stage_id = fields.Many2one(
        "dd.reclamo.etapa", string="Etapa", tracking=True, group_expand="_read_group_stage_ids",
        default=lambda self: self.env["dd.reclamo.etapa"].search([], limit=1),
    )
    color = fields.Integer()
    kanban_state = fields.Selection(
        [("normal", "En progreso"), ("done", "Listo"), ("blocked", "Bloqueado")], default="normal"
    )

    # Resolución
    solucion = fields.Selection(
        [
            ("reposicion", "Reposición del producto"),
            ("nota_credito", "Nota de crédito"),
            ("reembolso", "Reembolso"),
            ("explicacion", "Aclaración / sin costo"),
        ],
        string="Tipo de solución",
        tracking=True,
    )
    causa_raiz = fields.Text(string="Causa raíz")
    resolucion = fields.Html(string="Detalle de la resolución")
    fecha_resolucion = fields.Datetime(string="Fecha de resolución", readonly=True)
    satisfaccion = fields.Selection(
        [("1", "Muy insatisfecho"), ("2", "Insatisfecho"), ("3", "Neutral"),
         ("4", "Satisfecho"), ("5", "Muy satisfecho")],
        string="Satisfacción del cliente",
        tracking=True,
    )
    devolucion_id = fields.Many2one("stock.picking", string="Devolución", readonly=True, copy=False)
    reposicion_id = fields.Many2one("stock.picking", string="Entrega de reposición", readonly=True, copy=False)
    nota_credito_id = fields.Many2one("account.move", string="Nota de crédito", readonly=True, copy=False)
    scrap_id = fields.Many2one("stock.scrap", string="Desecho (merma)", readonly=True, copy=False)
    devolucion_state = fields.Selection(related="devolucion_id.state", string="Estado de la devolución")
    es_resuelto = fields.Boolean(related="stage_id.es_resuelto")
    company_id = fields.Many2one("res.company", default=lambda self: self.env.company)

    @api.model
    def _read_group_stage_ids(self, stages, domain, order):
        return stages.search([], order=order)

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get("name", "/") == "/":
                vals["name"] = self.env["ir.sequence"].next_by_code("dd.reclamo") or "/"
        return super().create(vals_list)

    def write(self, vals):
        if "stage_id" in vals:
            stage = self.env["dd.reclamo.etapa"].browse(vals["stage_id"])
            if stage.es_resuelto and "fecha_resolucion" not in vals:
                vals["fecha_resolucion"] = fields.Datetime.now()
        return super().write(vals)

    @api.onchange("sale_order_id")
    def _onchange_sale_order_id(self):
        order = self.sale_order_id
        if not order:
            return
        self.partner_id = order.partner_id
        outgoing = order.picking_ids.filtered(lambda p: p.picking_type_code == "outgoing" and p.state == "done")
        self.picking_id = outgoing[:1]
        self.invoice_id = order.invoice_ids.filtered(lambda m: m.move_type == "out_invoice")[:1]

    @api.onchange("picking_id", "product_id")
    def _onchange_lote(self):
        if self.picking_id and self.product_id:
            lines = self.picking_id.move_line_ids.filtered(lambda l: l.product_id == self.product_id)
            self.lot_id = lines[:1].lot_id

    # ------------------------------------------------------------------
    # Acciones de resolución
    # ------------------------------------------------------------------
    def _check_producto(self):
        self.ensure_one()
        if not self.product_id or self.cantidad <= 0:
            raise UserError(_("Indique el producto afectado y una cantidad mayor a cero."))

    def _ubicacion_no_conforme(self):
        return self.env.ref("dulces_delicias.location_no_conforme")

    def action_crear_devolucion(self):
        """Crea la devolución del producto en mal estado hacia la ubicación de producto no conforme."""
        self.ensure_one()
        self._check_producto()
        if not self.picking_id or self.picking_id.state != "done":
            raise UserError(_("El caso debe estar vinculado a una entrega ya realizada."))
        if self.devolucion_id:
            raise UserError(_("Ya existe una devolución para este caso."))
        move = self.picking_id.move_ids.filtered(lambda m: m.product_id == self.product_id)[:1]
        if not move:
            raise UserError(_("El producto indicado no forma parte de la entrega."))
        wizard = self.env["stock.return.picking"].with_context(
            active_id=self.picking_id.id, active_model="stock.picking"
        ).create({"picking_id": self.picking_id.id})
        wizard.location_id = self._ubicacion_no_conforme()
        for line in wizard.product_return_moves:
            line.quantity = self.cantidad if line.move_id == move else 0.0
            line.to_refund = self.solucion == "nota_credito"
        new_picking_id, __ = wizard._create_returns()
        devolucion = self.env["stock.picking"].browse(new_picking_id)
        devolucion.origin = "%s / %s" % (self.name, self.picking_id.name)
        self.devolucion_id = devolucion
        self.message_post(body=_("Se creó la devolución %s.", devolucion._get_html_link()))
        return self._abrir(devolucion)

    def action_crear_reposicion(self):
        """Crea una nueva entrega sin costo con el producto de reemplazo."""
        self.ensure_one()
        self._check_producto()
        if self.reposicion_id:
            raise UserError(_("Ya existe una entrega de reposición para este caso."))
        warehouse = self.sale_order_id.warehouse_id or self.env["stock.warehouse"].search(
            [("company_id", "=", self.company_id.id)], limit=1)
        picking_type = warehouse.out_type_id
        picking = self.env["stock.picking"].create({
            "partner_id": (self.sale_order_id.partner_shipping_id or self.partner_id).id,
            "picking_type_id": picking_type.id,
            "location_id": picking_type.default_location_src_id.id,
            "location_dest_id": self.env.ref("stock.stock_location_customers").id,
            "origin": "%s (reposición)" % self.name,
            "move_ids": [(0, 0, {
                "name": self.product_id.display_name,
                "product_id": self.product_id.id,
                "product_uom_qty": self.cantidad,
                "product_uom": self.product_id.uom_id.id,
                "location_id": picking_type.default_location_src_id.id,
                "location_dest_id": self.env.ref("stock.stock_location_customers").id,
            })],
        })
        picking.action_confirm()
        picking.action_assign()
        self.reposicion_id = picking
        self.message_post(body=_("Se creó la entrega de reposición %s.", picking._get_html_link()))
        return self._abrir(picking)

    def action_crear_nota_credito(self):
        """Genera una nota de crédito (borrador) por la cantidad afectada."""
        self.ensure_one()
        self._check_producto()
        if not self.invoice_id or self.invoice_id.state != "posted":
            raise UserError(_("El caso debe estar vinculado a una factura publicada."))
        if self.nota_credito_id:
            raise UserError(_("Ya existe una nota de crédito para este caso."))
        inv_line = self.invoice_id.invoice_line_ids.filtered(lambda l: l.product_id == self.product_id)[:1]
        if not inv_line:
            raise UserError(_("El producto indicado no aparece en la factura."))
        refund = self.env["account.move"].create({
            "move_type": "out_refund",
            "partner_id": self.invoice_id.partner_id.id,
            "reversed_entry_id": self.invoice_id.id,
            "invoice_origin": self.invoice_id.name,
            "ref": _("%(caso)s - %(asunto)s", caso=self.name, asunto=self.asunto),
            "journal_id": self.invoice_id.journal_id.id,
            "invoice_line_ids": [(0, 0, {
                "product_id": self.product_id.id,
                "quantity": self.cantidad,
                "price_unit": inv_line.price_unit,
                "tax_ids": [(6, 0, inv_line.tax_ids.ids)],
            })],
        })
        self.nota_credito_id = refund
        self.message_post(body=_("Se creó la nota de crédito %s.", refund._get_html_link()))
        return self._abrir(refund)

    def action_desechar(self):
        """Envía a merma (desecho) el producto dañado que el cliente devolvió."""
        self.ensure_one()
        self._check_producto()
        if not self.devolucion_id or self.devolucion_id.state != "done":
            raise UserError(_("Primero debe validarse la devolución del producto."))
        if self.scrap_id:
            raise UserError(_("El producto de este caso ya fue desechado."))
        scrap = self.env["stock.scrap"].create({
            "product_id": self.product_id.id,
            "product_uom_id": self.product_id.uom_id.id,
            "scrap_qty": self.cantidad,
            "lot_id": self.lot_id.id,
            "location_id": self._ubicacion_no_conforme().id,
            "origin": self.name,
            "company_id": self.company_id.id,
        })
        scrap.action_validate()
        self.scrap_id = scrap
        self.message_post(body=_("Se registró la merma del producto dañado (%s).", scrap._get_html_link()))

    def action_resolver(self):
        stage = self.env["dd.reclamo.etapa"].search([("es_resuelto", "=", True)], limit=1)
        self.write({"stage_id": stage.id, "kanban_state": "done"})
        self.activity_ids.action_done()

    def action_cerrar(self):
        stage = self.env["dd.reclamo.etapa"].search([("es_cerrado", "=", True)], limit=1)
        self.write({"stage_id": stage.id})

    def _abrir(self, record):
        return {
            "type": "ir.actions.act_window",
            "res_model": record._name,
            "res_id": record.id,
            "view_mode": "form",
            "target": "current",
        }

    def action_ver_devolucion(self):
        return self._abrir(self.devolucion_id)

    def action_ver_reposicion(self):
        return self._abrir(self.reposicion_id)

    def action_ver_nota_credito(self):
        return self._abrir(self.nota_credito_id)
