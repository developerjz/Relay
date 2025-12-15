import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
          variant === 'primary' && 'bg-linkedin text-white hover:bg-linkedin/90',
          variant === 'secondary' && 'bg-gray-200 text-gray-900 hover:bg-gray-300',
          variant === 'outline' && 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50',
          className
        )}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'
