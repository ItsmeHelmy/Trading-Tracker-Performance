import { NextResponse } from 'next/server'

const SYMBOLS = [
  { key: 'XAUUSD', symbol: 'GC=F', name: 'Gold (XAU/USD)' },
  { key: 'XAGUSD', symbol: 'SI=F', name: 'Silver (XAG/USD)' },
  { key: 'BTCUSD', symbol: 'BTC-USD', name: 'Bitcoin (BTC/USD)' },
  { key: 'DXY', symbol: 'DX-Y.NYB', name: 'US Dollar Index' },
  { key: 'USOIL', symbol: 'CL=F', name: 'WTI Crude Oil' },
]

interface YahooQuote {
  symbol: string
  regularMarketPrice?: number
  regularMarketChange?: number
  regularMarketChangePercent?: number
}

export async function GET() {
  try {
    const symbolList = SYMBOLS.map(s => s.symbol).join(',')
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbolList}&fields=regularMarketPrice,regularMarketChange,regularMarketChangePercent`
    
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 60 }
    })
    
    if (!response.ok) throw new Error('Failed to fetch prices')
    
    const data = await response.json()
    const quotes: YahooQuote[] = data.quoteResponse?.result || []
    
    const prices = SYMBOLS.map(s => {
      const quote = quotes.find(q => q.symbol === s.symbol)
      return {
        key: s.key,
        name: s.name,
        price: quote?.regularMarketPrice ?? null,
        change: quote?.regularMarketChange ?? null,
        changePercent: quote?.regularMarketChangePercent ?? null,
      }
    })
    
    return NextResponse.json(prices)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch prices' }, { status: 500 })
  }
}
