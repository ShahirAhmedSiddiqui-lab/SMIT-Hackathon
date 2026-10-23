"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";

type EmployeeRow = { id: string; employeeCode: string; name: string; email: string; department?: string; designation: string; status: string; employmentType: string; joinDate: string; basicSalary: number };
const columnHelper = createColumnHelper<object, EmployeeRow>();

export function EmployeeTable({ employees, canEdit, onEdit }: { employees: EmployeeRow[]; canEdit: boolean; onEdit: (employee: EmployeeRow) => void }) {
  const columns = [
    columnHelper.accessor("name", { header: "Name", cell: (info) => <strong>{info.getValue()}</strong> }),
    columnHelper.accessor("employeeCode", { header: "Employee code" }),
    columnHelper.accessor("designation", { header: "Designation" }),
    columnHelper.accessor("department", { header: "Department", cell: (info) => info.getValue() || "—" }),
    columnHelper.accessor("email", { header: "Email" }),
    columnHelper.accessor("status", { header: "Status", cell: (info) => <span className="status-pill">{info.getValue()}</span> }),
    ...(canEdit ? [columnHelper.display({ id: "actions", header: "Actions", cell: (info) => <button type="button" onClick={() => onEdit(info.row.original)}>Edit</button> })] : []),
  ] as unknown as DataTableColumn<EmployeeRow>[];
  return <DataTable columns={columns} data={employees} caption="Employee directory" />;
}
