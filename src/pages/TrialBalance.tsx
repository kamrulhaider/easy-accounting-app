import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore, type TrialBalanceResponse } from "@/store/useAuthStore";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Scale,
    Download,
    Loader2,
    FilterX,
} from "lucide-react";


export default function TrialBalancePage() {
    const { user, getTrialBalance } = useAuthStore();

    // Default to current month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    const [startDate, setStartDate] = useState<string>(firstDay);
    const [endDate, setEndDate] = useState<string>(lastDay);
    const [statusFilter, setStatusFilter] = useState<string>("ACTIVE");

    const [isLoading, setIsLoading] = useState(false);
    const [tbData, setTbData] = useState<TrialBalanceResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const loadTrialBalance = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getTrialBalance({
                startDate: startDate || undefined,
                endDate: endDate || undefined,
                status: statusFilter !== 'ALL' ? statusFilter : undefined
            });
            setTbData(data);
        } catch (err: any) {
            setError(err.message || "Failed to load trial balance");
            setTbData(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadTrialBalance();
    }, [startDate, endDate, statusFilter]);

    if (user?.userRole !== "COMPANY_ADMIN" && user?.userRole !== "COMPANY_USER") {
        return <Navigate to="/" replace />;
    }

    const formatCurrency = (amount: number | null | undefined) => {
        if (amount === null || amount === undefined) return "-";
        if (amount === 0) return "-";
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 ml-4">Trial Balance</h2>
                        <p className="text-muted-foreground ml-4">
                            Annual or periodic summary of all ledger account balances.
                        </p>
                    </div>
                    <div className="ml-4 md:ml-0 flex gap-2">
                        <Button variant="outline" className="gap-2" onClick={() => window.print()}>
                            <Download className="h-4 w-4" />
                            Export PDF
                        </Button>
                    </div>
                </div>

                <Card className="ml-4 mr-4">
                    <CardHeader className="pb-3 border-b bg-gray-50/50">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    <option value="ALL">All Accounts</option>
                                    <option value="ACTIVE">Active Only</option>
                                    <option value="INACTIVE">Inactive Only</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">From Date</label>
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">To Date</label>
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                            <div>
                                <Button
                                    variant="ghost"
                                    className="text-muted-foreground hover:text-primary h-10"
                                    onClick={() => {
                                        setStartDate(firstDay);
                                        setEndDate(lastDay);
                                        setStatusFilter("ACTIVE");
                                    }}
                                >
                                    <FilterX className="h-4 w-4 mr-2" />
                                    Reset
                                </Button>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className="text-muted-foreground font-medium">Calculating balances...</p>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                                <div className="p-3 bg-destructive/10 rounded-full text-destructive">
                                    <Scale className="h-8 w-8" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">Report Error</h3>
                                    <p className="text-muted-foreground max-w-xs">{error}</p>
                                </div>
                                <Button variant="outline" onClick={loadTrialBalance}>Retry</Button>
                            </div>
                        ) : !tbData ? null : (
                            <div>
                                {/* Totals Header */}
                                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x border-b bg-primary/5">
                                    <div className="p-6 flex flex-col items-center justify-center text-center">
                                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Total Debit Balance</span>
                                        <span className="text-3xl font-black text-gray-900">${formatCurrency(tbData.totals.debitBalance)}</span>
                                    </div>
                                    <div className="p-6 flex flex-col items-center justify-center text-center">
                                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Total Credit Balance</span>
                                        <span className="text-3xl font-black text-gray-900">${formatCurrency(tbData.totals.creditBalance)}</span>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-muted/50 border-b text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
                                            <tr>
                                                <th className="px-6 py-4">Account</th>
                                                <th className="px-6 py-4 text-center">Type</th>
                                                <th className="px-6 py-4 text-right">Debit Balance</th>
                                                <th className="px-6 py-4 text-right">Credit Balance</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {tbData.accounts.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-20 text-center text-muted-foreground italic">
                                                        No accounts found matching the criteria.
                                                    </td>
                                                </tr>
                                            ) : (
                                                <>
                                                    {tbData.accounts.map((acc) => (
                                                        <tr key={acc.id} className="hover:bg-muted/30 transition-colors group">
                                                            <td className="px-6 py-4 font-semibold text-gray-900">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-2 w-2 rounded-full bg-primary/20 group-hover:bg-primary transition-colors" />
                                                                    {acc.name}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider bg-gray-50 text-gray-600">
                                                                    {acc.accountType}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-right font-medium tabular-nums">
                                                                {acc.debitBalance > 0 ? formatCurrency(acc.debitBalance) : "-"}
                                                            </td>
                                                            <td className="px-6 py-4 text-right font-medium tabular-nums">
                                                                {acc.creditBalance > 0 ? formatCurrency(acc.creditBalance) : "-"}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {/* Final Total Row */}
                                                    <tr className="bg-muted/20 font-black border-t-2 border-gray-900">
                                                        <td className="px-6 py-6 text-base" colSpan={2}>
                                                            Grand Total
                                                        </td>
                                                        <td className="px-6 py-6 text-right text-base tabular-nums">
                                                            ${formatCurrency(tbData.totals.debitBalance)}
                                                        </td>
                                                        <td className="px-6 py-6 text-right text-base tabular-nums">
                                                            ${formatCurrency(tbData.totals.creditBalance)}
                                                        </td>
                                                    </tr>
                                                </>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Status Warning */}
                                {Math.abs(tbData.totals.net) > 0.01 && (
                                    <div className="m-6 p-4 bg-rose-50 border border-rose-100 rounded-lg flex items-start gap-4">
                                        <div className="p-2 bg-rose-100 rounded-full text-rose-600">
                                            <Scale className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-rose-800 uppercase tracking-tight">Unbalanced Warning</h4>
                                            <p className="text-xs text-rose-600 mt-1">
                                                The trial balance is currently off by <b>${formatCurrency(Math.abs(tbData.totals.net))}</b>.
                                                Please review your journal entries for potential errors.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
