import { getJson, postJson } from '@/services/api'

export function getVentas(page = 1, pageSize = 10) {
  return getJson(`/api/ventas?page=${page}&pageSize=${pageSize}`, 'No se pudieron cargar las ventas.')
}

export function getNextFacturaNumber() {
  return getJson('/api/ventas/next-number', 'No se pudo generar el correlativo de factura.')
}

export function getDetalleVenta(idFactura) {
  return getJson(`/api/ventas/${idFactura}/detalle`, 'No se pudo cargar el detalle de la venta.')
}

export function createVenta(payload) {
  return postJson('/api/ventas', payload, 'No se pudo guardar la venta.')
}
