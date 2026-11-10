// "Iniciar recorrido" (B-02, B-03, B-04 y RF-11) en la versión web contra el
// backend local. Usa el primer domicilio pendiente de Juan y el que Ana tiene
// en camino en los datos de prueba.
const {
  BASE,
  VIEWPORT,
  abrirNavegador,
  captura,
  cargarTodo,
  cerrarSesion,
  correr,
  crearPrueba,
  get,
  ingresar,
  pendientesDeJuan,
  token,
  vigilarErrores,
} = require('./comun');

correr(async () => {
  const juan = await token('juan');
  const admin = await token('admin');
  const [pendiente] = await pendientesDeJuan(juan);
  const enCaminoAna = (await get('/domicilios/domicilios/?estado=EN_CAMINO', admin)).find((d) =>
    d.domiciliario_nombre?.startsWith('Ana'),
  );
  if (!enCaminoAna) throw new Error('Ana no tiene un domicilio en camino. Recarga los datos de prueba.');
  console.log('Pendiente de Juan:', pendiente.id, '· en camino de Ana:', enCaminoAna.id);

  const navegador = await abrirNavegador();
  const contexto = await navegador.newContext({ viewport: VIEWPORT });
  const pagina = await contexto.newPage();
  const errores = vigilarErrores(pagina);
  const prueba = crearPrueba('Recorrido');
  prueba.pagina = pagina;
  const { paso } = prueba;

  await paso('cliente: con domiciliario asignado y sin salida, no dice "en camino"', async () => {
    await pagina.goto(`${BASE}/seguimiento/${pendiente.pedido_token_seguimiento}`);
    await pagina.getByText(/^Domiciliario asignado · /).waitFor({ timeout: 10000 });
    await pagina.getByText('Te avisamos aquí cuando el domiciliario salga.', { exact: false }).waitFor({ timeout: 5000 });
    await pagina.screenshot({ path: captura('10-seguimiento-asignado') });
  });

  await paso('ingreso de Juan', () => ingresar(pagina, 'juan'));

  await paso('detalle pendiente: productos e "Iniciar recorrido", sin entregar todavía', async () => {
    await pagina.goto(`${BASE}/domicilio/${pendiente.id}`);
    await pagina.getByText('Productos', { exact: true }).waitFor({ timeout: 10000 });
    await pagina.getByText(/× \d+/).first().waitFor({ timeout: 5000 });
    console.log('      productos:', await pagina.getByText(/× \d+/).count());
    await pagina.getByText('Iniciar recorrido').waitFor({ timeout: 5000 });
    if (await pagina.getByText('Confirmar entrega').count()) throw new Error('Confirmar entrega visible en pendiente');
    await pagina.screenshot({ path: captura('11-detalle-pendiente') });
  });

  await paso('confirmación: cancelar no cambia nada', async () => {
    await pagina.getByText('Iniciar recorrido').click();
    await pagina.getByText('¿Ya saliste con el pedido?').waitFor({ timeout: 5000 });
    await pagina.getByText('Cancelar', { exact: true }).click();
    await pagina.getByText('Iniciar recorrido').waitFor({ timeout: 5000 });
  });

  await paso('carga: no se sale hasta contar todas las unidades', async () => {
    await pagina.getByText('Iniciar recorrido').click();
    await pagina.getByText('Verifica lo que llevas').waitFor({ timeout: 5000 });
    const iniciar = pagina.getByRole('button', { name: 'Sí, iniciar' });
    if (!(await iniciar.isDisabled())) throw new Error('se puede iniciar sin cargar');
    const quitar = pagina.getByRole('button', { name: /^Quitar una unidad de/ }).first();
    if (!(await quitar.isDisabled())) throw new Error('el − no está deshabilitado en 0');
    await cargarTodo(pagina);
    await pagina.getByText('Carga completa.').waitFor({ timeout: 5000 });
    const sumar = pagina.getByRole('button', { name: /^Sumar una unidad de/ }).first();
    if (!(await sumar.isDisabled())) throw new Error('el + no está deshabilitado en el máximo');
    if (await iniciar.isDisabled()) throw new Error('no deja iniciar con la carga completa');
    await pagina.screenshot({ path: captura('11b-carga-completa') });
  });

  await paso('sin conexión: informa y el domicilio sigue pendiente', async () => {
    await contexto.setOffline(true);
    try {
      await pagina.getByText('Sí, iniciar').click();
      await pagina.getByText(/Sin conexión: el domicilio sigue pendiente/).waitFor({ timeout: 20000 });
      await pagina.getByText('Pendiente', { exact: true }).waitFor({ timeout: 5000 });
      await pagina.screenshot({ path: captura('12-sin-conexion') });
    } finally {
      await contexto.setOffline(false);
    }
    // Al volver la conexión no debe enviarse nada solo.
    await pagina.waitForTimeout(3000);
    const r = await get(`/domicilios/domicilios/${pendiente.id}/`, juan);
    if (r.estado !== 'PENDIENTE') throw new Error('el backend cambió el estado: ' + r.estado);
  });

  await paso('con conexión: pasa a "En camino" y aparecen entregar y no entregar', async () => {
    await pagina.getByText('Sí, iniciar').click();
    // RF-11: tras iniciar se abre el mapa; luego se vuelve al detalle.
    await pagina.getByText('Cómo llegar en Google Maps').waitFor({ timeout: 10000 });
    await pagina.goto(`${BASE}/domicilio/${pendiente.id}`);
    await pagina.getByText('En camino', { exact: true }).first().waitFor({ timeout: 10000 });
    await pagina.getByText(/^Salió a las /).waitFor({ timeout: 5000 });
    await pagina.getByText('Confirmar entrega').waitFor({ timeout: 5000 });
    await pagina.getByText('Reportar no entrega').waitFor({ timeout: 5000 });
    if (await pagina.getByText('Iniciar recorrido').count()) throw new Error('Iniciar recorrido sigue visible');
    await pagina.screenshot({ path: captura('13-detalle-en-camino') });
    const r = await get(`/domicilios/domicilios/${pendiente.id}/`, juan);
    if (r.estado !== 'EN_CAMINO') throw new Error('backend: ' + r.estado);
  });

  await paso('lista de hoy: filtro En camino lo incluye', async () => {
    await pagina.goto(BASE + '/');
    await pagina.getByText('Ir a mis domicilios').click();
    await pagina.getByText(/Pedido #\d+ · /).first().waitFor({ timeout: 15000 });
    await pagina.getByText(/^En camino \d+$/).click();
    await pagina.waitForTimeout(500);
    const n = await pagina.getByText(/Pedido #\d+ · /).count();
    console.log('      en camino de Juan:', n);
    if (n < 1) throw new Error('sin domicilios en camino');
    await pagina.screenshot({ path: captura('14-hoy-en-camino') });
  });

  await paso('cliente: ahora ve "En camino" sin posición todavía', async () => {
    await pagina.goto(`${BASE}/seguimiento/${pendiente.pedido_token_seguimiento}`);
    await pagina.getByText(/^En camino · /).waitFor({ timeout: 10000 });
    await pagina.getByText(/todavía no ha enviado su posición/).waitFor({ timeout: 5000 });
  });

  await paso('cliente: un domicilio en camino con posición muestra su antigüedad', async () => {
    await pagina.goto(`${BASE}/seguimiento/${enCaminoAna.pedido_token_seguimiento}`);
    await pagina.getByText(/Última posición del domiciliario hace/).waitFor({ timeout: 10000 });
    await pagina.screenshot({ path: captura('15-seguimiento-posicion') });
  });

  await paso('administrador ve la última posición en el detalle', async () => {
    await cerrarSesion(pagina);
    await ingresar(pagina, 'admin');
    await pagina.goto(`${BASE}/domicilio/${enCaminoAna.id}`);
    await pagina.getByText('Última posición').waitFor({ timeout: 10000 });
    if (await pagina.getByText('Iniciar recorrido').count()) throw new Error('el administrador ve Iniciar recorrido');
    await pagina.screenshot({ path: captura('16-admin-posicion') });
  });

  await prueba.terminar(navegador, errores);
});
