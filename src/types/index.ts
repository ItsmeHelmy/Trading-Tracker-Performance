export interface Trade {
  id: number
  date: string
  asset: string
  side: 'LONG' | 'SHORT'
  quantity: number
  entry_price: number
  exit_price: number
  fee: number
  pnl: number
  risk_reward?: number | null
  notes: string
  createdAt?: string
}

export interface DailyRecord {
  id: number
  date: string
  no_trade: boolean
}

export interface DailySummary {
  date: string
  pnl: number
  trades: Trade[]
  no_trade: boolean
}

export interface Stats {
  totalPnl: number
  winRate: number
  avgRiskReward: number
  totalTrades: number
  winningTrades: number
}