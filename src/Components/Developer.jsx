import { useEffect, useState } from 'react'
import { getDeveloperLogs } from '../services/api'

export default function DeveloperLogsPage() {
  const [logsData, setLogsData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDeveloperLogs({ type: 'error', lines: 20 })
      .then((data) => {
        setLogsData(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) return <div>Loading logs...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="p-6 w-full max-w-5xl">
      <h1 className="text-2xl font-bold mb-4">Developer Logs</h1>
      <p className="mb-2">{logsData.message}</p>
      <p className="mb-4 text-sm text-gray-600">{logsData.log_file}</p>
      <pre className="bg-gray-100 p-4 rounded overflow-x-auto whitespace-pre-wrap text-sm">
        {logsData.logs?.join('\n')}
      </pre>
    </div>
  )
}