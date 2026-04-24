'use client'
import { useState } from 'react'
import { DailySummary } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { formatCurrency } from '@/lib/utils'

interface CalendarViewProps {
  summaries: DailySummary[]
}

export function CalendarView({ summaries }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<DailySummary | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const summaryMap = new Map(summaries.map(s => [s.date, s]))

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const today = new Date().toISOString().split('T')[0]

  function getDayClassName(summary: DailySummary | undefined, isToday: boolean): string {
    const hasTrades = summary && !summary.no_trade && summary.trades.length > 0
    const isNoTrade = summary?.no_trade

    return [
      'min-h-[60px] p-1.5 rounded-lg text-xs flex flex-col transition-all',
      summary ? 'cursor-pointer hover:opacity-90' : '',
      isToday ? 'ring-2 ring-blue-500' : '',
      hasTrades && summary.pnl > 0 ? 'bg-emerald-50 border border-emerald-200 dark:bg-emerald-900/25 dark:border-emerald-800' : '',
      hasTrades && summary.pnl < 0 ? 'bg-red-50 border border-red-200 dark:bg-red-900/25 dark:border-red-800' : '',
      hasTrades && summary.pnl === 0 ? 'bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700' : '',
      isNoTrade ? 'bg-gray-50 border border-dashed border-gray-300 dark:bg-gray-800 dark:border-gray-600' : '',
      !summary ? 'bg-white border border-gray-100 dark:bg-gray-900 dark:border-gray-800' : '',
    ].filter(Boolean).join(' ')
  }

  return (
    <div>
      <div className='flex items-center justify-between mb-4'>
        <button
          onClick={prevMonth}
          className='p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-700 dark:text-gray-200'
        >
          <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
          </svg>
        </button>

        <h3 className='font-semibold text-gray-900 dark:text-gray-100'>{monthName}</h3>

        <button
          onClick={nextMonth}
          className='p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-700 dark:text-gray-200'
        >
          <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
          </svg>
        </button>
      </div>

      <div className='grid grid-cols-7 mb-2'>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className='text-center text-xs font-medium text-gray-400 dark:text-gray-500 py-2'>
            {d}
          </div>
        ))}
      </div>

      <div className='grid grid-cols-7 gap-1'>
        {[...Array(firstDay)].map((_, i) => <div key={'empty-' + i} />)}
        {[...Array(daysInMonth)].map((_, i) => {
          const day = i + 1
          const dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0')
          const summary = summaryMap.get(dateStr)
          const isToday = dateStr === today
          const hasTrades = summary && !summary.no_trade && summary.trades.length > 0
          const isNoTrade = summary?.no_trade

          return (
            <div
              key={day}
              onClick={() => summary && setSelectedDay(summary)}
              className={getDayClassName(summary, isToday)}
            >
              <span className={'font-medium ' + (isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200')}>
                {day}
              </span>

              {hasTrades && (
                <span className={'mt-auto font-semibold ' + (summary.pnl >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400')}>
                  {summary.pnl >= 0 ? '+' : ''}
                  {formatCurrency(summary.pnl)}
                </span>
              )}

              {isNoTrade && (
                <span className='mt-auto text-gray-400 dark:text-gray-500 italic text-[10px]'>
                  No Trade
                </span>
              )}
            </div>
          )
        })}
      </div>

      <Modal
        isOpen={!!selectedDay}
        onClose={() => setSelectedDay(null)}
        title={selectedDay ? 'Trades - ' + selectedDay.date : ''}
      >
        {selectedDay && (
          <div>
            {selectedDay.no_trade ? (
              <p className='text-gray-500 dark:text-gray-400 text-sm'>No trade recorded for this day.</p>
            ) : selectedDay.trades.length === 0 ? (
              <p className='text-gray-500 dark:text-gray-400 text-sm'>No trades found.</p>
            ) : (
              <div className='space-y-3'>
                <div className='flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-800'>
                  <span className='text-sm text-gray-500 dark:text-gray-400'>
                    {selectedDay.trades.length} trade{selectedDay.trades.length !== 1 ? 's' : ''}
                  </span>
                  <span className={'font-semibold ' + (selectedDay.pnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400')}>
                    Total: {formatCurrency(selectedDay.pnl)}
                  </span>
                </div>

                {selectedDay.trades.map(trade => (
                  <div key={trade.id} className='bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-1 border border-gray-100 dark:border-gray-700'>
                    <div className='flex justify-between'>
                      <span className='font-medium text-gray-900 dark:text-gray-100'>{trade.asset}</span>
                      <span className={'font-semibold ' + (trade.pnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400')}>
                        {trade.pnl >= 0 ? '+' : ''}
                        {formatCurrency(trade.pnl)}
                      </span>
                    </div>
                    <div className='text-xs text-gray-500 dark:text-gray-400'>
                      Entry: {formatCurrency(trade.entry_price)} - Exit: {formatCurrency(trade.exit_price)}
                    </div>
                    {trade.risk_reward != null && (
                      <div className='text-xs text-gray-500 dark:text-gray-400'>R/R: {trade.risk_reward.toFixed(2)}</div>
                    )}
                    {trade.notes && (
                      <div className='text-xs text-gray-600 dark:text-gray-300 mt-1 italic'>&quot;{trade.notes}&quot;</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}