import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'
import { fetchApod, fetchMarsManifest, fetchMarsPhotos } from './api/nasa'

const ROVER_OPTIONS = [
  { label: 'Curiosity', value: 'curiosity' },
  { label: 'Perseverance', value: 'perseverance' },
  { label: 'Opportunity', value: 'opportunity' },
  { label: 'Spirit', value: 'spirit' },
]

const INITIAL_ROVER_SELECTION = {
  rover: 'curiosity',
  sol: '1000',
}

const getLocalISODate = (date = new Date()) => {
  const tzAdjustment = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - tzAdjustment).toISOString().split('T')[0]
}

const formatPrettyDate = (isoDate) =>
  new Date(isoDate).toLocaleDateString(undefined, { dateStyle: 'long' })

const LoadingIndicator = ({ label }) => (
  <div className="loading-indicator" role="status" aria-live="polite">
    <span className="spinner" aria-hidden="true" />
    <span>{label}</span>
  </div>
)

function App() {
  const todayString = useMemo(() => getLocalISODate(), [])

  const [apodDateInput, setApodDateInput] = useState(todayString)
  const [apodDate, setApodDate] = useState(todayString)
  const [apodData, setApodData] = useState(null)
  const [apodLoading, setApodLoading] = useState(false)
  const [apodError, setApodError] = useState('')

  const [roverForm, setRoverForm] = useState(() => ({ ...INITIAL_ROVER_SELECTION }))
  const [roverConfig, setRoverConfig] = useState(() => ({
    rover: INITIAL_ROVER_SELECTION.rover,
    sol: Number(INITIAL_ROVER_SELECTION.sol),
  }))
  const [roverPhotos, setRoverPhotos] = useState([])
  const [roverManifest, setRoverManifest] = useState(null)
  const [roverLoading, setRoverLoading] = useState(false)
  const [roverError, setRoverError] = useState('')
  const [roverNotice, setRoverNotice] = useState('')

  const loadApod = useCallback(async (targetDate) => {
    setApodLoading(true)
    setApodError('')
    try {
      const data = await fetchApod(targetDate)
      setApodData(data)
    } catch (error) {
      setApodError(error.message || 'Unable to load the Astronomy Picture of the Day.')
      setApodData(null)
    } finally {
      setApodLoading(false)
    }
  }, [])

  const loadRoverData = useCallback(async (selection) => {
    setRoverLoading(true)
    setRoverError('')
    setRoverNotice('')
    try {
      const [{ photos }, manifestResponse] = await Promise.all([
        fetchMarsPhotos(selection),
        fetchMarsManifest(selection.rover),
      ])

      setRoverPhotos(photos)
      setRoverManifest(manifestResponse.photo_manifest)

      if (photos.length === 0) {
        setRoverNotice('No images available for that sol. Try a nearby sol or a different rover.')
      }
    } catch (error) {
      setRoverError(error.message || 'Unable to load Mars rover telemetry right now.')
      setRoverPhotos([])
    } finally {
      setRoverLoading(false)
    }
  }, [])

  useEffect(() => {
    loadApod(apodDate)
  }, [apodDate, loadApod])

  useEffect(() => {
    loadRoverData(roverConfig)
  }, [roverConfig, loadRoverData])

  const handleApodSubmit = (event) => {
    event.preventDefault()
    if (apodDateInput) {
      setApodDate(apodDateInput)
    }
  }

  const handleRoverSubmit = (event) => {
    event.preventDefault()
    if (!roverForm.sol && roverForm.sol !== 0) {
      setRoverNotice('Enter a sol to retrieve imagery.')
      return
    }

    const cleanedSol = Math.min(5000, Math.max(0, Number(roverForm.sol) || 0))
    setRoverConfig({
      rover: roverForm.rover,
      sol: cleanedSol,
    })
  }

  return (
    <div className="app">
      <header className="hero">
        <div className="hero-text">
          <h1>Mission Control Dashboard</h1>
          <p>
            Explore NASA's Astronomy Picture of the Day and drill into live telemetry from Mars
            rovers. Pick a date, choose a rover, and let the cosmos come to you.
          </p>
        </div>
      </header>

      <main className="content-grid">
        <section className="panel apod-panel">
          <div className="panel-header">
            <h2>Astronomy Picture of the Day</h2>
            <form className="input-row" onSubmit={handleApodSubmit}>
              <label className="field">
                <span>Date</span>
                <input
                  type="date"
                  value={apodDateInput}
                  max={todayString}
                  onChange={(event) => setApodDateInput(event.target.value)}
                  aria-label="APOD date selector"
                />
              </label>
              <button type="submit">Show Image</button>
            </form>
          </div>
          {apodLoading && <LoadingIndicator label="Fetching today's cosmos..." />}
          {apodError && <p className="error">{apodError}</p>}
          {!apodLoading && apodData && (
            <div className="apod-content">
              <div className="apod-media">
                {apodData.media_type === 'image' ? (
                  <img src={apodData.url} alt={apodData.title} loading="lazy" />
                ) : (
                  <div className="video-frame">
                    <iframe
                      src={apodData.url}
                      title={apodData.title}
                      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>
              <div className="apod-details">
                <h3>{apodData.title}</h3>
                <p className="meta">{formatPrettyDate(apodData.date)}</p>
                <p>{apodData.explanation}</p>
              </div>
            </div>
          )}
        </section>

        <section className="panel rover-panel">
          <div className="panel-header">
            <h2>Mars Rover Telemetry</h2>
            <form className="input-row" onSubmit={handleRoverSubmit}>
              <label className="field">
                <span>Rover</span>
                <select
                  value={roverForm.rover}
                  onChange={(event) =>
                    setRoverForm((prev) => ({ ...prev, rover: event.target.value }))
                  }
                  aria-label="Select Mars rover"
                >
                  {ROVER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Sol</span>
                <input
                  type="number"
                  min="0"
                  max="5000"
                  value={roverForm.sol}
                  onChange={(event) =>
                    setRoverForm((prev) => ({ ...prev, sol: event.target.value }))
                  }
                  aria-label="Martian sol number"
                />
              </label>
              <button type="submit">Get Telemetry</button>
            </form>
          </div>
          {roverLoading && <LoadingIndicator label="Calling mission control..." />}
          {roverError && <p className="error">{roverError}</p>}
          {!roverLoading && !roverError && roverNotice && <p className="notice">{roverNotice}</p>}
          {roverManifest && (
            <div className="rover-stats">
              <div>
                <span className="label">Launch</span>
                <span>{formatPrettyDate(roverManifest.launch_date)}</span>
              </div>
              <div>
                <span className="label">Landing</span>
                <span>{formatPrettyDate(roverManifest.landing_date)}</span>
              </div>
              <div>
                <span className="label">Status</span>
                <span className="status">{roverManifest.status.toUpperCase()}</span>
              </div>
              <div>
                <span className="label">Max Sol</span>
                <span>{roverManifest.max_sol}</span>
              </div>
              <div>
                <span className="label">Max Date</span>
                <span>{formatPrettyDate(roverManifest.max_date)}</span>
              </div>
              <div>
                <span className="label">Total Photos</span>
                <span>{roverManifest.total_photos.toLocaleString()}</span>
              </div>
            </div>
          )}
          {roverPhotos.length > 0 && (
            <div className="rover-photo-grid">
              {roverPhotos.slice(0, 6).map((photo) => (
                <figure key={photo.id} className="rover-photo-card">
                  <img
                    src={photo.img_src}
                    alt={`${photo.camera.full_name} on sol ${photo.sol}`}
                    loading="lazy"
                  />
                  <figcaption>
                    <span className="caption-title">{photo.camera.full_name}</span>
                    <span className="caption-detail">
                      Sol {photo.sol} | {formatPrettyDate(photo.earth_date)}
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="footer">
        <p>
          Data courtesy of NASA's open APIs. Provide your own API key by setting{' '}
          <code>VITE_NASA_API_KEY</code> for higher rate limits.
        </p>
      </footer>
    </div>
  )
}

export default App

