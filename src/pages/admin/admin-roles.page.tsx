import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminTable } from "@/components/admin/admin-table";
import { getRoles, deleteRole, createRole, updateRole } from "@/api/roles";
import type { Role, CreateRolePayload } from "@/types/role.type";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";

export default function AdminRolesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<Partial<CreateRolePayload>>({
    title: "",
  });

  const createMutation = useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-roles"] });
      setIsDialogOpen(false);
      toast.success("Role created successfully");
    },
    onError: () => toast.error("Failed to create role"),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number; payload: Partial<CreateRolePayload> }) =>
      updateRole(data.id, data.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-roles"] });
      setIsDialogOpen(false);
      toast.success("Role updated successfully");
    },
    onError: () => toast.error("Failed to update role"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRole) {
      updateMutation.mutate({ id: editingRole.id, payload: formData });
    } else {
      createMutation.mutate(formData as CreateRolePayload);
    }
  };

  const handleEdit = (item: Role) => {
    setEditingRole(item);
    setFormData({
      title: item.title,
    });
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingRole(null);
    setFormData({
      title: "",
    });
    setIsDialogOpen(true);
  };

  return (
    <>
      <AdminTable<Role>
        title="Roles"
        queryKey={["admin-roles"]}
        fetchData={getRoles}
        deleteData={deleteRole}
        searchKey="title"
        columns={[
          { header: "ID", accessorKey: "id" },
          { header: "Title", accessorKey: "title" },
          { header: "User Count", accessorKey: "user_count" },
        ]}
        onEdit={handleEdit}
        onCreate={handleCreate}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingRole ? "Edit Role" : "Create Role"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title || ""}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingRole ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
