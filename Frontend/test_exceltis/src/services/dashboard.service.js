import { getJson } from '@/services/api'

export function getDashboard({ dateFrom, dateTo }) {
  const query = new URLSearchParams({ dateFrom, dateTo }).toString()
  return getJson(`/api/dashboard?${query}`, 'No se pudo cargar el dashboard.')
}
