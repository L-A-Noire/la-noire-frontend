import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminTable } from "@/components/admin/admin-table";
import {
  getPunishments,
  issuePunishment,
  deletePunishment,
} from "@/api/punishment";
import type {
  Punishment,
  CreatePunishmentPayload,
  PunishmentType,
} from "@/types/punishment.type";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-toastify";

export default function AdminPunishmentsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPunishment, setEditingPunishment] = useState<Punishment | null>(
    null,
  );
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<Partial<CreatePunishmentPayload>>({
    title: "",
    description: "",
    punishment_type: "fine",
    suspect_crime: undefined,
    amount: "",
    duration_months: undefined,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreatePunishmentPayload) =>
      issuePunishment(data.suspect_crime, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-punishments"] });
      setIsDialogOpen(false);
      toast.success("Punishment issued successfully");
    },
    onError: () => toast.error("Failed to issue punishment"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPunishment) {
      toast.info("Updating punishments is not supported by the API.");
    } else {
      if (!formData.suspect_crime) {
        toast.error("Suspect Crime ID is required.");
        return;
      }
      createMutation.mutate(formData as CreatePunishmentPayload);
    }
  };

  const handleEdit = (item: Punishment) => {
    setEditingPunishment(item);
    setFormData({
      title: item.title,
      description: item.description,
      punishment_type: item.punishment_type,
      suspect_crime: item.suspect_crime,
      amount: item.amount,
      duration_months: item.duration_months,
    });
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingPunishment(null);
    setFormData({
      title: "",
      description: "",
      punishment_type: "fine",
      suspect_crime: undefined,
      amount: "",
      duration_months: undefined,
    });
    setIsDialogOpen(true);
  };

  return (
    <>
      <AdminTable<Punishment>
        title="Punishments"
        queryKey={["admin-punishments"]}
        fetchData={getPunishments}
        deleteData={deletePunishment}
        searchKey="title"
        columns={[
          { header: "ID", accessorKey: "id" },
          { header: "Title", accessorKey: "title" },
          { header: "Type", accessorKey: "punishment_type_display" },
          {
            header: "Amount",
            accessorKey: "amount",
            cell: (item) => (item.amount ? `$${item.amount}` : "N/A"),
          },
          {
            header: "Duration (Months)",
            accessorKey: "duration_months",
            cell: (item) =>
              item.duration_months ? `${item.duration_months} months` : "N/A",
          },
          {
            header: "Paid",
            accessorKey: "is_paid",
            cell: (item) => (item.is_paid ? "Yes" : "No"),
          },
        ]}
        onEdit={handleEdit}
        onCreate={handleCreate}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPunishment ? "View Punishment" : "Issue Punishment"}
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
                disabled={!!editingPunishment}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
                disabled={!!editingPunishment}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="punishment_type">Type</Label>
              <Select
                value={formData.punishment_type}
                onValueChange={(value: PunishmentType) =>
                  setFormData({ ...formData, punishment_type: value })
                }
                disabled={!!editingPunishment}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fine">Fine</SelectItem>
                  <SelectItem value="bail">Bail</SelectItem>
                  <SelectItem value="imprisonment">Imprisonment</SelectItem>
                  <SelectItem value="death">Death</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="suspect_crime">Suspect Crime ID</Label>
              <Input
                id="suspect_crime"
                type="number"
                value={formData.suspect_crime || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    suspect_crime: Number(e.target.value),
                  })
                }
                required
                disabled={!!editingPunishment}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (Optional)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  disabled={!!editingPunishment}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration_months">
                  Duration Months (Optional)
                </Label>
                <Input
                  id="duration_months"
                  type="number"
                  value={formData.duration_months || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration_months: Number(e.target.value),
                    })
                  }
                  disabled={!!editingPunishment}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              {!editingPunishment && (
                <Button type="submit" disabled={createMutation.isPending}>
                  Issue
                </Button>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
