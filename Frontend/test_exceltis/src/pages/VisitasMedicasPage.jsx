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
import { getHospitalesCatalog, getPersonasCatalog } from '@/services/catalogos.service'
import { createVisita, getDetalleVisita, getInventarioPersona, getVisitas } from '@/services/visitas.service'

function formatCurrency(value) {
  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
    minimumFractionDigits: 2,
  }).format(Number(value || 0))
}

function VisitasMedicasPage() {
  const [open, setOpen] = useState(false)
  const [visitas, setVisitas] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0, totalPages: 1 })
  const [catalogos, setCatalogos] = useState({ personas: [], hospitales: [] })
  const [inventario, setInventario] = useState([])
  const [detallesByVisita, setDetallesByVisita] = useState({})
  const [expandedRows, setExpandedRows] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    idPersona: '',
    idHospital: '',
    productoActual: '',
    cantidadActual: '1',
    productos: [],
  })

  useEffect(() => {
    loadInitialData()
  }, [pagination.page])

  useEffect(() => {
    if (!formData.idPersona) {
      setInventario([])
      setFormData((current) => ({
        ...current,
        productoActual: '',
        productos: [],
      }))
      return
    }

    loadInventario(formData.idPersona)
  }, [formData.idPersona])

  async function loadInitialData() {
    try {
      setLoading(true)
      setError('')

      const [visitasData, personas, hospitales] = await Promise.all([
        getVisitas(pagination.page, pagination.pageSize),
        getPersonasCatalog(),
        getHospitalesCatalog(),
      ])

      setVisitas(visitasData.data)
      setPagination(visitasData.pagination)
      setCatalogos({ personas: personas.data, hospitales: hospitales.data })
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }

  async function loadInventario(idPersona) {
    try {
      const data = await getInventarioPersona(idPersona)
      setInventario(data)
    } catch (loadError) {
      setInventario([])
      setError(loadError.message)
    }
  }

  async function toggleExpandedRow(idVisita) {
    const isExpanded = Boolean(expandedRows[idVisita])

    setExpandedRows((current) => ({
      ...current,
      [idVisita]: !isExpanded,
    }))

    if (isExpanded || detallesByVisita[idVisita]) {
      return
    }

    try {
      const data = await getDetalleVisita(idVisita)
      setDetallesByVisita((current) => ({
        ...current,
        [idVisita]: data,
      }))
    } catch (loadError) {
      setError(loadError.message)
    }
  }

  function handlePersonaChange(idPersona) {
    setFormData({
      idPersona,
      idHospital: '',
      productoActual: '',
      cantidadActual: '1',
      productos: [],
    })
  }

  function handleHospitalChange(idHospital) {
    setFormData((current) => ({
      ...current,
      idHospital,
    }))
  }

  function handleCantidadActualChange(event) {
    setFormData((current) => ({
      ...current,
      cantidadActual: event.target.value,
    }))
  }

  function handleAgregarProducto() {
    const selectedInventory = inventario.find(
      (item) => String(item.idProducto) === String(formData.productoActual),
    )
    const cantidad = Number(formData.cantidadActual)

    if (!selectedInventory || !cantidad || cantidad <= 0) {
      setError('Selecciona un producto y una cantidad valida.')
      return
    }

    const productoExistente = formData.productos.find(
      (item) => item.idProducto === selectedInventory.idProducto,
    )
    const cantidadUsada = productoExistente ? productoExistente.cantidad : 0
    const disponibleReal = selectedInventory.cantidad - cantidadUsada

    if (cantidad > disponibleReal) {
      setError('La cantidad supera lo disponible en inventario.')
      return
    }

    setError('')
    setFormData((current) => {
      const existing = current.productos.find(
        (item) => item.idProducto === selectedInventory.idProducto,
      )

      if (existing) {
        return {
          ...current,
          productoActual: '',
          cantidadActual: '1',
          productos: current.productos.map((item) =>
            item.idProducto === selectedInventory.idProducto
              ? { ...item, cantidad: item.cantidad + cantidad }
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
            idProducto: selectedInventory.idProducto,
            nombre: selectedInventory.nombre,
            cantidad,
            disponible: selectedInventory.cantidad,
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

    if (!formData.idPersona || !formData.idHospital || formData.productos.length === 0) {
      setError('Debes seleccionar persona, hospital y al menos un producto.')
      return
    }

    try {
      setSaving(true)
      await createVisita({
        idPersona: Number(formData.idPersona),
        idHospital: Number(formData.idHospital),
        productos: formData.productos.map((producto) => ({
          idProducto: producto.idProducto,
          cantidad: producto.cantidad,
        })),
      })

      setOpen(false)
      setFormData({
        idPersona: '',
        idHospital: '',
        productoActual: '',
        cantidadActual: '1',
        productos: [],
      })
      setInventario([])
      setDetallesByVisita({})
      setExpandedRows({})
      await loadInitialData()
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setSaving(false)
    }
  }

  const visitColumns = [
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
    { key: 'persona', header: 'Persona' },
    { key: 'hospital', header: 'Hospital' },
    { key: 'totalProductos', header: 'Productos', cellClassName: 'text-right' },
  ]

  return (
    <main className="px-4 py-8 md:px-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Visitas Medicas</h1>
          <p className="mt-1 text-sm text-slate-500">Listado de registros y creacion de nuevas visitas.</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
              Agregar Visita medica
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-2xl">
            <form onSubmit={handleSubmit} className="grid gap-6">
              <DialogHeader>
                <DialogTitle>Agregar visita medica</DialogTitle>
                <DialogDescription>
                  Selecciona persona y hospital. Luego agrega productos desde el inventario disponible de la persona.
                </DialogDescription>
              </DialogHeader>

              <FieldGroup className="grid gap-4 md:grid-cols-2">
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
                    Solo se muestran productos existentes en la tabla InventarioPersona de la persona seleccionada.
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
                      disabled={!formData.idPersona || inventario.length === 0}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona un producto" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Inventario disponible</SelectLabel>
                          {inventario.map((producto) => (
                            <SelectItem key={producto.idInventarioPersona} value={String(producto.idProducto)}>
                              {producto.nombre} - Disponible: {producto.cantidad}
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
                      onChange={handleCantidadActualChange}
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
                      { key: 'cantidad', header: 'Cantidad a usar' },
                      { key: 'disponible', header: 'Disponible' },
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
              </div>

              {error ? <p className="text-sm text-red-600">{error}</p> : null}

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar visita'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        {loading ? (
          <p className="text-sm text-slate-500">Cargando visitas...</p>
        ) : (
          <DataTable
            columns={visitColumns}
            data={visitas}
            caption="Listado de visitas medicas registradas."
            emptyMessage="No hay visitas medicas registradas."
            isRowExpanded={(row) => Boolean(expandedRows[row.id])}
            expandedColSpan={visitColumns.length}
            renderExpandedRow={(row) => (
              <VisitaDetalleAccordion
                detalle={detallesByVisita[row.id]}
                loading={!detallesByVisita[row.id]}
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

function VisitaDetalleAccordion({ detalle, loading }) {
  if (loading) {
    return <div className="px-4 py-4 text-sm text-slate-500">Cargando detalle...</div>
  }

  if (!detalle || detalle.length === 0) {
    return <div className="px-4 py-4 text-sm text-slate-500">No hay productos en esta visita.</div>
  }

  return (
    <div className="px-4 py-4">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Nombre de Producto</th>
              <th className="px-4 py-3 text-right font-medium">Cantidad</th>
              <th className="px-4 py-3 text-right font-medium">Precio</th>
            </tr>
          </thead>
          <tbody>
            {detalle.map((item) => (
              <tr key={item.id} className="border-t border-slate-200">
                <td className="px-4 py-3 text-slate-900">{item.nombreProducto}</td>
                <td className="px-4 py-3 text-right text-slate-900">{item.cantidad}</td>
                <td className="px-4 py-3 text-right text-slate-900">{formatCurrency(item.precio)}</td>
              </tr>
            ))}
          </tbody>
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

export default VisitasMedicasPage
