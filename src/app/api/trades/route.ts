import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const trades = await prisma.trade.findMany({ orderBy: { date: 'desc' } })
    return NextResponse.json(trades)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch trades' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { date, asset, entry_price, exit_price, pnl, risk_reward, notes } = body
    const trade = await prisma.trade.create({
      data: {
        date,
        asset,
        entry_price: Number(entry_price),
        exit_price: Number(exit_price),
        pnl: Number(pnl),
        risk_reward: risk_reward ? Number(risk_reward) : null,
        notes: notes || ''
      }
    })
    await prisma.dailyRecord.upsert({
      where: { date },
      update: { no_trade: false },
      create: { date, no_trade: false }
    })
    return NextResponse.json(trade, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create trade' }, { status: 500 })
  }
}
