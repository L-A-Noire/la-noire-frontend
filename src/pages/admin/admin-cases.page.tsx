import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminTable } from "@/components/admin/admin-table";
import { getCases, deleteCase, createCase, updateCase } from "@/api/cases";
import type {
  CaseList,
  CreateCaseRequest,
  UpdateCaseRequest,
} from "@/types/case.type";
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

export default function AdminCasesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<CaseList | null>(null);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<Partial<UpdateCaseRequest>>({
    is_from_crime_scene: false,
    crime: undefined,
    detective: undefined,
    is_closed: false,
  });

  const createMutation = useMutation({
    mutationFn: createCase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cases"] });
      setIsDialogOpen(false);
      toast.success("Case created successfully");
    },
    onError: () => toast.error("Failed to create case"),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number; payload: UpdateCaseRequest }) =>
      updateCase(data.id, data.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cases"] });
      setIsDialogOpen(false);
      toast.success("Case updated successfully");
    },
    onError: () => toast.error("Failed to update case"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCase) {
      updateMutation.mutate({
        id: editingCase.id,
        payload: formData as UpdateCaseRequest,
      });
    } else {
      createMutation.mutate(formData as CreateCaseRequest);
    }
  };

  const handleEdit = (item: CaseList) => {
    setEditingCase(item);
    setFormData({
      is_from_crime_scene: item.is_from_crime_scene,
      is_closed: item.is_closed,
      // Note: crime and detective IDs are not in CaseList, so they would need to be fetched or handled differently
      // For now, we'll leave them undefined and let the user fill them in if they want to update them
    });
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingCase(null);
    setFormData({
      is_from_crime_scene: false,
      crime: undefined,
      detective: undefined,
      is_closed: false,
    });
    setIsDialogOpen(true);
  };

  return (
    <>
      <AdminTable<CaseList>
        title="Cases"
        queryKey={["admin-cases"]}
        fetchData={getCases}
        deleteData={deleteCase}
        searchKey="crime_title"
        columns={[
          { header: "ID", accessorKey: "id" },
          { header: "Crime Title", accessorKey: "crime_title" },
          { header: "Detective", accessorKey: "detective_name" },
          {
            header: "Closed",
            accessorKey: "is_closed",
            cell: (item) => (item.is_closed ? "Yes" : "No"),
          },
          {
            header: "Created At",
            accessorKey: "created_at",
            cell: (item) => new Date(item.created_at).toLocaleDateString(),
          },
        ]}
        onEdit={handleEdit}
        onCreate={handleCreate}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCase ? "Edit Case" : "Create Case"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="crime">Crime ID</Label>
              <Input
                id="crime"
                type="number"
                value={formData.crime || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    crime: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                required={!editingCase}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="detective">Detective ID</Label>
              <Input
                id="detective"
                type="number"
                value={formData.detective || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    detective: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                required={!editingCase}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_from_crime_scene"
                checked={formData.is_from_crime_scene}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    is_from_crime_scene: e.target.checked,
                  })
                }
              />
              <Label htmlFor="is_from_crime_scene">From Crime Scene</Label>
            </div>
            {editingCase && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_closed"
                  checked={formData.is_closed}
                  onChange={(e) =>
                    setFormData({ ...formData, is_closed: e.target.checked })
                  }
                />
                <Label htmlFor="is_closed">Closed</Label>
              </div>
            )}
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
                {editingCase ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
