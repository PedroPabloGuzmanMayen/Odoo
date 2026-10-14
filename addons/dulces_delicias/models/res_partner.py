from odoo import api, fields, models


class ResPartner(models.Model):
    _inherit = "res.partner"

    dd_tipo_cliente = fields.Selection(
        [
            ("confiteria", "Confitería / Minorista"),
            ("supermercado", "Supermercado / Cadena"),
            ("distribuidor", "Distribuidor / Mayorista"),
            ("otro", "Otro"),
        ],
        string="Tipo de cliente",
    )
    dd_productos_preferidos_ids = fields.Many2many(
        "product.product",
        "dd_partner_producto_preferido_rel",
        "partner_id",
        "product_id",
        string="Productos preferidos",
        domain=[("sale_ok", "=", True)],
    )
    dd_preferencias = fields.Text(string="Preferencias y observaciones")
    dd_frecuencia_compra = fields.Selection(
        [
            ("semanal", "Semanal"),
            ("quincenal", "Quincenal"),
            ("mensual", "Mensual"),
            ("ocasional", "Ocasional"),
        ],
        string="Frecuencia de compra",
    )
    dd_total_vendido = fields.Monetary(
        string="Total comprado (pedidos confirmados)",
        compute="_compute_dd_total_vendido",
        currency_field="currency_id",
    )
    dd_reclamo_count = fields.Integer(compute="_compute_dd_reclamo_count", string="Casos postventa")

    @api.depends("sale_order_ids.state", "sale_order_ids.amount_total")
    def _compute_dd_total_vendido(self):
        for partner in self:
            orders = self.env["sale.order"].search(
                [("partner_id", "child_of", partner.commercial_partner_id.id), ("state", "=", "sale")]
            )
            partner.dd_total_vendido = sum(orders.mapped("amount_total"))

    def _compute_dd_reclamo_count(self):
        for partner in self:
            partner.dd_reclamo_count = self.env["dd.reclamo"].search_count(
                [("partner_id", "child_of", partner.commercial_partner_id.id)]
            )

    def action_view_dd_reclamos(self):
        self.ensure_one()
        action = self.env["ir.actions.act_window"]._for_xml_id("dulces_delicias.action_dd_reclamo")
        action["domain"] = [("partner_id", "child_of", self.commercial_partner_id.id)]
        action["context"] = {"default_partner_id": self.id}
        return action
