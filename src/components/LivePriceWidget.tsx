// 'use client'
// import { useState, useEffect } from 'react'
// import { Card } from '@/components/ui/Card'
// import { CandlestickChart } from '@/components/CandlestickChart'

// interface PriceData {
//   key: string
//   name: string
//   price: number | null
//   change: number | null
//   changePercent: number | null
// }

// interface HistoryPoint {
//   t: number
//   p: number
// }

// type HistoryMap = Record<string, HistoryPoint[]>

// const MAX_HISTORY_POINTS = 30

// export function LivePriceWidget() {
//   const [selectedSymbol, setSelectedSymbol] = useState('BTCUSD')
//   const [prices, setPrices] = useState<PriceData[]>([])
//   const [history, setHistory] = useState<HistoryMap>({})
//   const [loading, setLoading] = useState(true)
//   const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
//   const [error, setError] = useState(false)

//   const fetchPrices = async () => {
//     try {
//       const res = await fetch('/api/prices')
//       if (!res.ok) throw new Error()

//       const data = (await res.json()) as PriceData[]
//       if ((data as unknown as { error?: string }).error) throw new Error()

//       setPrices(data)
//       setLastUpdated(new Date())
//       setError(false)

//       setHistory(prev => {
//         const next: HistoryMap = { ...prev }
//         const now = Date.now()

//         for (const item of data) {
//           if (item.price == null) continue
//           const prevSeries = next[item.key] ?? []
//           const updated = [...prevSeries, { t: now, p: item.price }]
//           next[item.key] = updated.slice(-MAX_HISTORY_POINTS)
//         }

//         return next
//       })
//     } catch {
//       setError(true)
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//     fetchPrices()
//     const interval = setInterval(fetchPrices, 60000)
//     return () => clearInterval(interval)
//   }, [])

//   const formatPrice = (price: number | null, key: string) => {
//     if (price === null) return '—'
//     if (key === 'BTCUSD') {
//       return price.toLocaleString('en-US', {
//         minimumFractionDigits: 2,
//         maximumFractionDigits: 2,
//       })
//     }
//     return price.toFixed(2)
//   }

//   const getSparklinePath = (points: HistoryPoint[], width: number, height: number) => {
//     if (points.length < 2) return ''

//     const pricesOnly = points.map(p => p.p)
//     const min = Math.min(...pricesOnly)
//     const max = Math.max(...pricesOnly)
//     const range = max - min || 1

//     return points
//       .map((point, i) => {
//         const x = (i / (points.length - 1)) * width
//         const y = height - ((point.p - min) / range) * height
//         return (i === 0 ? 'M ' : 'L ') + x.toFixed(2) + ' ' + y.toFixed(2)
//       })
//       .join(' ')
//   }

//   return (
//     <Card className='col-span-full'>
//       <div className='flex items-center justify-between mb-4'>
//         <h3 className='font-semibold text-gray-900 dark:text-gray-100'>Live Prices</h3>
//         <div className='flex items-center gap-3'>
//           {lastUpdated && (
//             <span className='text-xs text-gray-400 dark:text-gray-500'>
//               Updated {lastUpdated.toLocaleTimeString()}
//             </span>
//           )}
//           <button
//             onClick={fetchPrices}
//             className='text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors'
//           >
//             Refresh
//           </button>
//         </div>
//       </div>

//       {loading ? (
//         <div className='grid grid-cols-2 md:grid-cols-5 gap-3'>
//           {[...Array(5)].map((_, i) => (
//             <div key={i} className='animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg h-16' />
//           ))}
//         </div>
//       ) : error ? (
//         <p className='text-sm text-gray-400 dark:text-gray-500 text-center py-4'>
//           Live prices unavailable. Check your connection.
//         </p>
//       ) : (
//         <>
//           <div className='grid grid-cols-2 md:grid-cols-5 gap-3'>
//             {prices.map(item => (
//               <div key={item.key} className='bg-gray-50 dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700'>
//                 <p className='text-xs text-gray-500 dark:text-gray-400 font-medium mb-1'>{item.key}</p>
//                 <p className='text-base font-bold text-gray-900 dark:text-gray-100'>{formatPrice(item.price, item.key)}</p>
//                 {item.change !== null && (
//                   <p
//                     className={
//                       'text-xs font-medium mt-0.5 ' +
//                       (item.change >= 0
//                         ? 'text-emerald-600 dark:text-emerald-400'
//                         : 'text-red-500 dark:text-red-400')
//                     }
//                   >
//                     {item.change >= 0 ? '▲' : '▼'} {Math.abs(item.changePercent ?? 0).toFixed(2)}%
//                   </p>
//                 )}
//               </div>
//             ))}
//           </div>

//           <div className='mt-5 pt-4 border-t border-gray-100 dark:border-gray-800'>
//             <p className='text-xs font-medium text-gray-500 dark:text-gray-400 mb-3'>
//               Session Trend (last {MAX_HISTORY_POINTS} updates)
//             </p>

//             <div className='grid grid-cols-1 md:grid-cols-5 gap-3'>
//               {prices.map(item => {
//                 const points = history[item.key] ?? []
//                 const positive = (item.change ?? 0) >= 0
//                 const stroke = positive ? '#10b981' : '#ef4444'
//                 const path = getSparklinePath(points, 180, 44)

//                 return (
//                   <div
//                     key={'spark-' + item.key}
//                     className='rounded-lg border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 p-2'
//                   >
//                     <div className='text-[11px] mb-1 text-gray-500 dark:text-gray-400'>{item.key}</div>
//                     {points.length < 2 ? (
//                       <div className='h-11 flex items-center text-[11px] text-gray-400 dark:text-gray-500'>
//                         Collecting data...
//                       </div>
//                     ) : (
//                       <svg viewBox='0 0 180 44' className='w-full h-11'>
//                         <path d={path} fill='none' stroke={stroke} strokeWidth='2' strokeLinecap='round' />
//                       </svg>
//                     )}
//                   </div>
//                 )
//               })}
//             </div>
//           </div>

//           <div className='mt-5 pt-4 border-t border-gray-100 dark:border-gray-800'>
//             <div className='flex items-center justify-between mb-3'>
//               <p className='text-xs font-medium text-gray-500 dark:text-gray-400'>
//                 Real-time Candlestick (polled)
//               </p>
//               <div className='flex flex-wrap gap-2'>
//                 {prices.map(item => (
//                   <button
//                     key={'candle-btn-' + item.key}
//                     onClick={() => setSelectedSymbol(item.key)}
//                     className={
//                       'px-2 py-1 rounded-md text-xs border transition-colors ' +
//                       (selectedSymbol === item.key
//                         ? 'bg-blue-600 text-white border-blue-600'
//                         : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800')
//                     }
//                   >
//                     {item.key}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             <CandlestickChart symbol={selectedSymbol} interval='1min' />
//           </div>
//         </>
//       )}
//     </Card>
//   )
// }