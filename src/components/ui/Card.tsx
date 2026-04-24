import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6',
        className
      )}
    >
      {children}
    </div>
  )
}

