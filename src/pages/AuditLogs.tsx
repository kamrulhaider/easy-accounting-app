import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Activity,
    Search,
    Loader2,
    Calendar,
    ArrowUpDown,
    ChevronDown,
    ChevronUp,
    Shield
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AuditLogs() {
    const { user, auditLogs, totalAuditLogs, fetchAuditLogs } = useAuthStore();

    // Filters and Pagination
    const [page, setPage] = useState(1);
    const limit = 20;

    // Filter states
    const [actionFilter, setActionFilter] = useState("");
    const [entityFilter, setEntityFilter] = useState("");
    const [userIdFilter, setUserIdFilter] = useState("");
    const [companyIdFilter, setCompanyIdFilter] = useState("");

    const [isLoading, setIsLoading] = useState(true);

    const loadAuditLogs = async () => {
        setIsLoading(true);
        try {
            const params: any = {
                limit,
                offset: (page - 1) * limit,
            };

            if (actionFilter) params.action = actionFilter;
            if (entityFilter) params.entity = entityFilter;
            if (userIdFilter) params.userId = userIdFilter;
            if (companyIdFilter) params.companyId = companyIdFilter;

            await fetchAuditLogs(params);
        } catch (error) {
            console.error("Failed to load audit logs:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            loadAuditLogs();
        }, 500); // Debounce
        return () => clearTimeout(timer);
    }, [actionFilter, entityFilter, userIdFilter, companyIdFilter, page]);

    if (!user || (user.userRole !== "SUPER_ADMIN" && user.userRole !== "COMPANY_ADMIN")) {
        return <Navigate to="/" replace />;
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 ml-4">Audit Logs</h2>
                        <p className="text-muted-foreground ml-4">
                            Track system activities and changes.
                        </p>
                    </div>
                </div>

                <Card className="ml-4 mr-4 overflow-hidden border-none shadow-xl ring-1 ring-gray-200">
                    <CardHeader className="pb-3 px-6 bg-gray-50/50">
                        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Filter by Action..."
                                        className="pl-9 bg-white border-gray-200"
                                        value={actionFilter}
                                        onChange={(e) => {
                                            setActionFilter(e.target.value);
                                            setPage(1);
                                        }}
                                    />
                                </div>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Filter by Entity..."
                                        className="pl-9 bg-white border-gray-200"
                                        value={entityFilter}
                                        onChange={(e) => {
                                            setEntityFilter(e.target.value);
                                            setPage(1);
                                        }}
                                    />
                                </div>
                                <div className="relative">
                                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="User ID"
                                        className="pl-9 bg-white border-gray-200"
                                        value={userIdFilter}
                                        onChange={(e) => {
                                            setUserIdFilter(e.target.value);
                                            setPage(1);
                                        }}
                                    />
                                </div>
                                {user.userRole === "SUPER_ADMIN" && (
                                    <div className="relative">
                                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Company ID"
                                            className="pl-9 bg-white border-gray-200"
                                            value={companyIdFilter}
                                            onChange={(e) => {
                                                setCompanyIdFilter(e.target.value);
                                                setPage(1);
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                            <Button
                                variant="outline"
                                size="icon"
                                className="h-9 w-9 bg-white border-gray-200 text-gray-500 hover:text-primary shrink-0"
                                onClick={loadAuditLogs}
                            >
                                <ArrowUpDown className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 border-b text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                                    <tr>
                                        <th className="px-6 py-4">Timestamp</th>
                                        <th className="px-6 py-4">Action</th>
                                        <th className="px-6 py-4">Entity</th>
                                        <th className="px-6 py-4">Entity ID</th>
                                        <th className="px-6 py-4">User</th>
                                        <th className="px-6 py-4">Company</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y relative">
                                    {isLoading && auditLogs.length === 0 ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td className="px-6 py-4"><div className="h-4 w-32 bg-gray-200 rounded" /></td>
                                                <td className="px-6 py-4"><div className="h-4 w-16 bg-gray-200 rounded" /></td>
                                                <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
                                                <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
                                                <td className="px-6 py-4"><div className="h-4 w-32 bg-gray-200 rounded" /></td>
                                                <td className="px-6 py-4"><div className="h-4 w-32 bg-gray-200 rounded" /></td>
                                            </tr>
                                        ))
                                    ) : auditLogs.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-20 text-center text-muted-foreground font-medium italic">
                                                <div className="flex flex-col items-center gap-3">
                                                    <Activity className="h-10 w-10 text-muted-foreground/30" />
                                                    <p>{isLoading ? "Updating list..." : "No audit logs found."}</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        <>
                                            {auditLogs.map((log) => (
                                                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                                            <span className="font-medium text-gray-900">
                                                                {new Date(log.timestamp).toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={cn(
                                                            "px-2 py-1 rounded text-xs font-bold uppercase tracking-wider",
                                                            log.action?.toLowerCase().includes("create") ? "bg-emerald-100 text-emerald-800" :
                                                                log.action?.toLowerCase().includes("update") ? "bg-amber-100 text-amber-800" :
                                                                    log.action?.toLowerCase().includes("delete") ? "bg-rose-100 text-rose-800" :
                                                                        "bg-gray-100 text-gray-800"
                                                        )}>
                                                            {log.action}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 font-medium text-gray-700">
                                                        {log.entity}
                                                    </td>
                                                    <td className="px-6 py-4 text-xs font-mono text-muted-foreground">
                                                        {log.entityId}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-gray-900">{log.user?.name || "Unknown User"}</span>
                                                            <span className="text-xs text-muted-foreground">{log.user?.email}</span>
                                                            <span className="text-[10px] text-muted-foreground uppercase">{log.user?.userRole}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-gray-900">{log.company?.name || "N/A"}</span>
                                                            {log.company?.email && <span className="text-xs text-muted-foreground">{log.company?.email}</span>}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {isLoading && (
                                                <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] flex items-center justify-center z-10">
                                                    <div className="bg-white/90 px-4 py-2 rounded-full shadow-lg border flex items-center gap-2 text-sm font-medium text-primary animate-bounce">
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        Refreshing entries...
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-6 py-4 border-t bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                            <div>
                                Showing <span className="text-foreground">{(page - 1) * limit + 1}</span>-
                                <span className="text-foreground">{Math.min(page * limit, totalAuditLogs)}</span> of
                                <span className="text-foreground ml-1">{totalAuditLogs}</span> Entries
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                                    disabled={page === 1 || isLoading}
                                    className="bg-white h-8 w-8 p-0"
                                >
                                    <ChevronUp className="h-4 w-4 -rotate-90" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(prev => prev + 1)}
                                    disabled={page * limit >= totalAuditLogs || isLoading}
                                    className="bg-white h-8 w-8 p-0"
                                >
                                    <ChevronDown className="h-4 w-4 -rotate-90" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
