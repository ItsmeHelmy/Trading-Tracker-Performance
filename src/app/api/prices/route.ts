import { NextResponse } from 'next/server'

const SYMBOLS = [
  { key: 'XAUUSD', symbol: 'XAU/USD', name: 'Gold (XAU/USD)' },
  { key: 'XAGUSD', symbol: 'XAG/USD', name: 'Silver (XAG/USD)' },
  { key: 'BTCUSD', symbol: 'BTC/USD', name: 'Bitcoin (BTC/USD)' },
  { key: 'DXY', symbol: 'DXY', name: 'US Dollar Index' },
  { key: 'USOIL', symbol: 'USOIL', name: 'WTI Crude Oil' },
]

interface TwelveQuote {
  close?: string
  change?: string
  percent_change?: string
  code?: number
  status?: string
  message?: string
}

type PriceItem = {
  key: string
  name: string
  price: number | null
  change: number | null
  changePercent: number | null
}

function toNumber(value: string | undefined): number | null {
  if (!value) return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

async function fetchQuote(symbol: string, apiKey: string): Promise<TwelveQuote | null> {
  try {
    const url = `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbol)}&apikey=${encodeURIComponent(apiKey)}`
    const res = await fetch(url, {
      next: { revalidate: 60 },
    })

    if (!res.ok) return null

    const data = (await res.json()) as TwelveQuote
    if (data.status === 'error') return null

    return data
  } catch {
    return null
  }
}

export async function GET() {
  const apiKey = process.env.TWELVEDATA_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Missing TWELVEDATA_API_KEY' },
      { status: 500 }
    )
  }

  try {
    const results = await Promise.all(
      SYMBOLS.map(async (s): Promise<PriceItem> => {
        const quote = await fetchQuote(s.symbol, apiKey)

        return {
          key: s.key,
          name: s.name,
          price: toNumber(quote?.close),
          change: toNumber(quote?.change),
          changePercent: toNumber(quote?.percent_change),
        }
      })
    )

    return NextResponse.json(results)
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch prices' },
      { status: 500 }
    )
  }
}