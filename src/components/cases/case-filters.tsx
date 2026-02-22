import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CaseFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  statusFilter: "all" | "open" | "closed";
  onStatusChange: (status: "all" | "open" | "closed") => void;
}

export const CaseFilters = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
}: CaseFiltersProps) => {
  return (
    <div className="flex gap-4 items-end">
      <div className="flex-1 space-y-2">
        <Label htmlFor="search">Search Cases</Label>
        <Input
          id="search"
          placeholder="Search by crime title or detective name..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cases</SelectItem>
            <SelectItem value="open">Open Only</SelectItem>
            <SelectItem value="closed">Closed Only</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
