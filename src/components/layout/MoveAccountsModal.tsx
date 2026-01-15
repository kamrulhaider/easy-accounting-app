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
import { Label } from "@/components/ui/label";
import { Loader2, ArrowRightLeft, AlertCircle } from "lucide-react";

interface MoveAccountsModalProps {
    sourceCategory: any; // null for uncategorized
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function MoveAccountsModal({ sourceCategory, open, onOpenChange, onSuccess }: MoveAccountsModalProps) {
    const { moveCategoryAccounts, categories, fetchCategories } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [targetCategoryId, setTargetCategoryId] = useState<string>("null");

    useEffect(() => {
        if (open) {
            fetchCategories({ all: true });
        }
    }, [open, fetchCategories]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const fromId = sourceCategory ? sourceCategory.id : null;
            const toId = targetCategoryId === "null" ? null : targetCategoryId;

            if (fromId === toId) {
                onOpenChange(false);
                return;
            }

            await moveCategoryAccounts({
                fromCategoryId: fromId,
                toCategoryId: toId
            });
            onSuccess();
            onOpenChange(false);
        } catch (err: any) {
            setError(err.message || "Failed to move accounts");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ArrowRightLeft className="h-5 w-5 text-primary" />
                        Move Accounts
                    </DialogTitle>
                    <DialogDescription>
                        Relocate all accounts from <strong>{sourceCategory?.name || "Uncategorized"}</strong> to another category.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    {error && (
                        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="targetCategory">Target Category</Label>
                        <select
                            id="targetCategory"
                            value={targetCategoryId}
                            onChange={(e) => setTargetCategoryId(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                            <option value="null">Uncategorized</option>
                            {categories
                                .filter(cat => cat.id !== sourceCategory?.id)
                                .map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))
                            }
                        </select>
                    </div>

                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                        <p className="text-xs text-amber-700 leading-relaxed">
                            <strong>Note:</strong> This will affect all accounts currently assigned to {sourceCategory ? 'this category' : 'no category'}. This action cannot be undone automatically.
                        </p>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Move Accounts
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
