import * as React from 'react'
import { cn } from '@/lib/utils'

function Table({ className, ...props }) {
  return (
    <div className="relative w-full overflow-x-auto">
      <table className={cn('w-full caption-bottom text-sm', className)} {...props} />
    </div>
  )
}

function TableHeader({ className, ...props }) {
  return <thead className={cn('[&_tr]:border-b', className)} {...props} />
}

function TableBody({ className, ...props }) {
  return <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} />
}

function TableFooter({ className, ...props }) {
  return <tfoot className={cn('border-t bg-slate-50/70 font-medium [&>tr]:last:border-b-0', className)} {...props} />
}

function TableRow({ className, ...props }) {
  return <tr className={cn('border-b border-slate-200 transition-colors hover:bg-slate-50/70', className)} {...props} />
}

function TableHead({ className, ...props }) {
  return (
    <th
      className={cn('h-11 px-4 text-left align-middle font-medium text-slate-500 [&:has([role=checkbox])]:pr-0', className)}
      {...props}
    />
  )
}

function TableCell({ className, ...props }) {
  return <td className={cn('p-4 align-middle text-slate-900 [&:has([role=checkbox])]:pr-0', className)} {...props} />
}

function TableCaption({ className, ...props }) {
  return <caption className={cn('mt-4 text-sm text-slate-500', className)} {...props} />
}

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
}
