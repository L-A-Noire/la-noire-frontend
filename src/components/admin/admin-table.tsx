import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Edit02Icon,
  Delete02Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { toast } from "react-toastify";

interface AdminTableProps<T> {
  title: string;
  queryKey: string[];
  fetchData: () => Promise<T[]>;
  deleteData: (id: number) => Promise<void>;
  columns: {
    header: string;
    accessorKey: keyof T;
    cell?: (item: T) => React.ReactNode;
  }[];
  onEdit: (item: T) => void;
  onCreate: () => void;
  searchKey?: keyof T;
  searchFn?: (item: T, search: string) => boolean;
  searchPlaceholder?: string;
}

export function AdminTable<T extends { id: number }>({
  title,
  queryKey,
  fetchData,
  deleteData,
  columns,
  onEdit,
  onCreate,
  searchKey,
  searchFn,
  searchPlaceholder,
}: AdminTableProps<T>) {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: fetchData,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteData,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success(`${title} deleted successfully`);
    },
    onError: () => {
      toast.error(`Failed to delete ${title.toLowerCase()}`);
    },
  });

  const filteredData = data?.filter((item) => {
    if (!search) return true;
    if (searchFn) return searchFn(item, search);
    if (!searchKey) return true;
    const value = item[searchKey];
    return String(value).toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <Button onClick={onCreate}>
          <HugeiconsIcon icon={Add01Icon} className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        {(searchKey || searchFn) && (
          <div className="relative w-72">
            <HugeiconsIcon
              icon={Search01Icon}
              className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"
            />
            <Input
              placeholder={
                searchPlaceholder ||
                (searchKey ? `Search by ${String(searchKey)}...` : "Search...")
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={String(col.accessorKey)}>
                  {col.header}
                </TableHead>
              ))}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className="text-center text-destructive"
                >
                  Error loading data
                </TableCell>
              </TableRow>
            ) : filteredData?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="text-center">
                  No results found.
                </TableCell>
              </TableRow>
            ) : (
              filteredData?.map((item) => (
                <TableRow key={item.id}>
                  {columns.map((col) => (
                    <TableCell key={String(col.accessorKey)}>
                      {col.cell
                        ? col.cell(item)
                        : String(item[col.accessorKey])}
                    </TableCell>
                  ))}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(item)}
                      >
                        <HugeiconsIcon icon={Edit02Icon} className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          if (
                            confirm(
                              "Are you sure you want to delete this item?",
                            )
                          ) {
                            deleteMutation.mutate(item.id);
                          }
                        }}
                      >
                        <HugeiconsIcon
                          icon={Delete02Icon}
                          className="h-4 w-4"
                        />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
