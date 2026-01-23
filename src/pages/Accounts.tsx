import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Landmark,
    Search,
    Plus,
    Loader2,
    Calendar,
    Tag,
    ArrowUpDown,
    Edit2,
    Power,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CreateAccountModal } from "@/components/layout/CreateAccountModal";
import { EditAccountModal } from "@/components/layout/EditAccountModal";
import { ConfirmationModal } from "@/components/layout/ConfirmationModal";

export default function AccountsPage() {
    const { user, accounts, totalAccounts, fetchAccounts } = useAuthStore();

    // Filters and Pagination
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [page, setPage] = useState(1);
    const limit = 10;

    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<any>(null);

    // Confirmation Modal State
    const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
    const [accountToDeactivate, setAccountToDeactivate] = useState<{ id: string; name: string } | null>(null);

    const { deactivateAccount } = useAuthStore();

    const loadAccounts = async () => {
        setIsLoading(true);
        try {
            const params: any = {
                limit,
                offset: (page - 1) * limit,
            };

            if (searchTerm) params.q = searchTerm;
            if (typeFilter !== "ALL") params.type = typeFilter;
            if (statusFilter !== "ALL") params.status = statusFilter;

            await fetchAccounts(params);
        } catch (error) {
            console.error("Failed to load accounts:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            loadAccounts();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, typeFilter, statusFilter, page]);

    const handleDeactivateClick = (id: string, name: string) => {
        setAccountToDeactivate({ id, name });
        setIsDeactivateModalOpen(true);
    };

    const confirmDeactivate = async () => {
        if (!accountToDeactivate) return;

        try {
            await deactivateAccount(accountToDeactivate.id);
            loadAccounts();
            setIsDeactivateModalOpen(false);
            setAccountToDeactivate(null);
        } catch (error: any) {
            alert(error.message || "Failed to deactivate account");
        }
    };

    if (user?.userRole !== "COMPANY_ADMIN" && user?.userRole !== "COMPANY_USER") {
        return <Navigate to="/" replace />;
    }

    const getStatusStyles = (status: string) => {
        switch (status) {
            case "ACTIVE":
                return "bg-emerald-50 text-emerald-700 border-emerald-100";
            case "INACTIVE":
                return "bg-gray-50 text-gray-700 border-gray-100";
            default:
                return "bg-gray-50 text-gray-700";
        }
    };

    const getTypeStyles = (type: string) => {
        switch (type) {
            case "ASSET": return "bg-blue-50 text-blue-700 border-blue-100";
            case "LIABILITY": return "bg-rose-50 text-rose-700 border-rose-100";
            case "EQUITY": return "bg-purple-50 text-purple-700 border-purple-100";
            case "INCOME": return "bg-emerald-50 text-emerald-700 border-emerald-100";
            case "EXPENSE": return "bg-amber-50 text-amber-700 border-amber-100";
            default: return "bg-gray-50 text-gray-700 border-gray-100";
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 ml-4">Accounts</h2>
                        <p className="text-muted-foreground ml-4">
                            Manage your chart of accounts and financial categories.
                        </p>
                    </div>
                    <div className="ml-4 md:ml-0">
                        <Button className="gap-2" onClick={() => setIsCreateModalOpen(true)}>
                            <Plus className="h-4 w-4" />
                            New Account
                        </Button>
                    </div>
                </div>

                <Card className="ml-4 mr-4">
                    <CardHeader className="pb-3 px-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search account name..."
                                    className="pl-9 bg-muted/50 focus-visible:bg-background transition-colors"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setPage(1);
                                    }}
                                />
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <select
                                    value={typeFilter}
                                    onChange={(e) => {
                                        setTypeFilter(e.target.value);
                                        setPage(1);
                                    }}
                                    className="flex h-9 w-[130px] rounded-md border border-input bg-muted/50 px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                >
                                    <option value="ALL">All Types</option>
                                    <option value="ASSET">Asset</option>
                                    <option value="LIABILITY">Liability</option>
                                    <option value="EQUITY">Equity</option>
                                    <option value="INCOME">Income</option>
                                    <option value="EXPENSE">Expense</option>
                                </select>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => {
                                        setStatusFilter(e.target.value);
                                        setPage(1);
                                    }}
                                    className="flex h-9 w-[110px] rounded-md border border-input bg-muted/50 px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                >
                                    <option value="ALL">All Status</option>
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
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
                                        <th className="px-6 py-4">Account Name</th>
                                        <th className="px-6 py-4">Type</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 hidden md:table-cell">Category</th>
                                        <th className="px-6 py-4 hidden lg:table-cell">Created</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y relative min-h-[400px]">
                                    {isLoading && accounts.length === 0 ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td className="px-6 py-4"><div className="h-10 w-48 bg-muted rounded" /></td>
                                                <td className="px-6 py-4"><div className="h-6 w-24 bg-muted rounded-full" /></td>
                                                <td className="px-6 py-4"><div className="h-6 w-20 bg-muted rounded-full" /></td>
                                                <td className="px-6 py-4 hidden md:table-cell"><div className="h-4 w-32 bg-muted rounded" /></td>
                                                <td className="px-6 py-4 hidden lg:table-cell"><div className="h-4 w-24 bg-muted rounded" /></td>
                                                <td className="px-6 py-4 text-right"><div className="ml-auto h-8 w-8 bg-muted rounded" /></td>
                                            </tr>
                                        ))
                                    ) : accounts.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-20 text-center text-muted-foreground font-medium italic">
                                                <div className="flex flex-col items-center gap-3">
                                                    <Landmark className="h-10 w-10 text-muted-foreground/30" />
                                                    <p>{isLoading ? "Updating list..." : "No accounts found."}</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        <>
                                            {accounts.map((acc) => (
                                                <tr key={acc.id} className={cn(
                                                    "hover:bg-muted/30 transition-all group",
                                                    isLoading ? "opacity-50 grayscale-[0.5] pointer-events-none" : "opacity-100"
                                                )}>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-lg bg-primary/5 flex items-center justify-center border border-primary/10">
                                                                <Landmark className="h-5 w-5 text-primary" />
                                                            </div>
                                                            <div className="font-semibold text-gray-900">{acc.name}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className={cn(
                                                            "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider",
                                                            getTypeStyles(acc.accountType)
                                                        )}>
                                                            {acc.accountType}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className={cn(
                                                            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                                                            getStatusStyles(acc.status)
                                                        )}>
                                                            <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", acc.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-gray-400')} />
                                                            {acc.status}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 hidden md:table-cell">
                                                        {acc.category ? (
                                                            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                                                <Tag className="h-3 w-3" />
                                                                {acc.category.name}
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground italic">Uncategorized</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 hidden lg:table-cell text-xs text-muted-foreground">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="h-3 w-3" />
                                                            {new Date(acc.createdAt).toLocaleDateString()}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                                onClick={() => {
                                                                    setSelectedAccount(acc);
                                                                    setIsEditModalOpen(true);
                                                                }}
                                                                title="Edit Account"
                                                            >
                                                                <Edit2 className="h-4 w-4" />
                                                            </Button>
                                                            {acc.status === 'ACTIVE' && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-muted-foreground hover:text-rose-600"
                                                                    onClick={() => handleDeactivateClick(acc.id, acc.name)}
                                                                    title="Deactivate Account"
                                                                >
                                                                    <Power className="h-4 w-4" />
                                                                </Button>
                                                            )}
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
                                Showing <span className="font-medium text-foreground">{(page - 1) * limit + 1}</span> to <span className="font-medium text-foreground">{Math.min(page * limit, totalAccounts)}</span> of <span className="font-medium text-foreground">{totalAccounts}</span> accounts
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
                                    disabled={page * limit >= totalAccounts || isLoading}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <CreateAccountModal
                    open={isCreateModalOpen}
                    onOpenChange={setIsCreateModalOpen}
                    onSuccess={loadAccounts}
                />
                <EditAccountModal
                    account={selectedAccount}
                    open={isEditModalOpen}
                    onOpenChange={setIsEditModalOpen}
                    onSuccess={loadAccounts}
                />

                <ConfirmationModal
                    open={isDeactivateModalOpen}
                    onOpenChange={setIsDeactivateModalOpen}
                    title="Deactivate Account"
                    description={`Are you sure you want to deactivate the account "${accountToDeactivate?.name}"? You can reactivate it later.`}
                    onConfirm={confirmDeactivate}
                    confirmText="Deactivate"
                    cancelText="Cancel"
                    variant="destructive"
                />
            </div>
        </DashboardLayout>
    );
}
