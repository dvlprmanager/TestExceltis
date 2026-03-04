import * as React from 'react'
import {
  Legend as RechartsLegend,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts'
import { cn } from '@/lib/utils'

function ChartContainer({ config = {}, className, children }) {
  const style = Object.fromEntries(
    Object.entries(config)
      .filter(([, value]) => value?.color)
      .map(([key, value]) => [`--color-${key}`, value.color]),
  )

  return (
    <div className={cn('w-full text-sm', className)} style={style}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  )
}

const ChartTooltip = RechartsTooltip

function ChartTooltipContent({
  active,
  payload,
  label,
  hideLabel = false,
  hideIndicator = false,
  indicator = 'dot',
  labelKey,
  labelFormatter,
  formatter,
}) {
  if (!active || !payload?.length) {
    return null
  }

  const fallbackLabel = payload[0]?.payload?.[labelKey] ?? label
  const formattedLabel = labelFormatter ? labelFormatter(fallbackLabel, payload) : fallbackLabel

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg">
      {hideLabel ? null : <p className="mb-2 text-xs font-medium text-slate-500">{formattedLabel}</p>}
      <div className="space-y-1.5">
        {payload.map((item) => {
          const value = formatter ? formatter(item.value, item.name, item) : item.value

          return (
            <div key={item.dataKey} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {hideIndicator ? null : (
                  indicator === 'line' ? (
                    <span className="inline-flex h-0.5 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                  ) : (
                    <span
                      className="inline-flex h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                  )
                )}
                <span className="text-xs text-slate-500">{item.name}</span>
              </div>
              <span className="text-xs font-semibold text-slate-900">{value}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const ChartLegend = RechartsLegend

function ChartLegendContent({ payload }) {
  if (!payload?.length) {
    return null
  }

  return (
    <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
      {payload.map((item) => (
        <div key={item.value} className="flex items-center gap-2 text-xs text-slate-600">
          <span className="inline-flex h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
          <span>{item.value}</span>
        </div>
      ))}
    </div>
  )
}

export { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent }
