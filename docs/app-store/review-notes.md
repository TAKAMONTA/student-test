# App Store Review Notes — 中1テストキット

> App Store Connect の「App Reviewに関する情報」に貼り付けるテンプレート。`<<…>>` の部分は提出時に実値に置き換えること。

---

## サポート連絡先

- 担当者名: 中島 隆（Takashi Nakaima）
- メール: t.nakaima@gmail.com
- 電話: <<電話番号>>

## アプリ概要（Reviewer 向け）

中1テストキットは中学1年生の中間・期末テスト対策を支援する学習アプリです。Web版（https://chu1-testkit.t-nakaima.workers.dev）と同じバックエンドを WKWebView で表示し、購入のみ Apple In-App Purchase（StoreKit 2）を経由して処理します。

- アプリ内課金は1種類のみ: `chu1_testkit_lifetime`（非消費型 / ¥980 / 買い切り）
- 一度購入すれば、同じ Apple ID と同じメールアドレスでログインしている限り、全コンテンツに永続アクセスできます
- サブスクリプションはありません

## デモアカウント（メールリンクなしでログイン可能）

App Reviewer 向けに、メールマジックリンクを介さずにログインできるフォームを `/login` ページの下部に用意しています（PR #8 で実装、設計書: `docs/superpowers/specs/2026-06-03-ios-review-access-design.md`）。

**手順:**

1. アプリを起動するとログイン画面が表示されます。
2. 画面下部の「App Review ログイン」セクションを開いてください。
3. 次の値を入力して「ログイン」を押します。
   - メールアドレス: `<<APP_STORE_REVIEW_EMAIL>>`（例: `appreview@takaapps.com`）
   - レビューコード: `<<TEST_LOGIN_SECRET>>`（提出ビルドと同じ secret）
4. ログインに成功すると `/home` に遷移します。

> ※ レビューコードはApp Store Connect 提出時に Reviewer Notes 欄へ直接記入してください。本リポジトリには保存していません。

## IAP テスト手順

1. 上記デモアカウントでログインします（初回購入前なので未購入状態です）。
2. ホーム画面右上の「購入」タブを開きます。
3. 「¥980 で購入する」ボタンを押すと StoreKit のシートが表示されます。
4. Sandbox テスターでサインインの上、購入を完了してください。
5. 購入成功後、自動的に `/home` に戻り、全教科のコンテンツが解放されます。

### 復元購入

- 設定タブ →「購入を復元」をタップするか、購入画面の「購入を復元」リンクをタップしてください。
- StoreKit 2 の `AppStore.sync()` と `Transaction.currentEntitlements` を使用してサーバー検証付きで復元します。

## AI質問機能について

- 各単元のレッスン画面に「AIに質問する」ボタンがあります。
- 質問内容は Anthropic 社の Claude API に送信して回答を生成します。
- 1日30回までのレートリミットを設けています。
- 入力内容は学習目的に限り保存し、第三者へ提供することはありません（プライバシーポリシー参照）。

## 主な画面と動線

1. ログイン（メールマジックリンク or App Review ログインフォーム）
2. 初期設定（テスト日程と教科書出版社の入力）
3. ホーム（テストカウントダウン、教科ごとの進捗）
4. 教科詳細 → 単元一覧
5. レッスン（解説 → 「ドリルを始める」/「AIに質問する」）
6. ドリル（4択 / 全8問 / 即時フィードバック）
7. 予想模試（中間 / 期末モード切替、5教科 × 各5問）
8. プロフィール / 設定（フィードバック送信、購入復元、ログアウト）

## 関連URL

- マーケティングサイト / Web版: https://chu1-testkit.t-nakaima.workers.dev
- プライバシーポリシー: https://chu1-testkit.t-nakaima.workers.dev/privacy
- 利用規約: https://chu1-testkit.t-nakaima.workers.dev/terms
- サポート: https://chu1-testkit.t-nakaima.workers.dev/profile （ログイン後「お問い合わせ」）

## 補足

- 本アプリは外部広告・トラッキングを利用していません（PostHog 自社ホスト分析のみ、IDFA未使用）。
- 子ども向けカテゴリ（Kids Category）には属しません。中学生およびその保護者を主対象としています。
- 提出時の動作確認端末: iPhone 17 Pro Max (iOS 26.5) Simulator
