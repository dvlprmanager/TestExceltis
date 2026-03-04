import { getJson, postJson } from '@/services/api'

export function getVisitas(page = 1, pageSize = 10) {
  return getJson(
    `/api/visitas-medicas?page=${page}&pageSize=${pageSize}`,
    'No se pudieron cargar las visitas medicas.',
  )
}

export function getInventarioPersona(idPersona) {
  return getJson(
    `/api/visitas-medicas/inventario/${idPersona}`,
    'No se pudo cargar el inventario de la persona.',
  )
}

export function getDetalleVisita(idVisitaMedica) {
  return getJson(
    `/api/visitas-medicas/${idVisitaMedica}/detalle`,
    'No se pudo cargar el detalle de la visita.',
  )
}

export function createVisita(payload) {
  return postJson('/api/visitas-medicas', payload, 'No se pudo guardar la visita medica.')
}
