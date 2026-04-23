import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
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
    if (isNaN(Number(id))) {
      return NextResponse.json({ error: 'Invalid trade id' }, { status: 400 })
    }

    const trade = await prisma.trade.update({
      where: { id: Number(id) },
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
    return NextResponse.json(trade)
  } catch {
    return NextResponse.json({ error: 'Failed to update trade' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.trade.delete({ where: { id: Number(id) } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete trade' }, { status: 500 })
  }
}
