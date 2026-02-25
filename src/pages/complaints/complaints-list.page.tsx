import { useQuery } from "@tanstack/react-query";
import { getComplaints } from "@/api/complaints";
import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { ComplaintItem } from "@/components/complaints/complaint-item";
import type { ComplaintStatus } from "@/types/complaint.type";

export const ComplaintsListPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | "all">(
    "all",
  );

  const {
    data: complaints,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["complaints"],
    queryFn: getComplaints,
  });

  const filteredComplaints = useMemo(() => {
    if (!complaints) return [];

    return complaints.filter((complaint) => {
      const matchesSearch =
        complaint.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        complaint.id.toString().includes(searchTerm);

      const matchesStatus =
        statusFilter === "all" || complaint.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [complaints, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    if (!complaints)
      return { pending_cadet: 0, pending_officer: 0, rejected: 0, approved: 0 };

    return {
      pending_cadet: complaints.filter((c) => c.status === "pending_cadet")
        .length,
      pending_officer: complaints.filter((c) => c.status === "pending_officer")
        .length,
      rejected: complaints.filter(
        (c) =>
          c.status === "invalid",
      ).length,
      approved: complaints.filter((c) => c.status === "approved").length,
    };
  }, [complaints]);

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Complaints</h1>
          <p className="text-muted-foreground mt-1">
            File and manage criminal complaints.
          </p>
        </div>
        <Button onClick={() => navigate("/complaints/new")}>
          <HugeiconsIcon icon={Add01Icon} className="mr-2 h-4 w-4" />
          File Complaint
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-8 animate-in fade-in-50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 border rounded-lg space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-12" />
              </div>
            ))}
          </div>

          <div className="flex gap-4 items-end flex-wrap">
            <div className="flex-1 min-w-[300px] space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-[200px]" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="space-y-2">
                  <div className="flex justify-between items-start">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-1/3" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                  <div className="flex justify-between items-center pt-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : isError ? (
        <div className="p-8 text-center text-destructive">
          Error loading complaints
        </div>
      ) : (
        <>
          {/* Stats */}
          {complaints && complaints.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Awaiting Cadet</p>
                <p className="text-2xl font-bold mt-1">{stats.pending_cadet}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Awaiting Officer
                </p>
                <p className="text-2xl font-bold mt-1">
                  {stats.pending_officer}
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold mt-1 text-destructive">
                  {stats.rejected}
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold mt-1 text-green-600">
                  {stats.approved}
                </p>
              </div>
            </div>
          )}

          {/* Filters */}
          {complaints && complaints.length > 0 && (
            <div className="flex gap-4 items-end flex-wrap">
              <div className="flex-1 min-w-[300px] space-y-2">
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  placeholder="Search by description or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={statusFilter}
                  onValueChange={(value: any) => setStatusFilter(value)}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending_cadet">Pending Cadet</SelectItem>
                    <SelectItem value="rejected_by_cadet">
                      Rejected (Cadet)
                    </SelectItem>
                    <SelectItem value="pending_officer">
                      Pending Officer
                    </SelectItem>
                    <SelectItem value="rejected_by_officer">
                      Rejected (Officer)
                    </SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!complaints || complaints.length === 0 ? (
            <div className="text-center py-12 border rounded-lg border-dashed">
              <p className="text-muted-foreground">No complaints found.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => navigate("/complaints/new")}
              >
                File Your First Complaint
              </Button>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="text-center py-12 border rounded-lg border-dashed">
              <p className="text-muted-foreground">
                No complaints match your filters.
              </p>
            </div>
          ) : (
            /* Complaints Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredComplaints.map((complaint) => (
                <ComplaintItem key={complaint.id} complaint={complaint} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
