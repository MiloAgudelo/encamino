// Mapa y GPS (RF-11, RF-12, RF-16, RF-19, RF-20, RN-03, RN-04) en la versión
// web contra el backend local. El mapa de Google solo se ve en el teléfono;
// aquí se prueba el envío real de posiciones con la geolocalización del
// navegador. Tarda cerca de un minuto y medio por las esperas de 15 s.
const {
  BASE,
  VIEWPORT,
  abrirNavegador,
  captura,
  cargarTodo,
  cerrarSesion,
  correr,
  crearPrueba,
  espera,
  get,
  ingresar,
  pendientesDeJuan,
  token,
  vigilarErrores,
} = require('./comun');

const P1 = { latitude: 4.7461, longitude: -75.9155 };
const P2 = { latitude: 4.7488, longitude: -75.9102 };

correr(async () => {
  const juan = await token('juan');
  const admin = await token('admin');
  const [pendiente] = await pendientesDeJuan(juan);
  const ultima = async () => (await get(`/domicilios/domicilios/${pendiente.id}/posicion/`, admin)).ultima_posicion;
  console.log('Domicilio de Juan:', pendiente.id);

  const navegador = await abrirNavegador();
  const contexto = await navegador.newContext({
    viewport: VIEWPORT,
    geolocation: P1,
    permissions: ['geolocation'],
  });
  const pagina = await contexto.newPage();
  const errores = vigilarErrores(pagina);
  const prueba = crearPrueba('Mapa y GPS');
  prueba.pagina = pagina;
  const { paso } = prueba;

  await paso('ingreso de Juan', () => ingresar(pagina, 'juan'));

  await paso('mapa sin domicilios en camino', async () => {
    await pagina.goto(BASE + '/mapa');
    await pagina.getByText(/No tienes domicilios en camino/).waitFor({ timeout: 10000 });
  });

  await paso('iniciar recorrido abre el mapa compartiendo la posición (RF-11)', async () => {
    await pagina.goto(`${BASE}/domicilio/${pendiente.id}`);
    await pagina.getByText('Iniciar recorrido').click();
    await cargarTodo(pagina);
    await pagina.getByRole('button', { name: 'Sí, iniciar' }).click();
    await pagina.getByText(/^Compartiendo tu posición/).waitFor({ timeout: 15000 });
    await pagina.getByLabel('Marcador: Karamba by marCe').waitFor({ timeout: 5000 });
    await pagina.getByLabel('Marcador: Tú').waitFor({ timeout: 10000 });
    await pagina.screenshot({ path: captura('30-mapa-domiciliario') });
  });

  await paso('la posición llega al backend', async () => {
    await espera(3000);
    const p = await ultima();
    if (!p) throw new Error('sin posición');
    if (Math.abs(p.lat - P1.latitude) > 1e-4) throw new Error('lat ' + p.lat);
    console.log('      primera posición:', p.lat, p.lng, p.recibida_en);
  });

  await paso('se envía cada 15 s, no con cada lectura', async () => {
    const antes = (await ultima()).recibida_en;
    await contexto.setGeolocation(P2);
    await espera(5000);
    if ((await ultima()).recibida_en !== antes) throw new Error('envió antes de 15 s');
    await espera(14000);
    // Una lectura nueva dispara el envío pendiente.
    await contexto.setGeolocation({ latitude: P2.latitude + 0.0001, longitude: P2.longitude });
    await espera(3000);
    const p = await ultima();
    if (p.recibida_en === antes) throw new Error('no volvió a enviar');
    console.log('      segunda posición:', p.lat, p.lng);
  });

  await paso('pausar deja de enviar', async () => {
    await pagina.getByText('Pausar', { exact: true }).click();
    await pagina.getByText(/Envío en pausa/).waitFor({ timeout: 5000 });
    const antes = (await ultima()).recibida_en;
    await contexto.setGeolocation(P1);
    await espera(18000);
    if ((await ultima()).recibida_en !== antes) throw new Error('siguió enviando en pausa');
  });

  await paso('reanudar vuelve a enviar', async () => {
    const antes = (await ultima()).recibida_en;
    await pagina.getByText('Reanudar', { exact: true }).click();
    await pagina.getByText(/^Compartiendo tu posición/).waitFor({ timeout: 10000 });
    await contexto.setGeolocation({ latitude: P1.latitude + 0.0002, longitude: P1.longitude });
    await espera(4000);
    if ((await ultima()).recibida_en === antes) throw new Error('no reanudó');
  });

  await paso('al salir del mapa deja de enviar (RN-03)', async () => {
    await pagina.getByText('Hoy', { exact: true }).click();
    await pagina.getByText(/Pedido #\d+ · /).first().waitFor({ timeout: 10000 });
    const antes = (await ultima()).recibida_en;
    await contexto.setGeolocation(P2);
    await espera(18000);
    await contexto.setGeolocation(P1);
    await espera(2000);
    if ((await ultima()).recibida_en !== antes) throw new Error('siguió enviando fuera del mapa');
  });

  await paso('cliente ve al domiciliario en camino con su posición (RF-07)', async () => {
    await pagina.goto(`${BASE}/seguimiento/${pendiente.pedido_token_seguimiento}`);
    await pagina.getByLabel(/^Marcador: Juan/).waitFor({ timeout: 10000 });
    await pagina.getByText(/Última posición del domiciliario hace/).waitFor({ timeout: 5000 });
    await pagina.screenshot({ path: captura('31-seguimiento-mapa') });
  });

  await paso('punto de despacho con dirección, horario y contacto (RF-19)', async () => {
    await pagina.goto(BASE + '/punto-despacho');
    await pagina.getByText('Carrera 9 # 17-38, Cartago, Valle del Cauca').first().waitFor({ timeout: 10000 });
    await pagina.getByText(/Lunes a sábado/).waitFor({ timeout: 5000 });
    await pagina.getByText('311 610 8002').waitFor({ timeout: 5000 });
    await pagina.getByText('4.74568, -75.92068').waitFor({ timeout: 5000 });
  });

  await paso('permisos de ubicación: concedido (RF-20)', async () => {
    await pagina.goto(BASE + '/ubicacion');
    await pagina.getByText('Concedido mientras usas la app').waitFor({ timeout: 10000 });
  });

  await paso('administrador ve a los domiciliarios en camino (RF-16)', async () => {
    await cerrarSesion(pagina);
    await ingresar(pagina, 'admin');
    await pagina.goto(BASE + '/mapa');
    await pagina.getByText(/^\d+ en camino · se actualiza cada 15 s$/).waitFor({ timeout: 10000 });
    await pagina.getByLabel(/^Marcador: Juan/).waitFor({ timeout: 5000 });
    await pagina.getByLabel(/^Marcador: Ana/).waitFor({ timeout: 5000 });
    await pagina.screenshot({ path: captura('32-mapa-admin') });
    await pagina.getByText(/^Juan Pérez · Pedido #/).click();
    await pagina.getByText('Última posición', { exact: true }).first().waitFor({ timeout: 10000 });
  });

  // Permiso negado en un contexto nuevo, sin geolocalización concedida.
  const sinPermiso = await navegador.newContext({ viewport: VIEWPORT });
  const pagina2 = await sinPermiso.newPage();
  await paso(
    'sin permiso: explica y no envía (RF-20)',
    async () => {
      await ingresar(pagina2, 'ana');
      await pagina2.goto(BASE + '/mapa');
      await pagina2.getByText('Compartir mi posición').click();
      await pagina2.getByText(/Sin permiso de ubicación|La ubicación está bloqueada/).waitFor({ timeout: 15000 });
      await pagina2.getByText('Tu posición no se está compartiendo.').waitFor({ timeout: 5000 });
      await pagina2.screenshot({ path: captura('33-sin-permiso') });
    },
    pagina2,
  );

  await prueba.terminar(navegador, errores);
});
