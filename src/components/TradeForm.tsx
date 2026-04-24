'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Trade } from '@/types'

interface TradeFormProps {
  initialData?: Partial<Trade>
  onSubmit: (data: Omit<Trade, 'id' | 'createdAt'>) => void
  onCancel: () => void
  isLoading?: boolean
}

export function TradeForm({ initialData, onSubmit, onCancel, isLoading }: TradeFormProps) {
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({
    date: initialData?.date || today,
    asset: initialData?.asset || '',
    entry_price: initialData?.entry_price?.toString() || '',
    exit_price: initialData?.exit_price?.toString() || '',
    pnl: initialData?.pnl?.toString() || '',
    risk_reward: initialData?.risk_reward?.toString() || '',
    notes: initialData?.notes || '',
  })

  const calcPnl = () => {
    const entry = parseFloat(form.entry_price)
    const exit = parseFloat(form.exit_price)
    if (!isNaN(entry) && !isNaN(exit)) {
      setForm(f => ({ ...f, pnl: (exit - entry).toFixed(2) }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      date: form.date,
      asset: form.asset,
      entry_price: parseFloat(form.entry_price),
      exit_price: parseFloat(form.exit_price),
      pnl: parseFloat(form.pnl),
      risk_reward: form.risk_reward ? parseFloat(form.risk_reward) : null,
      notes: form.notes,
    })
  }

  const inputClass = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  const labelClass = "block text-sm font-medium text-gray-700 mb-1"

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Date</label>
          <input type="date" required className={inputClass} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
        </div>
        <div>
          <label className={labelClass}>Asset</label>
          <input type="text" required placeholder="e.g. BTCUSD" className={inputClass} value={form.asset} onChange={e => setForm(f => ({ ...f, asset: e.target.value.toUpperCase() }))} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Entry Price</label>
          <input type="number" required step="any" placeholder="0.00" className={inputClass} value={form.entry_price} onChange={e => setForm(f => ({ ...f, entry_price: e.target.value }))} />
        </div>
        <div>
          <label className={labelClass}>Exit Price</label>
          <input type="number" required step="any" placeholder="0.00" className={inputClass} value={form.exit_price} onChange={e => setForm(f => ({ ...f, exit_price: e.target.value }))} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>PnL</label>
          <div className="flex gap-2">
            <input type="number" required step="any" placeholder="0.00" className={inputClass} value={form.pnl} onChange={e => setForm(f => ({ ...f, pnl: e.target.value }))} />
            <button type="button" onClick={calcPnl} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 whitespace-nowrap">Calc</button>
          </div>
        </div>
        <div>
          <label className={labelClass}>Risk/Reward <span className="text-gray-400">(opt)</span></label>
          <input type="number" step="any" placeholder="e.g. 2.5" className={inputClass} value={form.risk_reward} onChange={e => setForm(f => ({ ...f, risk_reward: e.target.value }))} />
        </div>
      </div>
      <div>
        <label className={labelClass}>Notes</label>
        <textarea rows={3} placeholder="Trade notes..." className={inputClass} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? 'Saving...' : 'Save Trade'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  )
}
