import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    ArrowLeft01Icon,
    MapPinIcon,
    ClockIcon,
    UserIcon,
    CheckmarkCircle01Icon,
    Delete02Icon,
} from "@hugeicons/core-free-icons";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { useAuthStore } from "@/stores/auth.store";
import {
    getTestimony,
    confirmTestimony,
    deleteTestimony,
} from "@/api/evidence";
import {
    confirmTestimonySchema,
    type ConfirmTestimonyFormData,
} from "@/schemas/evidence.schema";

// Crime level options
const CRIME_LEVELS = [
    { value: "1", label: "Level 3 (Low)" },
    { value: "2", label: "Level 2 (Medium)" },
    { value: "3", label: "Level 1 (High)" },
    { value: "4", label: "Critical" },
];

export const TestimonyDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { session } = useAuthStore();
    const testimonyId = Number(id);

    const canReview = session && !["Cadet", "Base User"].includes(session.user.role_title);
    const canDelete = session?.user.role_title === "Administrator";

    const {
        data: testimony,
        isLoading,
        isError,
        refetch,
    } = useQuery({
        queryKey: ["testimony", testimonyId],
        queryFn: () => getTestimony(testimonyId),
        enabled: !isNaN(testimonyId),
    });

    const {
        register: registerConfirm,
        handleSubmit: handleSubmitConfirm,
        formState: { errors: confirmErrors, isSubmitting: isConfirmSubmitting },
        setValue: setConfirmValue,
        watch: watchConfirm,
        reset: resetConfirm,
    } = useForm<ConfirmTestimonyFormData>({
        resolver: zodResolver(confirmTestimonySchema),
    });

    const selectedCrimeLevel = watchConfirm("crime_level");

    const confirmMutation = useMutation({
        mutationFn: (data: ConfirmTestimonyFormData) =>
            confirmTestimony(testimonyId, { crime_level: parseInt(data.crime_level) }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["testimony", testimonyId] });
            queryClient.invalidateQueries({ queryKey: ["testimonies"] });
            queryClient.invalidateQueries({ queryKey: ["crime-scenes"] });
            toast.success("Testimony confirmed. Crime scene created.");
            resetConfirm();
            refetch();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || "Failed to confirm testimony");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: () => deleteTestimony(testimonyId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["testimonies"] });
            toast.success("Testimony deleted");
            navigate("/testimonies");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || "Failed to delete testimony");
        },
    });

    const onConfirmSubmit = (data: ConfirmTestimonyFormData) => {
        confirmMutation.mutate(data);
    };

    if (isLoading)
        return (
            <div className="p-8 text-center text-muted-foreground">
                Loading testimony...
            </div>
        );

    if (isError || !testimony)
        return (
            <div className="p-8 text-center text-destructive">
                Testimony not found
            </div>
        );

    return (
        <div className="container mx-auto py-8 max-w-4xl space-y-6">
            <Button
                variant="ghost"
                className="pl-0 hover:bg-transparent hover:text-primary"
                onClick={() => navigate("/testimonies")}
            >
                <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 h-4 w-4" />
                Back to Testimonies
            </Button>

            {/* Main Card */}
            <Card>
                <CardHeader className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <CardTitle className="text-2xl">{testimony.title}</CardTitle>
                            <CardDescription>
                                Submitted on {format(new Date(testimony.created_at), "PPP p")}
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge
                                variant={testimony.is_confirmed ? "default" : "outline"}
                                className={
                                    testimony.is_confirmed
                                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                        : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                                }
                            >
                                {testimony.is_confirmed ? "Confirmed" : "Pending Review"}
                            </Badge>
                            {canDelete && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                        if (confirm("Delete this testimony?")) {
                                            deleteMutation.mutate();
                                        }
                                    }}
                                    disabled={deleteMutation.isPending}
                                >
                                    <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Location & Time */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {testimony.location && (
                            <div className="flex items-start gap-2">
                                <HugeiconsIcon
                                    icon={MapPinIcon}
                                    className="h-5 w-5 text-muted-foreground mt-0.5"
                                />
                                <div>
                                    <p className="text-sm font-medium">Location</p>
                                    <p className="text-sm text-muted-foreground">
                                        {testimony.location}
                                    </p>
                                </div>
                            </div>
                        )}
                        <div className="flex items-start gap-2">
                            <HugeiconsIcon
                                icon={ClockIcon}
                                className="h-5 w-5 text-muted-foreground mt-0.5"
                            />
                            <div>
                                <p className="text-sm font-medium">Date & Time of Observation</p>
                                <p className="text-sm text-muted-foreground">
                                    {format(new Date(testimony.seen_at), "PPP p")}
                                </p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Description */}
                    <div>
                        <h3 className="text-sm font-medium mb-2">Description</h3>
                        <p className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
                            {testimony.description}
                        </p>
                    </div>

                    {/* Full Testimony */}
                    <div>
                        <h3 className="text-sm font-medium mb-2">Full Testimony</h3>
                        <p className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg whitespace-pre-wrap">
                            {testimony.transcription}
                        </p>
                    </div>

                    {/* Attachments */}
                    {testimony.attachment_details && testimony.attachment_details.length > 0 && (
                        <div>
                            <h3 className="text-sm font-medium mb-2">
                                Attachments ({testimony.attachment_details.length})
                            </h3>
                            <div className="grid grid-cols-2 gap-2">
                                {testimony.attachment_details.map((attachment) => (
                                    <a
                                        key={attachment.id}
                                        href={attachment.file}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 hover:underline truncate"
                                    >
                                        {attachment.file.split("/").pop()}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Review Form - For Police roles */}
            {canReview && !testimony.is_confirmed && (
                <Card className="border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/20">
                    <CardHeader>
                        <CardTitle className="text-lg">Review Testimony</CardTitle>
                        <CardDescription>
                            Confirm this testimony to create a crime scene. A higher-ranked officer
                            will then need to approve the crime scene to create a case.
                        </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleSubmitConfirm(onConfirmSubmit)}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="crime_level">Crime Level *</Label>
                                <Select
                                    onValueChange={(value) => setConfirmValue("crime_level", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select crime level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CRIME_LEVELS.map((level) => (
                                            <SelectItem key={level.value} value={level.value}>
                                                {level.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {confirmErrors.crime_level && (
                                    <p className="text-sm text-destructive">
                                        {confirmErrors.crime_level.message}
                                    </p>
                                )}
                            </div>

                            <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded border border-amber-200 dark:border-amber-900">
                                <p className="text-xs text-amber-800 dark:text-amber-200">
                                    <span className="font-bold">Note:</span> Confirming this testimony will create a crime scene.
                                    A {session?.user.role_title === "Chief" ? "case will be created immediately" : "higher-ranked officer must then confirm the crime scene to create a case"}.
                                </p>
                            </div>
                        </CardContent>

                        <div className="border-t p-6 flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate("/testimonies")}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isConfirmSubmitting || confirmMutation.isPending || !selectedCrimeLevel}
                            >
                                {confirmMutation.isPending ? "Confirming..." : "Confirm Testimony"}
                            </Button>
                        </div>
                    </form>
                </Card>
            )}
        </div>
    );
};