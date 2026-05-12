# 中1テストキット

中学1年生の1学期中間テスト対策に特化したPWAです。5教科の解説、3択ドリル、AI質問、予想模試、Stripe決済、メールマジックリンク認証を提供します。

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

中間範囲の curated コンテンツは以下です。

```bash
seeds/midterm-curated.sql
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

各トピック8問、合計64問です。全問3択で、難易度配分はおおむね基礎4・標準3・応用1です。

Remote D1へ適用:

```bash
set -a && source .env.local && set +a
npx wrangler d1 execute chu1-testkit-db --remote --file=seeds/midterm-curated.sql
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

`topics.midterm_scope` は予想模試の出題範囲制御に使います。

## Verification

```bash
npx tsc --noEmit
npm test
npm run build
```

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
- 予想模試は `mock_exam_items.user_answer/is_correct` と `mock_exams.finished_at/score` に保存します。
- AI質問は Anthropic API 残高と `ANTHROPIC_API_KEY` に依存します。
- git commit は手動で行ってください。
