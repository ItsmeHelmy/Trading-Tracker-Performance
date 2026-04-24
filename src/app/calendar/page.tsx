import { prisma } from '@/lib/prisma'
import { Card } from '@/components/ui/Card'
import { CalendarView } from '@/components/CalendarView'
import { DailySummary } from '@/types'

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
        side: 'LONG',
        quantity: 1,
        entry_price: t.entry_price,
        exit_price: t.exit_price,
        fee: 0,
        pnl: t.pnl,
        risk_reward: t.risk_reward,
        notes: t.notes,
        createdAt: t.createdAt.toISOString(),
      })),
      no_trade: false,
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

export default async function CalendarPage() {
  const summaries = await getDailySummaries()

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900 dark:text-gray-100'>Calendar</h1>
        <p className='text-gray-500 dark:text-gray-400 mt-1'>Monthly trading overview</p>
      </div>
      <Card>
        <CalendarView summaries={summaries} />
      </Card>
    </div>
  )
}