import { cn } from '@/lib/utils'

function FieldGroup({ className, ...props }) {
  return <div className={cn('grid gap-4', className)} {...props} />
}

function Field({ className, ...props }) {
  return <div className={cn('grid gap-2', className)} {...props} />
}

export { Field, FieldGroup }
