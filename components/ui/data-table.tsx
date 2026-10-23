"use client";

import { tableFeatures, useTable, type ColumnDef } from "@tanstack/react-table";
import { cn } from "@/lib/utils";

const features = tableFeatures({});
export type DataTableColumn<TData extends Record<string, unknown>> = ColumnDef<typeof features, TData, unknown>;

export function DataTable<TData extends Record<string, unknown>>({ columns, data, caption = "Data table", className }: { columns: ColumnDef<typeof features, TData, unknown>[]; data: TData[]; caption?: string; className?: string }) {
  const table = useTable<typeof features, TData>({ data, columns, features });
  return <div className={cn("data-table-wrap", className)}><table className="data-table"><caption className="sr-only">{caption}</caption><thead>{table.getHeaderGroups().map((group) => <tr key={group.id}>{group.headers.map((header) => <th key={header.id} scope="col">{header.isPlaceholder ? null : <table.FlexRender header={header} />}</th>)}</tr>)}</thead><tbody>{table.getRowModel().rows.length === 0 ? <tr><td colSpan={columns.length} className="empty-copy">No records to display.</td></tr> : table.getRowModel().rows.map((row) => <tr key={row.id}>{row.getAllCells().map((cell) => <td key={cell.id}><table.FlexRender cell={cell} /></td>)}</tr>)}</tbody></table></div>;
}
