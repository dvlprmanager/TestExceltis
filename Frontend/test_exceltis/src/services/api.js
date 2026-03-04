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
  const response = await fetch(url)
  return parseJsonResponse(response, fallbackMessage)
}

export async function postJson(url, body, fallbackMessage = 'No se pudo completar la solicitud.') {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  return parseJsonResponse(response, fallbackMessage)
}
