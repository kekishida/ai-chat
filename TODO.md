# AI Chat アプリケーション開発 TODOリスト

このドキュメントは、AI Chatアプリケーションを構築するための実行計画です。各フェーズごとにタスクを分解し、チェックリスト形式で管理します。

**作成日**: 2025-12-31
**参照仕様書**: CLAUDE.md

---

## 📋 進捗サマリー

- [x] Phase 1: プロジェクトセットアップ (7/7)
- [x] Phase 2: データベース・モデル (4/4)
- [x] Phase 3: API開発 (6/6)
- [x] Phase 4: フロントエンド開発 (12/12)
- [ ] Phase 5: テスト・最適化・デプロイ準備 (0/6)

**全体進捗**: 29/35 タスク完了

---

## Phase 1: プロジェクトセットアップ

### 1.1 Next.jsプロジェクトの初期化
- [x] Next.jsプロジェクトを作成（TypeScript、Tailwind CSS、App Router有効化）
  ```bash
  npx create-next-app@latest . --typescript --tailwind --app --eslint
  ```
- [x] 作成されたファイルを確認（package.json, tsconfig.json, tailwind.config.jsなど）

### 1.2 依存関係のインストール
- [x] Claude API SDKをインストール
  ```bash
  npm install @anthropic-ai/sdk
  ```
- [x] MongoDB関連パッケージをインストール
  ```bash
  npm install mongoose
  ```
- [x] Markdown・コードハイライト関連パッケージをインストール
  ```bash
  npm install react-markdown remark-gfm rehype-highlight
  npm install --save-dev @types/react-markdown
  ```

### 1.3 ディレクトリ構造の作成
- [x] 以下のディレクトリを作成
  ```bash
  mkdir -p src/components
  mkdir -p src/lib
  mkdir -p src/models
  mkdir -p src/app/api/chat
  mkdir -p src/app/api/conversations/[id]/messages
  ```

### 1.4 環境変数の設定
- [x] `.env.local`ファイルを作成
- [x] 以下の環境変数を設定
  ```
  ANTHROPIC_API_KEY=your_api_key_here
  MONGODB_URI=your_mongodb_uri_here
  ```
- [x] `.env.example`ファイルを作成（サンプル用）

### 1.5 .gitignoreの確認・更新
- [x] `.env.local`が含まれているか確認
- [x] `node_modules`、`.next`などが含まれているか確認

---

## Phase 2: データベース・モデル

### 2.1 MongoDB接続設定
- [x] `src/lib/mongodb.ts`を作成
- [x] MongoDBへの接続ロジックを実装（接続キャッシュ機能付き）

### 2.2 Mongooseスキーマの定義
- [x] `src/models/Conversation.ts`を作成
  - フィールド: `_id`, `title`, `createdAt`, `updatedAt`
- [x] `src/models/Message.ts`を作成
  - フィールド: `_id`, `conversationId`, `role`, `content`, `createdAt`

### 2.3 ユーティリティ関数の作成
- [x] `src/lib/utils.ts`を作成
- [x] 必要に応じてヘルパー関数を追加（日付フォーマット、エラーハンドリングなど）

### 2.4 Claude APIクライアントの作成
- [x] `src/lib/claude.ts`を作成
- [x] Anthropic SDKの初期化とラッパー関数を実装

---

## Phase 3: API開発

### 3.1 チャットAPI（ストリーミング対応）
- [x] `src/app/api/chat/route.ts`を作成
- [x] POSTメソッドを実装
  - リクエストボディ: `{ conversationId, message }`
  - 新規会話の場合、Conversationドキュメントを作成
  - ユーザーメッセージをMessageコレクションに保存
  - Claude APIをストリーミングモードで呼び出し
  - Server-Sent Events (SSE)でストリーミングレスポンスを返す
  - アシスタントメッセージをMessageコレクションに保存
  - 完了時に`conversationId`と`messageId`を返す

### 3.2 会話一覧取得API
- [x] `src/app/api/conversations/route.ts`を作成
- [x] GETメソッドを実装
  - 全ての会話を取得（降順ソート: 最新順）
  - レスポンス: `{ conversations: [...] }`

### 3.3 特定会話取得API
- [x] `src/app/api/conversations/[id]/route.ts`を作成
- [x] GETメソッドを実装
  - IDから特定の会話を取得
  - レスポンス: `{ conversation: {...} }`

### 3.4 会話削除API
- [x] `src/app/api/conversations/[id]/route.ts`（同じファイル）
- [x] DELETEメソッドを実装
  - 指定された会話を削除
  - 関連するメッセージも削除
  - レスポンス: `{ success: true }`

### 3.5 メッセージ一覧取得API
- [x] `src/app/api/conversations/[id]/messages/route.ts`を作成
- [x] GETメソッドを実装
  - 指定された会話のメッセージを全て取得（昇順ソート: 時系列順）
  - レスポンス: `{ messages: [...] }`

### 3.6 エラーハンドリング
- [x] 各APIにエラーハンドリングを実装
  - 400: バリデーションエラー
  - 404: リソースが見つからない
  - 500: サーバーエラー

---

## Phase 4: フロントエンド開発

### 4.1 基本レイアウトとグローバルスタイル
- [x] `src/app/layout.tsx`を更新
  - メタデータ設定（タイトル、説明）
  - フォント設定（Inter, Noto Sans JPなど）
- [x] `src/app/globals.css`を更新
  - カスタムスタイルの追加

