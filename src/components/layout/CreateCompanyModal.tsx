import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Building2, UserPlus } from "lucide-react";

interface CreateCompanyModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function CreateCompanyModal({ open, onOpenChange, onSuccess }: CreateCompanyModalProps) {
    const { createCompany } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        company: {
            name: "",
            email: "",
            description: "",
            address: "",
            phone: ""
        },
        admin: {
            username: "",
            email: "",
            password: "",
            name: "",
            phone: "",
            address: ""
        }
    });

    const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            company: { ...prev.company, [id.replace('comp_', '')]: value }
        }));
    };

    const handleAdminChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            admin: { ...prev.admin, [id.replace('admin_', '')]: value }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            await createCompany(formData);
            onSuccess();
            onOpenChange(false);
            // Reset form
            setFormData({
                company: { name: "", email: "", description: "", address: "", phone: "" },
                admin: { username: "", email: "", password: "", name: "", phone: "", address: "" }
            });
        } catch (err: any) {
            setError(err.message || "Failed to create company");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5 text-primary" />
                        Create New Company
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    {error && (
                        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md italic">
                            {error}
                        </div>
                    )}

                    {/* Company Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-primary/80 border-b pb-1">
                            <Building2 className="h-4 w-4" />
                            Company Information
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="comp_name">Company Name</Label>
                                <Input
                                    id="comp_name"
                                    value={formData.company.name}
                                    onChange={handleCompanyChange}
                                    placeholder="Acme Corp"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="comp_email">Business Email</Label>
                                <Input
                                    id="comp_email"
                                    type="email"
                                    value={formData.company.email}
                                    onChange={handleCompanyChange}
                                    placeholder="info@acme.com"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="comp_phone">Phone</Label>
                                <Input
                                    id="comp_phone"
                                    value={formData.company.phone}
                                    onChange={handleCompanyChange}
                                    placeholder="+1-202-555-0123"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="comp_address">Address</Label>
                                <Input
                                    id="comp_address"
                                    value={formData.company.address}
                                    onChange={handleCompanyChange}
                                    placeholder="123 Silicon Valley"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Admin Section */}
                    <div className="space-y-4 pt-2">
                        <div className="flex items-center gap-2 text-sm font-semibold text-blue-600/80 border-b pb-1">
                            <UserPlus className="h-4 w-4" />
                            Admin User Account
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="admin_username">Username</Label>
                                <Input
                                    id="admin_username"
                                    value={formData.admin.username}
                                    onChange={handleAdminChange}
                                    placeholder="jdoe_admin"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="admin_password">Password</Label>
                                <Input
                                    id="admin_password"
                                    type="password"
                                    value={formData.admin.password}
                                    onChange={handleAdminChange}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="admin_name">Full Name</Label>
                                <Input
                                    id="admin_name"
                                    value={formData.admin.name}
                                    onChange={handleAdminChange}
                                    placeholder="John Doe"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="admin_email">Admin Email</Label>
                                <Input
                                    id="admin_email"
                                    type="email"
                                    value={formData.admin.email}
                                    onChange={handleAdminChange}
                                    placeholder="jdoe@acme.com"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="pt-2">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading} className="gap-2">
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Plus className="h-4 w-4" />
                                    Create Company & Admin
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
