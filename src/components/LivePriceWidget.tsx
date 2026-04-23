'use client'
import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'

interface PriceData {
  key: string
  name: string
  price: number | null
  change: number | null
  changePercent: number | null
}

export function LivePriceWidget() {
  const [prices, setPrices] = useState<PriceData[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [error, setError] = useState(false)

  const fetchPrices = async () => {
    try {
      const res = await fetch('/api/prices')
      if (!res.ok) throw new Error()
      const data = await res.json()
      if (data.error) throw new Error()
      setPrices(data)
      setLastUpdated(new Date())
      setError(false)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPrices()
    const interval = setInterval(fetchPrices, 60000)
    return () => clearInterval(interval)
  }, [])

  const formatPrice = (price: number | null, key: string) => {
    if (price === null) return '—'
    if (key === 'BTCUSD') return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    return price.toFixed(2)
  }

  return (
    <Card className="col-span-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Live Prices</h3>
        <div className="flex items-center gap-3">
          {lastUpdated && <span className="text-xs text-gray-400">Updated {lastUpdated.toLocaleTimeString()}</span>}
          <button onClick={fetchPrices} className="text-xs text-blue-500 hover:text-blue-700 transition-colors">Refresh</button>
        </div>
      </div>
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-100 rounded-lg h-16" />
          ))}
        </div>
      ) : error ? (
        <p className="text-sm text-gray-400 text-center py-4">Live prices unavailable. Check your connection.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {prices.map(item => (
            <div key={item.key} className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 font-medium mb-1">{item.key}</p>
              <p className="text-base font-bold text-gray-900">{formatPrice(item.price, item.key)}</p>
              {item.change !== null && (
                <p className={`text-xs font-medium mt-0.5 ${item.change >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {item.change >= 0 ? '▲' : '▼'} {Math.abs(item.changePercent ?? 0).toFixed(2)}%
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
