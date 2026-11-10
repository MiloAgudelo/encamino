import { create } from 'zustand';

import type { Coordenadas } from '@/modelos/domicilio';

/** inactivo: no hay recorrido que seguir. activo: se envía. pausado: el domiciliario lo detuvo. */
export type ModoSeguimiento = 'inactivo' | 'activo' | 'pausado';

interface EstadoSeguimiento {
  /** Domicilio en camino cuya posición se envía. */
  domicilioId: number | null;
  modo: ModoSeguimiento;
  /** Última posición leída del GPS (se muestre o no al backend). */
  posicion: Coordenadas | null;
  /** Hora (ms) del último envío confirmado por el backend. */
  ultimoEnvio: number | null;
  /** Último problema al enviar; null si el último envío salió bien. */
  error: string | null;
  activar: (domicilioId: number) => void;
  pausar: () => void;
  reanudar: () => void;
  detener: (motivo?: string) => void;
  registrarLectura: (posicion: Coordenadas) => void;
  registrarEnvio: (hora: number) => void;
  registrarError: (mensaje: string) => void;
}

/**
 * Estado del seguimiento GPS del domiciliario (RF-12). Vive solo en memoria:
 * si la app se cierra, el domiciliario vuelve a activar el envío. Los datos
 * del servidor siguen en TanStack Query; aquí solo está lo que pasa en el
 * teléfono.
 */
export const useEnvioPosicion = create<EstadoSeguimiento>()((set) => ({
  domicilioId: null,
  modo: 'inactivo',
  posicion: null,
  ultimoEnvio: null,
  error: null,
  activar: (domicilioId) =>
    set((s) => ({
      domicilioId,
      modo: 'activo',
      error: null,
      // Al cambiar de domicilio, se olvida el envío anterior.
      ultimoEnvio: s.domicilioId === domicilioId ? s.ultimoEnvio : null,
    })),
  pausar: () => set((s) => (s.modo === 'activo' ? { modo: 'pausado' } : s)),
  reanudar: () => set((s) => (s.modo === 'pausado' ? { modo: 'activo', error: null } : s)),
  detener: (motivo) => set({ domicilioId: null, modo: 'inactivo', ultimoEnvio: null, error: motivo ?? null }),
  registrarLectura: (posicion) => set({ posicion }),
  registrarEnvio: (hora) => set({ ultimoEnvio: hora, error: null }),
  registrarError: (mensaje) => set({ error: mensaje }),
}));
