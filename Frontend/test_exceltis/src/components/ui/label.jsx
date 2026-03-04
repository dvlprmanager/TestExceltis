import * as React from 'react'
import { cn } from '@/lib/utils'

function Label({ className, ...props }) {
  return <label className={cn('text-sm font-medium text-slate-900', className)} {...props} />
}

export { Label }
