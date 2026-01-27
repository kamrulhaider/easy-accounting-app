import { create } from 'zustand';
import { API_BASE_URL } from "@/lib/config";

interface Company {
    id: string;
    name: string;
    email: string;
    status: string;
    description?: string;
    address?: string;
    phone?: string;
    adminId?: string;
    createdAt?: string;
    updatedAt?: string;
}

interface Account {
    id: string;
    name: string;
    accountType: string;
    status: string;
    companyId: string;
    categoryId?: string;
    category?: {
        id: string;
        name: string;
    };
    createdAt: string;
    updatedAt: string;
}

// Basic account category model
interface Category {
    id: string;
    name: string;
    companyId: string;
    accountCount: number;
    createdAt: string;
    updatedAt: string;
}

interface JournalLine {
    id: string;
    accountId: string;
    debitAmount: number | null;
    creditAmount: number | null;
    description?: string;
    account?: {
        id: string;
        name: string;
        accountType: string;
    };
    createdAt: string;
    updatedAt: string;
}

interface JournalEntry {
    id: string;
    date: string;
    description?: string;
    companyId: string;
    createdAt: string;
    updatedAt: string;
    journalLines?: JournalLine[];
    totals: {
        debit: number;
        credit: number;
    };
}

export interface LedgerLine {
    id: string;
    date: string;
    journalEntryId: string;
    journalEntryDescription: string;
    description?: string;
    debitAmount: number;
    creditAmount: number;
    balance: number;
    createdAt: string;
    updatedAt: string;
}

export interface LedgerResponse {
    account: Account;
    lines: LedgerLine[];
    totals: {
        debit: number;
        credit: number;
        net: number;
    };
    pagination: {
        limit: number;
        offset: number;
        currentPage: number;
        pageCount: number;
        itemsOnPage: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
        nextOffset: number | null;
        prevOffset: number | null;
    };
}

export interface TrialBalanceAccount {
    id: string;
    name: string;
    accountType: string;
    status: string;
    debit: number;
    credit: number;
    net: number;
    debitBalance: number;
    creditBalance: number;
}

export interface TrialBalanceResponse {
    accounts: TrialBalanceAccount[];
    totals: {
        debit: number;
        credit: number;
        net: number;
        debitBalance: number;
        creditBalance: number;
    };
    filters: {
        companyId: string;
        startDate?: string;
        endDate?: string;
        status?: string;
    };
}

export interface User {
    id: string;
    username: string;
    email: string;
    name: string;
    userRole: string;
    status: string;
    phone?: string;
    address?: string;
    company?: {
        id?: string;
        name: string;
        email?: string;
        description?: string;
        address?: string;
        phone?: string;
        currency?: string;
    } | null;
    createdAt: string;
    updatedAt: string;
}

export interface AuditLog {
    id: string;
    action: string;
    entity: string;
    entityId: string;
    timestamp: string;
    companyId: string;
    userId: string;
    company?: {
        id: string;
        name: string;
        email: string;
    };
    user?: {
        id: string;
        username: string;
        email: string;
        name: string;
        userRole: string;
    };

}

export interface CompanySummaryResponse {
    companyId: string;
    period: {
        startDate: string;
        endDate: string;
    };
    summary: {
        totalRevenue: number;
        totalExpense: number;
        netProfit: number;
        journalEntryCount: number;
        activeAccountCount: number;
    };
}

export interface ProfitLossData {
    companyId: string;
    period: {
        startMonth: string;
        endMonth: string;
    };
    data: {
        month: string;
        revenue: number;
        expense: number;
        net: number;
    }[];
}

export interface JournalEntryCountData {
    companyId: string;
    period: {
        startMonth: string;
        endMonth: string;
    };
    data: {
        month: string;
        count: number;
    }[];
}

