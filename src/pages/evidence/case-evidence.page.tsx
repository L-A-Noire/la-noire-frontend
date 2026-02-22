import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EvidenceCard } from "@/components/evidence/evidence-card";
import { EvidenceBadge } from "@/components/evidence/evidence-badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { getEvidenceByCase, getEvidenceSummary } from "@/api/evidence";
import type { EvidenceType } from "@/types/evidence.type";

export const CaseEvidencePage = () => {
  const navigate = useNavigate();
  const { caseId } = useParams<{ caseId: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<EvidenceType | "all">("all");

  const { data: evidence = [], isLoading } = useQuery({
    queryKey: ["evidence", caseId],
    queryFn: () => getEvidenceByCase(caseId ? parseInt(caseId) : 0),
    enabled: !!caseId,
  });

  const { data: summary } = useQuery({
    queryKey: ["evidenceSummary", caseId],
    queryFn: () => getEvidenceSummary(caseId ? parseInt(caseId) : 0),
    enabled: !!caseId,
  });

  // Filter evidence based on search and type
  const filteredEvidence = useMemo(() => {
    return evidence.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType =
        selectedType === "all" || item.evidence_type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [evidence, searchQuery, selectedType]);

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
          Record Evidence
        </Button>
      </div>

      {/* Statistics Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Total */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Evidence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_count}</div>
            </CardContent>
          </Card>

          {/* Witness Testimony */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Witness Testimony
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                {summary.by_type.witness_testimony || 0}
              </div>
            </CardContent>
          </Card>

          {/* Forensic */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Forensic
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                {summary.by_type.forensic || 0}
              </div>
            </CardContent>
          </Card>

          {/* Vehicle */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Vehicle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                {summary.by_type.vehicle || 0}
              </div>
            </CardContent>
          </Card>

          {/* Pending Tests */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Pending Tests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-amber-600">
                {summary.pending_tests}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search evidence by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select
          value={selectedType}
          onValueChange={(value) =>
            setSelectedType(value as EvidenceType | "all")
          }
        >
          <option value="all">All Types</option>
          <option value="witness_testimony">Witness Testimony</option>
          <option value="forensic">Forensic</option>
          <option value="vehicle">Vehicle</option>
          <option value="identification">Identification</option>
          <option value="other">Other</option>
        </Select>
      </div>

      {/* Evidence Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin">Loading evidence...</div>
        </div>
      ) : filteredEvidence.length > 0 ? (
        <>
          <div className="flex flex-wrap gap-2">
            {Array.from(
              new Set(filteredEvidence.map((e) => e.evidence_type)),
            ).map((type) => {
              const count = filteredEvidence.filter(
                (e) => e.evidence_type === type,
              ).length;
              return <EvidenceBadge key={type} type={type} count={count} />;
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvidence.map((item) => (
              <EvidenceCard key={item.id} evidence={item} />
            ))}
          </div>
        </>
      ) : (
        <Card className="border-l-4 border-l-muted-foreground">
          <CardHeader>
            <CardTitle className="text-lg">No evidence recorded yet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {evidence.length === 0
                ? "Start recording evidence to build this case."
                : "No evidence matches your search filters."}
            </p>
            {evidence.length === 0 && (
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
