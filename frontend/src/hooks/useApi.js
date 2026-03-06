import { useState, useEffect, useCallback } from 'react'

/**
 * Generischer Hook für API-Aufrufe.
 * @param {Function} apiFn - Die API-Funktion aus services/api.js
 * @param {Array} deps - Dependencies (werden als Argumente an apiFn übergeben)
 */
export function useApi(apiFn, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const execute = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiFn(...args)
      setData(response.data)
    } catch (err) {
      setError(err.message || 'Fehler beim Laden der Daten')
    } finally {
      setLoading(false)
    }
  }, [apiFn]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    execute(...deps)
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error, refetch: execute }
}

export default useApi
