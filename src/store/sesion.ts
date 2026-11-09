import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';

import type { UsuarioSesion } from '@/modelos/sesion';

/**
 * Los tokens van al almacenamiento seguro del teléfono (RNF-06). En la web,
 * que solo se usa para revisar pantallas, no existe ese almacenamiento y se
 * usa el del navegador.
 */
const almacenamientoSeguro: StateStorage =
  Platform.OS === 'web'
    ? {
        getItem: (clave) => globalThis.localStorage?.getItem(clave) ?? null,
        setItem: (clave, valor) => globalThis.localStorage?.setItem(clave, valor),
        removeItem: (clave) => globalThis.localStorage?.removeItem(clave),
      }
    : {
        getItem: (clave) => SecureStore.getItemAsync(clave),
        setItem: (clave, valor) => SecureStore.setItemAsync(clave, valor),
        removeItem: (clave) => SecureStore.deleteItemAsync(clave),
      };

interface EstadoSesion {
  access: string | null;
  refresh: string | null;
  usuario: UsuarioSesion | null;
  /** true cuando ya se leyó la sesión guardada; antes de eso no se sabe si hay sesión. */
  hidratada: boolean;
  iniciar: (datos: { access: string; refresh: string; usuario: UsuarioSesion }) => void;
  renovarAcceso: (access: string) => void;
  cerrar: () => void;
  marcarHidratada: () => void;
}

/** Sesión del equipo de Karamba (RF-03). Solo tokens y usuario: lo remoto vive en TanStack Query. */
export const useSesion = create<EstadoSesion>()(
  persist(
    (set) => ({
      access: null,
      refresh: null,
      usuario: null,
      hidratada: false,
      iniciar: ({ access, refresh, usuario }) => set({ access, refresh, usuario }),
      renovarAcceso: (access) => set({ access }),
      cerrar: () => set({ access: null, refresh: null, usuario: null }),
      marcarHidratada: () => set({ hidratada: true }),
    }),
    {
      name: 'encamino-sesion',
      storage: createJSONStorage(() => almacenamientoSeguro),
      partialize: ({ access, refresh, usuario }) => ({ access, refresh, usuario }),
      // Se marca desde el estado recibido y no con useSesion.setState: con un almacenamiento
      // síncrono (la web) la sesión se lee antes de que exista useSesion.
      onRehydrateStorage: () => (estado) => estado?.marcarHidratada(),
    },
  ),
);
