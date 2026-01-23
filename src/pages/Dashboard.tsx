import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuthStore, type CompanySummaryResponse, type ProfitLossData, type JournalEntryCountData } from "@/store/useAuthStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, Activity, TrendingDown, Wallet } from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    AreaChart,
    Area
} from "recharts";
import { cn, formatCurrency } from "@/lib/utils";

export default function Dashboard() {
    const { user, getCompanySummary, getProfitLoss12Months, getJournalEntries12Months } = useAuthStore();
    const [summary, setSummary] = useState<CompanySummaryResponse | null>(null);
    const [plData, setPlData] = useState<ProfitLossData | null>(null);
    const [jeData, setJeData] = useState<JournalEntryCountData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadDashboardData = async () => {
            setIsLoading(true);
            try {
                const [summaryRes, plRes, jeRes] = await Promise.all([
                    getCompanySummary(),
                    getProfitLoss12Months(),
                    getJournalEntries12Months()
                ]);
                setSummary(summaryRes);
                setPlData(plRes);
                setJeData(jeRes);
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (user && (user.userRole === 'COMPANY_ADMIN' || user.userRole === 'COMPANY_USER')) {
            loadDashboardData();
        } else {
            setIsLoading(false);
        }
    }, [user, getCompanySummary, getProfitLoss12Months, getJournalEntries12Months]);



    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="space-y-8 animate-pulse">
                    <div className="h-8 w-48 bg-gray-200 rounded ml-4" />
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 ml-4 mr-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded-xl" />
                        ))}
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col gap-2">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 ml-4">Dashboard</h2>
                    <p className="text-muted-foreground ml-4">
                        Overview for {user?.company?.name || "your company"}.
                    </p>
                </div>

                {/* KPI Cards */}
                {summary && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 ml-4 mr-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                <DollarSign className="h-4 w-4 text-emerald-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-emerald-600">{formatCurrency(summary.summary.totalRevenue, user?.company?.currency)}</div>
                                <p className="text-xs text-muted-foreground">In selected period</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                                <TrendingDown className="h-4 w-4 text-rose-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-rose-600">{formatCurrency(summary.summary.totalExpense, user?.company?.currency)}</div>
                                <p className="text-xs text-muted-foreground">In selected period</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                                <Wallet className={cn("h-4 w-4", summary.summary.netProfit >= 0 ? "text-emerald-600" : "text-rose-600")} />
                            </CardHeader>
                            <CardContent>
                                <div className={cn("text-2xl font-bold", summary.summary.netProfit >= 0 ? "text-emerald-600" : "text-rose-600")}>
                                    {formatCurrency(summary.summary.netProfit, user?.company?.currency)}
                                </div>
                                <p className="text-xs text-muted-foreground">Net earnings</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary.summary.activeAccountCount}</div>
                                <p className="text-xs text-muted-foreground">Operational ledger accounts</p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Charts Section */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 ml-4 mr-4">
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Financial Performance</CardTitle>
                            <CardDescription>
                                Revenue vs Expenses over the last 12 months
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <div className="h-[300px] w-full">
                                {plData && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={plData.data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1} />
                                                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis
                                                dataKey="month"
                                                tickLine={false}
                                                axisLine={false}
                                                tickFormatter={(value) => value.slice(5)} // Show MM from YYYY-MM
                                                tick={{ fontSize: 12 } as any}
                                            />
                                            <YAxis
                                                tickLine={false}
                                                axisLine={false}
                                                tickFormatter={(value) => formatCurrency(value, user?.company?.currency, { compact: true })}
                                                tick={{ fontSize: 12 } as any}
                                            />
                                            <Tooltip
                                                formatter={(value: any) => formatCurrency(value, user?.company?.currency)}
                                                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                                            />
                                            <Legend verticalAlign="top" height={36} />
                                            <Area
                                                type="monotone"
                                                dataKey="revenue"
                                                name="Revenue"
                                                stroke="#10b981"
                                                fillOpacity={1}
                                                fill="url(#colorRevenue)"
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="expense"
                                                name="Expenses"
                                                stroke="#f43f5e"
                                                fillOpacity={1}
                                                fill="url(#colorExpense)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Journal Activity</CardTitle>
                            <CardDescription>
                                Monthly transaction volume
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full">
                                {jeData && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={jeData.data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis
                                                dataKey="month"
                                                tickLine={false}
                                                axisLine={false}
                                                tickFormatter={(value) => value.slice(5)}
                                                tick={{ fontSize: 12 } as any}
                                            />
                                            <YAxis
                                                tickLine={false}
                                                axisLine={false}
                                                allowDecimals={false}
                                                tick={{ fontSize: 12 } as any}
                                            />
                                            <Tooltip
                                                cursor={{ fill: 'transparent' }}
                                                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                                            />
                                            <Bar
                                                dataKey="count"
                                                name="Entries"
                                                fill="#3b82f6"
                                                radius={[4, 4, 0, 0]}
                                                maxBarSize={50}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}

