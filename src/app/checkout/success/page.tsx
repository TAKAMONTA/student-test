import Link from "next/link";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;

  return (
    <div className="min-h-full bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_45%,#ecfeff_100%)] px-4 py-16">
      <main className="mx-auto w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/70">
        <p className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
          購入完了
        </p>
        <h1 className="mt-4 text-3xl font-black text-slate-950">お支払いを受け付けました</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          購入状態はアプリに反映されます。ログインリンクが届いたら、リンクからログインして学習を始めてください。
        </p>

        {sessionId ? <p className="mt-4 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">決済確認済み</p> : null}

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-700"
          >
            ログイン画面へ
          </Link>
          <Link
            href="/buy"
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            購入ページへ戻る
          </Link>
        </div>

        <p className="mt-5 text-xs leading-6 text-slate-500">
          メールが届かない場合は迷惑メールフォルダを確認し、数分待ってからログイン画面で再送してください。購入状態は失われません。
        </p>
      </main>
    </div>
  );
}
