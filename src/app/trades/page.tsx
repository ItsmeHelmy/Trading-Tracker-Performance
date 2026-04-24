'use client'
import { useState, useEffect } from 'react'
import { Trade } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { TradeForm } from '@/components/TradeForm'
import { TradeTable } from '@/components/TradeTable'

export default function TradesPage() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editTrade, setEditTrade] = useState<Trade | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showNoTrade, setShowNoTrade] = useState(false)
  const [noTradeDate, setNoTradeDate] = useState(new Date().toISOString().split('T')[0])

  const fetchTrades = async () => {
    const res = await fetch('/api/trades')
    const data = await res.json()
    setTrades(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchTrades()
  }, [])

  const handleCreate = async (data: Omit<Trade, 'id' | 'createdAt'>) => {
    setSubmitting(true)
    await fetch('/api/trades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    await fetchTrades()
    setShowForm(false)
    setSubmitting(false)
  }

  const handleUpdate = async (data: Omit<Trade, 'id' | 'createdAt'>) => {
    if (!editTrade) return
    setSubmitting(true)
    await fetch('/api/trades/' + editTrade.id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    await fetchTrades()
    setEditTrade(null)
    setSubmitting(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this trade?')) return
    await fetch('/api/trades/' + id, { method: 'DELETE' })
    await fetchTrades()
  }

  const handleNoTrade = async () => {
    await fetch('/api/daily-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: noTradeDate, no_trade: true }),
    })
    setShowNoTrade(false)
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-gray-100'>Trades</h1>
          <p className='text-gray-500 dark:text-gray-400 mt-1'>Manage your trading journal</p>
        </div>
        <div className='flex gap-3'>
          <Button variant='secondary' onClick={() => setShowNoTrade(true)}>
            Mark No Trade
          </Button>
          <Button onClick={() => setShowForm(true)}>+ Add Trade</Button>
        </div>
      </div>

      <Card className='p-0'>
        {loading ? (
          <div className='p-6 space-y-3'>
            {[...Array(3)].map((_, i) => (
              <div key={i} className='animate-pulse bg-gray-100 dark:bg-gray-800 h-10 rounded-lg' />
            ))}
          </div>
        ) : (
          <TradeTable trades={trades} onEdit={setEditTrade} onDelete={handleDelete} />
        )}
      </Card>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title='Add New Trade'>
        <TradeForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} isLoading={submitting} />
      </Modal>

      <Modal isOpen={!!editTrade} onClose={() => setEditTrade(null)} title='Edit Trade'>
        {editTrade && (
          <TradeForm
            initialData={editTrade}
            onSubmit={handleUpdate}
            onCancel={() => setEditTrade(null)}
            isLoading={submitting}
          />
        )}
      </Modal>

      <Modal isOpen={showNoTrade} onClose={() => setShowNoTrade(false)} title='Mark No Trade Day'>
        <div className='space-y-4'>
          <p className='text-sm text-gray-600 dark:text-gray-300'>Record a day where you chose not to trade.</p>
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1'>Date</label>
            <input
              type='date'
              value={noTradeDate}
              onChange={e => setNoTradeDate(e.target.value)}
              className='w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
          <div className='flex gap-3'>
            <Button className='flex-1' onClick={handleNoTrade}>
              Confirm
            </Button>
            <Button variant='secondary' onClick={() => setShowNoTrade(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}