// Confirmar entrega y reportar no entrega (B-05, B-06, RF-13, RF-14) en la
// versión web contra el backend local. Inicia por la API dos domicilios
// pendientes de Juan para tenerlos en camino.
const {
  BASE,
  FOTO,
  VIEWPORT,
  abrirNavegador,
  captura,
  cerrarSesion,
  correr,
  crearPrueba,
  get,
  ingresar,
  llamar,
  pendientesDeJuan,
  token,
  vigilarErrores,
} = require('./comun');

correr(async () => {
  const juan = await token('juan');
  const [aEntregar, aNoEntregar] = await pendientesDeJuan(juan, 2);
  for (const d of [aEntregar, aNoEntregar]) await llamar('POST', `/domicilios/domicilios/${d.id}/iniciar/`, juan);
  console.log('A entregar:', aEntregar.id, '· a no entregar:', aNoEntregar.id);

  const navegador = await abrirNavegador();
  const contexto = await navegador.newContext({ viewport: VIEWPORT });
  const pagina = await contexto.newPage();
  const errores = vigilarErrores(pagina);
  const prueba = crearPrueba('Entrega y no entrega');
  prueba.pagina = pagina;
  const { paso } = prueba;

  await paso('ingreso de Juan', () => ingresar(pagina, 'juan'));

  // ── Confirmar entrega ──────────────────────────────────────────────────────
  await paso('entregar: abre desde el detalle con quien recibe ya escrito', async () => {
    await pagina.goto(`${BASE}/domicilio/${aEntregar.id}`);
    await pagina.getByText('Confirmar entrega').click();
    await pagina.getByText('Se entrega completo').waitFor({ timeout: 10000 });
    const valor = await pagina.getByLabel('Quién recibió').inputValue();
    if (valor !== aEntregar.pedido_quien_recibe) throw new Error('no precargó: ' + valor);
    await pagina.screenshot({ path: captura('20-entregar') });
  });

  await paso('entregar: sin nombre muestra el error del campo', async () => {
    await pagina.getByLabel('Quién recibió').fill('');
    await pagina.getByRole('button', { name: 'Confirmar entrega' }).click();
    await pagina.getByText('Escribe el nombre de quien recibió el pedido.').waitFor({ timeout: 5000 });
  });

  await paso('entregar: sin conexión no confirma y conserva lo escrito', async () => {
    await pagina.getByLabel('Quién recibió').fill('Vecina del 2do piso');
    await contexto.setOffline(true);
    try {
      await pagina.getByRole('button', { name: 'Confirmar entrega' }).click();
      await pagina.getByText(/Sin conexión: la entrega no se registró/).waitFor({ timeout: 20000 });
      const valor = await pagina.getByLabel('Quién recibió').inputValue();
      if (valor !== 'Vecina del 2do piso') throw new Error('perdió el dato: ' + valor);
    } finally {
      await contexto.setOffline(false);
    }
    await pagina.waitForTimeout(2000);
    const r = await get(`/domicilios/domicilios/${aEntregar.id}/`, juan);
    if (r.estado !== 'EN_CAMINO') throw new Error('backend: ' + r.estado);
  });

  await paso('entregar: con conexión vuelve al detalle entregado', async () => {
    await pagina.getByRole('button', { name: 'Confirmar entrega' }).click();
    await pagina.getByText('Entregado', { exact: true }).first().waitFor({ timeout: 10000 });
    await pagina.getByText(/Vecina del 2do piso/).waitFor({ timeout: 5000 });
    if (await pagina.getByText('Reportar no entrega').count()) throw new Error('acciones visibles tras entregar');
    await pagina.screenshot({ path: captura('21-entregado') });
  });

  await paso('entregar: la ruta de un domicilio ya reportado no deja repetir', async () => {
    await pagina.goto(`${BASE}/domicilio/${aEntregar.id}/entregar`);
    await pagina.getByText('Este domicilio ya fue reportado.').waitFor({ timeout: 10000 });
  });

  // ── Reportar no entrega ───────────────────────────────────────────────────
  await paso('no entrega: primero el protocolo de contacto', async () => {
    await pagina.goto(`${BASE}/domicilio/${aNoEntregar.id}`);
    await pagina.getByText('Reportar no entrega').click();
    await pagina.getByText('Antes de reportar').waitFor({ timeout: 10000 });
    await pagina.getByText(/^Llama a quien recibe/).waitFor({ timeout: 5000 });
    await pagina.screenshot({ path: captura('22-protocolo') });
    await pagina.getByText('Ya seguí el protocolo').click();
  });

  await paso('no entrega: sin motivo ni foto muestra un error por campo', async () => {
    await pagina.getByRole('button', { name: 'Reportar no entrega' }).click();
    await pagina.getByText('Escribe el motivo de la no entrega.').waitFor({ timeout: 5000 });
    await pagina.getByText('Toma una foto de evidencia.').waitFor({ timeout: 5000 });
  });

  await paso('no entrega: la foto simulada se identifica en pantalla', async () => {
    await pagina.getByText(/^Simulado · la foto no se sube/).waitFor({ timeout: 10000 });
  });

  await paso('no entrega: motivo frecuente y foto', async () => {
    await pagina.getByText('Nadie atendió', { exact: true }).click();
    const [selector] = await Promise.all([
      pagina.waitForEvent('filechooser', { timeout: 10000 }),
      pagina.getByText('Tomar foto', { exact: true }).click(),
    ]);
    await selector.setFiles(FOTO);
    await pagina.getByRole('img', { name: 'Foto de evidencia tomada' }).waitFor({ timeout: 10000 });
    if (await pagina.getByText('Escribe el motivo de la no entrega.').count()) throw new Error('sigue el error de motivo');
    await pagina.screenshot({ path: captura('23-no-entrega-formulario') });
  });

  await paso('no entrega: sin conexión no confirma y conserva lo escrito', async () => {
    await contexto.setOffline(true);
    try {
      await pagina.getByRole('button', { name: 'Reportar no entrega' }).click();
      await pagina.getByText(/Sin conexión: la no entrega no se registró/).waitFor({ timeout: 20000 });
      await pagina.getByRole('img', { name: 'Foto de evidencia tomada' }).waitFor({ timeout: 5000 });
    } finally {
      await contexto.setOffline(false);
    }
    await pagina.waitForTimeout(2000);
    const r = await get(`/domicilios/domicilios/${aNoEntregar.id}/`, juan);
    if (r.estado !== 'EN_CAMINO') throw new Error('backend: ' + r.estado);
  });

  await paso('no entrega: con conexión vuelve al detalle con motivo y aviso de foto simulada', async () => {
    await pagina.getByRole('button', { name: 'Reportar no entrega' }).click();
    await pagina.getByText('No se pudo entregar').waitFor({ timeout: 10000 });
    await pagina.getByText('Nadie atendió').waitFor({ timeout: 5000 });
    await pagina.getByText('Sin foto guardada.').waitFor({ timeout: 5000 });
    await pagina.screenshot({ path: captura('24-no-entregado') });
  });

  await paso('administrador ve el no entregado en la lista', async () => {
    await cerrarSesion(pagina);
    await ingresar(pagina, 'admin');
    console.log('      primera tarjeta:', await pagina.getByText(/Pedido #\d+ · /).first().innerText());
    await pagina.getByText(/^No entregado \d+$/).click();
    await pagina.getByText(`Pedido #${aNoEntregar.pedido_id} · `, { exact: false }).waitFor({ timeout: 5000 });
    await pagina.screenshot({ path: captura('25-admin-no-entregados') });
  });

  await prueba.terminar(navegador, errores);
});
