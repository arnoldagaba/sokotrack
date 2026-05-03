/** biome-ignore-all lint/suspicious/noArrayIndexKey: For simplicity */

import {
    type ColumnDef,
    type ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type RowSelectionState,
    type SortingState,
    useReactTable,
    type VisibilityState,
} from "@tanstack/react-table";
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronsLeftIcon,
    ChevronsRightIcon,
} from "lucide-react";
import { useState } from "react";
import { Button } from "#/components/ui/button.tsx";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu.tsx";
import { Input } from "#/components/ui/input.tsx";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "#/components/ui/select.tsx";
import { Skeleton } from "#/components/ui/skeleton.tsx";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "#/components/ui/table.tsx";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    isLoading?: boolean;
    total: number;
}

const UserTable = <TData, TValue>({
    columns,
    data,
    total,
    isLoading = false,
}: DataTableProps<TData, TValue>) => {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
        {}
    );
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

    const table = useReactTable({
        columns,
        data,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        manualPagination: true,
        pageCount: Math.ceil(total / 10),
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });

    const PAGE_SIZE_OPTIONS = [10, 20, 25, 30, 40, 50] as const;

    return (
        <div>
            <div className="flex items-center justify-between gap-2 py-4">
                <Input
                    aria-label="Filter by email"
                    className="max-w-sm"
                    onChange={(event) =>
                        table
                            .getColumn("email")
                            ?.setFilterValue(event.target.value)
                    }
                    placeholder="Filter emails..."
                    value={
                        (table
                            .getColumn("email")
                            ?.getFilterValue() as string) ?? ""
                    }
                />

                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <Button className="ml-auto" variant="outline">
                                Filters
                            </Button>
                        }
                    />
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => (
                                <DropdownMenuCheckboxItem
                                    checked={column.getIsVisible()}
                                    className="capitalize"
                                    key={column.id}
                                    onCheckedChange={(value) =>
                                        column.toggleVisibility(!!value)
                                    }
                                >
                                    {column.id}
                                </DropdownMenuCheckboxItem>
                            ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef
                                                      .header,
                                                  header.getContext()
                                              )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {isLoading &&
const PAGE_SIZE_OPTIONS = [10, 20, 25, 30, 40, 50] as const;
const skeletonRowCount = table.getState().pagination.pageSize;
const visibleColumnCount = table.getVisibleLeafColumns().length;

...

                            Array.from({ length: skeletonRowCount }).map((_, i) => (
                                <TableRow key={`skeleton-${i}`}>
                                    {Array.from({ length: visibleColumnCount }).map((_, j) => (
                                        <TableCell
                                            key={`skeleton-cell-${j}`}
                                        >
                                            <Skeleton className="h-4 w-full" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        {!isLoading &&
                            table.getRowModel().rows.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        className="h-24 text-center"
                                        colSpan={visibleColumnCount}
                                    >
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        {!isLoading &&
                            table.getRowModel().rows.length > 0 &&
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    data-state={
                                        row.getIsSelected() && "selected"
                                    }
                                    key={row.id}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </div>

            <div className="mt-2 flex items-center justify-between px-2">
                {table.getFilteredSelectedRowModel().rows.length > 0 && (
                    <div className="flex-1 text-muted-foreground text-sm">
                        {table.getFilteredSelectedRowModel().rows.length} of{" "}
                        {table.getFilteredRowModel().rows.length} row(s)
                        selected.
                    </div>
                )}

                <div className="flex items-center space-x-6 lg:space-x-8">
                    <div className="flex items-center space-x-2">
                        <p className="font-medium text-sm">Rows per page</p>

                        <Select
                            onValueChange={(value) => {
                                table.setPageSize(Number(value));
                            }}
                            value={`${table.getState().pagination.pageSize}`}
                        >
                            <SelectTrigger className="h-8 w-17.5">
                                <SelectValue
                                    placeholder={
                                        table.getState().pagination.pageSize
                                    }
                                />
                            </SelectTrigger>

                            <SelectContent side="top">
                                {PAGE_SIZE_OPTIONS.map((pageSize) => (
                                    <SelectItem
                                        key={pageSize}
                                        value={`${pageSize}`}
                                    >
                                        {pageSize}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex w-25 items-center justify-center font-medium text-sm">
                        Page {table.getState().pagination.pageIndex + 1} of{" "}
                        {table.getPageCount()}
                    </div>

                    <div className="flex items-center space-x-2">
                        <Button
                            className="hidden size-8 lg:flex"
                            disabled={!table.getCanPreviousPage()}
                            onClick={() => table.setPageIndex(0)}
                            size="icon"
                            variant="outline"
                        >
                            <span className="sr-only">Go to first page</span>
                            <ChevronsLeftIcon />
                        </Button>

                        <Button
                            className="size-8"
                            disabled={!table.getCanPreviousPage()}
                            onClick={() => table.previousPage()}
                            size="icon"
                            variant="outline"
                        >
                            <span className="sr-only">Go to previous page</span>
                            <ChevronLeftIcon />
                        </Button>

                        <Button
                            className="size-8"
                            disabled={!table.getCanNextPage()}
                            onClick={() => table.nextPage()}
                            size="icon"
                            variant="outline"
                        >
                            <span className="sr-only">Go to next page</span>
                            <ChevronRightIcon />
                        </Button>

                        <Button
                            className="hidden size-8 lg:flex"
                            disabled={!table.getCanNextPage()}
                            onClick={() =>
                                table.setPageIndex(table.getPageCount() - 1)
                            }
                            size="icon"
                            variant="outline"
                        >
                            <span className="sr-only">Go to last page</span>
                            <ChevronsRightIcon />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserTable;
