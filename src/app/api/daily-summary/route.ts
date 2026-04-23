import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const trades = await prisma.trade.findMany({ orderBy: { date: 'asc' } })
    const dailyRecords = await prisma.dailyRecord.findMany()
    
    const tradesByDate = new Map<string, typeof trades>()
    for (const trade of trades) {
      if (!tradesByDate.has(trade.date)) tradesByDate.set(trade.date, [])
      tradesByDate.get(trade.date)!.push(trade)
    }
    
    const summaries = []
    
    for (const [date, dateTrades] of tradesByDate.entries()) {
      summaries.push({
        date,
        pnl: dateTrades.reduce((sum, t) => sum + t.pnl, 0),
        trades: dateTrades,
        no_trade: false
      })
    }
    
    for (const record of dailyRecords) {
      if (record.no_trade && !tradesByDate.has(record.date)) {
        summaries.push({ date: record.date, pnl: 0, trades: [], no_trade: true })
      }
    }
    
    summaries.sort((a, b) => a.date.localeCompare(b.date))
    return NextResponse.json(summaries)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch daily summary' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { date, no_trade } = body
    const record = await prisma.dailyRecord.upsert({
      where: { date },
      update: { no_trade },
      create: { date, no_trade }
    })
    return NextResponse.json(record, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to update daily record' }, { status: 500 })
  }
}
