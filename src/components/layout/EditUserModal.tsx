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
import { Loader2, UserCog, AlertCircle } from "lucide-react";

interface EditUserModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    userId: string | null;
}

export function EditUserModal({ open, onOpenChange, onSuccess, userId }: EditUserModalProps) {
    const { getCompanyUser, updateCompanyUser } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        address: "",
        status: "ACTIVE"
    });

    useEffect(() => {
        if (open && userId) {
            fetchUserData();
        }
    }, [open, userId]);

    const fetchUserData = async () => {
        if (!userId) return;
        setIsFetching(true);
        setError(null);
        try {
            const user = await getCompanyUser(userId);
            setFormData({
                name: user.name || "",
                phone: user.phone || "",
                address: user.address || "",
                status: user.status
            });
        } catch (err: any) {
            setError(err.message || "Failed to fetch user data");
        } finally {
            setIsFetching(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) return;
        setIsLoading(true);
        setError(null);

        try {
            await updateCompanyUser(userId, formData);
            onSuccess();
            onOpenChange(false);
        } catch (err: any) {
            setError(err.message || "Failed to update user");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 rounded-full text-primary">
                            <UserCog className="h-5 w-5" />
                        </div>
                        <DialogTitle className="text-xl">Edit Employee</DialogTitle>
                    </div>
                    <DialogDescription>
                        Update employee profile information and account status.
                    </DialogDescription>
                </DialogHeader>

                {isFetching ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Loading member details...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        {error && (
                            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Full Name</Label>
                            <Input
                                id="edit-name"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                disabled={isLoading}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-phone">Phone Number</Label>
                                <Input
                                    id="edit-phone"
                                    placeholder="+1-555-0000"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-status">Account Status</Label>
                                <select
                                    id="edit-status"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    disabled={isLoading}
                                >
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                    <option value="SUSPENDED">Suspended</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-address">Full Address</Label>
                            <Input
                                id="edit-address"
                                placeholder="123 Main St, City, Country"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                disabled={isLoading}
                            />
                        </div>

                        <DialogFooter className="pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading} className="gap-2">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Saving Changes...
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
