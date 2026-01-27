import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Building2,
    Users,
    Landmark,
    Tag,
    BookOpen,
    Library,
    Scale,
    Activity,
    LogOut,
    X,
    FileText
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/", roles: ["ANY"] },
    { name: "Companies", icon: Building2, path: "/companies", roles: ["SUPER_ADMIN", "MODERATOR"] },
    { name: "Users & Admins", icon: Users, path: "/users-admins", roles: ["SUPER_ADMIN", "MODERATOR"] },
    { name: "Users", icon: Users, path: "/users", roles: ["COMPANY_ADMIN"] },
    { name: "Categories", icon: Tag, path: "/account-categories", roles: ["COMPANY_ADMIN", "COMPANY_USER"] },
    { name: "Accounts", icon: Landmark, path: "/accounts", roles: ["COMPANY_ADMIN", "COMPANY_USER"] },
    { name: "Journal", icon: BookOpen, path: "/journal", roles: ["COMPANY_ADMIN", "COMPANY_USER"] },
    { name: "Ledger", icon: Library, path: "/ledger", roles: ["COMPANY_ADMIN", "COMPANY_USER"] },
    { name: "Trial Balance", icon: Scale, path: "/trial-balance", roles: ["COMPANY_ADMIN", "COMPANY_USER"] },
    { name: "Balance Sheet", icon: FileText, path: "/balance-sheet", roles: ["COMPANY_ADMIN", "COMPANY_USER"] },
    { name: "Audit Logs", icon: Activity, path: "/audit-logs", roles: ["SUPER_ADMIN", "COMPANY_ADMIN"] },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const logout = useAuthStore((state) => state.logout);
    const fetchProfile = useAuthStore((state) => state.fetchProfile);
    const user = useAuthStore((state) => state.user);

    useEffect(() => {
        if (user && !user.userRole) {
            fetchProfile();
        }
    }, [user, fetchProfile]);

    const filteredNavItems = navItems.filter(item => {
        if (item.roles.includes("ANY")) return true;
        if (!user) return false;

        // Support both userRole and role property names just in case
        const currentRole = user.userRole || (user as any).role;
        return currentRole && item.roles.includes(currentRole);
    });

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleNavigate = (path: string) => {
        navigate(path);
        onClose();
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white border-r transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Header */}
                <div className="flex h-16 items-center justify-between px-6 border-b">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="Logo" className="h-8" />
                    </div>
                    <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                    {filteredNavItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <button
                                key={item.path}
                                onClick={() => handleNavigate(item.path)}
                                className={cn(
                                    "flex w-full items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                                    isActive
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <item.icon className="h-5 w-5" />
                                {item.name}
                            </button>
                        );
                    })}
                </nav>

                {/* Footer / User Profile */}
                <div className="border-t p-4 mt-auto">
                    <button
                        onClick={() => handleNavigate("/profile")}
                        className="flex w-full items-center gap-3 px-2 py-3 mb-2 rounded-lg hover:bg-muted transition-colors text-left"
                    >
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold flex-shrink-0">
                            {user?.name?.charAt(0) || "U"}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium truncate">{user?.name || "User"}</p>
                            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                        </div>
                    </button>
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={handleLogout}
                    >
                        <LogOut className="h-5 w-5" />
                        Sign out
                    </Button>
                </div>
            </aside>
        </>
    );
}
