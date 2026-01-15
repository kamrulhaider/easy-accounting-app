import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { User, Building2, Phone, MapPin, Mail, Shield } from "lucide-react";
import { ChangePasswordModal } from "@/components/layout/ChangePasswordModal";

export default function ProfilePage() {
    const { user, fetchProfile } = useAuthStore();

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    if (!user) return null;

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Profile Settings</h2>
                    <p className="text-muted-foreground">
                        Manage your personal information and account security.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Personal Information */}
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-4">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <User className="h-5 w-5 text-primary" />
                            </div>
                            <CardTitle>Personal Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-1">
                                <Label className="text-xs text-muted-foreground">Full Name</Label>
                                <p className="font-medium">{user.name}</p>
                            </div>
                            <div className="grid gap-1">
                                <Label className="text-xs text-muted-foreground">Email Address</Label>
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="h-3 w-3 text-muted-foreground" />
                                    <span>{user.email}</span>
                                </div>
                            </div>
                            <div className="grid gap-1">
                                <Label className="text-xs text-muted-foreground">Username</Label>
                                <p className="text-sm">@{user.username}</p>
                            </div>
                            {user.phone && (
                                <div className="grid gap-1">
                                    <Label className="text-xs text-muted-foreground">Phone</Label>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="h-3 w-3 text-muted-foreground" />
                                        <span>{user.phone}</span>
                                    </div>
                                </div>
                            )}
                            {user.address && (
                                <div className="grid gap-1">
                                    <Label className="text-xs text-muted-foreground">Address</Label>
                                    <div className="flex items-center gap-2 text-sm">
                                        <MapPin className="h-3 w-3 text-muted-foreground" />
                                        <span>{user.address}</span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Account Security & Role */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center gap-4">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Shield className="h-5 w-5 text-blue-600" />
                                </div>
                                <CardTitle>Role & Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-1">
                                    <Label className="text-xs text-muted-foreground">Account Role</Label>
                                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 w-fit">
                                        {user.userRole}
                                    </div>
                                </div>
                                <div className="grid gap-1 pb-2">
                                    <Label className="text-xs text-muted-foreground">Account Status</Label>
                                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 w-fit">
                                        {user.status}
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <ChangePasswordModal />
                                </div>
                            </CardContent>
                        </Card>

                        {user.company && (
                            <Card>
                                <CardHeader className="flex flex-row items-center gap-4">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <Building2 className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <CardTitle>Company Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-1">
                                        <Label className="text-xs text-muted-foreground">Company Name</Label>
                                        <p className="font-medium">{user.company.name}</p>
                                    </div>
                                    <div className="grid gap-1">
                                        <Label className="text-xs text-muted-foreground">Company Email</Label>
                                        <p className="text-sm">{user.company.email}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
