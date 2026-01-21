import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore, type LedgerResponse } from "@/store/useAuthStore";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Book,
    Loader2,
    Landmark,
    FilterX,
    FileText,
    FileSpreadsheet
} from "lucide-react";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export default function LedgerPage() {
    const { user, accounts, fetchAccounts, getLedger } = useAuthStore();

    const [selectedAccountId, setSelectedAccountId] = useState<string>("");

    // Default to current month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    const [startDate, setStartDate] = useState<string>(firstDay);
    const [endDate, setEndDate] = useState<string>(lastDay);
    const [page, setPage] = useState(1);
    const limit = 50;

    const [isLoading, setIsLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [ledgerData, setLedgerData] = useState<LedgerResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchAccounts({ limit: 1000, status: 'ACTIVE' });
    }, [fetchAccounts]);

    const loadLedger = async () => {
        if (!selectedAccountId) return;

        setIsLoading(true);
        setError(null);
        try {
            const data = await getLedger({
                accountId: selectedAccountId,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
                limit,
                offset: (page - 1) * limit
            });
            setLedgerData(data);
        } catch (err: any) {
            setError(err.message || "Failed to load ledger");
            setLedgerData(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (selectedAccountId) {
            loadLedger();
        }
    }, [selectedAccountId, startDate, endDate, page]);

    if (user?.userRole !== "COMPANY_ADMIN" && user?.userRole !== "COMPANY_USER") {
        return <Navigate to="/" replace />;
    }

    const formatCurrency = (amount: number | null | undefined) => {
        if (amount === null || amount === undefined) return "-";
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const fetchFullLedger = async () => {
        if (!selectedAccountId) return null;
        return await getLedger({
            accountId: selectedAccountId,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            all: true
        });
    };

    const handleExportPDF = async () => {
        if (!selectedAccountId || !ledgerData) return;
        setIsExporting(true);
        try {
            const data = await fetchFullLedger();
            if (!data) return;

            const doc = new jsPDF();
            const accountName = data.account.name;

            // Title
            doc.setFontSize(18);
            doc.text(`Ledger - ${accountName}`, 14, 22);

            doc.setFontSize(11);
            doc.text(`Period: ${startDate} to ${endDate}`, 14, 30);
            doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 36);

            // Table
            const tableColumn = ["Date", "Ref", "Description", "Debit", "Credit", "Balance"];
            const tableRows: any[] = [];

            data.lines.forEach(line => {
                const row = [
                    new Date(line.date).toLocaleDateString(),
                    `JE-${line.journalEntryId.substring(0, 8)}`,
                    line.description || line.journalEntryDescription,
                    line.debitAmount > 0 ? formatCurrency(line.debitAmount) : "-",
                    line.creditAmount > 0 ? formatCurrency(line.creditAmount) : "-",
                    formatCurrency(line.balance)
                ];
                tableRows.push(row);
            });

            // Totals row
            tableRows.push([
                "",
                "",
                "TOTALS",
                formatCurrency(data.totals.debit),
                formatCurrency(data.totals.credit),
                formatCurrency(data.totals.net)
            ]);

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 44,
                theme: 'striped',
                headStyles: { fillColor: [66, 66, 66] }
            });

            doc.save(`Ledger_${accountName}_${startDate}_${endDate}.pdf`);

        } catch (error) {
            console.error("Export PDF error:", error);
        } finally {
            setIsExporting(false);
        }
    };

    const handleExportExcel = async () => {
        if (!selectedAccountId || !ledgerData) return;
        setIsExporting(true);
        try {
            const data = await fetchFullLedger();
            if (!data) return;

            const accountName = data.account.name;

            // Prepare header info
            const titleRows = [
                [`Account: ${accountName}`],
                [`Period: ${startDate} to ${endDate}`],
                [`Generated: ${new Date().toLocaleDateString()}`],
                [] // Spacer
            ];

            // Prepare headers
            const headers = ["Date", "Ref", "Description", "Debit", "Credit", "Balance"];

            // Prepare data rows
            const dataRows = data.lines.map(line => [
                new Date(line.date).toLocaleDateString(),
                `JE-${line.journalEntryId.substring(0, 8)}`,
                line.description || line.journalEntryDescription,
                line.debitAmount,
                line.creditAmount,
                line.balance
            ]);

            // Prepare total row
            const totalRow = [
                '',
                '',
                'TOTALS',
                data.totals.debit,
                data.totals.credit,
                data.totals.net
            ];

            // Combine all
            const worksheetData = [
                ...titleRows,
                headers,
                ...dataRows,
                totalRow
            ];

            const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Ledger");

            // Adjust column widths
            const wscols = [
                { wch: 12 }, // Date
                { wch: 15 }, // Ref
                { wch: 40 }, // Description
                { wch: 12 }, // Debit
                { wch: 12 }, // Credit
                { wch: 12 }, // Balance
            ];
            worksheet['!cols'] = wscols;

            XLSX.writeFile(workbook, `Ledger_${accountName}_${startDate}_${endDate}.xlsx`);

        } catch (error) {
            console.error("Export Excel error", error);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 ml-4">General Ledger</h2>
                        <p className="text-muted-foreground ml-4">
                            View detailed transaction history and running balances for individual accounts.
                        </p>
                    </div>
                    <div className="ml-4 md:ml-0 flex gap-2">
                        <div className="flex items-center gap-2">

                            <Button
                                variant="default"
                                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                                onClick={handleExportExcel}
                                disabled={!selectedAccountId || !ledgerData || isLoading || isExporting}
                            >
                                {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
                                <span className="hidden sm:inline">Excel</span>
                            </Button>
                            <Button
                                variant="default"
                                className="gap-2 bg-rose-600 hover:bg-rose-700 text-white"
                                onClick={handleExportPDF}
                                disabled={!selectedAccountId || !ledgerData || isLoading || isExporting}
                            >
                                {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                                <span className="hidden sm:inline">PDF</span>
                            </Button>
                        </div>
                    </div>
                </div>

                <Card className="ml-4 mr-4">
                    <CardHeader className="pb-3 border-b bg-gray-50/50">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Select Account</label>
                                <select
                                    value={selectedAccountId}
                                    onChange={(e) => {
                                        setSelectedAccountId(e.target.value);
                                        setPage(1);
                                    }}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="">Choose an account...</option>
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.id}>{acc.name} ({acc.accountType})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">From Date</label>
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => {
                                        setStartDate(e.target.value);
                                        setPage(1);
                                    }}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">To Date</label>
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => {
                                        setEndDate(e.target.value);
                                        setPage(1);
                                    }}
                                />
                            </div>
                            <div>
                                <Button
                                    variant="ghost"
                                    className="text-muted-foreground hover:text-primary h-10"
                                    onClick={() => {
                                        setStartDate(firstDay);
                                        setEndDate(lastDay);
                                        setSelectedAccountId("");
                                        setLedgerData(null);
                                    }}
                                >
                                    <FilterX className="h-4 w-4 mr-2" />
                                    Clear Filters
                                </Button>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className="text-muted-foreground font-medium">Generating ledger report...</p>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                                <div className="p-3 bg-destructive/10 rounded-full">
                                    <Book className="h-8 w-8 text-destructive" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">Error Loading Ledger</h3>
                                    <p className="text-muted-foreground max-w-xs">{error}</p>
                                </div>
                                <Button variant="outline" onClick={loadLedger}>Try Again</Button>
                            </div>
                        ) : !ledgerData ? (
                            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                                <Landmark className="h-12 w-12 text-muted-foreground/30" />
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">No Account Selected</h3>
                                    <p className="text-muted-foreground">Please select an account above to view its transaction history.</p>
                                </div>
                            </div>
                        ) : (
                            <div>
                                {/* Summary Bar */}
                                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x border-b bg-primary/5">
                                    <div className="p-4 flex flex-col items-center justify-center text-center">
                                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Total Debit</span>
                                        <span className="text-xl font-bold text-gray-900">{formatCurrency(ledgerData.totals.debit)}</span>
                                    </div>
                                    <div className="p-4 flex flex-col items-center justify-center text-center">
                                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Total Credit</span>
                                        <span className="text-xl font-bold text-gray-900">{formatCurrency(ledgerData.totals.credit)}</span>
                                    </div>
                                    <div className="p-4 flex flex-col items-center justify-center text-center">
                                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Net Balance</span>
                                        <span className={cn(
                                            "text-xl font-bold",
                                            ledgerData.totals.net >= 0 ? "text-emerald-600" : "text-rose-600"
                                        )}>
                                            {formatCurrency(ledgerData.totals.net)}
                                        </span>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm whitespace-nowrap">
                                        <thead className="bg-muted/50 border-b text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                                            <tr>
                                                <th className="px-6 py-4">Date</th>
                                                <th className="px-6 py-4">Ref / Journal</th>
                                                <th className="px-6 py-4">Description</th>
                                                <th className="px-6 py-4 text-right">Debit</th>
                                                <th className="px-6 py-4 text-right">Credit</th>
                                                <th className="px-6 py-4 text-right">Running Balance</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {ledgerData.lines.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground italic">
                                                        No transactions found for this period.
                                                    </td>
                                                </tr>
                                            ) : (
                                                ledgerData.lines.map((line) => (
                                                    <tr key={line.id} className="hover:bg-muted/30 transition-colors">
                                                        <td className="px-6 py-4 font-medium text-gray-900">
                                                            {new Date(line.date).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold text-primary/80">JE-{line.journalEntryId.substring(0, 8)}</span>
                                                                <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                                                                    {line.journalEntryDescription}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                                                            {line.description || "-"}
                                                        </td>
                                                        <td className="px-6 py-4 text-right font-medium">
                                                            {line.debitAmount > 0 ? formatCurrency(line.debitAmount) : "-"}
                                                        </td>
                                                        <td className="px-6 py-4 text-right font-medium">
                                                            {line.creditAmount > 0 ? formatCurrency(line.creditAmount) : "-"}
                                                        </td>
                                                        <td className={cn(
                                                            "px-6 py-4 text-right font-bold",
                                                            line.balance >= 0 ? "text-gray-900" : "text-rose-600"
                                                        )}>
                                                            {formatCurrency(line.balance)}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                <div className="px-6 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                                    <div>
                                        Page <span className="font-medium text-foreground">{ledgerData.pagination.currentPage}</span> of <span className="font-medium text-foreground">{ledgerData.pagination.pageCount}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage(prev => Math.max(1, prev - 1))}
                                            disabled={!ledgerData.pagination.hasPrevPage || isLoading}
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage(prev => prev + 1)}
                                            disabled={!ledgerData.pagination.hasNextPage || isLoading}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
