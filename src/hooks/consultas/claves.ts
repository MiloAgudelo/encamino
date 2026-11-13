/** Claves de TanStack Query por recurso, para invalidar en un solo lugar. */
export const claves = {
  domicilios: ['domicilios'] as const,
  domiciliosDelDiaTodos: ['domicilios', 'dia'] as const,
  domiciliosDelDia: (usuarioId: number, fecha: string) => ['domicilios', 'dia', usuarioId, fecha] as const,
  domicilio: (id: number) => ['domicilios', 'detalle', id] as const,
  enCamino: ['domicilios', 'en-camino'] as const,
  seguimiento: (codigo: string) => ['seguimiento', codigo] as const,
};
