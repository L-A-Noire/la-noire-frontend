import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRoles, deleteRole, createRole, updateRole, getRole } from "@/api/roles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { Settings01Icon, Delete02Icon, Edit02Icon, Add01Icon, ArrowLeft01Icon, UserGroupIcon } from "@hugeicons/core-free-icons";

// List Page
export function RolesListPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { data: roles, isLoading } = useQuery({
        queryKey: ["roles"],
        queryFn: getRoles,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteRole,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["roles"] });
            toast.success("Role deleted successfully");
        },
        onError: () => {
            toast.error("Failed to delete role");
        },
    });

    const handleDelete = (id: number) => {
        if (confirm("Are you sure you want to delete this role? This action cannot be undone.")) {
            deleteMutation.mutate(id);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary font-mono flex items-center gap-2">
                        <HugeiconsIcon icon={Settings01Icon} />
                        ROLE MANAGEMENT
                    </h1>
                    <p className="text-muted-foreground">Manage system access levels and designations.</p>
                </div>
                <Button onClick={() => navigate("/roles/new")} className="gap-2">
                    <HugeiconsIcon icon={Add01Icon} /> Create New Role
                </Button>
            </div>
            
            <Separator />

            {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader className="h-24 bg-muted/50" />
                            <CardContent className="h-32" />
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-5">
                    {roles?.map((role) => (
                        <Card key={role.id} className="group hover:border-primary/50 transition-colors">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xl font-bold">
                                    {role.title}
                                </CardTitle>
                                <Badge variant="outline" className="font-mono">ID: {role.id}</Badge>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                                    <HugeiconsIcon icon={UserGroupIcon} className="w-4 h-4" />
                                    <span>{role.user_count} Users assigned</span>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end gap-2 pt-4 mt-auto">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => navigate(`/roles/${role.id}`)}
                                    className="gap-2 hover:bg-primary/10 hover:text-primary"
                                >
                                    <HugeiconsIcon icon={Edit02Icon} className="w-4 h-4" /> Edit
                                </Button>
                                <Button 
                                    variant="destructive" 
                                    size="sm" 
                                    onClick={() => handleDelete(role.id)}
                                    disabled={deleteMutation.isPending}
                                    className="gap-2"
                                >
                                    <HugeiconsIcon icon={Delete02Icon} className="w-4 h-4" /> Delete
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                     {roles?.length === 0 && (
                        <div className="col-span-full text-center py-12 text-muted-foreground">
                            No roles found. Create one to get started.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// Form Page (Create/Edit)
export function RoleFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const isEditing = Boolean(id);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
    });

    const { data: roleData, isLoading: isLoadingRole } = useQuery({
        queryKey: ["role", id],
        queryFn: () => getRole(Number(id)),
        enabled: isEditing,
    });

    useEffect(() => {
        if (roleData) {
            setFormData({
                title: roleData.title,
                description: roleData.description || "",
            });
        }
    }, [roleData]);

    const mutation = useMutation({
        mutationFn: (data: typeof formData) => {
            if (isEditing) {
                return updateRole(Number(id), data);
            }
            return createRole(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["roles"] });
            toast.success(`Role ${isEditing ? "updated" : "created"} successfully`);
            navigate("/roles");
        },
        onError: () => {
            toast.error(`Failed to ${isEditing ? "update" : "create"} role`);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(formData);
    };

    if (isEditing && isLoadingRole) {
        return <div>Loading role details...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-semibold tracking-tight">
                        {isEditing ? "Edit Role Designation" : "New Role Designation"}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {isEditing 
                            ? "Modify existing access level and permissions." 
                            : "Establish a new hierarchy level in the department."}
                    </p>
                </div>
                 <Button variant="ghost" onClick={() => navigate("/roles")} className="gap-2">
                    <HugeiconsIcon icon={ArrowLeft01Icon} /> Back
                </Button>
            </div>
            
            <Separator />

            <Card>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4 pt-4">
                        <div className="flex flex-col space-y-2">
                            <Label htmlFor="title">Role Title</Label>
                            <Input 
                                id="title" 
                                placeholder="e.g. Detective, Captain" 
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                required
                            />
                        </div>
                        <div className="flex flex-col space-y-2">
                            <Label htmlFor="description">Description & Permissions</Label>
                            <Input 
                                id="description" 
                                placeholder="Describe the responsibilities..." 
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between bg-muted/20 py-4 mt-8">
                        <Button type="button" variant="ghost" onClick={() => navigate("/roles")}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? "Saving..." : (isEditing ? "Save Changes" : "Create Role")}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
