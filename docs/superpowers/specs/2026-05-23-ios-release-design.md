# iOS App Store Release Design

作成日: 2026-05-23

## 目的

中1テストキットを iOS アプリとして App Store に提出できる状態にする。既存の Next.js / Cloudflare / Stripe のWeb版資産は維持しつつ、iOSアプリ内の有料機能アンロックは Apple In-App Purchase に対応させる。

この設計の主眼は次の3点。

1. App Store Review Guideline 3.1.1 に沿って、iOSアプリ内では StoreKit による購入を使う
2. Web版の Stripe 買い切り販売は維持する
3. Web版とiOS版の購入権限を `users.purchased_at` に統合し、教材・ドリル・AI質問・模試の既存アクセス制御を共通化する

## 決定事項

- iOSアプリ化方式: ハイブリッドiOS版
- iOSネイティブ層: SwiftUI + WKWebView + StoreKit 2
- Web層: 既存Next.jsアプリを利用
- iOS課金: 非消耗型IAPによる買い切り永久アクセス
- Web課金: 既存の Stripe Checkout を継続
- 権限の正: `users.purchased_at`
- iOS購入前のユーザー紐づけ: メールログインで先にユーザーを作成・認証する
- iOSアプリ内では Stripe Checkout への導線を表示しない

## App Store上の前提

中1テストキットは、アプリ内でデジタル教材、AI質問、ドリル、模試をアンロックする。App Store Review Guidelines では、アプリ内のプレミアムコンテンツやフル機能アンロックには In-App Purchase が必要とされる。

マルチプラットフォームサービスとして、Webで購入済みのユーザーにiOSアプリ内アクセスを許可することは可能。ただし、iOSアプリ内でも同等のIAP購入手段を提供する必要がある。

最低限の機能リスクを下げるため、iOS版は単なるWebサイトの再包装ではなく、次のアプリ固有機能を備える。

- StoreKitによる購入と復元
- アプリ内ログイン完結
- Universal Linksによるメールログイン復帰
- iOS向けの購入状態同期
- App Store審査で確認しやすい購入・復元・学習開始フロー

## 商品設計

### iOS IAP商品

- 種別: Non-Consumable
- 表示名: 中1テストキット 永久アクセス
- 想定Product ID: `chu1_testkit_lifetime`
- 権限: 5教科25単元の解説、全201問の3択ドリル、AI質問1日30回、中間・期末の予想模試、学習進捗
- 有効期限: なし
- 復元購入: 必須

既存DBには `expires_at` が残っているが、買い切り永久モデルでは参照しない。iOS IAPでも `expires_at` は使わない。

### 価格

Web版は現在の980円買い切りを継続する。iOS版は App Store Connect で日本向け980円の価格を設定する。App Storeの価格表で完全一致できない場合は、980円に最も近い価格を設定し、iOSアプリ内では StoreKit から取得したlocalized priceを正として表示する。

## ユーザーフロー

### iOS新規ユーザー

1. iOSアプリを起動する
2. WKWebViewで `/login` を表示する
3. メールアドレスを入力する
4. サーバーは未購入ユーザーでもユーザーレコードを作成できるようにする
5. ログインメールを送信する
6. Universal LinkでiOSアプリへ戻り、セッションCookieを発行する
7. 未購入ユーザーは `/buy` に遷移する
8. iOSアプリ内では `/buy` が StoreKit購入UIを起動する
9. 購入完了後、アプリが transaction JWS をサーバーへ送信する
10. サーバーがApple購入を検証し、`users.purchased_at` を設定する
11. `/home` へ遷移し学習を開始する

### iOS購入済みWebユーザー

1. iOSアプリで既存メールアドレスを入力する
2. メールログインでセッションを発行する
3. `users.purchased_at` が存在するため `/home` へ遷移する
4. 追加購入は求めない

### iOS復元購入