interface AuthResponse {
    token: string;
    user: User;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    companies: Company[];
    totalCompanies: number;
    allUsers: User[];
    totalUsers: number;
    accounts: Account[];
    totalAccounts: number;
    categories: Category[];
    totalCategories: number;
    uncategorizedCount: number;
    journalEntries: JournalEntry[];
    totalJournalEntries: number;
    journalTotals: { debit: number; credit: number };
    login: (usernameOrEmail: string, password: string) => Promise<void>;
    logout: () => void;
    initialize: () => Promise<void>;
    fetchProfile: () => Promise<void>;
    changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
    updateProfile: (data: { name?: string; phone?: string; address?: string }) => Promise<void>;
    fetchCompanies: (params?: any) => Promise<void>;
    getCompany: (id: string) => Promise<Company>;
    createCompany: (data: any) => Promise<void>;
    updateCompany: (id: string, data: any) => Promise<void>;
    updateMyCompany: (data: { description?: string; address?: string; phone?: string; currency?: string }) => Promise<void>;
    deleteCompany: (id: string) => Promise<void>;
    fetchUsers: (params?: any) => Promise<void>;
    fetchCompanyUsers: (params?: any) => Promise<void>;
    createCompanyUser: (data: any) => Promise<void>;
    getCompanyUser: (id: string) => Promise<User>;
    updateCompanyUser: (id: string, data: any) => Promise<void>;
    deleteCompanyUser: (id: string) => Promise<void>;
    updateCompanyAdmin: (id: string, data: any) => Promise<void>;
    resetCompanyAdminPassword: (id: string) => Promise<void>;
    fetchAccounts: (params?: any) => Promise<void>;
    createAccount: (data: any) => Promise<void>;
    getAccount: (id: string) => Promise<Account>;
    updateAccount: (id: string, data: any) => Promise<void>;
    deactivateAccount: (id: string) => Promise<void>;
    fetchCategories: (params?: any) => Promise<void>;
    createCategory: (data: any) => Promise<void>;
    updateCategory: (id: string, data: any) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;
    moveCategoryAccounts: (data: { fromCategoryId: string | null; toCategoryId: string | null }) => Promise<void>;
    fetchJournalEntries: (params?: any) => Promise<void>;
    createJournalEntry: (data: any) => Promise<void>;
    getJournalEntry: (id: string) => Promise<JournalEntry>;
    updateJournalEntry: (id: string, data: any) => Promise<void>;
    deleteJournalEntry: (id: string) => Promise<void>;
    getLedger: (params: { accountId: string; startDate?: string; endDate?: string; limit?: number; offset?: number; all?: boolean }) => Promise<LedgerResponse>;
    getTrialBalance: (params: { startDate?: string; endDate?: string; status?: string }) => Promise<TrialBalanceResponse>;

    // Audit Logs
    auditLogs: AuditLog[];
    totalAuditLogs: number;
    fetchAuditLogs: (params?: any) => Promise<void>;

    // Dashboard
    getCompanySummary: (params?: { companyId?: string; startDate?: string; endDate?: string }) => Promise<CompanySummaryResponse>;
    getProfitLoss12Months: (params?: { companyId?: string }) => Promise<ProfitLossData>;
    getJournalEntries12Months: (params?: { companyId?: string }) => Promise<JournalEntryCountData>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    companies: [],
    totalCompanies: 0,
    allUsers: [],
    totalUsers: 0,
    accounts: [],
    totalAccounts: 0,
    categories: [],
    totalCategories: 0,
    uncategorizedCount: 0,
    journalEntries: [],
    totalJournalEntries: 0,

    journalTotals: { debit: 0, credit: 0 },

    auditLogs: [],
    totalAuditLogs: 0,

