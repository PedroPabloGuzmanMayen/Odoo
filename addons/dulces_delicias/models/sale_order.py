from odoo import fields, models


class SaleOrder(models.Model):
    _inherit = "sale.order"

    dd_reclamo_ids = fields.One2many("dd.reclamo", "sale_order_id", string="Casos postventa")
    dd_reclamo_count = fields.Integer(compute="_compute_dd_reclamo_count")

    def _compute_dd_reclamo_count(self):
        for order in self:
            order.dd_reclamo_count = len(order.dd_reclamo_ids)

    def action_view_dd_reclamos(self):
        self.ensure_one()
        action = self.env["ir.actions.act_window"]._for_xml_id("dulces_delicias.action_dd_reclamo")
        action["domain"] = [("sale_order_id", "=", self.id)]
        action["context"] = {"default_sale_order_id": self.id, "default_partner_id": self.partner_id.id}
        return action
