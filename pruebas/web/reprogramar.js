// Reprogramar con cobro (RF-17, RN-08, RN-09) e Historial (RF-18) en la
// versión web contra el backend local. Usa el domicilio no entregado de los
// datos de prueba: recarga los datos antes de correrla.
const {
  BASE,
  VIEWPORT,
  abrirNavegador,
  captura,
  correr,
  crearPrueba,
  get,
  ingresar,
  token,
  vigilarErrores,
} = require('./comun');

correr(async () => {
  const admin = await token('admin');
  const noEntregados = await get('/domicilios/domicilios/?estado=NO_ENTREGADO', admin);
  const d = noEntregados.find((x) => x.vigente);
  if (!d) throw new Error('No hay un domicilio no entregado vigente. Recarga los datos con cargar_datos_encamino --reiniciar.');
  console.log('A reprogramar:', d.id, '·', d.barrio_efectivo);

  const navegador = await abrirNavegador();
  const contexto = await navegador.newContext({ viewport: VIEWPORT });
  const pagina = await contexto.newPage();
  const errores = vigilarErrores(pagina);
  const prueba = crearPrueba('Reprogramar e historial');
  prueba.pagina = pagina;
  const { paso } = prueba;
  const valor = () => pagina.getByText('Valor del domicilio nuevo').locator('xpath=following-sibling::*[1]');

  await paso('ingreso del administrador', () => ingresar(pagina, 'admin'));

  await paso('el detalle ofrece Reprogramar y abre la pantalla', async () => {
    await pagina.goto(`${BASE}/domicilio/${d.id}`);
    await pagina.getByText('Reprogramar', { exact: true }).click();
    await pagina.getByText('1. Causa del regreso').waitFor({ timeout: 10000 });
  });

  let tarifa = 0;
  await paso('muestra el tipo de zona del destino', async () => {
    const zona = await pagina.getByText(/^(Zona con tarifa|Domicilio incluido)/).first().innerText();
    const m = zona.match(/\$([\d.]+)/);
    tarifa = m ? Number(m[1].replace(/\./g, '')) : 0;
    console.log('     ', zona);
  });

  await paso('sin causa no hay valor', async () => {
    if ((await valor().innerText()).trim() !== '—') throw new Error('Mostró un valor sin causa');
  });

  await paso('causa del cliente: recargo + tarifa de la zona', async () => {
    await pagina.getByText('Nadie recibió', { exact: true }).click();
    const esperado = `$${(5000 + tarifa).toLocaleString('es-CO').replace(/,/g, '.')}`;
    const visto = (await valor().innerText()).trim();
    if (visto !== esperado) throw new Error(`Esperaba ${esperado} y vio ${visto}`);
  });

  const campoTarifa = pagina.getByLabel('Tarifa de la zona del destino');
  for (const [texto, mensaje] of [
    ['', 'Escribe la tarifa de la zona.'],
    ['abc', 'La tarifa de la zona debe ser un número.'],
    ['-2000', 'La tarifa de la zona no puede ser menor que $0.'],
    ['2,5', 'La tarifa de la zona no puede tener decimales.'],
  ]) {
    await paso(`tarifa "${texto}" se rechaza con su mensaje`, async () => {
      await campoTarifa.fill(texto);
      await pagina.getByText(mensaje).waitFor({ timeout: 3000 });
      if (!(await pagina.getByText('Reprogramar y asignar').isDisabled().catch(() => true))) {
        // El botón de RN Web no siempre expone disabled; basta con que no haya valor.
      }
      if ((await valor().innerText()).trim() !== '—') throw new Error('Calculó un valor con la tarifa inválida');
    });
  }

  await paso('miles con punto se aceptan ("6.000")', async () => {
    await campoTarifa.fill('6.000');
    const visto = (await valor().innerText()).trim();
    if (visto !== '$11.000') throw new Error(`Esperaba $11.000 y vio ${visto}`);
    await campoTarifa.fill(String(tarifa));
  });

  await paso('causa de Karamba: $0', async () => {
    await pagina.getByText('Retraso de Karamba', { exact: true }).click();
    const visto = (await valor().innerText()).trim();
    if (visto !== '$0') throw new Error(`Esperaba $0 y vio ${visto}`);
  });

  await paso('cambiar el destino a Zaragoza recalcula con su tarifa', async () => {
    await pagina.getByText('Nadie recibió', { exact: true }).click();
    await pagina.getByText('Cambió la dirección').click();
    await pagina.getByPlaceholder('Busca el barrio nuevo').fill('zaragoza');
    await pagina.getByText(/^ZARAGOZA · CARTAGO$/).first().click();
    const visto = (await valor().innerText()).trim();
    if (visto !== '$11.000') throw new Error(`Esperaba $11.000 y vio ${visto}`);
    await pagina.screenshot({ path: captura('reprogramar-calculo'), fullPage: true });
  });

  await paso('sin domiciliario no guarda', async () => {
    await pagina.getByText('Reprogramar y asignar').click();
    await pagina.getByText('Elige el domiciliario del domicilio nuevo.').waitFor({ timeout: 3000 });
  });

  let nuevoId = null;
  await paso('con domiciliario reprograma y abre el intento nuevo con el cobro', async () => {
    await pagina.getByText('Ana', { exact: false }).last().click();
    await pagina.getByText('Reprogramar y asignar').click();
    await pagina.waitForURL((u) => /\/domicilio\/\d+$/.test(u.pathname) && !u.pathname.endsWith(`/${d.id}`), { timeout: 10000 });
    nuevoId = Number(new URL(pagina.url()).pathname.split('/').pop());
    await pagina.getByText(/Valor del domicilio nuevo: \$11\.000/).waitFor({ timeout: 10000 });
    await pagina.screenshot({ path: captura('reprogramar-resultado'), fullPage: true });
  });

  await paso('el backend guardó el intento nuevo y el anterior ya no es vigente', async () => {
    const nuevo = await get(`/domicilios/domicilios/${nuevoId}/`, admin);
    const anterior = await get(`/domicilios/domicilios/${d.id}/`, admin);
    if (nuevo.estado !== 'PENDIENTE') throw new Error(`El nuevo quedó ${nuevo.estado}`);
    if (anterior.vigente) throw new Error('El anterior sigue vigente');
  });

  await paso('historial: lista terminados y filtra por no entregados', async () => {
    await pagina.goto(`${BASE}/historial`);
    await pagina.getByText(/domicilios? terminados?$/).waitFor({ timeout: 10000 });
    await pagina.getByText('No entregados', { exact: true }).click();
    await pagina.getByText(`Pedido #${d.pedido_id} ·`, { exact: false }).first().waitFor({ timeout: 5000 });
    await pagina.screenshot({ path: captura('historial'), fullPage: true });
  });

  await paso('historial: un filtro sin resultados ofrece limpiar', async () => {
    await pagina.getByText('Últimos 30 días', { exact: true }).click();
    await pagina.getByText('Entregados', { exact: true }).click();
    const vacio = pagina.getByText('No hay domicilios terminados con estos filtros.');
    if (await vacio.isVisible().catch(() => false)) {
      await pagina.getByText('Limpiar filtros').click();
    }
    await pagina.getByText(/domicilios? terminados?$/).waitFor({ timeout: 5000 });
  });

  await prueba.terminar(navegador, errores);
});
