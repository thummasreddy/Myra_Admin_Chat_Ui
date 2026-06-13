import type { ReactNode } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";

export type DataTableColumn<T> = {
  header: string;
  accessor: keyof T | ((row: T) => ReactNode);
  className?: string;
};

export function DataTable<T>({
  columns,
  data,
  getRowKey,
  onRowClick,
  isLoading,
  emptyTitle = "No data found",
  emptyDescription
}: {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (isLoading) {
    return (
      <div data-slot="data-table-loading" className="space-y-2 rounded-lg border bg-[var(--color-bg-card)] p-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!data.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div data-slot="data-table" className="rounded-lg border bg-[var(--color-bg-card)]">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.header} className={column.className}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow
              key={getRowKey(row)}
              className={onRowClick ? "cursor-pointer" : undefined}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((column) => (
                <TableCell key={column.header} className={column.className}>
                  {typeof column.accessor === "function" ? column.accessor(row) : (row[column.accessor] as ReactNode)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
