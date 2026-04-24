'use client'
import { Trade } from '@/types'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatDate } from '@/lib/utils'

interface TradeTableProps {
  trades: Trade[]
  onEdit: (trade: Trade) => void
  onDelete: (id: number) => void
}

export function TradeTable({ trades, onEdit, onDelete }: TradeTableProps) {
  if (trades.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-lg">No trades yet</p>
        <p className="text-sm mt-1">Add your first trade to get started</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
            <th className="text-left py-3 px-4 font-medium text-gray-500">Asset</th>
            <th className="text-right py-3 px-4 font-medium text-gray-500">Entry</th>
            <th className="text-right py-3 px-4 font-medium text-gray-500">Exit</th>
            <th className="text-right py-3 px-4 font-medium text-gray-500">PnL</th>
            <th className="text-right py-3 px-4 font-medium text-gray-500">R/R</th>
            <th className="text-left py-3 px-4 font-medium text-gray-500">Notes</th>
            <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody>
          {trades.map(trade => (
            <tr key={trade.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
              <td className="py-3 px-4 text-gray-600">{formatDate(trade.date)}</td>
              <td className="py-3 px-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">{trade.asset}</span>
              </td>
              <td className="py-3 px-4 text-right text-gray-600">{formatCurrency(trade.entry_price)}</td>
              <td className="py-3 px-4 text-right text-gray-600">{formatCurrency(trade.exit_price)}</td>
              <td className={`py-3 px-4 text-right font-semibold ${trade.pnl >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {trade.pnl >= 0 ? '+' : ''}{formatCurrency(trade.pnl)}
              </td>
              <td className="py-3 px-4 text-right text-gray-600">{trade.risk_reward != null ? trade.risk_reward.toFixed(2) : '—'}</td>
              <td className="py-3 px-4 text-gray-500 max-w-[200px] truncate">{trade.notes || '—'}</td>
              <td className="py-3 px-4 text-right">
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(trade)}>Edit</Button>
                  <Button variant="danger" size="sm" onClick={() => onDelete(trade.id)}>Delete</Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
