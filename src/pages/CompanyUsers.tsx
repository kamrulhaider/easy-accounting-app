import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CreateUserModal } from "@/components/layout/CreateUserModal";
import { EditUserModal } from "@/components/layout/EditUserModal";
import { ConfirmationModal } from "@/components/layout/ConfirmationModal";
import {
    Pencil,
    Trash2,
    Mail,
    Phone,
    Search,
    UserPlus,
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle,
    Loader2,
    ArrowUpDown
} from "lucide-react";

export default function CompanyUsersPage() {
    const { user, allUsers, totalUsers, fetchCompanyUsers, deleteCompanyUser } = useAuthStore();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    // Confirmation Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);

    // Filters and Pagination
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [page, setPage] = useState(1);
    const limit = 10;

    const [isLoading, setIsLoading] = useState(true);

    const loadUsers = async () => {
        setIsLoading(true);
        try {
            const params: any = {
                limit,
                offset: (page - 1) * limit,
            };

            if (searchTerm) params.q = searchTerm;
            if (statusFilter !== "ALL") params.status = statusFilter;

            await fetchCompanyUsers(params);
        } catch (error) {
            console.error("Failed to load company users:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteClick = (userId: string, name: string) => {
        setUserToDelete({ id: userId, name });
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!userToDelete) return;

        try {
            await deleteCompanyUser(userToDelete.id);
            loadUsers();
            setIsDeleteModalOpen(false);
            setUserToDelete(null);
        } catch (error: any) {
            alert(error.message || "Failed to delete user");
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            loadUsers();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, statusFilter, page]);

    if (user?.userRole !== "COMPANY_ADMIN") {
        return <Navigate to="/" replace />;
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "ACTIVE":
                return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
            case "INACTIVE":
                return <XCircle className="h-4 w-4 text-gray-500" />;
            case "PENDING":
                return <Clock className="h-4 w-4 text-amber-500" />;
            case "SUSPENDED":
                return <AlertCircle className="h-4 w-4 text-rose-500" />;
            default:
                return null;
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case "ACTIVE":
                return "bg-emerald-50 text-emerald-700 border-emerald-100";
            case "INACTIVE":
                return "bg-gray-50 text-gray-700 border-gray-100";
            case "PENDING":
                return "bg-amber-50 text-amber-700 border-amber-100";
            case "SUSPENDED":
                return "bg-rose-50 text-rose-700 border-rose-100";
            default:
                return "bg-gray-50 text-gray-700";
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 ml-4">Users</h2>
                        <p className="text-muted-foreground ml-4">
                            Manage your company employees and their access.
                        </p>
                    </div>
                    <div className="ml-4 md:ml-0">
                        <Button className="gap-2" onClick={() => setIsCreateModalOpen(true)}>
                            <UserPlus className="h-4 w-4" />
                            Add User
                        </Button>
                    </div>
                </div>

                <Card className="ml-4 mr-4">
                    <CardHeader className="pb-3 px-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search users..."
                                    className="pl-9 bg-muted/50 focus-visible:bg-background transition-colors"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setPage(1);
                                    }}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => {
                                        setStatusFilter(e.target.value);
                                        setPage(1);
                                    }}
                                    className="flex h-9 w-[130px] rounded-md border border-input bg-muted/50 px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                >
                                    <option value="ALL">All Statuses</option>
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                    <option value="PENDING">Pending</option>
                                    <option value="SUSPENDED">Suspended</option>
                                </select>
                                <Button variant="outline" size="icon" className="h-9 w-9">
                                    <ArrowUpDown className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-muted/50 border-y text-muted-foreground font-medium">
                                    <tr>
                                        <th className="px-6 py-4">User</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 hidden md:table-cell">Contact</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y relative min-h-[400px]">
                                    {isLoading && allUsers.length === 0 ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td className="px-6 py-4"><div className="h-10 w-48 bg-muted rounded" /></td>
                                                <td className="px-6 py-4"><div className="h-6 w-20 bg-muted rounded-full" /></td>
                                                <td className="px-6 py-4 hidden md:table-cell"><div className="h-4 w-32 bg-muted rounded" /></td>
                                                <td className="px-6 py-4 text-right"><div className="ml-auto h-8 w-8 bg-muted rounded" /></td>
                                            </tr>
                                        ))
                                    ) : allUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-20 text-center text-muted-foreground font-medium italic">
                                                {isLoading ? "Loading users..." : "No users found in your company."}
                                            </td>
                                        </tr>
                                    ) : (
                                        <>
                                            {allUsers.map((u) => (
                                                <tr key={u.id} className={cn(
                                                    "hover:bg-muted/30 transition-all group",
                                                    isLoading ? "opacity-50 grayscale-[0.5] pointer-events-none" : "opacity-100"
                                                )}>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10 text-primary font-bold">
                                                                {u.name?.charAt(0) || u.username?.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold text-gray-900 line-clamp-1">{u.name}</div>
                                                                <div className="text-xs text-muted-foreground truncate max-w-[150px]">@{u.username}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className={cn(
                                                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors",
                                                            getStatusStyles(u.status)
                                                        )}>
                                                            {getStatusIcon(u.status)}
                                                            {u.status}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 hidden md:table-cell">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                                                <Mail className="h-3 w-3" />
                                                                {u.email}
                                                            </div>
                                                            {u.phone && (
                                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                    <Phone className="h-3 w-3" />
                                                                    {u.phone}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                                                                onClick={() => {
                                                                    setSelectedUserId(u.id);
                                                                    setIsEditModalOpen(true);
                                                                }}
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                                onClick={() => handleDeleteClick(u.id, u.name)}
                                                                disabled={u.id === user?.id}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {isLoading && (
                                                <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] flex items-center justify-center z-10">
                                                    <div className="bg-white/90 px-4 py-2 rounded-full shadow-lg border flex items-center gap-2 text-sm font-medium text-primary">
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        Refreshing...
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-6 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                            <div>
                                Showing <span className="font-medium text-foreground">{(page - 1) * limit + 1}</span> to <span className="font-medium text-foreground">{Math.min(page * limit, totalUsers)}</span> of <span className="font-medium text-foreground">{totalUsers}</span> users
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                                    disabled={page === 1 || isLoading}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(prev => prev + 1)}
                                    disabled={page * limit >= totalUsers || isLoading}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <CreateUserModal
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
                onSuccess={loadUsers}
            />

            <EditUserModal
                open={isEditModalOpen}
                onOpenChange={setIsEditModalOpen}
                onSuccess={loadUsers}
                userId={selectedUserId}
            />

            <ConfirmationModal
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
                title={`Delete ${userToDelete?.name}?`}
                description={`Are you sure you want to delete ${userToDelete?.name}? This action cannot be undone and they will lose access immediately.`}
                onConfirm={confirmDelete}
                confirmText="Delete User"
                cancelText="Cancel"
                variant="destructive"
            />
        </DashboardLayout>
    );
}
