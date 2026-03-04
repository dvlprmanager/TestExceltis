const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

function buildApiUrl(url) {
  if (/^https?:\/\//i.test(url)) {
    return url
  }

  if (!API_BASE_URL) {
    return url
  }

  return `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`
}

async function parseJsonResponse(response, fallbackMessage) {
  let data = null

  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    throw new Error(data?.error || fallbackMessage)
  }

  return data
}

export async function getJson(url, fallbackMessage = 'No se pudo completar la solicitud.') {
  const response = await fetch(buildApiUrl(url))
  return parseJsonResponse(response, fallbackMessage)
}

export async function postJson(url, body, fallbackMessage = 'No se pudo completar la solicitud.') {
  const response = await fetch(buildApiUrl(url), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  return parseJsonResponse(response, fallbackMessage)
}