### 4.2 ヘッダーコンポーネント
- [x] `src/components/Header.tsx`を作成
  - アプリタイトル表示
  - 新規会話ボタン
  - 履歴表示ボタン
  - クリアボタン

### 4.3 メッセージ入力コンポーネント
- [x] `src/components/MessageInput.tsx`を作成
  - テキストエリア（複数行対応）
  - 送信ボタン
  - Enterキーで送信（Shift+Enterで改行）
  - ローディング中は入力無効化

### 4.4 個別メッセージコンポーネント
- [x] `src/components/Message.tsx`を作成
  - ユーザー/アシスタントで見た目を区別
  - マークダウンレンダリング（MarkdownRendererを使用）
  - タイムスタンプ表示（オプション）

### 4.5 マークダウンレンダラーコンポーネント
- [x] `src/components/MarkdownRenderer.tsx`を作成
  - react-markdownを使用
  - remark-gfmプラグインを適用（テーブル、タスクリストなど）
  - rehype-highlightプラグインを適用（コードハイライト）
  - カスタムコンポーネントでCodeBlockを使用

### 4.6 コードブロックコンポーネント
- [x] `src/components/CodeBlock.tsx`を作成
  - シンタックスハイライト表示
  - 言語名表示
  - コピーボタンを実装
  - コピー成功時のフィードバック表示

### 4.7 メッセージ一覧コンポーネント
- [x] `src/components/MessageList.tsx`を作成
  - メッセージ配列を受け取り、Messageコンポーネントをマッピング
  - 自動スクロール機能（最新メッセージに追従）
  - ローディング状態の表示

### 4.8 会話履歴一覧コンポーネント
- [x] `src/components/ConversationList.tsx`を作成
  - サイドバーまたはモーダルで表示
  - 会話タイトルと更新日時を表示
  - 会話を選択すると該当の会話を読み込む
  - 削除ボタン（確認ダイアログ付き）

### 4.9 チャットインターフェース統合
- [x] `src/components/ChatInterface.tsx`を作成
  - Header, MessageList, MessageInputを統合
  - 状態管理（会話ID、メッセージ一覧、ローディング状態など）
  - メッセージ送信処理
  - ストリーミングレスポンスの受信と表示
  - 会話クリア処理
  - エラーハンドリング

### 4.10 メインページ
- [x] `src/app/page.tsx`を作成
  - ChatInterfaceコンポーネントを配置
  - 初期ロード時の処理

### 4.11 ストリーミング表示の実装
- [x] ChatInterfaceでEventSourceまたはfetch streamを使用してSSEを受信
- [x] 受信したトークンを逐次表示
- [x] ストリーミング完了時の処理

### 4.12 会話履歴機能の実装
- [x] 会話一覧の取得と表示
- [x] 会話選択時のメッセージ読み込み
- [x] 会話削除機能

---

## Phase 5: テスト・最適化・デプロイ準備

### 5.1 動作確認
- [ ] 新規会話の作成と保存
- [ ] メッセージの送受信
- [ ] ストリーミング表示の動作
- [ ] マークダウン・コードハイライトの表示
- [ ] コピーボタンの動作
- [ ] 会話履歴の取得と選択
- [ ] 会話削除
- [ ] 会話クリア

### 5.2 エラーハンドリングの強化
- [ ] ネットワークエラー時の表示
- [ ] API障害時の表示
- [ ] MongoDB接続エラー時の表示
- [ ] バリデーションエラーのユーザーフレンドリーなメッセージ

### 5.3 レスポンシブデザインの調整
- [ ] スマートフォン表示の確認と調整
- [ ] タブレット表示の確認と調整
- [ ] PC表示の確認と調整
- [ ] 会話履歴一覧のモバイル対応（ドロワーなど）

### 5.4 パフォーマンス最適化
- [ ] 画像の最適化（必要に応じて）
- [ ] コンポーネントのメモ化（React.memo、useMemo、useCallback）
- [ ] Lazy loadingの検討

### 5.5 デプロイ準備
- [ ] 環境変数の本番設定確認
- [ ] ビルドエラーの確認
  ```bash
  npm run build
  ```
- [ ] デプロイ先の選定（Vercel、AWS、自前サーバーなど）

### 5.6 ドキュメント整備
- [ ] README.mdの作成（オプション）
  - プロジェクト概要
  - セットアップ手順
  - 環境変数の説明
  - 起動方法
- [ ] .env.exampleの整備

---

## 📝 メモ・注意事項

### 優先度
1. Phase 1-3: バックエンド基盤（API、DB）を先に完成させる
2. Phase 4: フロントエンドの実装
3. Phase 5: テスト・最適化

### 技術的なポイント
- **ストリーミング**: Claude APIのストリーミングをServer-Sent Eventsで実装
- **状態管理**: まずはReact Hooksで実装（必要に応じてZustand等を検討）
- **データベース**: MongoDB Atlasの無料プランで開始可能
- **デプロイ**: Vercelが最も簡単（Next.jsとの親和性が高い）

### セキュリティ
- APIキーは必ず環境変数で管理
- クライアント側にAPIキーを露出させない
- ユーザー入力のサニタイゼーション

---

## 🚀 次のアクション

1. Phase 1のタスクから順番に進める
2. 各タスク完了時にチェックマークを付ける
3. 問題が発生した場合はメモセクションに記録
4. 各Phaseが完了したら進捗サマリーを更新

---

**最終更新**: 2025-12-31
