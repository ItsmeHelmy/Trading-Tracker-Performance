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

type TabType = 'trade' | 'daily'

export function TradeForm({ initialData, onSubmit, onCancel, isLoading }: TradeFormProps) {
  const today = new Date().toISOString().split('T')[0]
  const [activeTab, setActiveTab] = useState<TabType>('trade')

  // Trade form state
  const [form, setForm] = useState({
    date: initialData?.date || today,
    asset: initialData?.asset || '',
    side: initialData?.side || 'LONG',
    quantity: initialData?.quantity?.toString() || '1',
    entry_price: initialData?.entry_price?.toString() || '',
    exit_price: initialData?.exit_price?.toString() || '',
    fee: initialData?.fee?.toString() || '0',
    pnl: initialData?.pnl?.toString() || '',
    risk_reward: initialData?.risk_reward?.toString() || '',
    notes: initialData?.notes || '',
  })

  // Daily PnL form state
  const [dailyForm, setDailyForm] = useState({
    date: today,
    pnl: '',
  })

  const calcPnl = () => {
    const entry = parseFloat(form.entry_price)
    const exit = parseFloat(form.exit_price)
    const qty = parseFloat(form.quantity)
    const fee = parseFloat(form.fee)
    const rr = parseFloat(form.risk_reward)

    if (!isNaN(entry) && !isNaN(exit) && !isNaN(qty) && qty > 0) {
      const basePnl = form.side === 'LONG' ? (exit - entry) * qty : (entry - exit) * qty
      const multiplier = !isNaN(rr) ? rr : 1
      const feeValue = !isNaN(fee) ? fee : 0
      const netPnl = basePnl * multiplier - feeValue

      setForm(f => ({ ...f, pnl: netPnl.toFixed(2) }))
    }
  }

  const handleTradeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      date: form.date,
      asset: form.asset,
      side: form.side as 'LONG' | 'SHORT',
      quantity: parseFloat(form.quantity),
      entry_price: parseFloat(form.entry_price),
      exit_price: parseFloat(form.exit_price),
      fee: parseFloat(form.fee || '0'),
      pnl: parseFloat(form.pnl),
      risk_reward: form.risk_reward ? parseFloat(form.risk_reward) : null,
      notes: form.notes,
    })
  }

  const handleDailySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      date: dailyForm.date,
      asset: 'DAILY_PNL',
      side: 'LONG',
      quantity: 1,
      entry_price: 0,
      exit_price: parseFloat(dailyForm.pnl),
      fee: 0,
      pnl: parseFloat(dailyForm.pnl),
      risk_reward: null,
      notes: 'Daily summary PnL',
    })
  }

  const inputClass =
    'w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
  const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1'
  const tabClass = (isActive: boolean) =>
    'px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ' +
    (isActive
      ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
      : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100')

  return (
    <form onSubmit={activeTab === 'trade' ? handleTradeSubmit : handleDailySubmit} className='space-y-4'>
      {/* Tab buttons */}
      <div className='flex gap-0 border-b border-gray-200 dark:border-gray-700'>
        <button
          type='button'
          onClick={() => setActiveTab('trade')}
          className={tabClass(activeTab === 'trade')}
        >
          Trade Position
        </button>
        <button
          type='button'
          onClick={() => setActiveTab('daily')}
          className={tabClass(activeTab === 'daily')}
        >
          Daily PnL
        </button>
      </div>

      {/* Trade Tab */}
      {activeTab === 'trade' && (
        <>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className={labelClass}>Date</label>
              <input
                type='date'
                required
                className={inputClass}
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelClass}>Asset</label>
              <input
                type='text'
                required
                placeholder='e.g. BTCUSDT'
                className={inputClass}
                value={form.asset}
                onChange={e => setForm(f => ({ ...f, asset: e.target.value.toUpperCase() }))}
              />
            </div>
          </div>

          <div className='grid grid-cols-3 gap-4'>
            <div>
              <label className={labelClass}>Side</label>
              <select
                className={inputClass}
                value={form.side}
                onChange={e => setForm(f => ({ ...f, side: e.target.value as 'LONG' | 'SHORT' }))}
              >
                <option value='LONG'>LONG (Buy)</option>
                <option value='SHORT'>SHORT (Sell)</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Quantity</label>
              <input
                type='number'
                required
                min='0'
                step='any'
                placeholder='1'
                className={inputClass}
                value={form.quantity}
                onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelClass}>Fee</label>
              <input
                type='number'
                min='0'
                step='any'
                placeholder='0.00'
                className={inputClass}
                value={form.fee}
                onChange={e => setForm(f => ({ ...f, fee: e.target.value }))}
              />
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className={labelClass}>Entry Price</label>
              <input
                type='number'
                required
                step='any'
                placeholder='0.00'
                className={inputClass}
                value={form.entry_price}
                onChange={e => setForm(f => ({ ...f, entry_price: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelClass}>Exit Price</label>
              <input
                type='number'
                required
                step='any'
                placeholder='0.00'
                className={inputClass}
                value={form.exit_price}
                onChange={e => setForm(f => ({ ...f, exit_price: e.target.value }))}
              />
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className={labelClass}>PnL</label>
              <div className='flex gap-2'>
                <input
                  type='number'
                  required
                  step='any'
                  placeholder='0.00'
                  className={inputClass}
                  value={form.pnl}
                  onChange={e => setForm(f => ({ ...f, pnl: e.target.value }))}
                />
                <button
                  type='button'
                  onClick={calcPnl}
                  className='px-2 py-1 text-xs rounded-lg whitespace-nowrap border border-gray-200 dark:border-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
                >
                  Calc
                </button>
              </div>
              <p className='text-xs text-gray-400 dark:text-gray-500 mt-1'>
                LONG: (exit - entry) × qty, SHORT: (entry - exit) × qty, then × R/R - fee
              </p>
            </div>
            <div>
              <label className={labelClass}>
                Risk/Reward <span className='text-gray-400 dark:text-gray-500'>(opt)</span>
              </label>
              <input
                type='number'
                step='any'
                placeholder='e.g. 2.5'
                className={inputClass}
                value={form.risk_reward}
                onChange={e => setForm(f => ({ ...f, risk_reward: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Notes</label>
            <textarea
              rows={3}
              placeholder='Trade notes...'
              className={inputClass}
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            />
          </div>
        </>
      )}

      {/* Daily PnL Tab */}
      {activeTab === 'daily' && (
        <>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className={labelClass}>Date</label>
              <input
                type='date'
                required
                className={inputClass}
                value={dailyForm.date}
                onChange={e => setDailyForm(f => ({ ...f, date: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelClass}>Daily PnL</label>
              <input
                type='number'
                required
                step='any'
                placeholder='0.00'
                className={inputClass}
                value={dailyForm.pnl}
                onChange={e => setDailyForm(f => ({ ...f, pnl: e.target.value }))}
              />
            </div>
          </div>
          <p className='text-xs text-gray-500 dark:text-gray-400'>
            Enter your total daily profit or loss.
          </p>
        </>
      )}

      {/* Submit buttons */}
      <div className='flex gap-3 pt-2'>
        <Button type='submit' disabled={isLoading} className='flex-1'>
          {isLoading ? 'Saving...' : 'Save'}
        </Button>
        <Button type='button' variant='secondary' onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}