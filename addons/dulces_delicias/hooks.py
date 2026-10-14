"""Configuración inicial que depende de la compañía (no se puede expresar sólo con XML)."""
import base64

from odoo.tools import file_open


def post_init_hook(env):
    company = env.ref("base.main_company")
    _configurar_compania(env, company)
    _cargar_plan_contable(env, company)
    _moneda_precios_proveedor(env, company)
    _configurar_ajustes(env, company)
    _configurar_contabilidad(env, company)
    _configurar_almacen(env, company)
    _configurar_crm(env)


def _cargar_plan_contable(env, company):
    """En una base de datos nueva Odoo carga el plan contable al final de la instalación,
    después de este hook. Se carga aquí para poder configurar cuentas, diarios y valoración."""
    if company.chart_template:
        return
    env["account.chart.template"].try_loading("gt", company, install_demo=False)
    if hasattr(env.registry, "_auto_install_template"):
        del env.registry._auto_install_template


def _moneda_precios_proveedor(env, company):
    """Los precios de proveedor se crean al cargar los datos XML, cuando la compañía aún tiene
    la moneda por defecto (USD). El plan contable la cambia a GTQ, así que se actualizan para
    que las compras y las facturas de proveedor salgan en quetzales."""
    env["product.supplierinfo"].search([
        ("company_id", "in", (company.id, False)),
        ("currency_id", "!=", company.currency_id.id),
    ]).write({"currency_id": company.currency_id.id})


def _configurar_compania(env, company):
    company.write({
        "name": "Dulces Delicias S.A.",
        "street": "Calzada Roosevelt 22-43, zona 11",
        "city": "Guatemala",
        "zip": "01011",
        "country_id": env.ref("base.gt").id,
        "state_id": env.ref("base.state_gt_gua", raise_if_not_found=False).id or False,
        "phone": "+502 2440 1000",
        "email": "info@dulcesdelicias.com.gt",
        "website": "https://www.dulcesdelicias.com.gt",
        "vat": "1234567-8",
        "company_registry": "Registro Mercantil 123456",
    })
    with file_open("dulces_delicias/static/description/icon.png", "rb") as f:
        company.logo = base64.b64encode(f.read())
    company.write({
        "external_report_layout_id": env.ref("web.external_layout_standard").id,
        "paperformat_id": env.ref("base.paperformat_us").id,
        "primary_color": "#d6336c",
        "secondary_color": "#6c3483",
        "report_footer": "Dulces Delicias S.A. - Dulces artesanales hechos en Guatemala",
    })
    company.partner_id.write({"is_company": True})
    # Idioma y zona horaria del administrador
    if env["res.lang"]._lang_get("es_419"):
        env.ref("base.user_admin").write({"lang": "es_419", "tz": "America/Guatemala"})
        env["res.partner"].search([("country_id.code", "=", "GT")]).write({"lang": "es_419"})
    env.ref("base.user_admin").partner_id.write({"name": "Administrador Dulces Delicias"})


def _configurar_ajustes(env, company):
    settings = env["res.config.settings"].with_company(company).create({
        "group_uom": True,                    # unidades de medida (kg, L, unidades)
        "group_stock_multi_locations": True,  # ubicaciones de almacén
        "group_stock_adv_location": True,     # rutas de varios pasos (producto en proceso)
        "group_stock_production_lot": True,        # lotes de producción
        "group_mrp_routings": True,           # órdenes de trabajo
        "group_sale_delivery_address": True,  # dirección de entrega distinta
        "group_discount_per_so_line": True,   # descuentos por línea (mayoristas)
        "module_delivery": True,
    })
    settings.execute()


