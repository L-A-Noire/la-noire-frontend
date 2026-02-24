import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminTable } from "@/components/admin/admin-table";
import {
  getSuspectCrimes,
  updateSuspectStatus,
  deleteSuspectCrime,
} from "@/api/suspect";
import type { Suspect } from "@/types/suspect.type";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-toastify";
import http from "@/lib/http";

export default function AdminSuspectsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSuspect, setEditingSuspect] = useState<Suspect | null>(null);
  const queryClient = useQueryClient();

  const [status, setStatus] = useState<string>("");
  const [createData, setCreateData] = useState({
    first_name: "",
    last_name: "",
    case_id: "",
    status: "suspect",
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number; status: string }) =>
      updateSuspectStatus(data.id, data.status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-suspects"] });
      setIsDialogOpen(false);
      toast.success("Suspect status updated successfully");
    },
    onError: () => toast.error("Failed to update suspect status"),
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof createData) => {
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000);

      const username = `${data.first_name.toLowerCase()}_${data.last_name.toLowerCase()}_${timestamp}`;
      const email = `suspect_${timestamp}${random}@local.system`;
      const phone = `${timestamp}`.slice(-10);
      const nationalId = `ID${timestamp}${random}`;

      const userResponse = await http.post("/auth/register/", {
        username,
        email,
        phone,
        first_name: data.first_name,
        last_name: data.last_name,
        national_id: nationalId,
        password: "temporary123",
      });

      const newUser = userResponse.data;
      let userId;

      if (newUser.id) {
        userId = newUser.id;
      } else if (newUser.user_id) {
        userId = newUser.user_id;
      } else if (newUser.user && newUser.user.id) {
        userId = newUser.user.id;
      } else {
        throw new Error("Could not get user ID from response");
      }

      const suspectCrimePayload = {
        suspect: userId,
        case: data.case_id ? parseInt(data.case_id) : null,
        status: data.status,
      };

      const suspectResponse = await http.post(
        "/suspect/suspect-crimes/",
        suspectCrimePayload,
      );

      return suspectResponse.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-suspects"] });
      setIsCreateDialogOpen(false);
      setCreateData({
        first_name: "",
        last_name: "",
        case_id: "",
        status: "suspect",
      });
      toast.success("Suspect created successfully");
    },
    onError: (error: any) => {
      console.error("Error creating suspect:", error);
      toast.error("Failed to create suspect");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSuspect) {
      updateMutation.mutate({ id: editingSuspect.id, status });
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createData.first_name || !createData.last_name) {
      toast.error("First name and last name are required");
      return;
    }
    createMutation.mutate(createData);
  };

  const handleEdit = (item: Suspect) => {
    setEditingSuspect(item);
    setStatus(item.status);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setCreateData({
      first_name: "",
      last_name: "",
      case_id: "",
      status: "suspect",
    });
    setIsCreateDialogOpen(true);
  };

  return (
    <>
      <AdminTable<Suspect>
        title="Suspects"
        queryKey={["admin-suspects"]}
        fetchData={getSuspectCrimes}
        deleteData={deleteSuspectCrime}
        columns={[
          { header: "ID", accessorKey: "id" },
          {
            header: "Name",
            accessorKey: "suspect_details",
            cell: (item) =>
              `${item.suspect_details.first_name} ${item.suspect_details.last_name}`,
          },
          {
            header: "Username",
            accessorKey: "suspect_details",
            cell: (item) => item.suspect_details.username,
          },
          { header: "Status", accessorKey: "status" },
          { header: "Crime Level", accessorKey: "crime_level" },
        ]}
        onEdit={handleEdit}
        onCreate={handleCreate}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Suspect Status</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="suspect">Suspect</SelectItem>
                  <SelectItem value="wanted">Wanted</SelectItem>
                  <SelectItem value="most_wanted">Most Wanted</SelectItem>
                  <SelectItem value="arrested">Arrested</SelectItem>
                  <SelectItem value="convicted">Convicted</SelectItem>
                  <SelectItem value="innocent">Innocent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                Update
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Suspect</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={createData.first_name}
                onChange={(e) =>
                  setCreateData({ ...createData, first_name: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={createData.last_name}
                onChange={(e) =>
                  setCreateData({ ...createData, last_name: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="case_id">Case ID (Optional)</Label>
              <Input
                id="case_id"
                type="number"
                value={createData.case_id}
                onChange={(e) =>
                  setCreateData({ ...createData, case_id: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create_status">Status</Label>
              <Select
                value={createData.status}
                onValueChange={(val) =>
                  setCreateData({ ...createData, status: val })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="suspect">Suspect</SelectItem>
                  <SelectItem value="wanted">Wanted</SelectItem>
                  <SelectItem value="most_wanted">Most Wanted</SelectItem>
                  <SelectItem value="arrested">Arrested</SelectItem>
                  <SelectItem value="convicted">Convicted</SelectItem>
                  <SelectItem value="innocent">Innocent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