    login: async (usernameOrEmail: string, password: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ emailOrUsername: usernameOrEmail, password }),
            });

            if (!response.ok) {
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Failed to login");
                } else {
                    const errorText = await response.text();
                    console.error("Login failed with non-JSON response:", errorText);
                    throw new Error(`Login failed: Server returned ${response.status} ${response.statusText}`);
                }
            }

            const authData = await response.json() as AuthResponse;

            localStorage.setItem("authToken", authData.token);
            localStorage.setItem("authUser", JSON.stringify(authData.user));

            set({
                user: authData.user,
                token: authData.token,
                isAuthenticated: true
            });

            // Fetch full profile to ensure all fields (like roles) are present
            await get().fetchProfile();
        } catch (error: any) {
            console.error("Login error:", error);
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("authUser");
        set({
            user: null,
            token: null,
            isAuthenticated: false,
            companies: [],
            totalCompanies: 0,
            allUsers: [],
            totalUsers: 0,
            accounts: [],
            totalAccounts: 0,
            categories: [],
            totalCategories: 0,
            uncategorizedCount: 0,
            journalEntries: [],
            totalJournalEntries: 0,
            journalTotals: { debit: 0, credit: 0 }
        });
    },

    fetchProfile: async () => {
        const { token } = get();
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE_URL}/auth/me`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    get().logout();
                    return;
                }
                throw new Error("Failed to load profile");
            }

            const data = await response.json();
            set({ user: data.user });
            localStorage.setItem("authUser", JSON.stringify(data.user));
        } catch (error) {
            console.error("Fetch profile error:", error);
        }
    },

    changePassword: async (currentPassword, newPassword) => {
        const { token } = get();
        if (!token) throw new Error("Unauthorized");

        const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ currentPassword, newPassword }),
        });

        await response.json();
    },

    updateProfile: async (data: { name?: string; phone?: string; address?: string }) => {
        const { token } = get();
        if (!token) throw new Error("Unauthorized");

        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || "Failed to update profile");
        }

        set({ user: result.user });
        localStorage.setItem("authUser", JSON.stringify(result.user));
    },

    fetchCompanies: async (params = {}) => {
        const { token } = get();
        if (!token) return;

        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${API_BASE_URL}/companies?${query}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Failed to fetch companies");
        }

        set({
            companies: data.companies,
            totalCompanies: data.total
        });
    },

    getCompany: async (id: string) => {
        const { token } = get();
        if (!token) throw new Error("Unauthorized");

        const response = await fetch(`${API_BASE_URL}/companies/${id}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Failed to fetch company");
        }

        return data.company;
    },

    createCompany: async (data: any) => {
        const { token } = get();
        if (!token) throw new Error("Unauthorized");

        const response = await fetch(`${API_BASE_URL}/companies`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || "Failed to create company");
        }
    },

    updateCompany: async (id: string, data: any) => {
        const { token } = get();
        if (!token) throw new Error("Unauthorized");

        const response = await fetch(`${API_BASE_URL}/companies/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || "Failed to update company");
        }
    },

    updateMyCompany: async (data: any) => {
        const { token } = get();
        if (!token) throw new Error("Unauthorized");

        const response = await fetch(`${API_BASE_URL}/companies/my`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || "Failed to update company");
        }

        // Update local user state with new company details if necessary
        // Since the user object contains a nested company object, we might want to refresh the profile
        await get().fetchProfile();
    },

    deleteCompany: async (id: string) => {
        const { token } = get();
        if (!token) throw new Error("Unauthorized");

        const response = await fetch(`${API_BASE_URL}/companies/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || "Failed to delete company");
        }
    },

    fetchUsers: async (params = {}) => {
        const { token } = get();
        if (!token) return;

        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${API_BASE_URL}/users/all?${query}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Failed to fetch users");
        }

        set({
            allUsers: data.users,
            totalUsers: data.total
        });
    },

    fetchCompanyUsers: async (params = {}) => {
        const { token } = get();
        if (!token) return;

        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${API_BASE_URL}/users?${query}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Failed to fetch company users");
        }

        set({
            allUsers: data.users, // Reuse allUsers for display
            totalUsers: data.total
        });
    },

    createCompanyUser: async (data: any) => {
        const { token } = get();
        if (!token) throw new Error("Unauthorized");

        const response = await fetch(`${API_BASE_URL}/users`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || "Failed to create user");
        }
    },

    getCompanyUser: async (id: string) => {
        const { token } = get();
        if (!token) throw new Error("Unauthorized");

        const response = await fetch(`${API_BASE_URL}/users/${id}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Failed to get user");
        }

        return data.user;
    },

    updateCompanyUser: async (id: string, data: any) => {
        const { token } = get();
        if (!token) throw new Error("Unauthorized");

        const response = await fetch(`${API_BASE_URL}/users/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || "Failed to update user");
        }
    },

    deleteCompanyUser: async (id: string) => {
        const { token } = get();
        if (!token) throw new Error("Unauthorized");

        const response = await fetch(`${API_BASE_URL}/users/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.error || "Failed to delete user");
        }
    },

    updateCompanyAdmin: async (id: string, data: any) => {
        const { token } = get();
        if (!token) throw new Error("Unauthorized");

        const response = await fetch(`${API_BASE_URL}/users/admins/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || "Failed to update company administrator");
        }
    },

    resetCompanyAdminPassword: async (id: string) => {
        const { token } = get();
        if (!token) throw new Error("Unauthorized");

        const response = await fetch(`${API_BASE_URL}/users/admins/${id}/reset-password`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || "Failed to reset password");
        }
    },

    fetchAccounts: async (params = {}) => {
        const { token, user } = get();
        if (!token || !user?.company?.id) return;

        const query = new URLSearchParams({
            ...params,
            companyId: user.company.id
        }).toString();

        const response = await fetch(`${API_BASE_URL}/accounts?${query}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Failed to fetch accounts");
        }

        set({
            accounts: data.accounts,
            totalAccounts: data.total
        });
    },

    createAccount: async (data: any) => {
        const { token, user } = get();
        if (!token || !user?.company?.id) throw new Error("No company context");

        const response = await fetch(`${API_BASE_URL}/accounts`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({
                ...data,
                companyId: user.company.id
            }),
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || "Failed to create account");
        }
    },

    getAccount: async (id: string) => {
        const { token } = get();
        if (!token) throw new Error("Unauthorized");

        const response = await fetch(`${API_BASE_URL}/accounts/${id}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Failed to fetch account");
        }

        return data.account;
    },

    updateAccount: async (id: string, data: any) => {
        const { token } = get();
        if (!token) throw new Error("Unauthorized");

        const response = await fetch(`${API_BASE_URL}/accounts/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || "Failed to update account");
        }
    },

    deactivateAccount: async (id: string) => {
        const { token } = get();
        if (!token) throw new Error("Unauthorized");

        const response = await fetch(`${API_BASE_URL}/accounts/${id}/deactivate`, {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || "Failed to deactivate account");
        }
    },

    fetchCategories: async (params = {}) => {
        const { token, user } = get();
        if (!token || !user?.company?.id) return;

        const query = new URLSearchParams({
            ...params,
            companyId: user.company.id
        }).toString();

        const response = await fetch(`${API_BASE_URL}/account-categories?${query}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Failed to fetch categories");
        }

        set({
            categories: data.categories,
            totalCategories: data.total,
            uncategorizedCount: data.uncategorizedCount
        });
    },

    createCategory: async (data: any) => {
        const { token, user } = get();
        if (!token || !user?.company?.id) throw new Error("No company context");

        const response = await fetch(`${API_BASE_URL}/account-categories`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({
                ...data,
                companyId: user.company.id
            }),
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || "Failed to create category");
        }
    },

    updateCategory: async (id: string, data: any) => {
        const { token, user } = get();
        if (!token || !user?.company?.id) throw new Error("No company context");

        const response = await fetch(`${API_BASE_URL}/account-categories/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || "Failed to update category");
        }
    },

    deleteCategory: async (id: string) => {
        const { token, user } = get();
        if (!token || !user?.company?.id) throw new Error("No company context");

        const response = await fetch(`${API_BASE_URL}/account-categories/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || "Failed to delete category");
        }
    },

    moveCategoryAccounts: async (data) => {
        const { token, user } = get();
        if (!token || !user?.company?.id) throw new Error("No company context");

        const response = await fetch(`${API_BASE_URL}/account-categories/move`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({
                ...data,
                companyId: user.company.id
            }),
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || "Failed to move accounts");
        }
    },

    fetchJournalEntries: async (params = {}) => {
        const { token, user } = get();
        if (!token || !user?.company?.id) return;

        const query = new URLSearchParams({
            ...params,
            companyId: user.company.id
        }).toString();

        const response = await fetch(`${API_BASE_URL}/journal-entries?${query}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Failed to fetch journal entries");
        }

        set({
            journalEntries: data.entries,
            totalJournalEntries: data.total,
            journalTotals: data.totals
        });
    },

    createJournalEntry: async (data: any) => {
        const { token, user } = get();
        if (!token || !user?.company?.id) throw new Error("No company context");

        const response = await fetch(`${API_BASE_URL}/journal-entries`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({
                ...data,
                companyId: user.company.id
            }),
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || "Failed to create journal entry");
        }
    },

    getJournalEntry: async (id: string) => {
        const { token, journalEntries } = get();
        if (!token) throw new Error("Unauthorized");

        const response = await fetch(`${API_BASE_URL}/journal-entries/${id}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Failed to fetch journal entry");
        }

        // Update the entry in the list if it exists to include lines
        const updatedEntries = journalEntries.map(entry =>
            entry.id === id ? { ...entry, ...data.entry } : entry
        );
        set({ journalEntries: updatedEntries });

        return data.entry;
    },

    updateJournalEntry: async (id: string, data: any) => {
        const { token } = get();
        if (!token) throw new Error("Unauthorized");

        const response = await fetch(`${API_BASE_URL}/journal-entries/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || "Failed to update journal entry");
        }
    },

    deleteJournalEntry: async (id: string) => {
        const { token } = get();
        if (!token) throw new Error("Unauthorized");

        const response = await fetch(`${API_BASE_URL}/journal-entries/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok && response.status !== 204) {
            const data = await response.json();
            throw new Error(data.error || "Failed to delete journal entry");
        }
    },

    getLedger: async (params) => {
        const { token, user } = get();
        if (!token || !user?.company?.id) throw new Error("No company context");

        const query = new URLSearchParams({
            ...params as any,
            companyId: user.company.id
        }).toString();

        const response = await fetch(`${API_BASE_URL}/ledger?${query}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Failed to fetch ledger");
        }

        return data as LedgerResponse;
    },

    getTrialBalance: async (params) => {
        const { token, user } = get();
        if (!token || !user?.company?.id) throw new Error("No company context");

        const query = new URLSearchParams({
            ...params as any,
            companyId: user.company.id
        }).toString();

        const response = await fetch(`${API_BASE_URL}/trial-balance?${query}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Failed to fetch trial balance");
        }

        return data as TrialBalanceResponse;
    },

    fetchAuditLogs: async (params = {}) => {
        const { token } = get();
        if (!token) return;

        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${API_BASE_URL}/audit-logs?${query}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Failed to fetch audit logs");
        }

        set({
            auditLogs: data.auditLogs,
            totalAuditLogs: data.total
        });
    },

    getCompanySummary: async (params = {}) => {
        const { token } = get();
        if (!token) throw new Error("Unauthorized");

        const query = new URLSearchParams(params as any).toString();
        const response = await fetch(`${API_BASE_URL}/dashboard/company/summary?${query}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to fetch company summary");
        return data as CompanySummaryResponse;
    },

    getProfitLoss12Months: async (params = {}) => {
        const { token } = get();
        if (!token) throw new Error("Unauthorized");

        const query = new URLSearchParams(params as any).toString();
        const response = await fetch(`${API_BASE_URL}/dashboard/company/profit-loss-12-months?${query}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to fetch profit/loss data");
        return data as ProfitLossData;
    },

    getJournalEntries12Months: async (params = {}) => {
        const { token } = get();
        if (!token) throw new Error("Unauthorized");

        const query = new URLSearchParams(params as any).toString();
        const response = await fetch(`${API_BASE_URL}/dashboard/company/journal-entries-12-months?${query}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to fetch journal entries data");
        return data as JournalEntryCountData;
    },



    initialize: async () => {
        const storedToken = localStorage.getItem("authToken");
        const storedUser = localStorage.getItem("authUser");

        if (storedToken && storedUser) {
            try {
                const user = JSON.parse(storedUser);
                set({
                    token: storedToken,
                    user: user,
                    isAuthenticated: true,
                });

                // Refresh profile data from server BEFORE setting isLoading to false
                await get().fetchProfile();
            } catch (e) {
                console.error("Failed to parse stored user", e);
                localStorage.removeItem("authToken");
                localStorage.removeItem("authUser");
            } finally {
                set({ isLoading: false });
            }
        } else {
            set({ isLoading: false });
        }
    }
}));