def _configurar_contabilidad(env, company):
    Account = env["account.account"]
    # La cuenta de costo de ventas del plan guatemalteco se clasifica como costo directo
    # para que el estado de resultados muestre la utilidad bruta.
    costo = Account.search([("code", "=", "5.1.01.01"), ("company_id", "=", company.id)], limit=1)
    if costo:
        costo.account_type = "expense_direct_cost"

    Journal = env["account.journal"]
    banco = Journal.search([("type", "=", "bank"), ("company_id", "=", company.id)], limit=1)
    if banco:
        banco.name = "Banco - Transferencia bancaria"
        banco.inbound_payment_method_line_ids[:1].name = "Transferencia bancaria"
        banco.outbound_payment_method_line_ids[:1].name = "Transferencia bancaria"
    if not Journal.search([("code", "=", "TARJ"), ("company_id", "=", company.id)]):
        tarjeta = Journal.create({
            "name": "Tarjeta de crédito",
            "code": "TARJ",
            "type": "bank",
            "company_id": company.id,
        })
        tarjeta.inbound_payment_method_line_ids[:1].name = "Tarjeta de crédito (POS bancario)"
    if not Journal.search([("code", "=", "PCE"), ("company_id", "=", company.id)]):
        contra = Journal.create({
            "name": "Pago contra entrega",
            "code": "PCE",
            "type": "cash",
            "company_id": company.id,
        })
        contra.inbound_payment_method_line_ids[:1].name = "Efectivo contra entrega"
    efectivo = Journal.search([("code", "=", "CSH1"), ("company_id", "=", company.id)], limit=1)
    if efectivo:
        efectivo.name = "Caja general"

    # IVA por defecto en los productos del caso (pueden haberse creado antes que el plan contable)
    productos = env["product.template"].search([("categ_id", "child_of", env.ref("dulces_delicias.categ_dulces_delicias").id)])
    for producto in productos:
        if not producto.taxes_id and company.account_sale_tax_id:
            producto.taxes_id = company.account_sale_tax_id
        if not producto.supplier_taxes_id and company.account_purchase_tax_id:
            producto.supplier_taxes_id = company.account_purchase_tax_id

    # Cuentas de inventario (el plan contable guatemalteco no las incluye)
    def cuenta(code, name, account_type, reconcile=False):
        acc = Account.search([("code", "=", code), ("company_id", "=", company.id)], limit=1)
        if not acc:
            acc = Account.create({
                "code": code, "name": name, "account_type": account_type,
                "reconcile": reconcile, "company_id": company.id,
            })
        return acc

    inv_mp = cuenta("1.1.04.01", "Inventario de materias primas", "asset_current")
    inv_wip = cuenta("1.1.04.02", "Inventario de productos en proceso", "asset_current")
    inv_pt = cuenta("1.1.04.03", "Inventario de productos terminados", "asset_current")
    recibido = cuenta("1.1.04.04", "Mercadería recibida pendiente de facturar", "asset_current", True)
    entregado = cuenta("1.1.04.05", "Mercadería entregada pendiente de facturar", "asset_current", True)
    saldo_inicial = cuenta("3.1.01.04", "Saldo inicial de inventarios", "equity")
    mermas = cuenta("5.1.01.02", "Mermas y producto dañado", "expense_direct_cost")

    # Valoración perpetua: el costo de ventas se reconoce al facturar lo entregado
    company.anglo_saxon_accounting = True
    Location = env["stock.location"]
    dominio = [("company_id", "in", [company.id, False])]
    Location.search(dominio + [("usage", "=", "production")]).write({
        "valuation_in_account_id": inv_wip.id, "valuation_out_account_id": inv_wip.id})
    Location.search(dominio + [("usage", "=", "inventory"), ("scrap_location", "=", False)]).write({
        "valuation_in_account_id": saldo_inicial.id, "valuation_out_account_id": saldo_inicial.id})
    Location.search(dominio + [("scrap_location", "=", True)]).write({
        "valuation_in_account_id": mermas.id, "valuation_out_account_id": mermas.id})

    # Cuentas contables de las categorías de producto
    ingreso = Account.search([("code", "=", "4.1.01.01"), ("company_id", "=", company.id)], limit=1)
    gasto_adm = Account.search([("code", "=", "6.2.01.01"), ("company_id", "=", company.id)], limit=1)
    gasto_venta = Account.search([("code", "=", "6.1.01.01"), ("company_id", "=", company.id)], limit=1)
    stock_journal = Journal.search([("code", "=", "STJ"), ("company_id", "=", company.id)], limit=1)
    categorias = {
        "dulces_delicias.categ_materias_primas": (ingreso, costo, inv_mp),
        "dulces_delicias.categ_productos_terminados": (ingreso, costo, inv_pt),
        "dulces_delicias.categ_servicios": (ingreso, gasto_adm, None),
        "dulces_delicias.categ_logistica": (ingreso, gasto_venta, None),
    }
    for xmlid, (cta_ingreso, cta_gasto, cta_inventario) in categorias.items():
        categ = env.ref(xmlid).with_company(company)
        vals = {
            "property_account_income_categ_id": cta_ingreso.id,
            "property_account_expense_categ_id": cta_gasto.id,
        }
        if cta_inventario:
            vals.update({
                "property_cost_method": "average",
                "property_valuation": "real_time",
                "property_stock_valuation_account_id": cta_inventario.id,
                "property_stock_account_input_categ_id": recibido.id,
                "property_stock_account_output_categ_id": entregado.id,
                "property_stock_journal": stock_journal.id,
            })
        categ.write(vals)


