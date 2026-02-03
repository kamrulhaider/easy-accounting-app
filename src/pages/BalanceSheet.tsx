import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { formatCurrency, formatCurrencyForExport } from "@/lib/utils";
import {
  useAuthStore,
  type BalanceSheetResponse,
  type BalanceSheetSection,
} from "@/store/useAuthStore";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, FileText, FileSpreadsheet } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

import { cn } from "@/lib/utils";

export default function BalanceSheet() {
  const { user, getBalanceSheet } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<BalanceSheetResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filters
  // Filters
  const getFormattedDate = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [startDate, setStartDate] = useState<string>(
    getFormattedDate(new Date(new Date().getFullYear(), 0, 1)),
  );
  const [endDate, setEndDate] = useState<string>(getFormattedDate(new Date()));
  const [status, setStatus] = useState<string>("ACTIVE");

  const fetchReport = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getBalanceSheet({
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
        status: status !== "ALL" ? status : undefined,
      });
      setData(response);
    } catch (err: any) {
      setError(err.message || "Failed to load balance sheet");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.company?.id) {
      fetchReport();
    }
  }, [user?.company?.id]);

  const handleApplyFilters = () => {
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      setError("Start date cannot be after end date.");
      return;
    }
    if (startDate && new Date(startDate).toString() === "Invalid Date") {
      setError("Invalid start date provided.");
      return;
    }
    if (endDate && new Date(endDate).toString() === "Invalid Date") {
      setError("Invalid end date provided.");
      return;
    }
    fetchReport();
  };

  const handleExportPDF = () => {
    if (!data || !user?.company) return;

    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.text(user.company.name, 14, 20);
    doc.setFontSize(14);
    doc.text("Balance Sheet", 14, 30);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 40);

    if (data.filters.startDate || data.filters.endDate) {
      const range = `${data.filters.startDate ? new Date(data.filters.startDate).toLocaleDateString() : "Start"} to ${data.filters.endDate ? new Date(data.filters.endDate).toLocaleDateString() : "End"}`;
      doc.text(`Period: ${range}`, 14, 45);
    }

    const currency = user.company.currency;
    const sections = [
      { title: "Assets", data: data.assets },
      { title: "Liabilities", data: data.liabilities },
      { title: "Equity", data: data.equity },
    ];

    let startY = 55;

    sections.forEach((section) => {
      doc.setFontSize(12);
      doc.text(section.title, 14, startY);
      startY += 5;

      const rows = section.data.accounts.map((acc) => [
        acc.name,
        formatCurrencyForExport(acc.balance, currency),
      ]);

      // Add total row for section
      rows.push([
        "Total " + section.title,
        formatCurrencyForExport(section.data.total, currency),
      ]);

      autoTable(doc, {
        startY: startY,
        head: [["Account", "Balance"]],
        body: rows,
        theme: "grid",
        headStyles: { fillColor: [66, 66, 66] },
        styles: { fontSize: 9 },
        columnStyles: {
          1: { halign: "right" },
        },
      });

      // @ts-ignore
      startY = doc.lastAutoTable.finalY + 10;
    });

    doc.save("BalanceSheet.pdf");
  };

  const handleExportExcel = () => {
    if (!data || !user?.company) return;

    const currency = user.company.currency;
    const wb = XLSX.utils.book_new();
    const wsData: any[] = [];

    // Header
    wsData.push([user.company.name]);
    wsData.push(["Balance Sheet"]);
    wsData.push([`Generated on: ${new Date().toLocaleDateString()}`]);
    wsData.push([]);

    const sections = [
      { title: "Assets", data: data.assets },
      { title: "Liabilities", data: data.liabilities },
      { title: "Equity", data: data.equity },
    ];

    sections.forEach((section) => {
      wsData.push([section.title]);
      wsData.push(["Account", "Balance"]);

      section.data.accounts.forEach((acc) => {
        wsData.push([acc.name, formatCurrencyForExport(acc.balance, currency)]);
      });

      wsData.push([
        `Total ${section.title}`,
        formatCurrencyForExport(section.data.total, currency),
      ]);
      wsData.push([]); // Spacer
    });

    // Grand Totals check (Assets = Liabilities + Equity)
    wsData.push(["Accounting Equation Check"]);
    wsData.push([
      "Total Assets",
      formatCurrencyForExport(data.totals.assets, currency),
    ]);
    wsData.push([
      "Total Liab + Equity",
      formatCurrencyForExport(
        data.totals.liabilities + data.totals.equity,
        currency,
      ),
    ]);
    wsData.push(["Balanced", data.totals.equationBalanced ? "YES" : "NO"]);

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "BalanceSheet");
    XLSX.writeFile(wb, "BalanceSheet.xlsx");
  };

  if (user?.userRole !== "COMPANY_ADMIN" && user?.userRole !== "COMPANY_USER") {
    return <Navigate to="/" replace />;
  }

  const renderSection = (title: string, section: BalanceSheetSection) => (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4 text-primary">{title}</h3>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account</TableHead>
              <TableHead className="text-right">Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {section.accounts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={2}
                  className="text-center h-24 text-muted-foreground"
                >
                  No accounts found in this section
                </TableCell>
              </TableRow>
            ) : (
              section.accounts.map((acc) => (
                <TableRow key={acc.id}>
                  <TableCell>{acc.name}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(acc.balance, user?.company?.currency)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell className="font-bold">Total {title}</TableCell>
              <TableCell className="text-right font-bold">
                {formatCurrency(section.total, user?.company?.currency)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Balance Sheet</h1>
            <p className="text-muted-foreground">
              Statement of financial position including Assets, Liabilities, and
              Equity.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleExportPDF}
              disabled={!data || isLoading}
            >
              <FileText className="mr-2 h-4 w-4" />
              PDF
            </Button>
            <Button
              variant="outline"
              onClick={handleExportExcel}
              disabled={!data || isLoading}
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Excel
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <Label>Report Filters</Label>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="grid gap-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-[200px]"
                />
              </div>
              <div className="grid gap-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-[200px]"
                />
              </div>
              <div className="grid gap-2 min-w-[150px]">
                <Label>Account Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active Only</SelectItem>
                    <SelectItem value="ALL">All Statuses</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={handleApplyFilters} disabled={isLoading}>
                  <Search className="mr-2 h-4 w-4" />
                  Generate Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="bg-destructive/15 text-destructive p-4 rounded-md">
            {error}
          </div>
        )}

        {data && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Equation Check Banner */}
            <div
              className={cn(
                "p-4 rounded-md border flex justify-between items-center",
                data.totals.equationBalanced
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-red-50 border-red-200 text-red-800",
              )}
            >
              <div className="font-semibold">
                {data.totals.equationBalanced
                  ? "Accounting Equation Balanced"
                  : "Warning: Accounting Equation NOT Balanced"}
              </div>
              <div className="text-sm">
                Assets (
                {formatCurrency(data.totals.assets, user?.company?.currency)}) =
                Liabilities (
                {formatCurrency(
                  data.totals.liabilities,
                  user?.company?.currency,
                )}
                ) + Equity (
                {formatCurrency(data.totals.equity, user?.company?.currency)})
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-8">
                {renderSection("Assets", data.assets)}
              </div>
              <div className="space-y-8">
                {renderSection("Liabilities", data.liabilities)}
                {renderSection("Equity", data.equity)}
              </div>
            </div>

            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Assets</span>
                  <span>
                    {formatCurrency(
                      data.totals.assets,
                      user?.company?.currency,
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold mt-2">
                  <span>Total Liabilities & Equity</span>
                  <span>
                    {formatCurrency(
                      data.totals.liabilities + data.totals.equity,
                      user?.company?.currency,
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