1. 未購入状態の `/buy` で「購入を復元」を押す
2. ネイティブ層が `Transaction.currentEntitlements` を確認する
3. 対象Product IDの有効なtransactionがあればサーバーに送信する
4. サーバー検証後、現在ログイン中のユーザーに `purchased_at` を設定する
5. 復元成功として `/home` へ遷移する

復元はログイン済みユーザーに対してのみ実行する。未ログインで復元しようとした場合は、先にメールログインへ誘導する。

## 画面設計

### `/login`

Web版では既存ユーザー向けログインとして動作している。iOS版では新規ユーザー作成も兼ねるため、メール送信APIは存在しないメールアドレスにもユーザーを作成できるようにする。

iOS版で必要な表示:

- メールアドレス入力
- ログインリンク送信
- メールアプリから戻る説明
- プライバシーポリシーと利用規約へのリンク

### `/buy`

Webブラウザでは現在どおり Stripe Checkout の購入ページ。

iOSアプリ内では以下に切り替える。

- 価格表示は StoreKit から取得した localized price を使う
- 「Stripe」「カード番号」「外部決済」などの文言は表示しない
- 主要ボタンは「App Storeで購入」
- 復元ボタンは「購入を復元」
- 購入済みなら「このアカウントは購入済みです」と表示してホームへ誘導

切り替え方法は、ネイティブWKWebViewのカスタムUser-Agentに `Chu1TestKitIOS/1` を付与してWeb側の表示分岐に使う。購入開始と復元は `window.webkit.messageHandlers.iap` のJavaScript bridgeでネイティブへ依頼する。購入処理自体はUser-Agentを信頼せず、必ずサーバー側のApple検証結果を正とする。

### `/checkout/success`

Web版Stripe購入成功用として残す。iOSアプリ内のStoreKit購入成功はこの画面に依存しない。iOSは購入検証API成功後に `/home` へ遷移する。

### `/profile`

初期リリースでは「購入済み」表示だけにする。購入経路の確認はユーザー向けUIでは出さず、運営調査用に `stripe_purchases` と `apple_purchases` を見る。

## ネイティブiOS設計

### アプリ構成

- `ios/` 配下に Xcode プロジェクトを置く
- SwiftUI App をエントリーポイントにする
- メイン画面は WKWebView
- StoreKit 2 の購入処理をネイティブで実装する
- WKWebViewとSwiftの間は message handler で連携する

### WebView

WKWebViewは本番URLを表示する。開発時はローカルやpreview URLを差し替えられるように設定値を持つ。

必要な設定:

- Cookieを永続化し、Webセッションを維持する
- Universal Linkから受け取ったURLをWebViewで処理する
- 外部ブラウザ遷移は必要最小限にする
- Stripe Checkout URLはiOSアプリ内では開かない

### StoreKit

ネイティブ層が担う責務:

- Product取得
- 購入開始
- 購入結果の処理
- transaction JWS の取得
- サーバー検証APIへの送信
- `Transaction.currentEntitlements` による復元
- `Transaction.updates` の監視

サーバー検証が成功するまで、Web側の有料機能はアンロックしない。

## サーバー設計

### 新規API

#### `POST /api/apple/iap/verify`

ログイン必須。

Request:

```json
{
  "signedTransactionInfo": "JWS",
  "source": "purchase | restore | update"
}
```

処理:

1. セッションCookieからユーザーを特定する
2. JWS署名とtransaction内容を検証する
3. `bundleId`、`productId`、environmentを確認する
4. `revocationDate` がないことを確認する
5. `apple_purchases` に冪等記録する
6. `users.purchased_at` が未設定なら設定する
7. 結果を返す

Response:

```json
{
  "ok": true,
  "purchasedAt": 1779450000000
}
```

#### `POST /api/apple/iap/notifications`

App Store Server Notifications V2 を受ける。ログインCookieは使わない。

処理:

1. `signedPayload` のJWSを検証する
2. notification type と transaction を取り出す
3. `originalTransactionId` または `transactionId` から `apple_purchases` を特定する
4. 返金・取消があれば監査テーブルへ記録する
5. 初期リリースでは永久アクセスの即時剥奪は手動判断にする
6. 成功時は2xxを返す

永久アクセスの非消耗型IAPでは、返金や取消の扱いを慎重にする。自動で `users.purchased_at` を消すと、Web版Stripe購入者やサポート対応済みユーザーまで巻き込むため、初期リリースでは監査記録のみ行い、権限停止は手動対応にする。

### Apple購入監査テーブル

`apple_purchases`

- `transaction_id` primary key
- `original_transaction_id`
- `web_order_line_item_id`
- `user_id`
- `product_id`
- `environment`
- `purchase_date`
- `revocation_date`
- `revocation_reason`
- `signed_transaction_info`
- `source`
- `notification_type`
- `created_at`
- `updated_at`

`transaction_id` で冪等にし、復元や通知の重複で二重処理しない。

### 認証API変更

`POST /api/auth/send` は現在、既存ユーザーにだけメールを送る。iOS初回購入では購入前にログインユーザーが必要なため、未登録メールにも未購入ユーザーを作成してメールを送る。

安全条件:

- メールアドレス正規化とrate limitは既存のまま維持する
- ユーザーの存在有無はレスポンスで漏らさない
- Web版でも未購入ユーザー作成を許可する。これは購入権限を付与しないため、rate limitを守ればセキュリティ上の権限リスクは増えない
- レスポンスは既存ユーザーと新規ユーザーで同じにし、ユーザー列挙を防ぐ

## データフロー

### Web Stripe購入

Stripe Checkout -> Stripe Webhook -> `stripe_purchases` -> `users.purchased_at`

### iOS IAP購入

StoreKit -> transaction JWS -> `/api/apple/iap/verify` -> `apple_purchases` -> `users.purchased_at`

### Appleサーバー通知

App Store Server Notifications -> `/api/apple/iap/notifications` -> `apple_purchases`

## 設定・Secrets

追加する環境変数:

- `APPLE_TEAM_ID`
- `APPLE_BUNDLE_ID`
- `APPLE_IAP_PRODUCT_ID`
- `APPLE_APP_STORE_ENVIRONMENT`
- `APPLE_IAP_ISSUER_ID`
- `APPLE_IAP_KEY_ID`
- `APPLE_IAP_PRIVATE_KEY`

App Store Server APIを使う検証方式では、In-App Purchase key の `.p8` を秘密情報として管理する。Cloudflareに入れる場合はwrangler secretsで登録し、リポジトリには置かない。

## Privacy / Compliance

### PrivacyInfo.xcprivacy

iOSネイティブアプリにはPrivacy Manifestを追加する。初期想定ではカメラ、位置情報、連絡先、マイクは使わない。WebView、UserDefaults、ファイルタイムスタンプ等のRequired Reason API使用有無をXcodeビルド時に確認する。

### App Privacy

App Store Connectのプライバシー栄養表示は、実際の収集内容と一致させる。

収集するデータ:

- メールアドレス
- 学習進捗
- 購入状態
- AI質問内容
- クラッシュ/診断情報

追跡広告は導入しない。ATTプロンプトは表示しない。

### 子ども向け配慮

中学1年生向けだが、購入意思決定者は保護者を想定する。初期リリースでは「子ども向け」カテゴリには出さず、教育カテゴリで提出する。子ども向けカテゴリにすると広告、外部リンク、データ収集、保護者ゲートの制約が強くなるため、必要になった場合は別リリースで設計する。

## App Store提出準備

### App Store Connect

- Bundle ID作成
- In-App Purchase capability有効化
- Non-Consumable商品 `chu1_testkit_lifetime` 作成
- Sandbox tester作成
- App Store Server Notifications V2 URL設定
- Privacy Policy URL設定
- サポートURL設定
- App Review用デモアカウント準備

### メタデータ

