import * as React from 'react'
import { TrendingUp } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, LabelList, Pie, PieChart, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Input } from '@/components/ui/input'
import DataTable from '@/components/DataTable'
import { getDashboard } from '@/services/dashboard.service'

const pieColors = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)']

const pieChartConfig = {
  visitas: {
    label: 'Visitas',
  },
  hospital_1: {
    label: 'Hospital 1',
    color: 'var(--chart-1)',
  },
  hospital_2: {
    label: 'Hospital 2',
    color: 'var(--chart-2)',
  },
  hospital_3: {
    label: 'Hospital 3',
    color: 'var(--chart-3)',
  },
  hospital_4: {
    label: 'Hospital 4',
    color: 'var(--chart-4)',
  },
  hospital_5: {
    label: 'Hospital 5',
    color: 'var(--chart-5)',
  },
}

const bonusChartConfig = {
  valor: {
    label: 'Valor',
  },
  meta: {
    label: 'Meta',
    color: 'var(--chart-3)',
  },
  ventaReal: {
    label: 'Venta real',
    color: 'var(--chart-1)',
  },
}

const hospitalBarChartConfig = {
  activities: {
    label: 'Actividades',
  },
  visitas: {
    label: 'Visitas',
    color: 'var(--chart-1)',
  },
  facturas: {
    label: 'Facturas',
    color: 'var(--chart-2)',
  },
}

const salesCountryChartConfig = {
  ventas: {
    label: 'Ventas',
  },
  country_1: {
    label: 'Pais 1',
    color: 'var(--chart-1)',
  },
  country_2: {
    label: 'Pais 2',
    color: 'var(--chart-2)',
  },
  country_3: {
    label: 'Pais 3',
    color: 'var(--chart-3)',
  },
  country_4: {
    label: 'Pais 4',
    color: 'var(--chart-4)',
  },
  country_5: {
    label: 'Pais 5',
    color: 'var(--chart-5)',
  },
}

function formatCurrency(value) {
  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
    minimumFractionDigits: 2,
  }).format(Number(value || 0))
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10)
}

function getDefaultStartDate() {
  const current = new Date()
  current.setDate(current.getDate() - 89)
  return current.toISOString().slice(0, 10)
}

function getBonusRate(compliance) {
  if (compliance < 80) return 0
  if (compliance < 100) return 0.03
  if (compliance <= 115) return 0.06
  return 0.08
}

function getBonusLabel(compliance) {
  if (compliance < 80) return 'Cumplimiento menor a 80%'
  if (compliance < 100) return 'Cumplimiento entre 80% y 99%'
  if (compliance <= 115) return 'Cumplimiento entre 100% y 115%'
  return 'Cumplimiento superior a 115%'
}

