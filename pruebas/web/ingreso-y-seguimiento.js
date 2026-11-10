// Ingreso, lista de hoy, detalle, cierre de sesión y seguimiento del cliente
// en la versión web contra el backend local.
const {
  BASE,
  VIEWPORT,
  abrirNavegador,
  captura,
  correr,
  crearPrueba,
  get,
  ingresar,
  cerrarSesion,
  token,
  vigilarErrores,
} = require('./comun');

correr(async () => {
  const juan = await token('juan');
  const [domicilio] = await get('/domicilios/domicilios/', juan);
  if (!domicilio) throw new Error('Juan no tiene domicilios. Recarga los datos de prueba.');
  const codigo = domicilio.pedido_token_seguimiento;

  const navegador = await abrirNavegador();
  const pagina = await navegador.newPage({ viewport: VIEWPORT });
  const errores = vigilarErrores(pagina);
  const prueba = crearPrueba('Ingreso y seguimiento');
  prueba.pagina = pagina;
  const { paso } = prueba;

  // 1. Ingreso con validación
  await paso('ingreso vacío muestra errores por campo', async () => {
    await pagina.goto(BASE + '/ingresar');
    await pagina.getByText('Entrar', { exact: true }).click();
    await pagina.getByText('Escribe tu correo.').waitFor({ timeout: 5000 });
    await pagina.getByText('Escribe tu contraseña.').waitFor({ timeout: 5000 });
  });
  await paso('contraseña incorrecta no revela el dato', async () => {
    await pagina.getByLabel('Correo').fill('juan@encamino.local');
    await pagina.getByLabel('Contraseña').fill('mala');
    await pagina.getByText('Entrar', { exact: true }).click();
    await pagina.getByText('Correo o contraseña incorrectos.').waitFor({ timeout: 10000 });
  });
  await paso('ingreso correcto abre la lista de hoy', async () => {
    await pagina.getByLabel('Contraseña').fill('encamino-local');
    await pagina.getByText('Entrar', { exact: true }).click();
    await pagina.getByText(/Pedido #\d+ · /).first().waitFor({ timeout: 15000 });
    await pagina.screenshot({ path: captura('01-hoy-juan') });
  });

  // 2. Búsqueda y filtro sobre la lista
  await paso('filtro Pendiente', async () => {
    const todas = await pagina.getByText(/Pedido #\d+ · /).count();
    await pagina.getByText(/^Pendiente \d+$/).click();
    await pagina.waitForTimeout(500);
    const pendientes = await pagina.getByText(/Pedido #\d+ · /).count();
    console.log('      tarjetas de Juan:', todas, '· pendientes:', pendientes);
    if (pendientes > todas) throw new Error('el filtro muestra más tarjetas que el total');
    await pagina.getByText(/^Todos \d+$/).click();
  });
  await paso('búsqueda sin resultados ofrece limpiar', async () => {
    await pagina.getByLabel('Buscar domicilios').fill('zzzz');
    await pagina.getByText('Limpiar filtros').waitFor({ timeout: 5000 });
    await pagina.getByText('Limpiar filtros').click();
  });

  // 3. Detalle
  await paso('detalle de un domicilio', async () => {
    await pagina.getByText(/Pedido #\d+ · /).first().click();
    await pagina.getByText('Franja de entrega').waitFor({ timeout: 10000 });
    await pagina.screenshot({ path: captura('02-detalle') });
  });
  await paso('detalle inexistente', async () => {
    await pagina.goto(BASE + '/domicilio/999999');
    await pagina.getByText('Domicilio no encontrado').waitFor({ timeout: 10000 });
  });

  // 4. Perfil y cierre de sesión
  await paso('cerrar sesión', () => cerrarSesion(pagina));
  await paso('sin sesión, las rutas del equipo llevan al ingreso', async () => {
    await pagina.goto(BASE + '/domicilio/1');
    await pagina.getByText('Equipo de Karamba').waitFor({ timeout: 10000 });
  });

  // 5. Seguimiento del cliente
  await paso('seguimiento con enlace completo pegado', async () => {
    await pagina.goto(BASE + '/');
    await pagina.getByLabel('Código o enlace de seguimiento').fill(`https://karamba.com/pedidos/seguimiento/${codigo}`);
    await pagina.getByText('Seguir mi pedido').click();
    await pagina.getByText(/Pedido #\d+$/).waitFor({ timeout: 10000 });
    await pagina.screenshot({ path: captura('03-seguimiento') });
  });
  await paso('código consultado queda recordado', async () => {
    await pagina.goto(BASE + '/');
    await pagina.getByText(codigo).waitFor({ timeout: 5000 });
  });
  await paso('código inexistente', async () => {
    await pagina.goto(BASE + '/seguimiento/00000000-0000-0000-0000-000000000000');
    await pagina.getByText('No encontramos este pedido').waitFor({ timeout: 10000 });
  });
  await paso('código mal formado', async () => {
    await pagina.goto(BASE + '/seguimiento/hola');
    await pagina.getByText('No encontramos este pedido').waitFor({ timeout: 10000 });
  });

  // 6. Administrador ve todos
  await paso('administrador ve todos los domicilios', async () => {
    await ingresar(pagina, 'admin');
    console.log('      tarjetas del administrador:', await pagina.getByText(/Pedido #\d+ · /).count());
    await pagina.screenshot({ path: captura('04-hoy-admin') });
  });

  await prueba.terminar(navegador, errores);
});
