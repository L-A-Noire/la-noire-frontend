import { useQuery } from "@tanstack/react-query";
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
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, SearchIcon } from "@hugeicons/core-free-icons";
import { getTestimonies } from "@/api/evidence";
import { TestimonyCard } from "@/components/testimonies/testimony-card";
import { useAuthStore } from "@/stores/auth.store";

export const TestimoniesListPage = () => {
  const navigate = useNavigate();
  const { session } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "confirmed" | "pending"
  >("all");

  const canReview =
    session && !["Cadet", "Base User"].includes(session.user.role_title);

  const {
    data: testimonies,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["testimonies"],
    queryFn: () => getTestimonies(),
  });

  const filteredTestimonies = useMemo(() => {
    if (!testimonies) return [];

    return testimonies.filter((testimony) => {
      const matchesSearch =
        testimony.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        testimony.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        testimony.transcription
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "confirmed" && testimony.is_confirmed) ||
        (statusFilter === "pending" && !testimony.is_confirmed);

      return matchesSearch && matchesStatus;
    });
  }, [testimonies, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    if (!testimonies) return { total: 0, confirmed: 0, pending: 0 };

    return {
      total: testimonies.length,
      confirmed: testimonies.filter((t) => t.is_confirmed).length,
      pending: testimonies.filter((t) => !t.is_confirmed).length,
    };
  }, [testimonies]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-muted-foreground">Loading testimonies...</div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-destructive">Error loading testimonies</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Witness Testimonies
          </h1>
          <p className="text-muted-foreground mt-1">
            Submit and review witness testimonies about crimes.
          </p>
        </div>
        <Button onClick={() => navigate("/testimonies/new")}>
          <HugeiconsIcon icon={Add01Icon} className="mr-2 h-4 w-4" />
          Submit Testimony
        </Button>
      </div>

      {/* Stats */}
      {testimonies && testimonies.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground">Total Testimonies</p>
            <p className="text-2xl font-bold mt-1">{stats.total}</p>
          </div>
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground">Confirmed</p>
            <p className="text-2xl font-bold mt-1 text-green-600">
              {stats.confirmed}
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground">Pending Review</p>
            <p className="text-2xl font-bold mt-1 text-amber-600">
              {stats.pending}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      {testimonies && testimonies.length > 0 && (
        <div className="flex gap-4 items-end flex-wrap">
          <div className="flex-1 min-w-[300px] space-y-2">
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <HugeiconsIcon
                icon={SearchIcon}
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
              />
              <Input
                id="search"
                placeholder="Search by title, description, or testimony..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as "all" | "confirmed" | "pending")
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Testimonies</SelectItem>
                <SelectItem value="pending">Pending Review</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!testimonies || testimonies.length === 0 ? (
        <div className="text-center py-12 border rounded-lg border-dashed">
          <p className="text-muted-foreground">No testimonies found.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate("/testimonies/new")}
          >
            Submit Your First Testimony
          </Button>
        </div>
      ) : filteredTestimonies.length === 0 ? (
        <div className="text-center py-12 border rounded-lg border-dashed">
          <p className="text-muted-foreground">
            No testimonies match your filters.
          </p>
        </div>
      ) : (
        /* Testimonies Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTestimonies.map((testimony) => (
            <TestimonyCard
              key={testimony.id}
              testimony={testimony}
              canReview={canReview ?? undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};
