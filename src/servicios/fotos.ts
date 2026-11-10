import { Platform } from 'react-native';

import { aErrorDeApi, api, ErrorDeApi } from '@/servicios/api';
import type { FirmaFotoApi, SubidaCloudinaryApi } from '@/tipos/api';

/** Foto lista para enviar en el reporte de no entrega. */
export type FotoReportada = { tipo: 'subida'; url: string } | { tipo: 'simulada' };

/** Pide al backend la firma para subir la foto de no entrega (B-06). */
export async function pedirFirmaFoto(idDomicilio: number): Promise<FirmaFotoApi> {
  try {
    const { data } = await api.post<FirmaFotoApi>(`/domicilios/domicilios/${idDomicilio}/firma-foto/`);
    return data;
  } catch (error) {
    throw aErrorDeApi(error);
  }
}

/**
 * Sube la foto a Cloudinary con la firma del backend y devuelve su URL. En el
 * entorno local sin Cloudinary no sube nada y la marca como simulada (RNF-09).
 */
export async function subirFotoNoEntrega(idDomicilio: number, uriFoto: string): Promise<FotoReportada> {
  const firma = await pedirFirmaFoto(idDomicilio);
  if ('simulado' in firma) return { tipo: 'simulada' };

  const formulario = new FormData();
  if (Platform.OS === 'web') {
    // En el navegador, el selector entrega una URL de blob: se envía el archivo.
    formulario.append('file', await (await fetch(uriFoto)).blob());
  } else {
    formulario.append('file', { uri: uriFoto, name: 'no-entrega.jpg', type: 'image/jpeg' } as unknown as Blob);
  }
  formulario.append('api_key', firma.api_key);
  formulario.append('timestamp', String(firma.timestamp));
  formulario.append('signature', firma.signature);
  formulario.append('folder', firma.folder);

  let respuesta: Response;
  try {
    respuesta = await fetch(`https://api.cloudinary.com/v1_1/${firma.cloud_name}/image/upload`, {
      method: 'POST',
      body: formulario,
    });
  } catch {
    throw new ErrorDeApi('sin_conexion', 'No hay conexión para subir la foto. Revisa tu internet e inténtalo de nuevo.');
  }
  if (!respuesta.ok) throw new ErrorDeApi('servidor', 'No se pudo subir la foto. Inténtalo de nuevo.');
  const datos = (await respuesta.json()) as SubidaCloudinaryApi;
  return { tipo: 'subida', url: datos.secure_url };
}
