import type { Metadata } from "next";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import type { TimeRange } from "@/lib/admin/mock-data";

export const metadata: Metadata = {
  title: "REPP Admin",
  robots: { index: false, follow: false },
};

type SearchParams = { error?: string; range?: string };

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const authed = await isAdminAuthenticated();

  if (!authed) {
    return <AdminLogin error={sp.error} />;
  }

  const allowedRanges: TimeRange[] = ["today", "week", "month", "all"];
  const range = (allowedRanges as string[]).includes(sp.range ?? "")
    ? (sp.range as TimeRange)
    : "month";

  return <AdminDashboard range={range} />;
}
