import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  Add01Icon,
  UserIcon,
  Delete02Icon,
  SearchIcon,
} from "@hugeicons/core-free-icons";
import { toast } from "react-toastify";
import {
  getAllSuspects,
  getSuspectsByCaseDirect,
  addSuspectToCase,
  createSuspect,
  deleteSuspectFromCase,
} from "@/api/suspect";
import { getCaseById } from "@/api/cases";
import http, { extractErrorMessage } from "@/lib/http";
import { AxiosError } from "axios";
import type { SuspectCrime } from "@/types/suspect.type";

export const ManageSuspectsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const caseId = parseInt(id!);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isNewSuspectDialogOpen, setIsNewSuspectDialogOpen] = useState(false);
  const [selectedSuspectId, setSelectedSuspectId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [newSuspectData, setNewSuspectData] = useState({
    name: "",
    description: "",
    nickname: "",
    gender: "",
    national_id: "",
  });

  const {
    data: caseDetails,
    isLoading: isLoadingCase,
    error: caseError,
  } = useQuery({
    queryKey: ["case", caseId],
    queryFn: () => getCaseById(caseId),
  });

  const {
    data: allSuspects = [],
    isLoading: isLoadingSuspects,
    error: suspectsError,
  } = useQuery({
    queryKey: ["suspects", "all"],
    queryFn: async () => {
      const data = await getAllSuspects();
      return data;
    },
  });

  const {
    data: caseSuspects = [],
    isLoading: isLoadingCaseSuspects,
    error: caseSuspectsError,
  } = useQuery({
    queryKey: ["suspects", "case", caseId],
    queryFn: async () => {
      const data = await getSuspectsByCaseDirect(caseId);
      console.log("Case suspects (direct):", data);
      return data;
    },
  });

  const { data: suspectCrimes = [], isLoading: isLoadingSuspectCrimes } =
    useQuery<SuspectCrime[]>({
      queryKey: ["suspect-crimes", "case", caseId, caseDetails?.crime],
      queryFn: async () => {
        const response = await http.get<SuspectCrime[]>(
          "/suspect/suspect-crimes/",
        );
        return response.data.filter(
          (sc: SuspectCrime) => sc.crime === caseDetails?.crime,
        );
      },
      enabled: !!caseDetails,
    });

  useEffect(() => {
    if (suspectsError) {
      console.error("Error fetching suspects:", suspectsError);
    }
    if (caseSuspectsError) {
      console.error("Error fetching case suspects:", caseSuspectsError);
    }
    if (caseError) {
      console.error("Error fetching case details:", caseError);
    }
  }, [suspectsError, caseSuspectsError, caseError]);

  const linkedSuspectIds = caseSuspects.map((suspect) => suspect.id);

  const availableSuspects = allSuspects.filter((suspect) => {
    if (linkedSuspectIds.includes(suspect.id)) {
      return false;
    }

    if (searchTerm) {
      const name = suspect.name?.toLowerCase() || "";
      const nickname = suspect.nickname?.toLowerCase() || "";
      const nationalId = suspect.national_id?.toString() || "";
      const term = searchTerm.toLowerCase();

      return (
        name.includes(term) ||
        nickname.includes(term) ||
        nationalId.includes(term)
      );
    }

    return true;
  });

  const addSuspectMutation = useMutation({
    mutationFn: () => {
      if (!caseDetails?.crime) throw new Error("Case has no crime");
      return addSuspectToCase({
        suspect: parseInt(selectedSuspectId),
        crime: caseDetails.crime,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suspects", "case", caseId] });
      queryClient.invalidateQueries({
        queryKey: ["suspect-crimes", "case", caseId],
      });
      toast.success("Suspect added to case");
      setIsAddDialogOpen(false);
      setSelectedSuspectId("");
      setSearchTerm("");
    },
    onError: (error: AxiosError) => {
      console.error("Error adding suspect:", error);
      toast.error(extractErrorMessage(error));
    },
  });

  const createSuspectMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("name", newSuspectData.name);
      formData.append("description", newSuspectData.description);
      formData.append("nickname", newSuspectData.nickname);
      if (newSuspectData.gender)
        formData.append("gender", newSuspectData.gender);
      if (newSuspectData.national_id)
        formData.append("national_id", newSuspectData.national_id);

      const newSuspect = await createSuspect(formData);

      if (!caseDetails?.crime) throw new Error("Case has no crime");
      return addSuspectToCase({
        suspect: newSuspect.id,
        crime: caseDetails.crime,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suspects", "all"] });
      queryClient.invalidateQueries({ queryKey: ["suspects", "case", caseId] });
      queryClient.invalidateQueries({
        queryKey: ["suspect-crimes", "case", caseId],
      });
      toast.success("New suspect created and added to case");
      setIsNewSuspectDialogOpen(false);
      setNewSuspectData({
        name: "",
        description: "",
        nickname: "",
        gender: "",
        national_id: "",
      });
    },
    onError: (error: AxiosError) => {
      console.error("Error creating suspect:", error);
      toast.error(extractErrorMessage(error));
    },
  });

  const removeSuspectMutation = useMutation({
    mutationFn: (suspectId: number) => {
      const suspectCrime = suspectCrimes.find(
        (sc: SuspectCrime) => sc.suspect === suspectId,
      );
      if (!suspectCrime) {
        throw new Error("Suspect not linked to this case");
      }
      return deleteSuspectFromCase(suspectCrime.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suspects", "case", caseId] });
      queryClient.invalidateQueries({
        queryKey: ["suspect-crimes", "case", caseId],
      });
      toast.success("Suspect removed from case");
    },
    onError: (error: AxiosError) => {
      console.error("Error removing suspect:", error);
      toast.error(extractErrorMessage(error));
    },
  });

  const handleAddExistingSuspect = () => {
    if (!selectedSuspectId) {
      toast.error("Please select a suspect");
      return;
    }
    if (!caseDetails?.crime) {
      toast.error("Case has no associated crime");
      return;
    }
    addSuspectMutation.mutate();
  };

  const handleCreateNewSuspect = () => {
    if (!newSuspectData.name) {
      toast.error("Name is required");
      return;
    }
    if (!caseDetails?.crime) {
      toast.error("Case has no associated crime");
      return;
    }
    createSuspectMutation.mutate();
  };

  const handleRemoveSuspect = (suspectId: number) => {
    if (confirm("Remove this suspect from the case?")) {
      removeSuspectMutation.mutate(suspectId);
    }
  };

  const isLoading =
    isLoadingCase ||
    isLoadingSuspects ||
    isLoadingCaseSuspects ||
    isLoadingSuspectCrimes;

  if (isLoadingCase) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="text-center py-12">Loading case details...</div>
      </div>
    );
  }

  if (!caseDetails || !caseDetails.crime) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <Card className="border-destructive">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p className="text-muted-foreground mb-4">
              {!caseDetails ? "Case not found" : "Case has no associated crime"}
            </p>
            <Button onClick={() => navigate(`/cases/${caseId}`)}>
              Back to Case
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl space-y-6">
      <Button
        variant="ghost"
        className="pl-0 hover:bg-transparent hover:text-primary"
        onClick={() => navigate(`/cases/${caseId}`)}
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 h-4 w-4" />
        Back to Case
      </Button>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Manage Suspects - Case #{caseId}
          </h1>
          <p className="text-muted-foreground mt-1">
            Add suspects to this case or create new ones
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <HugeiconsIcon icon={Add01Icon} className="mr-2 h-4 w-4" />
              Add Suspect
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Suspect to Case</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Search input */}
              <div className="relative">
                <HugeiconsIcon
                  icon={SearchIcon}
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                />
                <Input
                  placeholder="Search suspects by name, nickname, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Debug info - remove in production */}
              <div className="text-xs text-muted-foreground p-2 bg-muted/30 rounded">
                <p>Total suspects: {allSuspects.length}</p>
                <p>Linked suspects: {linkedSuspectIds.length}</p>
                <p>Available suspects: {availableSuspects.length}</p>
                <p>Crime ID: {caseDetails.crime}</p>
              </div>

              {/* Suspects list */}
              <div className="max-h-[300px] overflow-y-auto border rounded-lg">
                {isLoadingSuspects ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Loading suspects...
                  </div>
                ) : availableSuspects.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    {searchTerm
                      ? "No suspects match your search"
                      : "No suspects available"}
                    {allSuspects.length > 0 &&
                      linkedSuspectIds.length === allSuspects.length && (
                        <p className="text-xs mt-2">
                          All suspects are already added to this case
                        </p>
                      )}
                  </div>
                ) : (
                  <div className="divide-y">
                    {availableSuspects.map((suspect) => (
                      <div
                        key={suspect.id}
                        className={`p-3 flex items-center gap-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                          selectedSuspectId === suspect.id.toString()
                            ? "bg-muted"
                            : ""
                        }`}
                        onClick={() =>
                          setSelectedSuspectId(suspect.id.toString())
                        }
                      >
                        <div className="flex-1">
                          <div className="font-medium">{suspect.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {suspect.nickname && (
                              <span>AKA: {suspect.nickname} • </span>
                            )}
                            {suspect.national_id && (
                              <span>ID: {suspect.national_id}</span>
                            )}
                          </div>
                          <div className="text-xs mt-1">
                            <Badge variant="outline" className="text-xs">
                              {suspect.status}
                            </Badge>
                          </div>
                        </div>
                        {selectedSuspectId === suspect.id.toString() && (
                          <Badge variant="default" className="bg-primary">
                            Selected
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setIsNewSuspectDialogOpen(true);
                  }}
                >
                  Create New Suspect
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleAddExistingSuspect}
                  disabled={!selectedSuspectId || addSuspectMutation.isPending}
                >
                  {addSuspectMutation.isPending ? "Adding..." : "Add to Case"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* New Suspect Dialog */}
      <Dialog
        open={isNewSuspectDialogOpen}
        onOpenChange={setIsNewSuspectDialogOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Suspect</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={newSuspectData.name}
                  onChange={(e) =>
                    setNewSuspectData({
                      ...newSuspectData,
                      name: e.target.value,
                    })
                  }
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nickname">Nickname</Label>
                <Input
                  id="nickname"
                  value={newSuspectData.nickname}
                  onChange={(e) =>
                    setNewSuspectData({
                      ...newSuspectData,
                      nickname: e.target.value,
                    })
                  }
                  placeholder="The Shadow"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={newSuspectData.gender}
                  onValueChange={(value) =>
                    setNewSuspectData({ ...newSuspectData, gender: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="m">Male</SelectItem>
                    <SelectItem value="f">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="national_id">National ID</Label>
                <Input
                  id="national_id"
                  value={newSuspectData.national_id}
                  onChange={(e) =>
                    setNewSuspectData({
                      ...newSuspectData,
                      national_id: e.target.value,
                    })
                  }
                  placeholder="ID123456"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newSuspectData.description}
                onChange={(e) =>
                  setNewSuspectData({
                    ...newSuspectData,
                    description: e.target.value,
                  })
                }
                placeholder="Physical description, identifying marks, etc."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsNewSuspectDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateNewSuspect}
                disabled={
                  createSuspectMutation.isPending || !newSuspectData.name
                }
              >
                {createSuspectMutation.isPending
                  ? "Creating..."
                  : "Create & Add to Case"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Suspects List - now showing Suspect objects directly */}
      <Card>
        <CardHeader>
          <CardTitle>Suspects in this Case</CardTitle>
          <CardDescription>
            {caseSuspects.length} suspect(s) currently linked to this case
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading suspects...</div>
          ) : caseSuspects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No suspects added to this case yet
            </div>
          ) : (
            <div className="space-y-4">
              {caseSuspects.map((suspect) => (
                <div
                  key={suspect.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    <HugeiconsIcon
                      icon={UserIcon}
                      className="h-5 w-5 text-muted-foreground mt-1"
                    />
                    <div>
                      <h3 className="font-semibold">{suspect.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {suspect.status}
                        </Badge>
                        {suspect.nickname && (
                          <span className="text-xs text-muted-foreground">
                            AKA: {suspect.nickname}
                          </span>
                        )}
                      </div>
                      {suspect.national_id && (
                        <p className="text-xs text-muted-foreground mt-1">
                          ID: {suspect.national_id}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleRemoveSuspect(suspect.id)}
                    disabled={removeSuspectMutation.isPending}
                  >
                    <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