function DashboardPage() {
  const [dashboard, setDashboard] = React.useState({
    summary: { totalVisitas: 0, ventasRango: 0, totalVentas: 0 },
    filters: { dateFrom: getDefaultStartDate(), dateTo: getTodayDate() },
    pieData: [],
    bonusByPerson: [],
    salesByCountry: [],
    trendData: [],
  })
  const [goal, setGoal] = React.useState(50000)
  const [dateFrom, setDateFrom] = React.useState(getDefaultStartDate())
  const [dateTo, setDateTo] = React.useState(getTodayDate())
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    loadDashboard()
  }, [dateFrom, dateTo])

  async function loadDashboard() {
    try {
      setLoading(true)
      setError('')

      const data = await getDashboard({ dateFrom, dateTo })
      setDashboard(data)
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }

  const pieData = dashboard.pieData.map((item, index) => ({
    ...item,
    fill: pieColors[index % pieColors.length],
  }))

  const salesByCountryData = dashboard.salesByCountry.map((item, index) => ({
    ...item,
    fill: pieColors[index % pieColors.length],
  }))

  const bonusRows = dashboard.bonusByPerson.map((item) => {
    const personCompliance = goal > 0 ? (item.ventaReal / goal) * 100 : 0
    const personBonusRate = getBonusRate(personCompliance)

    return {
      ...item,
      cumplimiento: personCompliance,
      bonoRate: personBonusRate,
      bono: item.ventaReal * personBonusRate,
    }
  })

  const bonusChartData = bonusRows.slice(0, 8).map((item) => ({
    persona: item.persona,
    ventaReal: item.ventaReal,
    fill: 'var(--chart-1)',
  }))

  const hospitalColumns = [
    { key: 'hospital', header: 'Hospital' },
    {
      key: 'visitas',
      header: 'Visitas',
      cellClassName: 'text-right',
    },
    {
      key: 'facturas',
      header: 'Facturas',
      cellClassName: 'text-right',
    },
  ]

  const bonusColumns = [
    { key: 'persona', header: 'Persona' },
    { key: 'totalFacturas', header: 'Facturas', cellClassName: 'text-right' },
    {
      key: 'ventaReal',
      header: 'Venta real',
      cellClassName: 'text-right',
      render: (row) => formatCurrency(row.ventaReal),
    },
    {
      key: 'cumplimiento',
      header: 'Cumplimiento',
      cellClassName: 'text-right',
      render: (row) => `${row.cumplimiento.toFixed(2)}%`,
    },
    {
      key: 'bono',
      header: 'Bono',
      cellClassName: 'text-right',
      render: (row) => `${formatCurrency(row.bono)} (${(row.bonoRate * 100).toFixed(0)}%)`,
    },
  ]

  return (
    <main className="px-4 py-8 md:px-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Visitas medicas, ventas del rango y calculo de bonos en una sola vista.
          </p>
        </div>

        <div className="grid w-full gap-4 md:max-w-3xl md:grid-cols-3">
          <div>
            <label htmlFor="dateFrom" className="mb-2 block text-sm font-medium text-slate-700">
              Fecha inicio
            </label>
            <Input id="dateFrom" type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
          </div>
          <div>
            <label htmlFor="dateTo" className="mb-2 block text-sm font-medium text-slate-700">
              Fecha fin
            </label>
            <Input id="dateTo" type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
          </div>
          <div>
            <label htmlFor="goal" className="mb-2 block text-sm font-medium text-slate-700">
              Meta mensual
            </label>
            <Input
              id="goal"
              type="number"
              min="0"
              value={goal}
              onChange={(event) => setGoal(Number(event.target.value || 0))}
            />
          </div>
        </div>
      </div>

      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

      {loading ? (
        <p className="text-sm text-slate-500">Cargando dashboard...</p>
      ) : (
        <div className="grid gap-6">
          <section className="grid gap-4 md:grid-cols-3">
            <Metric title="Visitas medicas" value={dashboard.summary.totalVisitas} helper="Total en el rango" />
            <Metric title="Ventas" value={formatCurrency(dashboard.summary.ventasRango)} helper="Venta real del rango" />
            <Metric title="Facturas" value={dashboard.summary.totalVentas} helper="Total en el rango" />
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <Card className="flex h-[760px] flex-col">
              <CardHeader className="items-center pb-0">
                <CardTitle>Visitas medicas por hospital</CardTitle>
                <CardDescription>Distribucion dentro del rango seleccionado</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col overflow-hidden pb-0">
                <ChartContainer config={pieChartConfig} className="mx-auto aspect-square max-h-[320px] shrink-0">
                  <PieChart>
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <Pie data={pieData} dataKey="visitas" nameKey="hospital">
                      {pieData.map((entry) => (
                        <Cell key={entry.hospital} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
                <div className="mt-6 min-h-0 flex-1 overflow-y-auto">
                  <DataTable
                    columns={hospitalColumns}
                    data={dashboard.pieData}
                    emptyMessage="No hay hospitales con visitas en el rango seleccionado."
                  />
                </div>
              </CardContent>
              <div className="px-6 pb-6 pt-2 text-sm text-slate-500">
                Total hospitales con visitas: {dashboard.pieData.length}
              </div>
            </Card>

            <Card className="flex h-[760px] flex-col">
              <CardHeader className="pb-2">
                <CardTitle>Bono mensual por persona</CardTitle>
                <CardDescription>Meta aplicada individualmente a la venta real de cada persona</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-6 overflow-hidden">
                <ChartContainer config={bonusChartConfig} className="h-[260px] w-full shrink-0">
                  <BarChart data={bonusChartData} layout="vertical" margin={{ left: 12, right: 12 }}>
                    <CartesianGrid horizontal={false} />
                    <YAxis type="category" dataKey="persona" tickLine={false} axisLine={false} width={130} />
                    <XAxis type="number" tickLine={false} axisLine={false} hide />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel formatter={(value) => formatCurrency(value)} />}
                    />
                    <Bar dataKey="ventaReal" radius={10}>
                      {bonusChartData.map((entry) => (
                        <Cell key={entry.persona} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>

                <div className="grid gap-2 text-sm">
                  <p className="text-slate-600">
                    Meta por persona:
                    <span className="ml-2 font-semibold text-slate-900">{formatCurrency(goal)}</span>
                  </p>
                  <p className="text-slate-600">Reglas: menor a 80% = 0%, 80-99% = 3%, 100-115% = 6%, mayor a 115% = 8%</p>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto">
                  <DataTable
                    columns={bonusColumns}
                    data={bonusRows}
                    emptyMessage="No hay personas con facturas en el rango seleccionado."
                  />
                </div>
              </CardContent>
            </Card>
          </section>

          <Card>
            <CardHeader>
              <CardTitle>Hospitales con visitas y facturas</CardTitle>
              <CardDescription>Comparativo de actividad comercial y médica por hospital</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={hospitalBarChartConfig} className="h-[380px] w-full">
                <BarChart data={dashboard.pieData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="hospital"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    interval={0}
                    angle={-18}
                    textAnchor="end"
                    height={90}
                    tickFormatter={(value) => value.slice(0, 20)}
                  />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                  <Bar
                    dataKey="visitas"
                    name="Visitas"
                    stackId="a"
                    fill="var(--color-visitas)"
                    radius={[0, 0, 4, 4]}
                  />
                  <Bar
                    dataKey="facturas"
                    name="Facturas"
                    stackId="a"
                    fill="var(--color-facturas)"
                    radius={[4, 4, 0, 0]}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        labelKey="activities"
                        indicator="line"
                        labelFormatter={(value, payload) => payload?.[0]?.payload?.hospital ?? value}
                      />
                    }
                    cursor={false}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
              <CardTitle>Ventas por pais</CardTitle>
              <CardDescription>Distribucion de ventas dentro del rango seleccionado</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              <ChartContainer
                config={salesCountryChartConfig}
                className="mx-auto aspect-square max-h-[320px] [&_.recharts-text]:fill-white"
              >
                <PieChart>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        hideLabel
                        formatter={(value) => formatCurrency(value)}
                      />
                    }
                  />
                  <Pie data={salesByCountryData} dataKey="ventas" nameKey="pais">
                    {salesByCountryData.map((entry) => (
                      <Cell key={entry.pais} fill={entry.fill} />
                    ))}
                    <LabelList
                      dataKey="pais"
                      fill="white"
                      stroke="none"
                      fontSize={12}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
            </CardContent>
            <div className="flex flex-col gap-2 px-6 pb-6 pt-2 text-sm">
              <div className="flex items-center gap-2 leading-none font-medium text-slate-800">
                Ventas acumuladas por pais <TrendingUp className="h-4 w-4" />
              </div>
              <div className="leading-none text-slate-500">
                Total paises con ventas: {dashboard.salesByCountry.length}
              </div>
            </div>
          </Card>

        </div>
      )}
    </main>
  )
}

function Metric({ title, value, helper }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{helper}</p>
    </div>
  )
}

export default DashboardPage
