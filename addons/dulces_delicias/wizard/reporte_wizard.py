from odoo import _, api, fields, models
from odoo.exceptions import UserError


class DdReporteWizard(models.TransientModel):
    _name = "dd.reporte.wizard"
    _description = "Reportes de Dulces Delicias"

    tipo = fields.Selection(
        [
            ("estado_resultados", "Estado de resultados"),
            ("inventario", "Estado del inventario"),
            ("clientes", "Listado de clientes"),
            ("proveedores", "Listado de proveedores"),
        ],
        string="Reporte",
        required=True,
        default="estado_resultados",
    )
    date_from = fields.Date(
        string="Desde", default=lambda self: fields.Date.today().replace(month=1, day=1)
    )
    date_to = fields.Date(string="Hasta", default=fields.Date.context_today)
    incluir_borradores = fields.Boolean(
        string="Incluir asientos en borrador",
        help="Por defecto sólo se consideran los asientos publicados.",
    )
    detalle_cuentas = fields.Boolean(string="Mostrar detalle por cuenta", default=True)
    location_id = fields.Many2one(
        "stock.location",
        string="Ubicación",
        domain=[("usage", "=", "internal")],
        default=lambda self: self.env["stock.warehouse"].search(
            [("company_id", "=", self.env.company.id)], limit=1).lot_stock_id,
    )
    categ_id = fields.Many2one("product.category", string="Categoría de producto")
    company_id = fields.Many2one("res.company", default=lambda self: self.env.company, required=True)

    @api.constrains("date_from", "date_to")
    def _check_fechas(self):
        for wiz in self:
            if wiz.date_from and wiz.date_to and wiz.date_from > wiz.date_to:
                raise UserError(_("La fecha inicial debe ser anterior a la fecha final."))

    def _report_xmlid(self):
        return {
            "estado_resultados": "dulces_delicias.action_report_estado_resultados",
            "inventario": "dulces_delicias.action_report_inventario",
            "clientes": "dulces_delicias.action_report_clientes",
            "proveedores": "dulces_delicias.action_report_proveedores",
        }[self.tipo]

    def action_imprimir(self):
        self.ensure_one()
        return self.env.ref(self._report_xmlid()).report_action(self)

    def action_ver(self):
        self.ensure_one()
        action = self.env.ref(self._report_xmlid()).report_action(self)
        action["report_type"] = "qweb-html"
        return action

    # ------------------------------------------------------------------
    # Estado de resultados
    # ------------------------------------------------------------------
    def _saldos_por_cuenta(self):
        self.ensure_one()
        tipos = ["income", "income_other", "expense", "expense_direct_cost", "expense_depreciation"]
        estados = ["posted", "draft"] if self.incluir_borradores else ["posted"]
        domain = [
            ("company_id", "=", self.company_id.id),
            ("parent_state", "in", estados),
            ("account_id.account_type", "in", tipos),
            ("date", ">=", self.date_from),
            ("date", "<=", self.date_to),
        ]
        grupos = self.env["account.move.line"]._read_group(domain, ["account_id"], ["balance:sum"])
        return [(account, balance) for account, balance in grupos]

    @api.model
    def _seccion_cuenta(self, account):
        code = account.code or ""
        if account.account_type == "income":
            return "ventas" if code.startswith("4.1") or not code.startswith("4.") else "otros_ingresos"
        if account.account_type == "income_other":
            return "otros_ingresos"
        if account.account_type == "expense_direct_cost":
            return "costo_ventas"
        if account.account_type == "expense_depreciation":
            return "gastos_operacion"
        # expense: los grupos 7, 8 y 9 del plan guatemalteco son gastos financieros / no operativos
        if code[:1] in ("7", "8", "9"):
            return "otros_gastos"
        if code.startswith("5"):
            return "costo_ventas"
        return "gastos_operacion"

    def _datos_estado_resultados(self):
        self.ensure_one()
        secciones = {
            key: {"titulo": titulo, "lineas": [], "total": 0.0}
            for key, titulo in [
                ("ventas", _("Ingresos por ventas")),
                ("costo_ventas", _("Costo de ventas")),
                ("gastos_operacion", _("Gastos de operación")),
                ("otros_ingresos", _("Otros ingresos")),
                ("otros_gastos", _("Otros gastos y gastos financieros")),
            ]
        }
        for account, balance in self._saldos_por_cuenta():
            key = self._seccion_cuenta(account)
            # Los ingresos tienen saldo acreedor (negativo): se presentan en positivo
            importe = -balance if key in ("ventas", "otros_ingresos") else balance
            secciones[key]["lineas"].append({"codigo": account.code, "nombre": account.name, "importe": importe})
            secciones[key]["total"] += importe
        ventas = secciones["ventas"]["total"]

        def pct(valor):
            return (valor / ventas * 100.0) if ventas else 0.0

        for sec in secciones.values():
            sec["lineas"].sort(key=lambda l: l["codigo"] or "")
            sec["pct"] = pct(sec["total"])
        utilidad_bruta = ventas - secciones["costo_ventas"]["total"]
        utilidad_operacion = utilidad_bruta - secciones["gastos_operacion"]["total"]
        utilidad_neta = (utilidad_operacion + secciones["otros_ingresos"]["total"]
                         - secciones["otros_gastos"]["total"])

        return {
            "secciones": secciones,
            "ventas": ventas,
            "utilidad_bruta": utilidad_bruta,
            "utilidad_operacion": utilidad_operacion,
            "utilidad_neta": utilidad_neta,
            "margen_bruto": pct(utilidad_bruta),
            "margen_operacion": pct(utilidad_operacion),
            "margen_neto": pct(utilidad_neta),
        }

    # ------------------------------------------------------------------
    # Inventario
    # ------------------------------------------------------------------
    def _datos_inventario(self):
        self.ensure_one()
        domain = [("type", "=", "product"), ("company_id", "in", [False, self.company_id.id])]
        if self.categ_id:
            domain.append(("categ_id", "child_of", self.categ_id.id))
        productos = self.env["product.product"].search(domain, order="categ_id, default_code, name")
        location = self.location_id
        orderpoints = self.env["stock.warehouse.orderpoint"].search([
            ("product_id", "in", productos.ids), ("company_id", "=", self.company_id.id)])
        categorias = {}
        total_valor = 0.0
        for producto in productos:
            ctx_product = producto.with_context(location=location.id) if location else producto
            disponible = ctx_product.qty_available
            entrante = ctx_product.incoming_qty
            saliente = ctx_product.outgoing_qty
            op = orderpoints.filtered(lambda o: o.product_id == producto)[:1]
            minimo = op.product_min_qty if op else 0.0
            maximo = op.product_max_qty if op else 0.0
            if not op:
                estado = "sin_regla"
            elif disponible < minimo:
                estado = "bajo"
            elif maximo and disponible > maximo:
                estado = "exceso"
            else:
                estado = "ok"
            valor = disponible * producto.standard_price
            total_valor += valor
            categorias.setdefault(producto.categ_id.display_name, []).append({
                "codigo": producto.default_code or "",
                "nombre": producto.name,
                "uom": producto.uom_id.name,
                "disponible": disponible,
                "entrante": entrante,
                "saliente": saliente,
                "minimo": minimo,
                "maximo": maximo,
                "estado": estado,
                "costo": producto.standard_price,
                "valor": valor,
            })
        detalle_ubicaciones = []
        if location:
            quants = self.env["stock.quant"].search([
                ("location_id", "child_of", location.id), ("product_id", "in", productos.ids),
                ("quantity", "!=", 0)], order="location_id, product_id")
            for quant in quants:
                detalle_ubicaciones.append({
                    "ubicacion": quant.location_id.complete_name,
                    "producto": quant.product_id.display_name,
                    "lote": quant.lot_id.name or "",
                    "cantidad": quant.quantity,
                    "uom": quant.product_uom_id.name,
                })
        return {"categorias": categorias, "total_valor": total_valor, "ubicaciones": detalle_ubicaciones}

    # ------------------------------------------------------------------
    # Clientes y proveedores
    # ------------------------------------------------------------------
    def _datos_clientes(self):
        partners = self.env["res.partner"].search(
            [("customer_rank", ">", 0), ("is_company", "=", True)], order="name")
        tipos = dict(self.env["res.partner"]._fields["dd_tipo_cliente"].selection)
        filas = []
        for p in partners:
            contacto = p.child_ids.filtered(lambda c: c.type == "contact")[:1]
            pedidos = self.env["sale.order"].search_count(
                [("partner_id", "child_of", p.id), ("state", "=", "sale")])
            facturado = sum(self.env["account.move"].search([
                ("partner_id", "child_of", p.id), ("state", "=", "posted"),
                ("move_type", "in", ("out_invoice", "out_refund"))]).mapped("amount_total_signed"))
            filas.append({
                "nombre": p.name,
                "tipo": tipos.get(p.dd_tipo_cliente, ""),
                "nit": p.vat or "",
                "contacto": contacto.name or "",
                "telefono": p.phone or p.mobile or "",
                "email": p.email or "",
                "ciudad": p.city or "",
                "plazo": p.property_payment_term_id.name or "",
                "pedidos": pedidos,
                "facturado": facturado,
                "preferidos": ", ".join(p.dd_productos_preferidos_ids.mapped(lambda x: x.default_code or x.name)),
            })
        return filas

    def _datos_proveedores(self):
        partners = self.env["res.partner"].search(
            [("supplier_rank", ">", 0), ("is_company", "=", True)], order="name")
        filas = []
        for p in partners:
            productos = self.env["product.supplierinfo"].search([("partner_id", "=", p.id)]).mapped(
                "product_tmpl_id.name")
            compras = self.env["purchase.order"].search([
                ("partner_id", "child_of", p.id), ("state", "in", ("purchase", "done"))])
            filas.append({
                "nombre": p.name,
                "nit": p.vat or "",
                "telefono": p.phone or "",
                "email": p.email or "",
                "ciudad": p.city or "",
                "plazo": p.property_supplier_payment_term_id.name or "",
                "productos": ", ".join(productos),
                "ordenes": len(compras),
                "comprado": sum(compras.mapped("amount_total")),
            })
        return filas
