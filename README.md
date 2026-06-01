# 中1テストキット

中学1年生の定期テスト対策PWAです。中間・期末に向けた5教科の解説、3択ドリル、AI質問、予想模試、Stripe決済、メールマジックリンク認証を提供します。

認証と購入フローの設計方針は [docs/auth-design.md](/Users/taka/中学一年生中間テスト対策/docs/auth-design.md) を正とします。

## Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS
- Drizzle ORM
- Cloudflare Workers / D1 / KV / R2 via OpenNext
- Stripe Checkout
- Resend magic link auth
- Anthropic Claude for AI質問

## Setup

```bash
npm install
cp .env.local.example .env.local
```

`.env.local` に少なくとも以下を設定します。

```bash
JWT_SECRET=
APP_URL=http://localhost:3000
RESEND_API_KEY=
RESEND_FROM_EMAIL=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID=
ANTHROPIC_API_KEY=
CLOUDFLARE_API_TOKEN=
```

## Development

```bash
npm run dev
```

ローカルでは Cloudflare D1/KV が必要なAPIはそのままでは動かないことがあります。Cloudflare接続の確認:

```bash
set -a && source .env.local && set +a
npx wrangler whoami
```

## Content Seeds

商品版の教材コンテンツは以下です。5教科×5単元の全25単元、各単元8問以上、全問3択です。中間範囲8単元は curated コンテンツで上書きし、期末模試は全25単元から出題します。

```bash
seeds/complete-content.sql
```

対象トピック:

- `kokugo-1` 説明文の読み方
- `kokugo-2` 物語文の読み方
- `kokugo-3` 漢字・語句
- `sugaku-1` 正の数・負の数
- `eigo-1` アルファベット・発音
- `eigo-2` be動詞
- `rika-1` 植物のからだ
- `shakai-1` 地球のすがた

中間範囲は各トピック8問、合計64問です。全問3択で、難易度配分はおおむね基礎4・標準3・応用1です。

Remote D1へ適用:

```bash
set -a && source .env.local && set +a
npm run content:check
npx wrangler d1 execute chu1-testkit-db --remote --file=seeds/complete-content.sql
```

件数確認:

```bash
npx wrangler d1 execute chu1-testkit-db --remote --json --command="SELECT (SELECT COUNT(*) FROM topics) AS topics, (SELECT COUNT(*) FROM lessons) AS lessons, (SELECT COUNT(*) FROM questions) AS questions, (SELECT COUNT(*) FROM questions WHERE difficulty=1) AS d1, (SELECT COUNT(*) FROM questions WHERE difficulty=2) AS d2, (SELECT COUNT(*) FROM questions WHERE difficulty=3) AS d3;"
```

## Database

Initial schema:

```bash
migrations/0000_smiling_moondragon.sql
```

Additional manual migration:

```bash
migrations/0001_add_topics_midterm_scope.sql
```

`topics.midterm_scope` は中間模試の出題範囲制御に使います。期末模試は全トピックを対象にします。

## Verification

```bash
npx tsc --noEmit
npm test
npm run build
```

## Security Release Checklist

Before deploying security-sensitive changes:

```bash
npm test
npx tsc --noEmit
npm run content:check
npm run build
npx wrangler d1 execute chu1-testkit-db --remote --file=migrations/0002_security_hardening.sql
npx wrangler d1 execute chu1-testkit-db --remote --file=migrations/0003_ai_rate_limits.sql
npx wrangler d1 execute chu1-testkit-db --remote --file=migrations/0004_stripe_purchases.sql
```

Smoke checks:

- Logged-out paid API returns `401`.
- Logged-in unpaid paid API returns `403`.
- Logged-in purchased paid API returns `200`.
- Logout clears cached authenticated pages.
- Replaying the same Stripe `checkout.session.completed` event does not send another purchase email.
- AI question number 31 returns `429`.

## iOS App Store Preparation

iOS IAP readiness is tracked in [docs/release/2026-05-24-ios-iap-readiness.md](/Users/taka/中学一年生中間テスト対策/docs/release/2026-05-24-ios-iap-readiness.md).
The native shell release notes are in [docs/release/2026-05-25-ios-native-shell.md](/Users/taka/中学一年生中間テスト対策/docs/release/2026-05-25-ios-native-shell.md).

Native build/test:

```bash
cd ios
xcodegen generate
xcodebuild -project Chu1TestKit.xcodeproj -scheme Chu1TestKit -destination 'generic/platform=iOS' CODE_SIGNING_ALLOWED=NO build
xcodebuild -project Chu1TestKit.xcodeproj -scheme Chu1TestKit -destination 'platform=iOS Simulator,name=iPhone 17' CODE_SIGNING_ALLOWED=NO test
xcodebuild -project Chu1TestKit.xcodeproj -scheme 'Chu1TestKit Local StoreKit' -destination 'platform=iOS Simulator,name=iPhone 17' CODE_SIGNING_ALLOWED=NO build
```

Local StoreKit testing:

- Copy `.dev.vars.example` to `.dev.vars` and set local-only secrets.
- Keep `APPLE_APP_STORE_ENVIRONMENT=Xcode` for the local preview server.
- `APPLE_IAP_ISSUER_ID`, `APPLE_IAP_KEY_ID`, and `APPLE_IAP_PRIVATE_KEY` may stay empty in Xcode mode.
- Apply local D1 migrations and seed data with `npx wrangler d1 migrations apply chu1-testkit-db --local` and `npx wrangler d1 execute chu1-testkit-db --local --file=seeds/complete-content.sql`.
- Run `npm run preview:local-storekit`, then launch the `Chu1TestKit Local StoreKit` scheme in Xcode.
- The local scheme points the WebView at `http://localhost:8787` and uses `ios/StoreKit/Chu1TestKit.storekit`.

App Store Connect setup:

- Bundle ID: `jp.taka.chu1testkit`
- Associated Domains: `applinks:chu1-testkit.t-nakaima.workers.dev`
- Non-consumable IAP product ID: `chu1_testkit_lifetime`
- App Store Server Notifications V2: `/api/apple/iap/notifications`
- Sandbox tester for purchase and restore checks

## Deploy

```bash
npm run deploy
```

公開URL:

```text
https://chu1-testkit.t-nakaima.workers.dev
```

Smoke checks:

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://chu1-testkit.t-nakaima.workers.dev/buy
curl -s -X POST -o /dev/null -w "checkout(unauth): %{http_code}\n" https://chu1-testkit.t-nakaima.workers.dev/api/stripe/checkout
curl -s -X PATCH -H "Content-Type: application/json" -d '{"examId":1,"questionId":1,"userAnswer":"x"}' -o /dev/null -w "mock-patch(unauth): %{http_code}\n" https://chu1-testkit.t-nakaima.workers.dev/api/mock-exam
```

Expected:

- `/buy`: `200`
- unauthenticated checkout: `401`
- unauthenticated mock exam PATCH: `401`

## Current Notes

- 中間範囲8トピックは curated seed 適用済み。
- 期末模試は全25単元から5教科各5問を出題します。
- 予想模試は `mock_exam_items.user_answer/is_correct` と `mock_exams.finished_at/score` に保存します。
- AI質問は Anthropic API 残高と `ANTHROPIC_API_KEY` に依存します。
- git commit は手動で行ってください。