def _configurar_almacen(env, company):
    warehouse = env.ref("stock.warehouse0")
    warehouse.write({
        "name": "Planta Dulces Delicias",
        "code": "DD",
        "partner_id": company.partner_id.id,
        # Dos pasos: materias primas -> productos en proceso -> fabricación
        "manufacture_steps": "pbm",
    })
    # Las secuencias se crearon con el código anterior (WH): se ajustan al nuevo (DD)
    for picking_type in env["stock.picking.type"].search([("warehouse_id", "=", warehouse.id)]):
        seq = picking_type.sequence_id
        if seq.prefix and seq.prefix.startswith("WH/"):
            seq.prefix = "DD/" + seq.prefix[3:]
    mp = env.ref("dulces_delicias.location_materias_primas")
    pt = env.ref("dulces_delicias.location_productos_terminados")
    wip = warehouse.pbm_loc_id
    wip.write({"name": "Productos en Proceso", "barcode": "DD-WIP"})

    # Tipos de operación: cada uno usa el almacén (ubicación) que le corresponde
    warehouse.in_type_id.write({"default_location_dest_id": mp.id})
    warehouse.pbm_type_id.write({
        "name": "Traslado a producción (materias primas)",
        "default_location_src_id": mp.id,
        "default_location_dest_id": wip.id,
    })
    warehouse.manu_type_id.write({
        "default_location_src_id": wip.id,
        "default_location_dest_id": pt.id,
    })
    warehouse.out_type_id.write({"default_location_src_id": pt.id})

    # Las reglas de abastecimiento toman las materias primas del almacén de MP
    rules = env["stock.rule"].search([
        ("warehouse_id", "=", warehouse.id),
        ("picking_type_id", "=", warehouse.pbm_type_id.id),
    ])
    rules.write({"location_src_id": mp.id})
    out_rules = env["stock.rule"].search([
        ("warehouse_id", "=", warehouse.id),
        ("picking_type_id", "=", warehouse.out_type_id.id),
    ])
    out_rules.write({"location_src_id": pt.id})
    manu_rules = env["stock.rule"].search([
        ("warehouse_id", "=", warehouse.id),
        ("picking_type_id", "=", warehouse.manu_type_id.id),
        ("action", "=", "manufacture"),
    ])
    manu_rules.write({"location_dest_id": pt.id})

    # Reglas de reabastecimiento (stock mínimo / máximo) de las materias primas
    niveles = {
        "dulces_delicias.mp_azucar": (100, 400),
        "dulces_delicias.mp_colorante": (1, 5),
        "dulces_delicias.mp_saborizante": (2, 8),
        "dulces_delicias.mp_cacao": (10, 40),
        "dulces_delicias.mp_leche": (8, 30),
        "dulces_delicias.mp_harina": (25, 100),
        "dulces_delicias.mp_mantequilla": (10, 40),
        "dulces_delicias.mp_huevos": (60, 360),
        "dulces_delicias.mp_bolsa_caramelos": (100, 1000),
        "dulces_delicias.mp_caja_bombones": (50, 500),
        "dulces_delicias.mp_bolsa_galletas": (100, 1000),
    }
    Orderpoint = env["stock.warehouse.orderpoint"]
    buy_route = env.ref("purchase_stock.route_warehouse0_buy")
    for xmlid, (minimo, maximo) in niveles.items():
        product = env.ref(xmlid)
        if Orderpoint.search([("product_id", "=", product.id), ("location_id", "=", mp.id)]):
            continue
        Orderpoint.create({
            "name": "MIN/MAX %s" % product.default_code,
            "product_id": product.id,
            "warehouse_id": warehouse.id,
            "location_id": mp.id,
            "product_min_qty": minimo,
            "product_max_qty": maximo,
            "trigger": "auto",
            "route_id": buy_route.id,
        })


def _configurar_crm(env):
    # Etapas del ciclo de ventas solicitadas: prospecto, negociación, cierre
    etapas = [
        ("crm.stage_lead1", "Prospecto", 1),
        ("crm.stage_lead2", "Calificado", 2),
        ("crm.stage_lead3", "Negociación", 3),
        ("crm.stage_lead4", "Cierre (ganado)", 70),
    ]
    for xmlid, nombre, seq in etapas:
        stage = env.ref(xmlid, raise_if_not_found=False)
        if stage:
            stage.sequence = seq
            stage.update_field_translations("name", {"en_US": nombre, "es_419": nombre})
    team = env.ref("sales_team.team_sales_department", raise_if_not_found=False)
    if team:
        team.update_field_translations("name", {"en_US": "Ventas Dulces Delicias", "es_419": "Ventas Dulces Delicias"})
