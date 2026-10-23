"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";

type RecordRow = Record<string, string>;
const helper = createColumnHelper<object, RecordRow>();

export function RecordTable({ rows, columns, caption }: { rows: RecordRow[]; columns: Array<{ key: string; label: string }>; caption: string }) {
  const definitions = columns.map(({ key, label }) => helper.accessor((row) => row[key] ?? "—", { id: key, header: label })) as unknown as DataTableColumn<RecordRow>[];
  return <DataTable columns={definitions} data={rows} caption={caption} />;
}
