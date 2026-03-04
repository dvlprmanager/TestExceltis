import { useEffect, useState } from 'react'
import { ChevronDown, ChevronRight, Plus } from 'lucide-react'
import DataTable from '@/components/DataTable'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  getHospitalesCatalog,
  getPersonasCatalog,
  getProductosCatalog,
} from '@/services/catalogos.service'
import {
  createVenta,
  getDetalleVenta,
  getNextFacturaNumber as fetchNextFacturaNumber,
  getVentas,
} from '@/services/ventas.service'

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

function VentasPage() {
  const [open, setOpen] = useState(false)
  const [ventas, setVentas] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0, totalPages: 1 })
  const [catalogos, setCatalogos] = useState({ personas: [], hospitales: [], productos: [] })
  const [detallesByVenta, setDetallesByVenta] = useState({})
  const [expandedRows, setExpandedRows] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    noFactura: '',
    fecha: getTodayDate(),
    idPersona: '',
    idHospital: '',
    productoActual: '',
    cantidadActual: '1',
    productos: [],
  })

  const totalVenta = formData.productos.reduce(
    (sum, producto) => sum + Number(producto.subtotal || 0),
    0,
  )

  useEffect(() => {
    loadInitialData()
  }, [pagination.page])

  useEffect(() => {
    if (open) {
      loadNextFacturaNumber()
    }
  }, [open])

  async function loadInitialData() {
    try {
      setLoading(true)
      setError('')

      const [ventasData, personas, hospitales, productos] = await Promise.all([
        getVentas(pagination.page, pagination.pageSize),
        getPersonasCatalog(),
        getHospitalesCatalog(),
        getProductosCatalog(),
      ])

      setVentas(ventasData.data)
      setPagination(ventasData.pagination)
      setCatalogos({ personas: personas.data, hospitales: hospitales.data, productos: productos.data })
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }

  async function loadNextFacturaNumber() {
    try {
      const data = await fetchNextFacturaNumber()
      setFormData((current) => ({
        ...current,
        noFactura: data.noFactura,
      }))
    } catch (loadError) {
      setError(loadError.message)
    }
  }

  async function toggleExpandedRow(idVenta) {
    const isExpanded = Boolean(expandedRows[idVenta])

    setExpandedRows((current) => ({
      ...current,
      [idVenta]: !isExpanded,
    }))

    if (isExpanded || detallesByVenta[idVenta]) {
      return
    }

    try {
      const data = await getDetalleVenta(idVenta)
      setDetallesByVenta((current) => ({
        ...current,
        [idVenta]: data,
      }))
    } catch (loadError) {
      setError(loadError.message)
    }
  }

  function handleHospitalChange(idHospital) {
    setFormData((current) => ({
      ...current,
      idHospital,
    }))
  }

  function handlePersonaChange(idPersona) {
    setFormData((current) => ({
      ...current,
      idPersona,
    }))
  }

  function handleAgregarProducto() {
    const selectedProduct = catalogos.productos.find(
      (item) => String(item.id) === String(formData.productoActual),
    )
    const cantidad = Number(formData.cantidadActual)

    if (!selectedProduct || !cantidad || cantidad <= 0) {
      setError('Selecciona un producto y una cantidad valida.')
      return
    }

    setError('')
    setFormData((current) => {
      const existing = current.productos.find((item) => item.idProducto === selectedProduct.id)

      if (existing) {
        return {
          ...current,
          productoActual: '',
          cantidadActual: '1',
          productos: current.productos.map((item) =>
            item.idProducto === selectedProduct.id
              ? {
                  ...item,
                  cantidad: item.cantidad + cantidad,
                  subtotal: (item.cantidad + cantidad) * item.precio,
                }
              : item,
          ),
        }
      }

      return {
        ...current,
        productoActual: '',
        cantidadActual: '1',
        productos: [
          ...current.productos,
          {
            idProducto: selectedProduct.id,
            nombre: selectedProduct.nombre,
            cantidad,
            precio: Number(selectedProduct.precio || 0),
            subtotal: Number(selectedProduct.precio || 0) * cantidad,
          },
        ],
      }
    })
  }

  function removeProducto(idProducto) {
    setFormData((current) => ({
      ...current,
      productos: current.productos.filter((item) => item.idProducto !== idProducto),
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!formData.noFactura || !formData.fecha || !formData.idPersona || !formData.idHospital || formData.productos.length === 0) {
      setError('Debes ingresar noFactura, fecha, persona, hospital y al menos un producto.')
      return
    }

    try {
      setSaving(true)
      await createVenta({
        noFactura: formData.noFactura,
        fecha: formData.fecha,
        idPersona: Number(formData.idPersona),
        idHospital: Number(formData.idHospital),
        productos: formData.productos.map((producto) => ({
          idProducto: producto.idProducto,
          cantidad: producto.cantidad,
        })),
      })

      setOpen(false)
      setFormData({
        noFactura: '',
        fecha: getTodayDate(),
        idPersona: '',
        idHospital: '',
        productoActual: '',
        cantidadActual: '1',
        productos: [],
      })
      setDetallesByVenta({})
      setExpandedRows({})
      await loadInitialData()
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setSaving(false)
    }
  }

  const ventaColumns = [
    {
      key: 'expand',
      header: '',
      className: 'w-14',
      render: (row) => (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => toggleExpandedRow(row.id)}
          className="h-8 w-8 px-0"
        >
          {expandedRows[row.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      ),
    },
    { key: 'id', header: 'ID' },
    { key: 'noFactura', header: 'No. Factura' },
    { key: 'fecha', header: 'Fecha' },
    { key: 'persona', header: 'Persona' },
    { key: 'hospital', header: 'Hospital' },
    { key: 'totalProductos', header: 'Productos', cellClassName: 'text-right' },
    {
      key: 'total',
      header: 'Total',
      cellClassName: 'text-right',
      render: (row) => formatCurrency(row.total),
    },
  ]

  return (
    <main className="px-4 py-8 md:px-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Ventas</h1>
          <p className="mt-1 text-sm text-slate-500">Listado de ventas y creacion de nuevas facturas.</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
              Agregar Venta
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-4xl">
            <form onSubmit={handleSubmit} className="grid gap-6">
              <DialogHeader>
                <DialogTitle>Agregar venta</DialogTitle>
                <DialogDescription>
                  Ingresa los datos de la factura y agrega los productos que se incluiran en la venta.
                </DialogDescription>
              </DialogHeader>

              <FieldGroup className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Field>
                  <Label htmlFor="noFactura">No. Factura</Label>
                  <Input
                    id="noFactura"
                    value={formData.noFactura}
                    readOnly
                  />
                </Field>

                <Field>
                  <Label htmlFor="fecha">Fecha</Label>
                  <Input
                    id="fecha"
                    type="date"
                    value={formData.fecha}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        fecha: event.target.value,
                      }))
                    }
                  />
                </Field>

                <Field>
                  <Label htmlFor="persona">Persona</Label>
                  <Select value={formData.idPersona} onValueChange={handlePersonaChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona una persona" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Personas</SelectLabel>
                        {catalogos.personas.map((persona) => (
                          <SelectItem key={persona.id} value={String(persona.id)}>
                            {persona.nombre}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <Label htmlFor="hospital">Hospital</Label>
                  <Select value={formData.idHospital} onValueChange={handleHospitalChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona un hospital" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Hospitales</SelectLabel>
                        {catalogos.hospitales.map((hospital) => (
                          <SelectItem key={hospital.id} value={String(hospital.id)}>
                            {hospital.nombre}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              </FieldGroup>

              <div className="border-t border-slate-200 pt-6">
                <div className="mb-4">
                  <h2 className="text-base font-semibold text-slate-900">Productos</h2>
                  <p className="text-sm text-slate-500">
                    Selecciona los productos para la factura. El precio se toma desde la tabla Producto.
                  </p>
                </div>

                <FieldGroup className="grid gap-4 md:grid-cols-[1fr_140px_160px]">
                  <Field>
                    <Label htmlFor="producto">Producto</Label>
                    <Select
                      value={formData.productoActual}
                      onValueChange={(value) =>
                        setFormData((current) => ({
                          ...current,
                          productoActual: value,
                        }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona un producto" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Productos</SelectLabel>
                          {catalogos.productos.map((producto) => (
                            <SelectItem key={producto.id} value={String(producto.id)}>
                              {producto.nombre} - {formatCurrency(producto.precio)}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <Label htmlFor="cantidad">Cantidad</Label>
                    <Input
                      id="cantidad"
                      type="number"
                      min="1"
                      value={formData.cantidadActual}
                      onChange={(event) =>
                        setFormData((current) => ({
                          ...current,
                          cantidadActual: event.target.value,
                        }))
                      }
                    />
                  </Field>

                  <Field className="self-end">
                    <Button type="button" variant="outline" onClick={handleAgregarProducto}>
                      Agregar producto
                    </Button>
                  </Field>
                </FieldGroup>

                <div className="mt-4 rounded-2xl border border-slate-200">
                  <DataTable
                    columns={[
                      { key: 'nombre', header: 'Producto' },
                      { key: 'cantidad', header: 'Cantidad' },
                      {
                        key: 'precio',
                        header: 'Precio',
                        cellClassName: 'text-right',
                        render: (row) => formatCurrency(row.precio),
                      },
                      {
                        key: 'subtotal',
                        header: 'Subtotal',
                        cellClassName: 'text-right',
                        render: (row) => formatCurrency(row.subtotal),
                      },
                      {
                        key: 'acciones',
                        header: '',
                        render: (row) => (
                          <Button variant="outline" size="sm" type="button" onClick={() => removeProducto(row.idProducto)}>
                            Quitar
                          </Button>
                        ),
                        cellClassName: 'text-right',
                      },
                    ]}
                    data={formData.productos}
                    emptyMessage="No hay productos agregados."
                  />
                </div>

                <div className="mt-4 flex flex-col items-end gap-1 text-sm">
                  <p className="text-base font-semibold text-slate-900">
                    Total factura: {formatCurrency(totalVenta)}
                  </p>
                </div>
              </div>

              {error ? <p className="text-sm text-red-600">{error}</p> : null}

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar venta'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        {loading ? (
          <p className="text-sm text-slate-500">Cargando ventas...</p>
        ) : (
          <DataTable
            columns={ventaColumns}
            data={ventas}
            caption="Listado de ventas registradas."
            emptyMessage="No hay ventas registradas."
            isRowExpanded={(row) => Boolean(expandedRows[row.id])}
            expandedColSpan={ventaColumns.length}
            renderExpandedRow={(row) => (
              <VentaDetalleAccordion
                detalle={detallesByVenta[row.id]}
                loading={!detallesByVenta[row.id]}
              />
            )}
          />
        )}
        <PaginationControls
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          onPrevious={() => setPagination((current) => ({ ...current, page: Math.max(1, current.page - 1) }))}
          onNext={() =>
            setPagination((current) => ({ ...current, page: Math.min(current.totalPages, current.page + 1) }))
          }
        />
      </div>
    </main>
  )
}

function VentaDetalleAccordion({ detalle, loading }) {
  if (loading) {
    return <div className="px-4 py-4 text-sm text-slate-500">Cargando detalle...</div>
  }

  if (!detalle || detalle.length === 0) {
    return <div className="px-4 py-4 text-sm text-slate-500">No hay productos en esta venta.</div>
  }

  const total = detalle.reduce((sum, item) => sum + Number(item.total || 0), 0)

  return (
    <div className="px-4 py-4">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Nombre de Producto</th>
              <th className="px-4 py-3 text-right font-medium">Cantidad</th>
              <th className="px-4 py-3 text-right font-medium">Precio</th>
              <th className="px-4 py-3 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {detalle.map((item) => (
              <tr key={item.id} className="border-t border-slate-200">
                <td className="px-4 py-3 text-slate-900">{item.nombreProducto}</td>
                <td className="px-4 py-3 text-right text-slate-900">{item.cantidad}</td>
                <td className="px-4 py-3 text-right text-slate-900">{formatCurrency(item.precioUnitario)}</td>
                <td className="px-4 py-3 text-right text-slate-900">{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t border-slate-200 bg-slate-50">
            <tr>
              <td colSpan="3" className="px-4 py-3 text-right font-semibold text-slate-900">Total</td>
              <td className="px-4 py-3 text-right font-semibold text-slate-900">{formatCurrency(total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

function PaginationControls({ page, totalPages, total, onPrevious, onNext }) {
  return (
    <div className="mt-4 flex items-center justify-between gap-4">
      <p className="text-sm text-slate-500">Total registros: {total}</p>
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onPrevious} disabled={page <= 1}>
          Anterior
        </Button>
        <span className="text-sm text-slate-600">
          Pagina {page} de {totalPages}
        </span>
        <Button type="button" variant="outline" size="sm" onClick={onNext} disabled={page >= totalPages}>
          Siguiente
        </Button>
      </div>
    </div>
  )
}

export default VentasPage