- アプリ名: 中1テストキット
- サブタイトル: 中学定期テスト対策
- カテゴリ: 教育
- 年齢制限: 教育内容・AI質問内容・外部リンク有無を踏まえて回答
- 説明文: Web版価格や外部決済への誘導を書かない
- スクリーンショット: 実アプリ画面を使用する

### Review Notes

App Reviewに伝えること:

- このアプリは中学1年生の定期テスト対策アプリ
- 有料機能は非消耗型IAPで購入可能
- 既存Web購入ユーザーはメールログインでアクセス可能
- 購入復元ボタンの場所
- デモアカウントのメールアドレスとログイン方法
- AI質問は1日30回まで

## テスト計画

### Web既存機能

- `npm test`
- `npx tsc --noEmit`
- `npm run content:check`
- `npm run build`
- Stripe購入フローがWebで維持される
- iOS判定がない通常ブラウザではStripe文言のまま表示される

### iOS購入

- Xcode StoreKit Configurationでローカル購入
- Sandbox testerで実機購入
- 購入直後に `users.purchased_at` が設定される
- 同じtransactionを再送しても冪等
- 復元購入で同じユーザーに権限が戻る
- 未ログイン復元はログインへ誘導される
- WebView再読み込み後も `/home` に入れる

### App Store通知

- Request a Test Notificationで2xx応答を確認
- 通知payloadの署名検証
- 重複通知の冪等処理
- 返金/取消通知の監査記録

### 審査リスク確認

- iOSアプリ内にStripe Checkoutや外部購入CTAが表示されない
- 復元購入ボタンが見つけやすい
- プライバシーポリシーがアプリ内から到達可能
- ログインなしでもApp Reviewが購入画面まで確認できる
- デモアカウントで有料機能まで確認できる
- WebViewだけでなくIAP/復元/Universal Linksのネイティブ機能がある

## 実装フェーズ

### Phase 1: Web側のIAP受け入れ準備

- Apple購入監査テーブル追加
- `/api/apple/iap/verify` 追加
- `/api/apple/iap/notifications` 追加
- 未購入ユーザー作成を含むiOSログイン経路追加
- `/buy` をWeb Stripe版とiOS IAP版に分岐

### Phase 2: iOS shell

- SwiftUI + WKWebViewプロジェクト作成
- WebView設定
- Universal Links設定
- StoreKit Product取得
- 購入・復元・transaction update処理
- Web bridge実装

### Phase 3: App Store提出準備

- App Store Connect IAP作成
- Sandbox購入検証
- Privacy Manifest作成
- アイコン/Launch Screen/スクリーンショット準備
- Review Notes作成
- TestFlight内部テスト

## 完了条件

- Web版Stripe購入が壊れていない
- iOSアプリ内でStoreKit購入できる
- iOSアプリ内で購入復元できる
- iOS購入後に既存有料APIへアクセスできる
- App Store ConnectでIAP商品が審査提出可能
- Privacy ManifestとApp Privacy回答が実装と一致している
- TestFlightで主要導線を実機確認済み
- App Review用デモアカウントと説明が準備済み

## 初期運用方針

- iOS価格: 日本向け980円。完全一致できない場合は980円に最も近い価格
- 対象国/地域: 初期リリースは日本のみ
- App Storeカテゴリ: 教育。子ども向けカテゴリにはしない
- Universal Links: 本番ドメイン `chu1-testkit.t-nakaima.workers.dev` で `apple-app-site-association` を配信する
- 返金/取消: `apple_purchases` に監査記録し、権限停止は手動対応

## 参考

- App Review Guidelines: https://developer.apple.com/jp/app-store/review/guidelines/
- StoreKit In-App Purchase: https://developer.apple.com/documentation/StoreKit/in-app-purchase
- App Store Server Notifications: https://developer.apple.com/documentation/appstoreservernotifications
- App Store Server API: https://developer.apple.com/documentation/appstoreserverapi
