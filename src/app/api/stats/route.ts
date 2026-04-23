import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const trades = await prisma.trade.findMany()
    const totalTrades = trades.length
    const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0)
    const winningTrades = trades.filter(t => t.pnl > 0).length
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0
    const tradesWithRR = trades.filter(t => t.risk_reward != null)
    const avgRiskReward = tradesWithRR.length > 0
      ? tradesWithRR.reduce((sum, t) => sum + (t.risk_reward ?? 0), 0) / tradesWithRR.length
      : 0
    return NextResponse.json({ totalPnl, winRate, avgRiskReward, totalTrades, winningTrades })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
