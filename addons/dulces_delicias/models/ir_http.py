from odoo import models


class IrHttp(models.AbstractModel):
    _inherit = "ir.http"

    def session_info(self):
        # Odoo activa los recorridos guiados cuando la base no tiene datos de demostración.
        # Su puntero morado tapa campos en la demostración en vivo y en las capturas.
        result = super().session_info()
        result["tour_disable"] = True
        return result
