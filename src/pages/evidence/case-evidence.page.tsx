import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  User02Icon,
  DropletIcon,
  VanIcon,
  UserIcon,
  Package01Icon,
  SearchIcon,
} from "@hugeicons/core-free-icons";
import {
  getTestimonies,
  getBiologicalEvidences,
  getVehicleEvidences,
  getIdentificationEvidences,
  getOtherEvidences,
} from "@/api/evidence";
import { format } from "date-fns";

type EvidenceType =
  | "all"
  | "testimony"
  | "biological"
  | "vehicle"
  | "identification"
  | "other";

type UnifiedEvidence = {
  id: number;
  type: EvidenceType;
  title: string;
  description: string;
  created_at: string;
  created_by: number;
};

export const CaseEvidencePage = () => {
  const navigate = useNavigate();
  const { caseId } = useParams<{ caseId: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<EvidenceType>("all");

  // Fetch all evidence types
  const { data: testimonies = [], isLoading: loadingTestimonies } = useQuery({
    queryKey: ["testimonies"],
    queryFn: getTestimonies,
  });

  const { data: biologicalEvidence = [], isLoading: loadingBiological } =
    useQuery({
      queryKey: ["biologicalEvidence"],
      queryFn: getBiologicalEvidences,
    });

  const { data: vehicleEvidence = [], isLoading: loadingVehicle } = useQuery({
    queryKey: ["vehicleEvidence"],
    queryFn: getVehicleEvidences,
  });

  const {
    data: identificationEvidence = [],
    isLoading: loadingIdentification,
  } = useQuery({
    queryKey: ["identificationEvidence"],
    queryFn: getIdentificationEvidences,
  });

  const { data: otherEvidence = [], isLoading: loadingOther } = useQuery({
    queryKey: ["otherEvidence"],
    queryFn: getOtherEvidences,
  });

  const isLoading =
    loadingTestimonies ||
    loadingBiological ||
    loadingVehicle ||
    loadingIdentification ||
    loadingOther;

  // Combine all evidence into unified format
  const allEvidence = useMemo<UnifiedEvidence[]>(() => {
    const unified: UnifiedEvidence[] = [];

    testimonies.forEach((item) => {
      unified.push({
        id: item.id,
        type: "testimony",
        title: item.title,
        description: item.description,
        created_at: item.created_at,
        created_by: item.created_by,
      });
    });

    biologicalEvidence.forEach((item) => {
      unified.push({
        id: item.id,
        type: "biological",
        title: item.title,
        description: item.description,
        created_at: item.created_at,
        created_by: item.created_by,
      });
    });

    vehicleEvidence.forEach((item) => {
      unified.push({
        id: item.id,
        type: "vehicle",
        title: item.title,
        description: item.description,
        created_at: item.created_at,
        created_by: item.created_by,
      });
    });

    identificationEvidence.forEach((item) => {
      unified.push({
        id: item.id,
        type: "identification",
        title: item.title,
        description: item.description,
        created_at: item.created_at,
        created_by: item.created_by,
      });
    });

    otherEvidence.forEach((item) => {
      unified.push({
        id: item.id,
        type: "other",
        title: item.title,
        description: item.description,
        created_at: item.created_at,
        created_by: item.created_by,
      });
    });

    // Sort by creation date (newest first)
    return unified.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }, [
    testimonies,
    biologicalEvidence,
    vehicleEvidence,
    identificationEvidence,
    otherEvidence,
  ]);

  // Filter evidence
  const filteredEvidence = useMemo(() => {
    return allEvidence.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === "all" || item.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [allEvidence, searchQuery, selectedType]);

  const statistics = useMemo(() => {
    return {
      total: allEvidence.length,
      testimony: testimonies.length,
      biological: biologicalEvidence.length,
      vehicle: vehicleEvidence.length,
      identification: identificationEvidence.length,
      other: otherEvidence.length,
    };
  }, [
    allEvidence,
    testimonies,
    biologicalEvidence,
    vehicleEvidence,
    identificationEvidence,
    otherEvidence,
  ]);

  const getTypeIcon = (type: EvidenceType) => {
    switch (type) {
      case "testimony":
        return User02Icon;
      case "biological":
        return DropletIcon;
      case "vehicle":
        return VanIcon;
      case "identification":
        return UserIcon;
      case "other":
        return Package01Icon;
      default:
        return Package01Icon;
    }
  };

  const getTypeColor = (type: EvidenceType) => {
    switch (type) {
      case "testimony":
        return "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400";
      case "biological":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      case "vehicle":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      case "identification":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "other":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getTypeLabel = (type: EvidenceType) => {
    switch (type) {
      case "testimony":
        return "Witness Testimony";
      case "biological":
        return "Biological";
      case "vehicle":
        return "Vehicle";
      case "identification":
        return "Identification";
      case "other":
        return "Other";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Case Evidence</h1>
          <p className="text-sm text-muted-foreground">Case #{caseId}</p>
        </div>
        <Button
          onClick={() => navigate(`/cases/${caseId}/evidence/record`)}
          className="gap-2"
        >
          <HugeiconsIcon icon={Add01Icon} className="h-4 w-4" />
          Record New Evidence
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Evidence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Witness Testimony
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-sky-600">
              {statistics.testimony}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Biological
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-purple-600">
              {statistics.biological}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Vehicle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-orange-600">
              {statistics.vehicle}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Identification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-green-600">
              {statistics.identification}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Other
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-gray-600">
              {statistics.other}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <HugeiconsIcon
            icon={SearchIcon}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
          />
          <Input
            placeholder="Search by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedType === "all" ? "default" : "outline"}
            onClick={() => setSelectedType("all")}
            size="sm"
          >
            All ({statistics.total})
          </Button>
          <Button
            variant={selectedType === "testimony" ? "default" : "outline"}
            onClick={() => setSelectedType("testimony")}
            size="sm"
          >
            Testimony ({statistics.testimony})
          </Button>
          <Button
            variant={selectedType === "biological" ? "default" : "outline"}
            onClick={() => setSelectedType("biological")}
            size="sm"
          >
            Biological ({statistics.biological})
          </Button>
          <Button
            variant={selectedType === "vehicle" ? "default" : "outline"}
            onClick={() => setSelectedType("vehicle")}
            size="sm"
          >
            Vehicle ({statistics.vehicle})
          </Button>
          <Button
            variant={selectedType === "identification" ? "default" : "outline"}
            onClick={() => setSelectedType("identification")}
            size="sm"
          >
            Identification ({statistics.identification})
          </Button>
          <Button
            variant={selectedType === "other" ? "default" : "outline"}
            onClick={() => setSelectedType("other")}
            size="sm"
          >
            Other ({statistics.other})
          </Button>
        </div>
      </div>

      {/* Evidence Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      ) : filteredEvidence.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvidence.map((item) => {
            const Icon = getTypeIcon(item.type);
            return (
              <Card
                key={`${item.type}-${item.id}`}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <HugeiconsIcon
                      icon={Icon}
                      className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base line-clamp-2">
                        {item.title}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        #{item.id} •{" "}
                        {format(new Date(item.created_at), "MMM dd, yyyy")}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Badge className={getTypeColor(item.type)}>
                    {getTypeLabel(item.type)}
                  </Badge>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">
              {allEvidence.length === 0
                ? "No evidence recorded yet"
                : "No evidence matches this filter"}
            </p>
            {allEvidence.length === 0 && (
              <Button
                onClick={() => navigate(`/cases/${caseId}/evidence/record`)}
                className="gap-2"
              >
                <HugeiconsIcon icon={Add01Icon} className="h-4 w-4" />
                Record First Evidence
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
