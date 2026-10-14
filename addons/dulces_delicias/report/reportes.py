from odoo import api, models


class _DdReporteBase(models.AbstractModel):
    _name = "report.dulces_delicias.base"
    _description = "Base de reportes Dulces Delicias"
    _metodo = None

    @api.model
    def _get_report_values(self, docids, data=None):
        docs = self.env["dd.reporte.wizard"].browse(docids)
        return {
            "doc_ids": docids,
            "doc_model": "dd.reporte.wizard",
            "docs": docs,
            "datos": {doc.id: getattr(doc, self._metodo)() for doc in docs},
            "company": docs[:1].company_id or self.env.company,
        }


class ReporteEstadoResultados(models.AbstractModel):
    _name = "report.dulces_delicias.report_estado_resultados"
    _inherit = "report.dulces_delicias.base"
    _description = "Estado de resultados"
    _metodo = "_datos_estado_resultados"


class ReporteInventario(models.AbstractModel):
    _name = "report.dulces_delicias.report_inventario"
    _inherit = "report.dulces_delicias.base"
    _description = "Estado del inventario"
    _metodo = "_datos_inventario"


class ReporteClientes(models.AbstractModel):
    _name = "report.dulces_delicias.report_clientes"
    _inherit = "report.dulces_delicias.base"
    _description = "Listado de clientes"
    _metodo = "_datos_clientes"


class ReporteProveedores(models.AbstractModel):
    _name = "report.dulces_delicias.report_proveedores"
    _inherit = "report.dulces_delicias.base"
    _description = "Listado de proveedores"
    _metodo = "_datos_proveedores"
