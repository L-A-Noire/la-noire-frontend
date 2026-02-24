import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminTable } from "@/components/admin/admin-table";
import {
  getCrimeScenes,
  deleteCrimeScene,
  createCrimeScene,
  updateCrimeScene,
} from "@/api/crime-scenes";
import type {
  CrimeSceneDetail,
  CreateCrimeSceneRequest,
} from "@/types/crime-scene.type";
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

export default function AdminCrimeScenesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingScene, setEditingScene] = useState<CrimeSceneDetail | null>(
    null,
  );
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<Partial<CreateCrimeSceneRequest>>({
    location: "",
    description: "",
    seen_at: new Date().toISOString(),
    witness_ids: [],
  });

  const createMutation = useMutation({
    mutationFn: createCrimeScene,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-crime-scenes"] });
      setIsDialogOpen(false);
      toast.success("Crime scene created successfully");
    },
    onError: () => toast.error("Failed to create crime scene"),
  });

  const updateMutation = useMutation({
    mutationFn: (data: {
      id: number;
      payload: Partial<CreateCrimeSceneRequest>;
    }) => updateCrimeScene(data.id, data.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-crime-scenes"] });
      setIsDialogOpen(false);
      toast.success("Crime scene updated successfully");
    },
    onError: () => toast.error("Failed to update crime scene"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingScene) {
      updateMutation.mutate({ id: editingScene.id, payload: formData });
    } else {
      createMutation.mutate(formData as CreateCrimeSceneRequest);
    }
  };

  const handleEdit = (item: CrimeSceneDetail) => {
    setEditingScene(item);
    setFormData({
      location: item.location,
      description: item.description,
      seen_at: item.seen_at,
      witness_ids: item.witnesses,
    });
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingScene(null);
    setFormData({
      location: "",
      description: "",
      seen_at: new Date().toISOString(),
      witness_ids: [],
    });
    setIsDialogOpen(true);
  };

  return (
    <>
      <AdminTable<CrimeSceneDetail>
        title="Crime Scenes"
        queryKey={["admin-crime-scenes"]}
        fetchData={getCrimeScenes}
        deleteData={deleteCrimeScene}
        searchKey="location"
        columns={[
          { header: "ID", accessorKey: "id" },
          { header: "Location", accessorKey: "location" },
          { header: "Case Report ID", accessorKey: "case_report" },
          {
            header: "Confirmed",
            accessorKey: "is_confirmed",
            cell: (item) => (item.is_confirmed ? "Yes" : "No"),
          },
          {
            header: "Seen At",
            accessorKey: "seen_at",
            cell: (item) => new Date(item.seen_at).toLocaleDateString(),
          },
        ]}
        onEdit={handleEdit}
        onCreate={handleCreate}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingScene ? "Edit Crime Scene" : "Create Crime Scene"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                required
              />
            </div>
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
              <Label htmlFor="seen_at">Seen At</Label>
              <Input
                id="seen_at"
                type="datetime-local"
                value={
                  formData.seen_at
                    ? new Date(formData.seen_at).toISOString().slice(0, 16)
                    : ""
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    seen_at: new Date(e.target.value).toISOString(),
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
                {editingScene ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
