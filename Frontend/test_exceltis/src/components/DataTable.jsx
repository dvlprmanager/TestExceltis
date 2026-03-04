import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

function DataTable({
  columns,
  data,
  caption,
  emptyMessage = 'No hay registros.',
  renderExpandedRow,
  isRowExpanded,
  expandedColSpan,
}) {
  return (
    <Table>
      {caption ? <TableCaption>{caption}</TableCaption> : null}
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column.key} className={column.className}>
              {column.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={columns.length} className="text-center text-slate-500">
              {emptyMessage}
            </TableCell>
          </TableRow>
        ) : (
          data.map((row, rowIndex) => (
            <>
              <TableRow key={row.id ?? rowIndex}>
                {columns.map((column) => (
                  <TableCell key={column.key} className={column.cellClassName}>
                    {column.render ? column.render(row) : row[column.key]}
                  </TableCell>
                ))}
              </TableRow>
              {renderExpandedRow && isRowExpanded?.(row) ? (
                <TableRow key={`${row.id ?? rowIndex}-expanded`} className="bg-slate-50/60 hover:bg-slate-50/60">
                  <TableCell colSpan={expandedColSpan ?? columns.length} className="p-0">
                    {renderExpandedRow(row)}
                  </TableCell>
                </TableRow>
              ) : null}
            </>
          ))
        )}
      </TableBody>
    </Table>
  )
}

export default DataTable
