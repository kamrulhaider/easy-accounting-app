import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Tag,
    Search,
    Plus,
    Loader2,
    Calendar,
    ArrowUpDown,
    Landmark,
    Edit2,
    Trash2,
    ArrowRightLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CreateCategoryModal } from "@/components/layout/CreateCategoryModal";
import { EditCategoryModal } from "@/components/layout/EditCategoryModal";
import { MoveAccountsModal } from "@/components/layout/MoveAccountsModal";

export default function CategoriesPage() {
    const { user, categories, totalCategories, fetchCategories, uncategorizedCount } = useAuthStore();

    // Filters and Pagination
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const limit = 10;

    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    const { deleteCategory } = useAuthStore();

    const loadCategories = async () => {
        setIsLoading(true);
        try {
            const params: any = {
                limit,
                offset: (page - 1) * limit,
            };

            if (searchTerm) params.q = searchTerm;

            await fetchCategories(params);
        } catch (error) {
            console.error("Failed to load categories:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            loadCategories();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, page]);

    const handleDelete = async (id: string, name: string) => {
        if (!window.confirm(`Are you sure you want to delete the category "${name}"? Accounts in this category will become uncategorized.`)) {
            return;
        }

        try {
            await deleteCategory(id);
            loadCategories();
        } catch (error: any) {
            alert(error.message || "Failed to delete category");
        }
    };

    if (user?.userRole !== "COMPANY_ADMIN" && user?.userRole !== "COMPANY_USER") {
        return <Navigate to="/" replace />;
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 ml-4">Account Categories</h2>
                        <p className="text-muted-foreground ml-4">
                            Organize your chart of accounts with custom categories.
                        </p>
                    </div>
                    <div className="ml-4 md:ml-0">
                        <Button className="gap-2" onClick={() => setIsCreateModalOpen(true)}>
                            <Plus className="h-4 w-4" />
                            New Category
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 ml-4 mr-4">
                    <Card className="bg-primary/5 border-primary/10">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary/10 rounded-xl">
                                    <Tag className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Categories</p>
                                    <p className="text-2xl font-bold">{totalCategories}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-amber-50/50 border-amber-100">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-amber-100/50 rounded-xl">
                                    <Landmark className="h-6 w-6 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Uncategorized</p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-2xl font-bold text-amber-600">{uncategorizedCount}</p>
                                        {uncategorizedCount > 0 && user?.userRole === 'COMPANY_ADMIN' && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 text-[10px] text-amber-600 hover:text-amber-700 hover:bg-amber-100/50 gap-1 px-2"
                                                onClick={() => {
                                                    setSelectedCategory(null);
                                                    setIsMoveModalOpen(true);
                                                }}
                                            >
                                                <ArrowRightLeft className="h-3 w-3" />
                                                Move
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="ml-4 mr-4">
                    <CardHeader className="pb-3 px-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search category name..."
                                    className="pl-9 bg-muted/50 focus-visible:bg-background transition-colors"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setPage(1);
                                    }}
                                />
                            </div>
                            <Button variant="outline" size="icon" className="h-9 w-9">
                                <ArrowUpDown className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-muted/50 border-y text-muted-foreground font-medium">
                                    <tr>
                                        <th className="px-6 py-4">Category Name</th>
                                        <th className="px-6 py-4 text-center">Accounts Count</th>
                                        <th className="px-6 py-4 hidden md:table-cell">Created</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y relative min-h-[400px]">
                                    {isLoading && categories.length === 0 ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td className="px-6 py-4"><div className="h-10 w-48 bg-muted rounded" /></td>
                                                <td className="px-6 py-4"><div className="mx-auto h-6 w-12 bg-muted rounded-full" /></td>
                                                <td className="px-6 py-4 hidden md:table-cell"><div className="h-4 w-24 bg-muted rounded" /></td>
                                                <td className="px-6 py-4 text-right"><div className="ml-auto h-8 w-8 bg-muted rounded" /></td>
                                            </tr>
                                        ))
                                    ) : categories.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-20 text-center text-muted-foreground font-medium italic">
                                                <div className="flex flex-col items-center gap-3">
                                                    <Tag className="h-10 w-10 text-muted-foreground/30" />
                                                    <p>{isLoading ? "Updating list..." : "No categories found."}</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        <>
                                            {categories.map((cat) => (
                                                <tr key={cat.id} className={cn(
                                                    "hover:bg-muted/30 transition-all group",
                                                    isLoading ? "opacity-50 grayscale-[0.5] pointer-events-none" : "opacity-100"
                                                )}>
                                                    <td className="px-6 py-4 font-semibold text-gray-900">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-8 w-8 rounded bg-primary/5 flex items-center justify-center border border-primary/10">
                                                                <Tag className="h-4 w-4 text-primary" />
                                                            </div>
                                                            {cat.name}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                                                            {cat.accountCount} {cat.accountCount === 1 ? 'Account' : 'Accounts'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 hidden md:table-cell text-xs text-muted-foreground">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="h-3 w-3" />
                                                            {new Date(cat.createdAt).toLocaleDateString()}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            {user?.userRole === 'COMPANY_ADMIN' && (
                                                                <>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                                        onClick={() => {
                                                                            setSelectedCategory(cat);
                                                                            setIsMoveModalOpen(true);
                                                                        }}
                                                                        title="Move Accounts"
                                                                    >
                                                                        <ArrowRightLeft className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-muted-foreground hover:text-rose-600"
                                                                        onClick={() => handleDelete(cat.id, cat.name)}
                                                                        title="Delete Category"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </>
                                                            )}
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                                onClick={() => {
                                                                    setSelectedCategory(cat);
                                                                    setIsEditModalOpen(true);
                                                                }}
                                                                title="Rename Category"
                                                            >
                                                                <Edit2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {isLoading && (
                                                <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] flex items-center justify-center z-10">
                                                    <div className="bg-white/90 px-4 py-2 rounded-full shadow-lg border flex items-center gap-2 text-sm font-medium text-primary">
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        Refreshing...
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-6 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                            <div>
                                Showing <span className="font-medium text-foreground">{(page - 1) * limit + 1}</span> to <span className="font-medium text-foreground">{Math.min(page * limit, totalCategories)}</span> of <span className="font-medium text-foreground">{totalCategories}</span> categories
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                                    disabled={page === 1 || isLoading}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(prev => prev + 1)}
                                    disabled={page * limit >= totalCategories || isLoading}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <CreateCategoryModal
                    open={isCreateModalOpen}
                    onOpenChange={setIsCreateModalOpen}
                    onSuccess={loadCategories}
                />

                <EditCategoryModal
                    category={selectedCategory}
                    open={isEditModalOpen}
                    onOpenChange={setIsEditModalOpen}
                    onSuccess={loadCategories}
                />

                <MoveAccountsModal
                    sourceCategory={selectedCategory}
                    open={isMoveModalOpen}
                    onOpenChange={setIsMoveModalOpen}
                    onSuccess={loadCategories}
                />
            </div>
        </DashboardLayout>
    );
}
