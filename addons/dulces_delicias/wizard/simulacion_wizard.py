from odoo import fields, models

from ..models.dd_simulacion import PASOS


class DdSimulacionWizard(models.TransientModel):
    _name = "dd.simulacion.wizard"
    _description = "Asistente de simulación del caso de estudio"

    paso_inventario = fields.Boolean(string=dict(PASOS)["inventario"], default=True)
    paso_compras = fields.Boolean(string=dict(PASOS)["compras"], default=True)
    paso_produccion = fields.Boolean(string=dict(PASOS)["produccion"], default=True)
    paso_crm = fields.Boolean(string=dict(PASOS)["crm"], default=True)
    paso_ventas = fields.Boolean(string=dict(PASOS)["ventas"], default=True)
    paso_entregas = fields.Boolean(string=dict(PASOS)["entregas"], default=True)
    paso_facturacion = fields.Boolean(string=dict(PASOS)["facturacion"], default=True)
    paso_postventa = fields.Boolean(string=dict(PASOS)["postventa"], default=True)
    resultado = fields.Text(readonly=True)

    def action_ejecutar(self):
        self.ensure_one()
        pasos = [p for p, __ in PASOS if self["paso_%s" % p]]
        resultados = self.env["dd.simulacion"].ejecutar(pasos)
        self.resultado = "\n".join(resultados)
        return {
            "type": "ir.actions.act_window",
            "res_model": self._name,
            "res_id": self.id,
            "view_mode": "form",
            "target": "new",
        }
