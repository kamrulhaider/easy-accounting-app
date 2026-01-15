import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, BookOpen, Plus, Trash2, AlertCircle } from "lucide-react";

interface EditJournalModalProps {
    entryId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

interface EntryLine {
    id?: string;
    accountId: string;
    debitAmount: string;
    creditAmount: string;
    description: string;
}

export function EditJournalModal({ entryId, open, onOpenChange, onSuccess }: EditJournalModalProps) {
    const { getJournalEntry, updateJournalEntry, accounts, fetchAccounts } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [date, setDate] = useState("");
    const [description, setDescription] = useState("");
    const [lines, setLines] = useState<EntryLine[]>([]);

    useEffect(() => {
        const loadEntry = async () => {
            if (!entryId || !open) return;

            setIsFetching(true);
            setError(null);
            try {
                await fetchAccounts({ all: true, status: "ACTIVE" });
                const entry = await getJournalEntry(entryId);

                setDate(new Date(entry.date).toISOString().split('T')[0]);
                setDescription(entry.description || "");

                if (entry.journalLines) {
                    setLines(entry.journalLines.map(line => ({
                        id: line.id,
                        accountId: line.accountId,
                        debitAmount: line.debitAmount ? line.debitAmount.toString() : "",
                        creditAmount: line.creditAmount ? line.creditAmount.toString() : "",
                        description: line.description || ""
                    })));
                }
            } catch (err: any) {
                setError(err.message || "Failed to load journal entry");
            } finally {
                setIsFetching(false);
            }
        };

        loadEntry();
    }, [entryId, open, getJournalEntry, fetchAccounts]);

    const addLine = () => {
        setLines([...lines, { accountId: "", debitAmount: "", creditAmount: "", description: "" }]);
    };

    const removeLine = (index: number) => {
        if (lines.length <= 2) return;
        setLines(lines.filter((_, i) => i !== index));
    };

    const updateLine = (index: number, field: keyof EntryLine, value: string) => {
        const newLines = [...lines];

        if (field === "debitAmount" && value !== "") {
            newLines[index].creditAmount = "";
        } else if (field === "creditAmount" && value !== "") {
            newLines[index].debitAmount = "";
        }

        newLines[index][field] = value;
        setLines(newLines);
    };

    const totalDebits = lines.reduce((sum, line) => sum + (parseFloat(line.debitAmount) || 0), 0);
    const totalCredits = lines.reduce((sum, line) => sum + (parseFloat(line.creditAmount) || 0), 0);
    const difference = Math.abs(totalDebits - totalCredits);
    const isBalanced = totalDebits > 0 && Math.abs(totalDebits - totalCredits) < 0.01;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isBalanced) {
            setError("Journal entry must be balanced (Total Debits = Total Credits).");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const payload = {
                date,
                description,
                lines: lines.map(line => ({
                    accountId: line.accountId,
                    debitAmount: parseFloat(line.debitAmount) || 0,
                    creditAmount: parseFloat(line.creditAmount) || 0,
                    description: line.description || undefined
                })).filter(line => (parseFloat(line.debitAmount.toString()) || 0) > 0 || (parseFloat(line.creditAmount.toString()) || 0) > 0)
            };

            if (!entryId) return;
            await updateJournalEntry(entryId, payload);
            onSuccess();
            onOpenChange(false);
        } catch (err: any) {
            setError(err.message || "Failed to update journal entry");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        Edit Journal Entry
                    </DialogTitle>
                    <DialogDescription>
                        Modify your bookkeeping record. Entries must remain balanced.
                    </DialogDescription>
                </DialogHeader>

                {isFetching ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground italic font-medium">Fetching entry details...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6 py-4">
                        {error && (
                            <div className="bg-destructive/15 text-destructive text-sm p-4 rounded-lg flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                <p className="font-medium">{error}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="date">Entry Date</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Main Description</Label>
                                <Input
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="e.g. Initial investment, Monthly rent payment"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Entry Lines</Label>
                                <Button type="button" variant="outline" size="sm" onClick={addLine} className="h-8 gap-1">
                                    <Plus className="h-3.5 w-3.5" />
                                    Add Line
                                </Button>
                            </div>

                            <div className="rounded-lg border overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/50 border-b">
                                        <tr>
                                            <th className="px-3 py-2 text-left font-medium w-[30%]">Account</th>
                                            <th className="px-3 py-2 text-left font-medium">Description</th>
                                            <th className="px-3 py-2 text-right font-medium w-[15%]">Debit</th>
                                            <th className="px-3 py-2 text-right font-medium w-[15%]">Credit</th>
                                            <th className="p-2 w-[50px]"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {lines.map((line, index) => (
                                            <tr key={index} className="group hover:bg-muted/30">
                                                <td className="p-2">
                                                    <select
                                                        value={line.accountId}
                                                        onChange={(e) => updateLine(index, "accountId", e.target.value)}
                                                        className="w-full h-9 rounded-md border border-input bg-transparent px-2 py-1 text-xs focus:ring-1 focus:ring-primary outline-none"
                                                        required
                                                    >
                                                        <option value="">Select Account</option>
                                                        {accounts.map(acc => (
                                                            <option key={acc.id} value={acc.id}>{acc.name} ({acc.accountType})</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="p-2">
                                                    <Input
                                                        value={line.description}
                                                        onChange={(e) => updateLine(index, "description", e.target.value)}
                                                        className="h-9 px-2 text-xs"
                                                        placeholder="Line note"
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={line.debitAmount}
                                                        onChange={(e) => updateLine(index, "debitAmount", e.target.value)}
                                                        className="h-9 px-2 text-xs text-right font-medium text-emerald-600"
                                                        placeholder="0.00"
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={line.creditAmount}
                                                        onChange={(e) => updateLine(index, "creditAmount", e.target.value)}
                                                        className="h-9 px-2 text-xs text-right font-medium text-rose-600"
                                                        placeholder="0.00"
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeLine(index)}
                                                        disabled={lines.length <= 2}
                                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-muted/10 border-t font-semibold">
                                        <tr>
                                            <td colSpan={2} className="px-3 py-3 text-right text-xs text-muted-foreground uppercase tracking-widest italic">Live Balance View</td>
                                            <td className="px-3 py-3 text-right text-emerald-600">
                                                {totalDebits.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-3 py-3 text-right text-rose-600">
                                                {totalCredits.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        {!isBalanced && totalDebits > 0 && (
                            <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-100">
                                <AlertCircle className="h-3.5 w-3.5" />
                                <span>Entry is out of balance by <span className="font-bold">{difference.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></span>
                            </div>
                        )}

                        <DialogFooter className="pt-4 border-t">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading || !isBalanced}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Update Journal Entry
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
