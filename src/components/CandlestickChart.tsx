'use client'
import { useEffect, useRef, useState } from 'react'
import {
  createChart,
  ColorType,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  CandlestickSeries,
  UTCTimestamp,
} from 'lightweight-charts'

interface Candle {
  time: number
  open: number
  high: number
  low: number
  close: number
}

interface Props {
  symbol: string
  interval?: '1min' | '5min' | '15min' | '30min' | '1h'
}

function isDarkMode() {
  return document.documentElement.classList.contains('dark')
}

export function CandlestickChart({ symbol, interval = '1min' }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const applyTheme = () => {
    const dark = isDarkMode()
    const chart = chartRef.current
    if (!chart) return

    chart.applyOptions({
      layout: {
        background: { type: ColorType.Solid, color: dark ? '#0f172a' : '#ffffff' },
        textColor: dark ? '#cbd5e1' : '#334155',
      },
      grid: {
        vertLines: { color: dark ? '#1f2937' : '#f1f5f9' },
        horzLines: { color: dark ? '#1f2937' : '#f1f5f9' },
      },
      rightPriceScale: {
        borderColor: dark ? '#334155' : '#e2e8f0',
      },
      timeScale: {
        borderColor: dark ? '#334155' : '#e2e8f0',
      },
    })
  }

  useEffect(() => {
    if (!containerRef.current) return

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 320,
      layout: {
        background: { type: ColorType.Solid, color: '#ffffff' },
        textColor: '#334155',
      },
      grid: {
        vertLines: { color: '#f1f5f9' },
        horzLines: { color: '#f1f5f9' },
      },
      rightPriceScale: {
        borderColor: '#e2e8f0',
      },
      timeScale: {
        borderColor: '#e2e8f0',
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        mode: 1,
      },
    })

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#ef4444',
      borderUpColor: '#10b981',
      borderDownColor: '#ef4444',
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    })

    chartRef.current = chart
    seriesRef.current = series
    applyTheme()

    const resizeObserver = new ResizeObserver(() => {
      if (!containerRef.current || !chartRef.current) return
      chartRef.current.applyOptions({ width: containerRef.current.clientWidth })
    })
    resizeObserver.observe(containerRef.current)

    const themeObserver = new MutationObserver(() => applyTheme())
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => {
      themeObserver.disconnect()
      resizeObserver.disconnect()
      chart.remove()
      chartRef.current = null
      seriesRef.current = null
    }
  }, [])

  useEffect(() => {
    let active = true

    const load = async () => {
      setLoading(true)
      setError(null)

      try {
        const res = await fetch(
          `/api/candles?symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(interval)}&outputsize=120`
        )
        if (!res.ok) throw new Error('Failed to load candles')

        const data = await res.json()
        if (data.error || !Array.isArray(data.candles)) {
          throw new Error(data.error || 'Invalid candle data')
        }

        const candles: CandlestickData[] = data.candles.map((c: Candle) => ({
          time: c.time as UTCTimestamp,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }))

        if (active && seriesRef.current) {
          seriesRef.current.setData(candles)
          chartRef.current?.timeScale().fitContent()
        }
      } catch (e) {
        if (active) {
          setError(e instanceof Error ? e.message : 'Failed to load candles')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    const id = setInterval(load, 15000)
    return () => {
      active = false
      clearInterval(id)
    }
  }, [symbol, interval])

  if (error) {
    return (
      <div className='rounded-lg border border-red-200 dark:border-red-900/50 p-4 text-sm text-red-600 dark:text-red-400'>
        {error}
      </div>
    )
  }

  return (
    <div className='rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-3'>
      <div className='mb-2 text-sm font-medium text-gray-700 dark:text-gray-200'>
        {symbol} · {interval} Candlestick
      </div>
      {loading && <div className='mb-2 text-xs text-gray-500 dark:text-gray-400'>Loading candles...</div>}
      <div ref={containerRef} />
    </div>
  )
}