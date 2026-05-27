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
  isLoading,
  emptyTitle = "No data found",
  emptyDescription
}: {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowKey: (row: T) => string;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (isLoading) {
    return (
      <div className="space-y-2 rounded-lg border bg-white p-4">
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
    <div className="rounded-lg border bg-white">
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
            <TableRow key={getRowKey(row)}>
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
