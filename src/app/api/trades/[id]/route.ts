import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { date, asset, entry_price, exit_price, pnl, risk_reward, notes } = body
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
