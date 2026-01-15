import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuthStore } from "@/store/useAuthStore";


export default function Dashboard() {
    const user = useAuthStore((state) => state.user);

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Welcome Section */}
                <div className="flex flex-col gap-2">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 ml-4">Dashboard</h2>
                    <p className="text-muted-foreground ml-4">
                        Welcome back, {user?.name || "User"}. Here is an overview of your account.
                    </p>
                </div>

                {/* Placeholder for future API-driven stats */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 ml-4">
                    <Card className="bg-white/50 border-dashed">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-muted-foreground italic">
                                Summary data will appear here...
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-24 bg-gray-50 rounded-lg animate-pulse" />
                        </CardContent>
                    </Card>
                    <Card className="bg-white/50 border-dashed">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-muted-foreground italic">
                                Activity logs will appear here...
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-24 bg-gray-50 rounded-lg animate-pulse" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}

