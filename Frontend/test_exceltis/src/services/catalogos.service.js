import { getJson } from '@/services/api'

export function getPersonasCatalog(page = 1, pageSize = 100) {
  return getJson(
    `/api/catalogos/personas?page=${page}&pageSize=${pageSize}`,
    'No se pudo cargar el catalogo de personas.',
  )
}

export function getHospitalesCatalog(page = 1, pageSize = 100) {
  return getJson(
    `/api/catalogos/hospitales?page=${page}&pageSize=${pageSize}`,
    'No se pudo cargar el catalogo de hospitales.',
  )
}

export function getProductosCatalog(page = 1, pageSize = 100) {
  return getJson(
    `/api/catalogos/productos?page=${page}&pageSize=${pageSize}`,
    'No se pudo cargar el catalogo de productos.',
  )
}
