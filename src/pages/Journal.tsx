import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    BookOpen,
    Search,
    Plus,
    Loader2,
    Calendar,
    ArrowUpDown,
    ChevronDown,
    ChevronUp,
    FileText,
    Edit2,
    Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CreateJournalModal } from "@/components/layout/CreateJournalModal";
import { EditJournalModal } from "@/components/layout/EditJournalModal";
import { ConfirmationModal } from "@/components/layout/ConfirmationModal";

export default function JournalPage() {
    const { user, journalEntries, totalJournalEntries, fetchJournalEntries, journalTotals } = useAuthStore();

    // Filters and Pagination
    const [searchTerm, setSearchTerm] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [page, setPage] = useState(1);
    const limit = 10;

    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
    const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());

    // Confirmation Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [entryToDelete, setEntryToDelete] = useState<string | null>(null);

    const { deleteJournalEntry, getJournalEntry } = useAuthStore();

    const loadJournalEntries = async () => {
        setIsLoading(true);
        try {
            const params: any = {
                limit,
                offset: (page - 1) * limit,
            };

            if (searchTerm) params.q = searchTerm;
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;

            await fetchJournalEntries(params);
        } catch (error) {
            console.error("Failed to load journal entries:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            loadJournalEntries();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, startDate, endDate, page]);

    if (user?.userRole !== "COMPANY_ADMIN" && user?.userRole !== "COMPANY_USER") {
        return <Navigate to="/" replace />;
    }

    const toggleExpand = async (id: string) => {
        const next = new Set(expandedEntries);
        if (next.has(id)) {
            next.delete(id);
            setExpandedEntries(next);
        } else {
            next.add(id);
            setExpandedEntries(next);

            // If we don't have lines for this entry, fetch them
            const entry = journalEntries.find(e => e.id === id);
            if (entry && (!entry.journalLines || entry.journalLines.length === 0)) {
                try {
                    await getJournalEntry(id);
                } catch (err) {
                    console.error("Failed to fetch entry details:", err);
                }
            }
        }
    };

    const handleDeleteClick = (id: string) => {
        if (user?.userRole !== "COMPANY_ADMIN") {
            alert("Only company admins can delete journal entries.");
            return;
        }
        setEntryToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!entryToDelete) return;

        try {
            await deleteJournalEntry(entryToDelete);
            loadJournalEntries();
            setIsDeleteModalOpen(false);
            setEntryToDelete(null);
        } catch (error: any) {
            alert(error.message || "Failed to delete entry");
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 ml-4">Journal Entries</h2>
                        <p className="text-muted-foreground ml-4">
                            Record and track financial transactions in the general ledger.
                        </p>
                    </div>
                    <div className="ml-4 md:ml-0">
                        <Button className="gap-2" onClick={() => setIsCreateModalOpen(true)}>
                            <Plus className="h-4 w-4" />
                            New Journal Entry
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-4 mr-4">
                    <Card className="bg-emerald-50 border-emerald-100 shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-500/10 rounded-xl">
                                    <ChevronUp className="h-6 w-6 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-emerald-800/70 uppercase tracking-wider">Total Debits</p>
                                    <p className="text-2xl font-bold text-emerald-700">
                                        {journalTotals.debit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-rose-50 border-rose-100 shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-rose-500/10 rounded-xl">
                                    <ChevronDown className="h-6 w-6 text-rose-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-rose-800/70 uppercase tracking-wider">Total Credits</p>
                                    <p className="text-2xl font-bold text-rose-700">
                                        {journalTotals.credit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="ml-4 mr-4 overflow-hidden border-none shadow-xl ring-1 ring-gray-200">
                    <CardHeader className="pb-3 px-6 bg-gray-50/50">
                        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search description..."
                                    className="pl-9 bg-white border-gray-200"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setPage(1);
                                    }}
                                />
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-muted-foreground uppercase">From:</span>
                                    <Input
                                        type="date"
                                        className="h-9 w-[150px] text-xs bg-white"
                                        value={startDate}
                                        onChange={(e) => {
                                            setStartDate(e.target.value);
                                            setPage(1);
                                        }}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-muted-foreground uppercase">To:</span>
                                    <Input
                                        type="date"
                                        className="h-9 w-[150px] text-xs bg-white"
                                        value={endDate}
                                        onChange={(e) => {
                                            setEndDate(e.target.value);
                                            setPage(1);
                                        }}
                                    />
                                </div>
                                <div className="h-6 w-px bg-gray-200 mx-1 hidden md:block" />
                                <Button variant="outline" size="icon" className="h-9 w-9 bg-white border-gray-200 text-gray-500 hover:text-primary">
                                    <ArrowUpDown className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 border-b text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                                    <tr>
                                        <th className="px-6 py-4 w-[50px]"></th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Description</th>
                                        <th className="px-6 py-4 text-right">Debit</th>
                                        <th className="px-6 py-4 text-right">Credit</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y relative">
                                    {isLoading && journalEntries.length === 0 ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td className="px-6 py-4"><div className="h-4 w-4 bg-gray-200 rounded" /></td>
                                                <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
                                                <td className="px-6 py-4"><div className="h-4 w-48 bg-gray-200 rounded" /></td>
                                                <td className="px-6 py-4 text-right"><div className="ml-auto h-4 w-16 bg-gray-200 rounded" /></td>
                                                <td className="px-6 py-4 text-right"><div className="ml-auto h-4 w-16 bg-gray-200 rounded" /></td>
                                                <td className="px-6 py-4 text-right"><div className="ml-auto h-8 w-8 bg-gray-200 rounded" /></td>
                                            </tr>
                                        ))
                                    ) : journalEntries.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-20 text-center text-muted-foreground font-medium italic">
                                                <div className="flex flex-col items-center gap-3">
                                                    <BookOpen className="h-10 w-10 text-muted-foreground/30" />
                                                    <p>{isLoading ? "Updating list..." : "No journal entries found."}</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        <>
                                            {journalEntries.map((entry) => (
                                                <React.Fragment key={entry.id}>
                                                    <tr className={cn(
                                                        "hover:bg-gray-50/50 transition-colors group cursor-pointer",
                                                        expandedEntries.has(entry.id) && "bg-primary/5",
                                                        isLoading && "opacity-50 grayscale"
                                                    )} onClick={() => toggleExpand(entry.id)}>
                                                        <td className="px-6 py-4">
                                                            {expandedEntries.has(entry.id) ? (
                                                                <ChevronUp className="h-4 w-4 text-primary" />
                                                            ) : (
                                                                <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-primary transition-colors" />
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                                                <span className="font-medium text-gray-900">
                                                                    {new Date(entry.date).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 font-medium text-gray-700">
                                                            {entry.description || <span className="text-gray-400 italic font-normal text-xs">No description</span>}
                                                        </td>
                                                        <td className="px-6 py-4 text-right font-bold text-emerald-600">
                                                            {entry.totals.debit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                        </td>
                                                        <td className="px-6 py-4 text-right font-bold text-rose-600">
                                                            {entry.totals.credit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                        </td>
                                                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                                    onClick={() => {
                                                                        setSelectedEntryId(entry.id);
                                                                        setIsEditModalOpen(true);
                                                                    }}
                                                                >
                                                                    <Edit2 className="h-4 w-4" />
                                                                </Button>
                                                                {user?.userRole === "COMPANY_ADMIN" && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-muted-foreground hover:text-rose-600"
                                                                        onClick={() => handleDeleteClick(entry.id)}
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                )}
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                                                    <FileText className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    {expandedEntries.has(entry.id) && (
                                                        <tr className="bg-gray-50/80">
                                                            <td colSpan={6} className="px-12 py-6">
                                                                <div className="bg-white rounded-xl shadow-lg ring-1 ring-gray-100 overflow-hidden">
                                                                    <table className="w-full text-xs">
                                                                        <thead>
                                                                            <tr className="bg-gray-900 text-white font-semibold flex-shrink-0">
                                                                                <th className="px-4 py-3 text-left">Account</th>
                                                                                <th className="px-4 py-3 text-left">Description</th>
                                                                                <th className="px-4 py-3 text-right">Debit</th>
                                                                                <th className="px-4 py-3 text-right">Credit</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody className="divide-y border-x">
                                                                            {/* Note: In a real app we'd fetch lines if not in list response */}
                                                                            {/* The API doc shows journalLines in the list response if available or we might need another fetch */}
                                                                            {/* Based on common patterns, I'll check if they exist */}
                                                                            {entry.journalLines?.map(line => (
                                                                                <tr key={line.id} className="hover:bg-primary/5">
                                                                                    <td className="px-4 py-3 font-bold text-gray-900">
                                                                                        {line.account?.name || "Unknown Account"}
                                                                                        <span className="ml-2 px-1.5 py-0.5 rounded bg-gray-100 text-[9px] font-bold text-gray-500 uppercase tracking-tighter border border-gray-200">
                                                                                            {line.account?.accountType}
                                                                                        </span>
                                                                                    </td>
                                                                                    <td className="px-4 py-3 text-muted-foreground italic">
                                                                                        {line.description || "-"}
                                                                                    </td>
                                                                                    <td className="px-4 py-3 text-right font-semibold text-emerald-600">
                                                                                        {line.debitAmount ? line.debitAmount.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "-"}
                                                                                    </td>
                                                                                    <td className="px-4 py-3 text-right font-semibold text-rose-600">
                                                                                        {line.creditAmount ? line.creditAmount.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "-"}
                                                                                    </td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                            {isLoading && (
                                                <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] flex items-center justify-center z-10">
                                                    <div className="bg-white/90 px-4 py-2 rounded-full shadow-lg border flex items-center gap-2 text-sm font-medium text-primary animate-bounce">
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        Refreshing Entries...
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
                                <span className="text-foreground">{Math.min(page * limit, totalJournalEntries)}</span> of
                                <span className="text-foreground ml-1">{totalJournalEntries}</span> Entries
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => { e.stopPropagation(); setPage(prev => Math.max(1, prev - 1)); }}
                                    disabled={page === 1 || isLoading}
                                    className="bg-white h-8 w-8 p-0"
                                >
                                    <ChevronUp className="h-4 w-4 -rotate-90" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => { e.stopPropagation(); setPage(prev => prev + 1); }}
                                    disabled={page * limit >= totalJournalEntries || isLoading}
                                    className="bg-white h-8 w-8 p-0"
                                >
                                    <ChevronDown className="h-4 w-4 -rotate-90" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <CreateJournalModal
                    open={isCreateModalOpen}
                    onOpenChange={setIsCreateModalOpen}
                    onSuccess={loadJournalEntries}
                />

                <EditJournalModal
                    entryId={selectedEntryId}
                    open={isEditModalOpen}
                    onOpenChange={setIsEditModalOpen}
                    onSuccess={loadJournalEntries}
                />

                <ConfirmationModal
                    open={isDeleteModalOpen}
                    onOpenChange={setIsDeleteModalOpen}
                    title="Delete Journal Entry"
                    description="Are you sure you want to delete this journal entry? This will soft-delete the entry."
                    onConfirm={confirmDelete}
                    confirmText="Delete Entry"
                    cancelText="Cancel"
                    variant="destructive"
                />
            </div>
        </DashboardLayout>
    );
}

import React from "react";
