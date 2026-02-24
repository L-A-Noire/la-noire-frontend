import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
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
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { toast } from "react-toastify";
import http from "@/lib/http";
import { useAuthStore } from "@/stores/auth.store";

interface SuspectFormData {
    first_name: string;
    last_name: string;
    password: string;
    status: string;
}

export const AddSuspectPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { session } = useAuthStore();
    const [isSubmitting, setIsSubmitting] = useState(false);

    console.log("Current session user:", session); // Debug log

    const [formData, setFormData] = useState<SuspectFormData>({
        first_name: "",
        last_name: "",
        password: "temporary123",
        status: "suspect",
    });

    const addSuspectMutation = useMutation({
        mutationFn: async (data: SuspectFormData) => {
            const timestamp = Date.now();
            const random = Math.floor(Math.random() * 1000);

            const username = `${data.first_name.toLowerCase()}_${data.last_name.toLowerCase()}_${timestamp}`;

            const email = `suspect_${timestamp}${random}@local.system`;

            const phone = `${timestamp}`.slice(-10);

            const nationalId = `ID${timestamp}${random}`;

            const userResponse = await http.post("/auth/register/", {
                username: username,
                email: email,
                phone: phone,
                first_name: data.first_name,
                last_name: data.last_name,
                national_id: nationalId,
                password: data.password,
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
                console.error("Unexpected response format:", newUser);
                throw new Error("Could not get user ID from response");
            }

            const suspectCrimePayload = {
                suspect: userId,
                case: parseInt(id!),
                status: data.status,
            };

            const suspectResponse = await http.post("/suspect/suspect-crimes/", suspectCrimePayload);

            return suspectResponse.data;
        },
        onSuccess: (data) => {
            toast.success("Suspect added to case successfully");
            navigate(`/cases/${id}`);
        },
        onError: (error: any) => {
            console.error("Error adding suspect:", error);
            console.error("Error response data:", error.response?.data);
            console.error("Error status:", error.response?.status);
            console.error("Error headers:", error.response?.headers);

            if (error.response?.data) {
                const errorData = error.response.data;

                if (errorData.added_by) {
                    toast.error(`Added by error: ${JSON.stringify(errorData.added_by)}`);
                } else if (errorData.suspect) {
                    toast.error(`Suspect error: ${errorData.suspect[0] || errorData.suspect}`);
                } else if (errorData.phone) {
                    toast.error(`Phone error: ${errorData.phone[0]}`);
                } else if (errorData.national_id) {
                    toast.error(`National ID error: ${errorData.national_id[0]}`);
                } else if (errorData.username) {
                    toast.error(`Username error: ${errorData.username[0]}`);
                } else if (errorData.email) {
                    toast.error(`Email error: ${errorData.email[0]}`);
                } else if (errorData.message) {
                    toast.error(errorData.message);
                } else {
                    toast.error("Failed to add suspect");
                }
            } else {
                toast.error("Failed to add suspect");
            }
        },
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.first_name || !formData.last_name) {
            toast.error("Please enter suspect's first and last name");
            return;
        }

        if (!session?.user?.id) {
            toast.error("You must be logged in to add a suspect");
            console.error("No user ID in session:", session);
            return;
        }

        console.log("Submitting with user ID:", session.user.id);
        setIsSubmitting(true);
        addSuspectMutation.mutate(formData);
    };

    return (
        <div className="container mx-auto py-8 max-w-2xl space-y-6">
            <Button
                variant="ghost"
                className="pl-0 hover:bg-transparent hover:text-primary"
                onClick={() => navigate(`/cases/${id}`)}
            >
                <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 h-4 w-4" />
                Back to Case
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle>Add Suspect to Case #{id}</CardTitle>
                    <CardDescription>
                        Enter suspect information to add them to this case
                    </CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="first_name">First Name *</Label>
                                <Input
                                    id="first_name"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    placeholder="John"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="last_name">Last Name *</Label>
                                <Input
                                    id="last_name"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    placeholder="Doe"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => setFormData({ ...formData, status: value })}
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

                        <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded border border-blue-200 dark:border-blue-900">
                            <p className="text-xs text-blue-800 dark:text-blue-200">
                                System will generate unique identifiers for this suspect automatically.
                            </p>
                        </div>
                    </CardContent>

                    <div className="border-t p-6 flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate(`/cases/${id}`)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Adding..." : "Add Suspect"}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};