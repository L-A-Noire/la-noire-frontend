import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Search01Icon,
  User02Icon,
  Tick02Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { getUsers, changeUserRole } from "@/api/auth";
import { getRoles } from "@/api/roles";
import type { AdminUser } from "@/api/auth";
import type { Role } from "@/types/role.type";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";

const QUERY_KEY = ["admin-users"];
const ROLES_QUERY_KEY = ["admin-roles"];

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function RoleSelect({
  user,
  roles,
  onRoleChange,
  isPending,
}: {
  user: AdminUser;
  roles: Role[];
  onRoleChange: (userId: number, roleId: number) => void;
  isPending: boolean;
}) {
  const handleChange = (value: string) => {
    const roleId = parseInt(value, 10);
    if (roleId === user.role_id) return;
    onRoleChange(user.id, roleId);
  };

  return (
    <Select
      value={String(user.role_id)}
      onValueChange={handleChange}
      disabled={isPending}
    >
      <SelectTrigger
        className={cn(
          "w-[180px] min-w-[160px] transition-all",
          isPending && "opacity-70",
        )}
      >
        <SelectValue placeholder="Select role" />
      </SelectTrigger>
      <SelectContent align="start" className="max-h-[280px]">
        {roles.map((role) => (
          <SelectItem key={role.id} value={String(role.id)}>
            <span className="flex items-center gap-2">
              {role.id === user.role_id && (
                <HugeiconsIcon
                  icon={Tick02Icon}
                  className="h-3.5 w-3.5 text-primary"
                />
              )}
              {role.title}
              {role.user_count !== undefined && (
                <span className="text-muted-foreground text-[10px]">
                  ({role.user_count})
                </span>
              )}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function TableSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 8 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-4 w-8" />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-40" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-8 w-28" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-28" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const {
    data: users,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: getUsers,
  });

  const { data: roles } = useQuery({
    queryKey: ROLES_QUERY_KEY,
    queryFn: getRoles,
  });

  const changeRoleMutation = useMutation({
    mutationFn: changeUserRole,
    onMutate: async ({ user_id, role_id }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const prev = queryClient.getQueryData<AdminUser[]>(QUERY_KEY);
      queryClient.setQueryData<AdminUser[]>(QUERY_KEY, (old) =>
        old?.map((u) =>
          u.id === user_id
            ? {
                ...u,
                role_id,
                role_title:
                  roles?.find((r) => r.id === role_id)?.title ?? u.role_title,
              }
            : u,
        ),
      );
      return { prev };
    },
    onSuccess: () => {
      toast.success("Role updated successfully");
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(QUERY_KEY, ctx.prev);
      }
      toast.error("Failed to update role");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (!search.trim()) return users;
    const s = search.toLowerCase().trim();
    return users.filter(
      (u) =>
        u.username.toLowerCase().includes(s) ||
        u.email.toLowerCase().includes(s) ||
        `${u.first_name} ${u.last_name}`.toLowerCase().includes(s) ||
        u.role_title.toLowerCase().includes(s),
    );
  }, [users, search]);

  const handleRoleChange = (userId: number, roleId: number) => {
    changeRoleMutation.mutate({ user_id: userId, role_id: roleId });
  };

  const updatingUserId = changeRoleMutation.isPending
    ? changeRoleMutation.variables?.user_id
    : null;

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            Manage users and their roles across the system
          </p>
        </div>
      </div>

      <div className="relative w-full max-w-sm">
        <HugeiconsIcon
          icon={Search01Icon}
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
        />
        <Input
          placeholder="Search by name, email, username, or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : isError ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-8 text-center">
          <HugeiconsIcon
            icon={Cancel01Icon}
            className="mx-auto h-12 w-12 text-destructive/70"
          />
          <p className="mt-4 font-medium text-destructive">
            Failed to load users
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Please check your connection and try again
          </p>
          <Button variant="outline" className="mt-4" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="w-12 font-semibold">#</TableHead>
                <TableHead className="font-semibold">User</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold min-w-[180px]">
                  Role
                </TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-32 text-center text-muted-foreground"
                  >
                    {search ? "No users match your search" : "No users found"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    className="group transition-colors hover:bg-muted/20"
                  >
                    <TableCell className="font-mono text-muted-foreground text-xs">
                      {user.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <HugeiconsIcon
                            icon={User02Icon}
                            className="h-4 w-4"
                          />
                        </div>
                        <div>
                          <p className="font-medium">
                            {user.first_name || user.last_name
                              ? `${user.first_name} ${user.last_name}`.trim()
                              : "—"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            @{user.username}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{user.email}</span>
                    </TableCell>
                    <TableCell>
                      {roles && roles.length > 0 ? (
                        <RoleSelect
                          user={user}
                          roles={roles}
                          onRoleChange={handleRoleChange}
                          isPending={updatingUserId === user.id}
                        />
                      ) : (
                        <Badge variant="secondary">{user.role_title}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.is_active ? "default" : "secondary"}
                        className={cn(
                          user.is_active
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                            : "opacity-75",
                        )}
                      >
                        {user.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(user.date_joined)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {!isLoading && !isError && filteredUsers.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Showing {filteredUsers.length} of {users?.length ?? 0} users
        </p>
      )}
    </div>
  );
}
