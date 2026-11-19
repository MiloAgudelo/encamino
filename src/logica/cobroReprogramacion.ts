import barriosSemilla from '../../datos/semilla/barrios.json';
import zonasSemilla from '../../datos/semilla/zonas-domicilio.json';

/** Un barrio donde Karamba entrega. */
export interface Barrio {
  id: number;
  nombre: string;
  ciudad: string;
}

/** Zona con tarifa de domicilio (RN-09). Los barrios fuera de estas zonas tienen el domicilio incluido. */
export interface ZonaConTarifa {
  nombre: string;
  tarifa: number;
}

/** Quién causó el regreso. Si fue Karamba, el domicilio nuevo no se cobra (RN-09). */
export type ResponsableCausa = 'cliente' | 'karamba';

export interface CausaRegreso {
  id: string;
  texto: string;
  responsable: ResponsableCausa;
}

export const CAUSAS_REGRESO: CausaRegreso[] = [
  { id: 'nadie-recibio', texto: 'Nadie recibió', responsable: 'cliente' },
  { id: 'direccion-errada', texto: 'Dirección errada', responsable: 'cliente' },
  { id: 'cambio-cliente', texto: 'El cliente pidió cambio', responsable: 'cliente' },
  { id: 'retraso-karamba', texto: 'Retraso de Karamba', responsable: 'karamba' },
  { id: 'error-interno', texto: 'Error interno de Karamba', responsable: 'karamba' },
];

/** Recargo por reprogramar confirmado por Karamba. */
export const RECARGO_REPROGRAMACION: number = zonasSemilla.recargo_reprogramacion;

export const BARRIOS: Barrio[] = barriosSemilla;

const ZONA_POR_BARRIO = new Map<number, ZonaConTarifa>();
for (const zona of zonasSemilla.zonas) {
  for (const barrio of zona.barrios) ZONA_POR_BARRIO.set(barrio.id, { nombre: zona.nombre, tarifa: zona.tarifa });
}

/** Zona con tarifa del barrio; null si el destino tiene el domicilio incluido. */
export function zonaDeBarrio(barrioId: number): ZonaConTarifa | null {
  return ZONA_POR_BARRIO.get(barrioId) ?? null;
}

export function normalizarTexto(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toUpperCase();
}

/**
 * Barrio del destino a partir del nombre que trae el domicilio. Si el nombre se
 * repite en varias ciudades, prefiere el de una zona con tarifa en Cartago.
 */
export function buscarBarrioPorNombre(nombre: string): Barrio | null {
  const buscado = normalizarTexto(nombre);
  const coincidencias = BARRIOS.filter((b) => normalizarTexto(b.nombre) === buscado);
  return coincidencias.find((b) => zonaDeBarrio(b.id)) ?? coincidencias.find((b) => b.ciudad === 'CARTAGO') ?? coincidencias[0] ?? null;
}

/** Lo que escribe o elige el administrador en la pantalla de reprogramar. */
export interface EntradaCobro {
  /** Recargo por reprogramar, como texto del campo. */
  recargo: string;
  /** Tarifa de la zona del destino, como texto del campo ("0" si tiene el domicilio incluido). */
  tarifaZona: string;
  responsable: ResponsableCausa | null;
}

export type ErroresCobro = Partial<Record<'recargo' | 'tarifaZona' | 'causa', string>>;

export type ResultadoCobro =
  | { ok: true; valor: number; recargo: number; tarifaZona: number; exento: boolean }
  | { ok: false; errores: ErroresCobro };

/** Valida un valor en pesos: obligatorio, numérico, entero y no negativo. */
export function validarPesos(texto: string, nombre: string): { valor: number } | { error: string } {
  const recortado = texto.trim();
  // "5.000" es miles; "5.5" o "5,5" son decimales.
  const limpio = /^-?\d{1,3}(\.\d{3})+$/.test(recortado) ? recortado.replace(/\./g, '') : recortado;
  if (limpio === '') return { error: `Escribe ${nombre}.` };
  if (!/^-?\d+([.,]\d+)?$/.test(limpio)) return { error: `${capitalizar(nombre)} debe ser un número.` };
  if (/[.,]/.test(limpio)) return { error: `${capitalizar(nombre)} no puede tener decimales.` };
  const valor = Number(limpio);
  if (valor < 0) return { error: `${capitalizar(nombre)} no puede ser menor que $0.` };
  if (valor > 1_000_000) return { error: `${capitalizar(nombre)} no puede pasar de $1.000.000.` };
  return { valor };
}

/**
 * Valor del domicilio nuevo al reprogramar (RN-09):
 * recargo + tarifa de la zona del destino, o $0 si la causa es de Karamba.
 * Los puntos de miles se aceptan ("5.000"); la coma decimal se rechaza.
 */
export function calcularCobroReprogramacion(entrada: EntradaCobro): ResultadoCobro {
  const errores: ErroresCobro = {};
  const recargo = validarPesos(entrada.recargo, 'el recargo');
  const tarifa = validarPesos(entrada.tarifaZona, 'la tarifa de la zona');
  if ('error' in recargo) errores.recargo = recargo.error;
  if ('error' in tarifa) errores.tarifaZona = tarifa.error;
  if (!entrada.responsable) errores.causa = 'Elige la causa del regreso.';
  if ('error' in recargo || 'error' in tarifa || !entrada.responsable) return { ok: false, errores };

  const exento = entrada.responsable === 'karamba';
  return {
    ok: true,
    recargo: recargo.valor,
    tarifaZona: tarifa.valor,
    exento,
    valor: exento ? 0 : recargo.valor + tarifa.valor,
  };
}

/** 7000 → "$7.000" */
export function formatearPesos(valor: number): string {
  return `$${String(Math.round(valor)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
}

function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
