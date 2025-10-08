const NASA_API_BASE = 'https://api.nasa.gov'
const API_KEY = import.meta.env.VITE_NASA_API_KEY || 'DEMO_KEY'

const handleResponse = async (response, friendlyName) => {
  if (!response.ok) {
    const message = await response.text()
    throw new Error(
      `${friendlyName} request failed (${response.status}): ${message || 'Unknown error'}`
    )
  }
  return response.json()
}

export const fetchApod = async (date) => {
  const params = new URLSearchParams({
    api_key: API_KEY,
  })
  if (date) {
    params.set('date', date)
  }

  const response = await fetch(`${NASA_API_BASE}/planetary/apod?${params.toString()}`)
  return handleResponse(response, 'APOD')
}

export const fetchMarsPhotos = async ({ rover, sol }) => {
  const params = new URLSearchParams({
    api_key: API_KEY,
    sol: String(sol),
  })

  const response = await fetch(
    `${NASA_API_BASE}/mars-photos/api/v1/rovers/${rover}/photos?${params.toString()}`
  )
  return handleResponse(response, 'Mars photos')
}

export const fetchMarsManifest = async (rover) => {
  const params = new URLSearchParams({
    api_key: API_KEY,
  })

  const response = await fetch(
    `${NASA_API_BASE}/mars-photos/api/v1/manifests/${rover}?${params.toString()}`
  )
  return handleResponse(response, 'Mars mission manifest')
}

