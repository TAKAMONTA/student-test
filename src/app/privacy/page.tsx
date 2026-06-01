import Link from "next/link";
import { LEGAL_UPDATED_AT, SERVICE_NAME, SUPPORT_NOTE } from "../legal-data";

export const metadata = {
  title: `プライバシーポリシー | ${SERVICE_NAME}`,
};

export default function PrivacyPage() {
  return (
    <main className="min-h-full bg-white px-6 py-12">
      <article className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm font-medium text-indigo-600 hover:underline">
          ← トップに戻る
        </Link>
        <h1 className="mt-6 text-3xl font-bold text-slate-900">プライバシーポリシー</h1>
        <p className="mt-2 text-sm text-slate-500">最終更新日: {LEGAL_UPDATED_AT}</p>

        <div className="mt-8 space-y-7 text-sm leading-7 text-slate-700">
          <section>
            <h2 className="text-lg font-bold text-slate-900">1. 取得する情報</h2>
            <p>
              本サービスは、メールアドレス、購入状態、テスト日程、教科書出版社、学習履歴、ドリル回答、模試結果、AI質問の入力内容および回答内容を取得します。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900">2. 利用目的</h2>
            <p>
              取得した情報は、ログイン認証、購入確認、学習機能の提供、進捗表示、AI質問への回答、問い合わせ対応、不正利用防止、サービス改善のために利用します。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900">3. 外部サービス</h2>
            <p>
              決済には Stripe、メール送信には Resend、AI回答生成には Anthropic、ホスティングおよびデータ保存には Cloudflare を利用します。各サービスには、機能提供に必要な範囲で情報が送信される場合があります。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900">4. 利用状況の集計（解析ツール）</h2>
            <p>
              サービス改善のため、PostHog Inc.（データ保管リージョン: 欧州）が提供する解析ツールを利用しています。送信される情報の例: ページ閲覧履歴、操作内容、購入の成否、リファラ情報、デバイス・ブラウザの種類。メールアドレスはPostHogへの送信前にハッシュ化（SHA-256）し、原文は送信しません。IPアドレスは末尾を匿名化する設定にしています。画面の録画は行いません。
            </p>
            <p className="mt-2">
              ブラウザの「Do Not Track」設定が有効な場合、解析ツールの初期化を行いません。これにより、当該端末からの計測は停止されます。
            </p>
            <p className="mt-2">
              iOSアプリは他社アプリ・サイトを横断したトラッキングを行わないため、App Tracking Transparency（ATT）の許諾要求は表示しません。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900">5. 第三者提供</h2>
            <p>
              法令に基づく場合または利用者の同意がある場合を除き、取得した個人情報を第三者に提供しません。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900">6. 安全管理</h2>
            <p>
              取得した情報について、不正アクセス、漏えい、改ざん、紛失を防ぐため、合理的な安全管理措置を講じます。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900">7. 開示・訂正・削除</h2>
            <p>
              利用者本人から個人情報の開示、訂正、削除等の請求があった場合、本人確認のうえ、法令に従って対応します。{SUPPORT_NOTE}
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
