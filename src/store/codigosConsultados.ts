import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const MAXIMO = 5;

interface EstadoCodigos {
  /** Últimos códigos de seguimiento consultados, del más reciente al más antiguo. */
  codigos: string[];
  recordar: (codigo: string) => void;
  olvidar: (codigo: string) => void;
}

/** Recuerda en el teléfono los últimos códigos que consultó el cliente (RF-05). */
export const useCodigosConsultados = create<EstadoCodigos>()(
  persist(
    (set) => ({
      codigos: [],
      recordar: (codigo) =>
        set(({ codigos }) => ({ codigos: [codigo, ...codigos.filter((c) => c !== codigo)].slice(0, MAXIMO) })),
      olvidar: (codigo) => set(({ codigos }) => ({ codigos: codigos.filter((c) => c !== codigo) })),
    }),
    { name: 'encamino-codigos', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
