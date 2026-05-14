import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAuth, hasPurchase } from "@/lib/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const authResult = await requireAuth();
  if (authResult instanceof Response) redirect("/login");

  if (!hasPurchase(authResult)) redirect("/buy");

  return (
    <div className="flex flex-col min-h-full">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 h-14 max-w-3xl mx-auto w-full">
          <Link href="/home" className="font-bold text-indigo-600">
            中1テストキット
          </Link>
          <div className="flex items-center gap-5">
            <Link href="/home" className="text-sm text-slate-600 hover:text-slate-900">
              ホーム
            </Link>
            <Link href="/mock-exam" className="text-sm text-slate-600 hover:text-slate-900">
              模試
            </Link>
            <Link href="/buy" className="text-sm text-slate-600 hover:text-slate-900">
              購入
            </Link>
            <Link href="/profile" className="text-sm text-slate-600 hover:text-slate-900">
              設定
            </Link>
          </div>
        </div>
      </nav>
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">{children}</main>
    </div>
  );
}
