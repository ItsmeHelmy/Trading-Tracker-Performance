import { Card } from '@/components/ui/Card'
import { LivePriceWidget } from '@/components/LivePriceWidget'
import { CalendarView } from '@/components/CalendarView'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { DailySummary } from '@/types'

async function getStats() {
  const trades = await prisma.trade.findMany()
  const totalTrades = trades.length
  const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0)
  const winningTrades = trades.filter(t => t.pnl > 0).length
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0
  const tradesWithRR = trades.filter(t => t.risk_reward != null)
  const avgRiskReward = tradesWithRR.length > 0
    ? tradesWithRR.reduce((sum, t) => sum + (t.risk_reward ?? 0), 0) / tradesWithRR.length
    : 0
  return { totalPnl, winRate, avgRiskReward, totalTrades, winningTrades }
}

async function getDailySummaries(): Promise<DailySummary[]> {
  const trades = await prisma.trade.findMany({ orderBy: { date: 'asc' } })
  const dailyRecords = await prisma.dailyRecord.findMany()
  
  const tradesByDate = new Map<string, typeof trades>()
  for (const trade of trades) {
    if (!tradesByDate.has(trade.date)) tradesByDate.set(trade.date, [])
    tradesByDate.get(trade.date)!.push(trade)
  }
  
  const summaries: DailySummary[] = []
  for (const [date, dateTrades] of tradesByDate.entries()) {
    summaries.push({
      date,
      pnl: dateTrades.reduce((sum, t) => sum + t.pnl, 0),
      trades: dateTrades.map(t => ({
        id: t.id,
        date: t.date,
        asset: t.asset,
        entry_price: t.entry_price,
        exit_price: t.exit_price,
        pnl: t.pnl,
        risk_reward: t.risk_reward,
        notes: t.notes,
        createdAt: t.createdAt.toISOString(),
      })),
      no_trade: false
    })
  }
  for (const record of dailyRecords) {
    if (record.no_trade && !tradesByDate.has(record.date)) {
      summaries.push({ date: record.date, pnl: 0, trades: [], no_trade: true })
    }
  }
  summaries.sort((a, b) => a.date.localeCompare(b.date))
  return summaries
}

export default async function DashboardPage() {
  const [stats, summaries] = await Promise.all([getStats(), getDailySummaries()])

  const statCards = [
    { label: 'Total PnL', value: formatCurrency(stats.totalPnl), color: stats.totalPnl >= 0 ? 'text-emerald-600' : 'text-red-500', icon: '💰' },
    { label: 'Win Rate', value: `${stats.winRate.toFixed(1)}%`, color: 'text-blue-600', icon: '🎯' },
    { label: 'Avg Risk/Reward', value: stats.avgRiskReward > 0 ? stats.avgRiskReward.toFixed(2) : '—', color: 'text-purple-600', icon: '⚖️' },
    { label: 'Total Trades', value: stats.totalTrades.toString(), color: 'text-gray-700', icon: '📊' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Your trading performance overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => (
          <Card key={card.label}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{card.icon}</span>
            </div>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
            <p className="text-sm text-gray-500 mt-1">{card.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        <LivePriceWidget />
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Trading Calendar</h2>
        <CalendarView summaries={summaries} />
      </Card>
    </div>
  )
}
