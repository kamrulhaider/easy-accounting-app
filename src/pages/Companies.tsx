import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Plus,
    Search,
    Building2,
    Mail,
    Phone,
    MapPin,
    ArrowUpDown,
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle,
    Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { EditCompanyModal } from "@/components/layout/EditCompanyModal";
import { CreateCompanyModal } from "@/components/layout/CreateCompanyModal";
import { DeleteCompanyModal } from "@/components/layout/DeleteCompanyModal";
import { Edit2, Trash2 } from "lucide-react";

export default function CompaniesPage() {
    const { companies, totalCompanies, fetchCompanies, user } = useAuthStore();

    if (user?.userRole === "COMPANY_ADMIN" || user?.userRole === "COMPANY_USER") {
        return <Navigate to="/" replace />;
    }
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [includeDeleted, setIncludeDeleted] = useState(false);
    const [page, setPage] = useState(1);
    const limit = 10;

    const [isLoading, setIsLoading] = useState(true);
    const [selectedCompany, setSelectedCompany] = useState<any>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const loadCompanies = async () => {
        setIsLoading(true);
        try {
            const params: any = {
                limit,
                offset: (page - 1) * limit,
            };

            if (searchTerm) params.q = searchTerm;
            if (statusFilter !== "ALL") params.status = statusFilter;
            if (includeDeleted) params.includeDeleted = "true";

            await fetchCompanies(params);
        } catch (error) {
            console.error("Failed to load companies:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            loadCompanies();
        }, 300); // Debounce search
        return () => clearTimeout(timer);
    }, [searchTerm, statusFilter, page, includeDeleted, fetchCompanies]);

    const handleEdit = (company: any) => {
        setSelectedCompany(company);
        setIsEditModalOpen(true);
    };

    const handleOpenDelete = (company: any) => {
        setSelectedCompany(company);
        setIsDeleteModalOpen(true);
    };

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

    const isAdmin = user?.userRole === "SUPER_ADMIN" || user?.userRole === "MODERATOR";

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 ml-4">Companies</h2>
                        <p className="text-muted-foreground ml-4">
                            Manage your client companies and their account status.
                        </p>
                    </div>
                    {isAdmin && (
                        <div className="ml-4 md:ml-0">
                            <Button className="gap-2" onClick={() => setIsCreateModalOpen(true)}>
                                <Plus className="h-4 w-4" />
                                New Company
                            </Button>
                        </div>
                    )}
                </div>

                <Card className="ml-4 mr-4">
                    <CardHeader className="pb-3 px-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4 flex-1">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search name or email..."
                                        className="pl-9 bg-muted/50 focus-visible:bg-background transition-colors"
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setPage(1); // Reset to first page on search
                                        }}
                                    />
                                </div>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => {
                                        setStatusFilter(e.target.value);
                                        setPage(1);
                                    }}
                                    className="flex h-9 w-[140px] rounded-md border border-input bg-muted/50 px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                >
                                    <option value="ALL">All Statuses</option>
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                    <option value="PENDING">Pending</option>
                                    <option value="SUSPENDED">Suspended</option>
                                </select>
                            </div>

                            {isAdmin && (
                                <div className="flex items-center gap-2">
                                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={includeDeleted}
                                            onChange={(e) => {
                                                setIncludeDeleted(e.target.checked);
                                                setPage(1);
                                            }}
                                            className="rounded border-gray-300 text-primary focus:ring-primary h-3 w-3"
                                        />
                                        Include Deleted
                                    </label>
                                    <Button variant="outline" size="icon" className="h-8 w-8 ml-2">
                                        <ArrowUpDown className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-muted/50 border-y text-muted-foreground font-medium">
                                    <tr>
                                        <th className="px-6 py-4">Company Name</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 hidden md:table-cell">Contact</th>
                                        <th className="px-6 py-4 hidden lg:table-cell">Address</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y relative">
                                    {isLoading && companies.length === 0 ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td className="px-6 py-4"><div className="h-10 w-48 bg-muted rounded" /></td>
                                                <td className="px-6 py-4"><div className="h-6 w-20 bg-muted rounded-full" /></td>
                                                <td className="px-6 py-4 hidden md:table-cell"><div className="h-4 w-32 bg-muted rounded" /></td>
                                                <td className="px-6 py-4 hidden lg:table-cell"><div className="h-4 w-40 bg-muted rounded" /></td>
                                                <td className="px-6 py-4 text-right"><div className="ml-auto h-8 w-8 bg-muted rounded" /></td>
                                            </tr>
                                        ))
                                    ) : companies.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground italic">
                                                {isLoading ? "Searching..." : "No companies found."}
                                            </td>
                                        </tr>
                                    ) : (
                                        <>
                                            {companies.map((company) => (
                                                <tr
                                                    key={company.id}
                                                    className={cn(
                                                        "hover:bg-muted/30 transition-all group",
                                                        isLoading ? "opacity-50 grayscale-[0.5] pointer-events-none" : "opacity-100"
                                                    )}
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-lg bg-primary/5 flex items-center justify-center border border-primary/10">
                                                                <Building2 className="h-5 w-5 text-primary" />
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold text-gray-900 line-clamp-1">{company.name}</div>
                                                                <div className="text-xs text-muted-foreground truncate max-w-[150px]">{company.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className={cn(
                                                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors",
                                                            getStatusStyles(company.status)
                                                        )}>
                                                            {getStatusIcon(company.status)}
                                                            {company.status}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 hidden md:table-cell">
                                                        <div className="space-y-1">
                                                            {company.phone && (
                                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                    <Phone className="h-3 w-3" />
                                                                    {company.phone}
                                                                </div>
                                                            )}
                                                            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                                                <Mail className="h-3 w-3" />
                                                                {company.email}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 hidden lg:table-cell">
                                                        <div className="flex items-start gap-2 text-xs text-muted-foreground max-w-[200px]">
                                                            <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                                                            <span className="truncate">{company.address || "No address set"}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        {(isAdmin || user?.company?.id === company.id) && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary"
                                                                onClick={() => handleEdit(company)}
                                                                title="Edit Company"
                                                            >
                                                                <Edit2 className="h-4 w-4" />
                                                            </Button>
                                                        )}

                                                        {user?.userRole === "SUPER_ADMIN" && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                                                                onClick={() => handleOpenDelete(company)}
                                                                title="Delete Company"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        )}

                                                    </td>
                                                </tr>
                                            ))}
                                            {isLoading && (
                                                <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-b-lg">
                                                    <div className="bg-white/80 px-4 py-2 rounded-full shadow-lg border flex items-center gap-2 text-sm font-medium text-primary animate-in fade-in zoom-in duration-200">
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
                                Showing <span className="font-medium text-foreground">{(page - 1) * limit + 1}</span> to <span className="font-medium text-foreground">{Math.min(page * limit, totalCompanies)}</span> of <span className="font-medium text-foreground">{totalCompanies}</span> companies
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
                                    disabled={page * limit >= totalCompanies || isLoading}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <EditCompanyModal
                    company={selectedCompany}
                    open={isEditModalOpen}
                    onOpenChange={setIsEditModalOpen}
                    onSuccess={loadCompanies}
                />

                <CreateCompanyModal
                    open={isCreateModalOpen}
                    onOpenChange={setIsCreateModalOpen}
                    onSuccess={loadCompanies}
                />

                <DeleteCompanyModal
                    company={selectedCompany}
                    open={isDeleteModalOpen}
                    onOpenChange={setIsDeleteModalOpen}
                    onSuccess={loadCompanies}
                />


            </div>
        </DashboardLayout>
    );
}
