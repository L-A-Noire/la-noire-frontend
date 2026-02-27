import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EvidenceCardProps {
  evidence: unknown;
}

export const EvidenceCard = (props: EvidenceCardProps) => {
  void props;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Evidence Card - Legacy Component</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">
          This component is being refactored to use the new evidence API
          structure.
        </p>
      </CardContent>
    </Card>
  );
};
