import { NextRequest, NextResponse } from 'next/server'

const SYMBOL_MAP: Record<string, string> = {
  XAUUSD: 'XAU/USD',
  XAGUSD: 'XAG/USD',
  BTCUSD: 'BTC/USD',
  DXY: 'DXY',
  USOIL: 'USOIL',
}

const ALLOWED_INTERVALS = new Set(['1min', '5min', '15min', '30min', '1h'])

interface TwelveTimeSeriesValue {
  datetime: string
  open: string
  high: string
  low: string
  close: string
}

interface TwelveTimeSeriesResponse {
  status?: string
  message?: string
  values?: TwelveTimeSeriesValue[]
}

function toNum(v: string): number | null {
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function toUnixSeconds(datetime: string): number | null {
  // TwelveData often returns "YYYY-MM-DD HH:mm:ss" without timezone.
  // Treat as UTC for consistent chart rendering.
  const iso = datetime.replace(' ', 'T') + 'Z'
  const ms = Date.parse(iso)
  if (Number.isNaN(ms)) return null
  return Math.floor(ms / 1000)
}

export async function GET(req: NextRequest) {
  const apiKey = process.env.TWELVEDATA_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing TWELVEDATA_API_KEY' }, { status: 500 })
  }

  const { searchParams } = new URL(req.url)
  const key = (searchParams.get('symbol') || 'BTCUSD').toUpperCase()
  const interval = searchParams.get('interval') || '1min'
  const outputsize = Math.min(Number(searchParams.get('outputsize') || 120), 240)

  if (!SYMBOL_MAP[key]) {
    return NextResponse.json({ error: 'Unsupported symbol key' }, { status: 400 })
  }

  if (!ALLOWED_INTERVALS.has(interval)) {
    return NextResponse.json({ error: 'Unsupported interval' }, { status: 400 })
  }

  try {
    const symbol = SYMBOL_MAP[key]
    const url =
      `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(symbol)}` +
      `&interval=${encodeURIComponent(interval)}` +
      `&outputsize=${outputsize}` +
      `&apikey=${encodeURIComponent(apiKey)}`

    const res = await fetch(url, { next: { revalidate: 15 } })
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch candles' }, { status: 502 })
    }

    const data = (await res.json()) as TwelveTimeSeriesResponse
    if (data.status === 'error' || !Array.isArray(data.values)) {
      return NextResponse.json({ error: data.message || 'Invalid candles response' }, { status: 502 })
    }

    // TwelveData values are newest-first. Convert to ascending time.
    const candles = data.values
      .map(v => {
        const time = toUnixSeconds(v.datetime)
        const open = toNum(v.open)
        const high = toNum(v.high)
        const low = toNum(v.low)
        const close = toNum(v.close)

        if (
          time == null ||
          open == null ||
          high == null ||
          low == null ||
          close == null
        ) {
          return null
        }

        return { time, open, high, low, close }
      })
      .filter((v): v is NonNullable<typeof v> => v !== null)
      .reverse()

    return NextResponse.json({ symbol: key, interval, candles })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch candles' }, { status: 500 })
  }
}