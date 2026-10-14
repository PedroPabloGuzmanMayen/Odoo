# Ejecuta la simulación completa del caso de estudio desde "odoo shell".
#   docker compose run --rm -T odoo odoo shell -d dulces_delicias --no-http < scripts/simular.py
for linea in env["dd.simulacion"].ejecutar():
    print(linea)
env.cr.commit()
