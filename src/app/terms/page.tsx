import Link from "next/link";
import { LEGAL_UPDATED_AT, SERVICE_NAME } from "../legal-data";

export const metadata = {
  title: `利用規約 | ${SERVICE_NAME}`,
};

export default function TermsPage() {
  return (
    <main className="min-h-full bg-white px-6 py-12">
      <article className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm font-medium text-indigo-600 hover:underline">
          ← トップに戻る
        </Link>
        <h1 className="mt-6 text-3xl font-bold text-slate-900">利用規約</h1>
        <p className="mt-2 text-sm text-slate-500">最終更新日: {LEGAL_UPDATED_AT}</p>

        <div className="mt-8 space-y-7 text-sm leading-7 text-slate-700">
          <section>
            <h2 className="text-lg font-bold text-slate-900">1. 適用</h2>
            <p>
              本規約は、{SERVICE_NAME} の利用条件を定めるものです。利用者は、本サービスを利用することで本規約に同意したものとみなされます。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900">2. サービス内容</h2>
            <p>
              本サービスは、中学1年生向けの定期テスト対策として、解説、ドリル、AI質問、予想模試等の学習機能を提供します。教材内容は一般的な学習支援を目的とし、特定の学校の出題内容や成績向上を保証するものではありません。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900">3. アカウントと購入</h2>
            <p>
              利用にはメール認証が必要です。有料機能は購入完了後、表示された有効期間内で利用できます。利用者は、登録メールアドレスを正確に管理してください。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900">4. 禁止事項</h2>
            <p>
              不正アクセス、アカウント共有、教材や回答の無断転載、サービス運営を妨げる行為、法令または公序良俗に反する行為を禁止します。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900">5. AI機能</h2>
            <p>
              AI回答は学習補助を目的とする自動生成の情報です。回答には誤りが含まれる場合があります。重要な学習内容は教科書、授業、保護者または先生の確認とあわせて利用してください。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900">6. 免責</h2>
            <p>
              本サービスは、教材内容の正確性と安定提供に努めますが、学習成果、試験結果、サービスの継続的な無停止提供を保証するものではありません。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900">7. 規約変更</h2>
            <p>
              必要に応じて本規約を変更することがあります。重要な変更がある場合は、サービス上での掲示その他適切な方法によりお知らせします。
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
