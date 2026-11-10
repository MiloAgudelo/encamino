// Utilidades compartidas por las pruebas de flujo web. Cómo correrlas: ver
// docs/desarrollo-local.md, sección "Pruebas de flujo en la versión web".
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');

const BASE = process.env.WEB_URL ?? 'http://localhost:5173';
const API = process.env.API_URL ?? 'http://127.0.0.1:8000/api';
const CONTRASENA = 'encamino-local';
const CAPTURAS = path.join(__dirname, 'capturas');
const FOTO = path.join(__dirname, 'foto-prueba.png');
const VIEWPORT = { width: 400, height: 860 };

fs.mkdirSync(CAPTURAS, { recursive: true });

const captura = (nombre) => path.join(CAPTURAS, `${nombre}.png`);
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

/** Abre Edge (o el canal de NAVEGADOR: chrome, chromium…) instalado en el equipo. */
function abrirNavegador() {
  return chromium.launch({ channel: process.env.NAVEGADOR ?? 'msedge' });
}

async function token(usuario) {
  const r = await fetch(`${API}/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: `${usuario}@encamino.local`, password: CONTRASENA }),
  });
  if (!r.ok) throw new Error(`No se pudo ingresar como ${usuario} (${r.status}). ¿Está el backend arriba?`);
  return (await r.json()).access;
}

async function llamar(metodo, ruta, acceso) {
  const r = await fetch(`${API}${ruta}`, { method: metodo, headers: { Authorization: `Bearer ${acceso}` } });
  return r.json();
}
const get = (ruta, acceso) => llamar('GET', ruta, acceso);

/** Domicilios pendientes de Juan; falla con un mensaje claro si faltan datos de prueba. */
async function pendientesDeJuan(acceso, cuantos = 1) {
  const lista = await get('/domicilios/domicilios/?estado=PENDIENTE', acceso);
  if (lista.length < cuantos) {
    throw new Error(
      `Juan tiene ${lista.length} domicilios pendientes y la prueba necesita ${cuantos}. ` +
        'Recarga los datos con cargar_datos_encamino --reiniciar.',
    );
  }
  return lista;
}

async function ingresar(pagina, usuario) {
  await pagina.goto(BASE + '/ingresar');
  await pagina.getByLabel('Correo').fill(`${usuario}@encamino.local`);
  await pagina.getByLabel('Contraseña').fill(CONTRASENA);
  await pagina.getByText('Entrar', { exact: true }).click();
  await pagina.getByText(/Pedido #\d+ · /).first().waitFor({ timeout: 15000 });
}

async function cerrarSesion(pagina) {
  await pagina.goto(BASE + '/perfil');
  await pagina.getByText('Cerrar sesión').click();
  await pagina.getByText('Sigue tu pedido').waitFor({ timeout: 10000 });
}

/** Toca "+" en cada producto hasta llegar a la cantidad pedida. */
async function cargarTodo(pagina) {
  const botones = pagina.getByRole('button', { name: /^Sumar una unidad de/ });
  const n = await botones.count();
  for (let i = 0; i < n; i++) {
    while (!(await botones.nth(i).isDisabled())) await botones.nth(i).click();
  }
}

/** Guarda los errores de consola de la página. */
function vigilarErrores(pagina) {
  const errores = [];
  pagina.on('pageerror', (e) => errores.push(String(e)));
  pagina.on('console', (m) => m.type() === 'error' && errores.push(m.text()));
  return errores;
}

// Errores esperados: 401 y 404 que la prueba provoca, y los de las pruebas sin conexión.
const ERRORES_ESPERADOS = /401|404|Failed to load resource|ERR_INTERNET_DISCONNECTED|Network Error/;

/**
 * Lleva la cuenta de los pasos. Cada paso que falla guarda una captura de
 * `pagina` en capturas/. `terminar` imprime el total y sale con código 1 si
 * alguno falló.
 */
function crearPrueba(nombre) {
  const fallas = [];
  let total = 0;
  const prueba = {
    pagina: null,
    async paso(titulo, fn, pagina = prueba.pagina) {
      total++;
      try {
        await fn();
        console.log('OK   ', titulo);
      } catch (e) {
        fallas.push(titulo);
        console.log('FALLA', titulo, '-', e.message.split('\n')[0]);
        if (pagina) {
          await pagina.screenshot({ path: captura('falla-' + titulo.replace(/\W+/g, '-')) }).catch(() => {});
        }
      }
    },
    async terminar(navegador, errores = []) {
      const inesperados = errores.filter((e) => !ERRORES_ESPERADOS.test(e));
      if (inesperados.length) console.log('Errores de consola:', inesperados);
      await navegador.close();
      console.log(`${nombre}: ${total - fallas.length}/${total} pasos bien`);
      if (fallas.length) {
        console.log('Fallaron:', fallas.join(' | '));
        process.exitCode = 1;
      }
    },
  };
  return prueba;
}

/** Corre la prueba y sale con código 1 si algo falla antes de empezar los pasos. */
function correr(fn) {
  fn().catch((e) => {
    console.error('La prueba no pudo correr:', e.message);
    process.exitCode = 1;
  });
}

module.exports = {
  API,
  BASE,
  FOTO,
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
  llamar,
  pendientesDeJuan,
  token,
  vigilarErrores,
};
