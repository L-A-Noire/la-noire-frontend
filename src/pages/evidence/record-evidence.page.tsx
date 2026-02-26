import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { TestimonyForm } from "@/components/evidence/testimony-form";
import { BiologicalEvidenceForm } from "@/components/evidence/biological-evidence-form";
import { VehicleEvidenceForm } from "@/components/evidence/vehicle-evidence-form";
import { IdentificationEvidenceForm } from "@/components/evidence/identification-evidence-form";
import { OtherEvidenceForm } from "@/components/evidence/other-evidence-form";

export default function RecordEvidencePage() {
  const navigate = useNavigate();
  const { caseId } = useParams<{ caseId: string }>();
  const parsedCaseId = caseId ? parseInt(caseId) : undefined;

  const handleSuccess = () => {
    if (caseId) {
      // If we were in a case context, go back to case evidence page
      navigate(`/cases/${caseId}/evidence`);
    } else {
      // Otherwise go back to previous page
      navigate(-1);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="w-4 h-4" />
          Back
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-3xl">
            {caseId ? `Record Evidence for Case #${caseId}` : "Record Evidence"}
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Evidence is divided into five categories. All evidence requires a
            title, description, location, and date/time of observation.
          </p>
        </CardHeader>
      </Card>

      <Tabs defaultValue="testimony" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="testimony">Testimony</TabsTrigger>
          <TabsTrigger value="biological">Biological</TabsTrigger>
          <TabsTrigger value="vehicle">Vehicle</TabsTrigger>
          <TabsTrigger value="identification">ID Documents</TabsTrigger>
          <TabsTrigger value="other">Other</TabsTrigger>
        </TabsList>

        <TabsContent value="testimony">
          <TestimonyForm
            onSuccess={handleSuccess}
            initialCaseId={parsedCaseId}
          />
        </TabsContent>

        <TabsContent value="biological">
          <BiologicalEvidenceForm onSuccess={handleSuccess} />
        </TabsContent>

        <TabsContent value="vehicle">
          <VehicleEvidenceForm onSuccess={handleSuccess} />
        </TabsContent>

        <TabsContent value="identification">
          <IdentificationEvidenceForm onSuccess={handleSuccess} />
        </TabsContent>

        <TabsContent value="other">
          <OtherEvidenceForm onSuccess={handleSuccess} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
