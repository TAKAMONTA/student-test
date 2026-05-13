import Link from "next/link";
import { LEGAL_UPDATED_AT, SERVICE_NAME, SUPPORT_NOTE } from "../../legal-data";

export const metadata = {
  title: `特定商取引法に基づく表記 | ${SERVICE_NAME}`,
};

const rows = [
  ["販売価格", "980円（税込）"],
  ["商品代金以外の必要料金", "インターネット接続に必要な通信料等は利用者の負担となります。"],
  ["支払方法", "クレジットカード決済（Stripe）"],
  ["支払時期", "購入手続き完了時に決済されます。"],
  ["サービス提供時期", "決済完了後、直ちに有料機能を利用できます。"],
  ["有効期間", "購入日から30日間"],
  ["返品・キャンセル", "デジタルコンテンツの性質上、購入後の返品・キャンセルは原則としてお受けできません。ただし、法令上必要な場合または当方の責めに帰すべき不具合がある場合は個別に対応します。"],
  ["動作環境", "最新版の主要ブラウザを搭載したスマートフォン、タブレット、PC"],
  ["販売事業者", "請求があった場合、法令に基づき遅滞なく開示します。"],
  ["所在地・電話番号", "請求があった場合、法令に基づき遅滞なく開示します。"],
  ["お問い合わせ", SUPPORT_NOTE],
] as const;

export default function TokushoPage() {
  return (
    <main className="min-h-full bg-white px-6 py-12">
      <article className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm font-medium text-indigo-600 hover:underline">
          ← トップに戻る
        </Link>
        <h1 className="mt-6 text-3xl font-bold text-slate-900">特定商取引法に基づく表記</h1>
        <p className="mt-2 text-sm text-slate-500">最終更新日: {LEGAL_UPDATED_AT}</p>

        <div className="mt-8 overflow-hidden rounded-xl border border-slate-200">
          <dl className="divide-y divide-slate-200">
            {rows.map(([label, value]) => (
              <div key={label} className="grid gap-2 bg-white p-4 sm:grid-cols-[180px_1fr]">
                <dt className="font-bold text-slate-900">{label}</dt>
                <dd className="text-sm leading-6 text-slate-700">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <p className="mt-6 text-xs leading-6 text-slate-500">
          事業者情報の一部は、特定商取引法第11条ただし書に基づき省略しています。請求があった場合には、購入の意思決定に先立って確認できるよう遅滞なく提供します。
        </p>
      </article>
    </main>
  );
}
