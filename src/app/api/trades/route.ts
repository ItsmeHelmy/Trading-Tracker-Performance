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

    if (!date || !asset || entry_price == null || exit_price == null || pnl == null) {
      return NextResponse.json({ error: 'Missing required fields: date, asset, entry_price, exit_price, pnl' }, { status: 400 })
    }
    if (isNaN(Number(entry_price)) || isNaN(Number(exit_price)) || isNaN(Number(pnl))) {
      return NextResponse.json({ error: 'entry_price, exit_price, and pnl must be valid numbers' }, { status: 400 })
    }
    if (risk_reward != null && isNaN(Number(risk_reward))) {
      return NextResponse.json({ error: 'risk_reward must be a valid number' }, { status: 400 })
    }

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
