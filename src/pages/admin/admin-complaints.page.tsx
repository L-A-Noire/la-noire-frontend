import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminTable } from "@/components/admin/admin-table";
import {
  getComplaints,
  deleteComplaint,
  createComplaint,
  updateComplaint,
} from "@/api/complaints";
import type {
  ComplaintDetail,
  CreateComplaintRequest,
} from "@/types/complaint.type";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-toastify";

export default function AdminComplaintsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingComplaint, setEditingComplaint] =
    useState<ComplaintDetail | null>(null);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<Partial<CreateComplaintRequest>>({
    description: "",
    complainant_ids: [],
  });

  const createMutation = useMutation({
    mutationFn: createComplaint,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-complaints"] });
      setIsDialogOpen(false);
      toast.success("Complaint created successfully");
    },
    onError: () => toast.error("Failed to create complaint"),
  });

  const updateMutation = useMutation({
    mutationFn: (data: {
      id: number;
      payload: Partial<CreateComplaintRequest>;
    }) => updateComplaint(data.id, data.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-complaints"] });
      setIsDialogOpen(false);
      toast.success("Complaint updated successfully");
    },
    onError: () => toast.error("Failed to update complaint"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingComplaint) {
      updateMutation.mutate({ id: editingComplaint.id, payload: formData });
    } else {
      createMutation.mutate(formData as CreateComplaintRequest);
    }
  };

  const handleEdit = (item: ComplaintDetail) => {
    setEditingComplaint(item);
    setFormData({
      description: item.description,
      complainant_ids: item.complainants,
    });
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingComplaint(null);
    setFormData({
      description: "",
      complainant_ids: [],
    });
    setIsDialogOpen(true);
  };

  return (
    <>
      <AdminTable<ComplaintDetail>
        title="Complaints"
        queryKey={["admin-complaints"]}
        fetchData={getComplaints}
        deleteData={deleteComplaint}
        searchKey="description"
        columns={[
          { header: "ID", accessorKey: "id" },
          {
            header: "Description",
            accessorKey: "description",
            cell: (item) => item.description.substring(0, 50) + "...",
          },
          { header: "Status", accessorKey: "status_display" },
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
              {editingComplaint ? "Edit Complaint" : "Create Complaint"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="complainant_ids">
                Complainant IDs (comma separated)
              </Label>
              <Input
                id="complainant_ids"
                value={formData.complainant_ids?.join(", ") || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    complainant_ids: e.target.value
                      .split(",")
                      .map((id) => Number(id.trim()))
                      .filter((id) => !isNaN(id)),
                  })
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
                {editingComplaint ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
