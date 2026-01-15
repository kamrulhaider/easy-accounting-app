import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, Trash2 } from "lucide-react";

interface DeleteCompanyModalProps {
    company: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function DeleteCompanyModal({ company, open, onOpenChange, onSuccess }: DeleteCompanyModalProps) {
    const { deleteCompany } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        if (!company) return;

        setError(null);
        setIsLoading(true);

        try {
            await deleteCompany(company.id);
            onSuccess();
            onOpenChange(false);
        } catch (err: any) {
            setError(err.message || "Failed to delete company");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        Delete Company
                    </DialogTitle>
                    <DialogDescription className="pt-2">
                        Are you sure you want to delete <span className="font-semibold text-foreground">"{company?.name}"</span>?
                        This action will set the company status to INACTIVE and hide it from default views.
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md italic">
                        {error}
                    </div>
                )}

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isLoading}
                        className="gap-2"
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        Delete Company
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
