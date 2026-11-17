
"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

type Expense = {
  id: number;
  amount: string;
  description: string;
  date: string;
  category: string;
};

type MonthlySummary = {
  month: string;
  total_spent: string;
  transaction_count: number;
  previous_month_total: string;
  percentage_change: number | null;
};

type CategorySummary = {
  category: string;
  total: string;
  transaction_count: number;
};

type TrendItem = {
  month: string;
  total_spent: string;
  transaction_count: number;
};

type ExpenseListResponse = {
  items: Expense[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
};


export default function ExpenseOverview() {
  const now = new Date();

  const currentMonth = `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}`;

  // 1. Monthly summary
  const monthlyQuery = useQuery<MonthlySummary>({
    queryKey: ["dashboard", "monthly-summary", currentMonth],
    queryFn: async () => {
      const response = await fetch(
        `/api/summary/monthly?month=${currentMonth}`,
        { cache: "no-store" }
      );

      if (!response.ok) {
        throw new Error("Could not load monthly summary.");
      }

      return response.json();
    },
  });

  // 2. Category summary
  const categoriesQuery = useQuery<CategorySummary[]>({
    queryKey: ["dashboard", "category-summary", currentMonth],
    queryFn: async () => {
      const response = await fetch(
        `/api/summary/categories?month=${currentMonth}`,
        { cache: "no-store" }
      );

      if (!response.ok) {
        throw new Error("Could not load category summary.");
      }

      return response.json();
    },
  });

  // 3. Six-month spending trend
  const trendQuery = useQuery<TrendItem[]>({
    queryKey: ["dashboard", "monthly-trend", 6],
    queryFn: async () => {
      const response = await fetch("/api/summary/trend?months=6", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Could not load monthly trend.");
      }

      return response.json();
    },
  });

  // 4. Recent expenses
  const expensesQuery = useQuery<ExpenseListResponse>({
    queryKey: ["dashboard", "recent-expenses", 5],
    queryFn: async () => {
      const response = await fetch("/api/expenses?limit=5", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Could not load recent expenses.");
      }

      return response.json();
    },
  });

  // Preserve the variables used by the existing dashboard UI
  const monthlySummary = monthlyQuery.data ?? null;
  const categories = categoriesQuery.data ?? [];
  const monthlyTrend = trendQuery.data ?? [];
  const recentExpenses = expensesQuery.data?.items ?? [];
  const totalTransactions = expensesQuery.data?.total ?? 0;

  // const loading =
  //   monthlyQuery.isPending ||
  //   categoriesQuery.isPending ||
  //   trendQuery.isPending ||
  //   expensesQuery.isPending;

  // const error =
  //   monthlyQuery.error?.message ||
  //   categoriesQuery.error?.message ||
  //   trendQuery.error?.message ||
  //   expensesQuery.error?.message ||
  //   "";

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);

  const formatMonth = (monthKey: string) => {
    const [year, month] = monthKey.split("-").map(Number);

    return new Date(year, month - 1, 1).toLocaleString("en-IN", {
      month: "short",
    });
  };

  const formatDate = (date: string) =>
    new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const monthlyTotal = Number(monthlySummary?.total_spent ?? 0);
  const monthlyTransactionCount =
    monthlySummary?.transaction_count ?? 0;

  const chartData = monthlyTrend.map((item) => ({
    month: formatMonth(item.month),
    total: Number(item.total_spent),
  }));

  const categoryBreakdown = categories
    .map((item) => {
      const amount = Number(item.total);

      return {
        category: item.category,
        amount,
        percentage:
          monthlyTotal > 0 ? (amount / monthlyTotal) * 100 : 0,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  // if (loading) {
  //   return (
  //     <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 text-center text-sm text-slate-500">
  //       Loading your financial data...
  //     </div>
  //   );
  // }

  // if (error) {
  //   return (
  //     <div className="rounded-2xl border border-red-200 bg-white p-5 text-sm text-red-600">
  //       {error}
  //     </div>
  //   );
  // }

  return (
    <div className="min-w-0 space-y-5 sm:space-y-7">
      {/* Summary Cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-sm font-medium text-slate-500">
            Monthly Expenses
          </p>

          {monthlyQuery.isPending ? (
            <p className="mt-3 text-sm text-slate-400">Loading...</p>
          ) : monthlyQuery.isError ? (
            <p className="mt-3 text-sm text-red-500">
              Could not load monthly expenses.
            </p>
          ) : (
            <h3 className="mt-3 break-words text-2xl font-bold text-slate-800 sm:text-3xl">
              {formatAmount(monthlyTotal)}
            </h3>
          )}

          <p className="mt-3 text-xs text-slate-400">
            {!monthlyQuery.isError && (
              <>{monthlyTransactionCount} transactions this month</>
            )}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-sm font-medium text-slate-500">
            All Transactions
          </p>

                  {expensesQuery.isPending ? (
            <p className="mt-3 text-sm text-slate-400">Loading...</p>
          ) : expensesQuery.isError ? (
            <p className="mt-3 text-sm text-red-500">
              Could not load transaction count.
            </p>
          ) : (
            <h3 className="mt-3 text-2xl font-bold text-slate-800 sm:text-3xl">
              {totalTransactions}
            </h3>
          )}

          <p className="mt-3 text-xs text-slate-400">
           {!expensesQuery.isError && "Across all recorded expenses"}
          </p>
        </div>
      </section>

      {/* Monthly Spending Trend */}
      <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-5 sm:mb-6">
          <h3 className="font-semibold text-slate-800">
            Spending Overview
          </h3>

          <p className="mt-1 text-sm text-slate-400">
            Your monthly spending over the last six months.
          </p>
        </div>

        
        {trendQuery.isPending ? (
          <div className="flex h-60 items-center justify-center sm:h-72">
            <p className="text-sm text-slate-400">Loading spending trend...</p>
          </div>
        ) : trendQuery.isError ? (
          <div className="flex h-60 items-center justify-center sm:h-72">
            <p className="text-sm text-red-500">
              Could not load spending trend.
            </p>
          </div>
        ) : (
          <div className="h-60 w-full min-w-0 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 5, left: -15, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E2E8F0"
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748B", fontSize: 11 }}
                  interval={0}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748B", fontSize: 10 }}
                  tickFormatter={(value: number) =>
                    value >= 1000
                      ? `₹${(value / 1000).toFixed(1)}k`
                      : `₹${value}`
                  }
                  width={55}
                />
                <Tooltip
                  formatter={(value) => formatAmount(Number(value ?? 0))}
                  cursor={{ fill: "#EFF6FF" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #E2E8F0",
                    fontSize: "12px",
                  }}
                />
                <Bar
                  dataKey="total"
                  name="Expenses"
                  fill="#2563EB"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={38}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

      </section>

      {/* Spending by Category */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div>
          <h3 className="font-semibold text-slate-800">
            Spending by Category
          </h3>

          <p className="mt-1 text-sm text-slate-400">
            Where your money goes this month.
          </p>
        </div>


        {categoriesQuery.isPending ? (
          <div className="flex h-36 items-center justify-center sm:h-40">
            <p className="text-sm text-slate-400">
              Loading category breakdown...
            </p>
          </div>
        ) : categoriesQuery.isError ? (
          <div className="flex h-36 items-center justify-center sm:h-40">
            <p className="text-sm text-red-500">
              Could not load category breakdown.
            </p>
          </div>
        ) : categoryBreakdown.length === 0 ? (
          <div className="flex h-36 items-center justify-center sm:h-40">
            <p className="text-center text-sm text-slate-400">
              No spending data available for this month.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-5 sm:space-y-6">
            {categoryBreakdown.map((item) => (
              <div key={item.category}>
                <div className="mb-2 flex items-start justify-between gap-3">
                  <span className="min-w-0 break-words text-sm font-medium text-slate-700">
                    {item.category}
                  </span>

                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-slate-800">
                      {formatAmount(item.amount)}
                    </p>

                    <p className="text-xs text-slate-400">
                      {item.percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all duration-500"
                    style={{
                      width: `${Math.min(item.percentage, 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Transactions */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-slate-800">
              Recent Transactions
            </h3>

            <p className="mt-1 text-xs text-slate-400 sm:text-sm">
              Your latest financial activity.
            </p>
          </div>

          <span className="shrink-0 text-xs font-medium text-blue-600 sm:text-sm">
            Latest 5
          </span>
        </div>

        
        {expensesQuery.isPending ? (
          <div className="flex h-36 items-center justify-center sm:h-40">
            <p className="text-sm text-slate-400">
              Loading recent transactions...
            </p>
          </div>
        ) : expensesQuery.isError ? (
          <div className="flex h-36 items-center justify-center sm:h-40">
            <p className="text-sm text-red-500">
              Could not load recent transactions.
            </p>
          </div>
        ) : recentExpenses.length === 0 ? (
          <div className="flex h-36 items-center justify-center sm:h-40">
            <p className="text-sm text-slate-400">
              No expenses recorded yet.
            </p>
          </div>
        ) : (
          <div className="mt-4 divide-y divide-slate-100">
            {recentExpenses.map((expense) => (
              <div
                key={expense.id}
                className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
              >
                <div className="min-w-0">
                  <p className="break-words text-sm font-medium text-slate-800">
                    {expense.description}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {expense.category} · {formatDate(expense.date)}
                  </p>
                </div>

                <p className="self-start text-sm font-semibold text-slate-800 sm:shrink-0">
                  {formatAmount(Number(expense.amount))}
                </p>
              </div>
            ))}
          </div>

        )}
      </section>
    </div>
  );
}
