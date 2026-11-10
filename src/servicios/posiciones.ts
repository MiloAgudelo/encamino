import { mapearDomicilio } from '@/mapeadores/domicilio';
import { mapearPosicion } from '@/mapeadores/posicion';
import type { Coordenadas, Domicilio } from '@/modelos/domicilio';
import { aErrorDeApi, api } from '@/servicios/api';
import type { DomicilioApi, PosicionApi } from '@/tipos/api';

export interface LecturaGps {
  coordenadas: Coordenadas;
  /** Radio de error en metros; null si el teléfono no lo da. */
  precisionMetros: number | null;
  /** Cuándo la tomó el teléfono (milisegundos). */
  tomadaEn: number;
}

/** Envía la posición del domiciliario mientras va en camino (RF-12, B-04). */
export async function enviarPosicion(idDomicilio: number, lectura: LecturaGps): Promise<void> {
  try {
    await api.post<PosicionApi>(`/domicilios/domicilios/${idDomicilio}/posicion/`, {
      lat: Number(lectura.coordenadas.latitud.toFixed(6)),
      lng: Number(lectura.coordenadas.longitud.toFixed(6)),
      precision: lectura.precisionMetros != null ? Math.round(lectura.precisionMetros * 10) / 10 : null,
      registrada_en: new Date(lectura.tomadaEn).toISOString(),
    });
  } catch (error) {
    throw aErrorDeApi(error);
  }
}

/** Domicilios en camino con la última posición de cada uno (RF-16, B-10). Solo administrador. */
export async function listarEnCamino(): Promise<Domicilio[]> {
  try {
    const { data } = await api.get<DomicilioApi[]>('/domicilios/domicilios/en-camino/');
    return data.map((d) => ({ ...mapearDomicilio(d), ultimaPosicion: mapearPosicion(d.ultima_posicion) }));
  } catch (error) {
    throw aErrorDeApi(error);
  }
}
