# AI Chat - プロジェクト仕様書

## プロジェクト概要

**プロジェクト名**: ai-chat
**目的**: Claude APIを使用した汎用的な対話型AIチャットボット
**インターフェース**: Webアプリケーション
**対象ユーザー**: 一般ユーザー（認証なし）

---

## 技術スタック

### フロントエンド
- **フレームワーク**: Next.js (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **UIコンポーネント**: Headless UI / Radix UI (推奨)
- **マークダウンレンダリング**: react-markdown
- **コードハイライト**: Prism.js / highlight.js

### バックエンド
- **フレームワーク**: Next.js API Routes
- **言語**: TypeScript
- **AI API**: Anthropic Claude API
- **データベース**: MongoDB (Mongoose ORM)

### インフラ・デプロイ
- **ホスティング**: Vercel / AWS / 自前サーバー（選択可能）
- **データベースホスティング**: MongoDB Atlas
- **環境変数管理**: .env.local

---

## 機能要件

### コア機能

#### 1. チャット機能
- ユーザーがメッセージを入力し、AI（Claude）が応答する
- **ストリーミング表示**: AIの応答をリアルタイムで逐次表示
- **マークダウン表示**: 太字、リスト、見出しなどを書式付きで表示
- **コードハイライト**: プログラミングコードをシンタックスハイライト表示
- **コピー機能**: コードブロックにコピーボタンを表示

#### 2. 会話履歴管理
- **会話履歴の保存**: MongoDBに会話を永続化
- **会話履歴一覧**: 過去の会話をサイドバーやモーダルで一覧表示
- **会話の選択**: 過去の会話を選択して再開可能
- **会話クリア**: 現在の会話をクリアして新規会話を開始

#### 3. UI/UX
- シンプルで直感的なチャットインターフェース
- レスポンシブデザイン（PC・タブレット・スマホ対応）
- ローディング状態の表示
- エラーハンドリング（API障害時のメッセージ表示）

---

## システム構成

### ディレクトリ構造

```
ai-chat/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/
│   │   │   │   └── route.ts          # チャットAPI（ストリーミング対応）
│   │   │   ├── conversations/
│   │   │   │   ├── route.ts          # 会話一覧取得API
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts      # 特定会話取得・削除API
│   │   │   │       └── messages/
│   │   │   │           └── route.ts  # メッセージ一覧取得API
│   │   ├── page.tsx                  # メインチャット画面
│   │   ├── layout.tsx                # ルートレイアウト
│   │   └── globals.css               # グローバルスタイル
│   ├── components/
│   │   ├── ChatInterface.tsx         # チャットインターフェース全体
│   │   ├── MessageList.tsx           # メッセージ一覧表示
│   │   ├── MessageInput.tsx          # メッセージ入力欄
│   │   ├── Message.tsx               # 個別メッセージコンポーネント
│   │   ├── MarkdownRenderer.tsx      # マークダウンレンダラー
│   │   ├── CodeBlock.tsx             # コードブロック表示（コピーボタン付き）
│   │   ├── ConversationList.tsx      # 会話履歴一覧
│   │   └── Header.tsx                # ヘッダー（クリアボタンなど）
│   ├── lib/
│   │   ├── mongodb.ts                # MongoDB接続設定
│   │   ├── claude.ts                 # Claude API クライアント
│   │   └── utils.ts                  # ユーティリティ関数
│   └── models/
│       ├── Conversation.ts           # 会話モデル（Mongoose Schema）
│       └── Message.ts                # メッセージモデル（Mongoose Schema）
├── .env.local                        # 環境変数
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── next.config.js
└── CLAUDE.md                         # 本仕様書
```

---

## データモデル

### Conversation（会話）

```typescript
{
  _id: ObjectId,
  title: string,              // 会話のタイトル（最初のメッセージから自動生成）
  createdAt: Date,
  updatedAt: Date
}
```

### Message（メッセージ）

```typescript
{
  _id: ObjectId,
  conversationId: ObjectId,   // 所属する会話のID
  role: 'user' | 'assistant', // 送信者（ユーザー or AI）
  content: string,            // メッセージ内容
  createdAt: Date
}
```

---

## API設計

### 1. チャットAPI（ストリーミング対応）

**エンドポイント**: `POST /api/chat`

**リクエストボディ**:
```json
{
  "conversationId": "string | null",  // null の場合は新規会話
  "message": "string"
}
```

**レスポンス**: Server-Sent Events (SSE) ストリーミング
```
data: {"type":"token","content":"こ"}
data: {"type":"token","content":"んに"}
data: {"type":"token","content":"ちは"}
data: {"type":"done","conversationId":"64abc123...","messageId":"64abc456..."}
```

---

### 2. 会話一覧取得API

**エンドポイント**: `GET /api/conversations`

**レスポンス**:
```json
{
  "conversations": [
    {
      "_id": "64abc123...",
      "title": "最初の質問内容...",
      "createdAt": "2025-01-01T12:00:00Z",
      "updatedAt": "2025-01-01T12:05:00Z"
    }
  ]
}
```

---

### 3. 特定会話取得API

**エンドポイント**: `GET /api/conversations/[id]`

**レスポンス**:
```json
{
  "conversation": {
    "_id": "64abc123...",
    "title": "最初の質問内容...",
    "createdAt": "2025-01-01T12:00:00Z",
    "updatedAt": "2025-01-01T12:05:00Z"
  }
}
```

---

### 4. 会話削除API

**エンドポイント**: `DELETE /api/conversations/[id]`

**レスポンス**:
```json
{
  "success": true
}
```

---

### 5. メッセージ一覧取得API

**エンドポイント**: `GET /api/conversations/[id]/messages`

**レスポンス**:
```json
{
  "messages": [
    {
      "_id": "64abc456...",
      "conversationId": "64abc123...",
      "role": "user",
      "content": "こんにちは",
      "createdAt": "2025-01-01T12:00:00Z"
    },
    {
      "_id": "64abc789...",
      "conversationId": "64abc123...",
      "role": "assistant",
      "content": "こんにちは！何かお手伝いできることはありますか？",
      "createdAt": "2025-01-01T12:00:05Z"
    }
  ]
}
```

---

## UI/UX要件

### レイアウト

```
+----------------------------------------------------------+
| [ai-chat]                    [新規会話] [履歴] [クリア]   |
+----------------------------------------------------------+
|                                                          |
|  [User]                                                  |
|  こんにちは                                               |
|                                                          |
|                                         [Assistant]      |
|                        こんにちは！何かお手伝いできます？  |
|                                                          |
|  [User]                                                  |
|  ```python                                               |
|  def hello():        [Copy]                              |
|      print("Hello")                                      |
|  ```                                                     |
|                                                          |
+----------------------------------------------------------+
| [メッセージを入力...]                          [送信]     |
+----------------------------------------------------------+
```

### デザイン要件
- **カラースキーム**: 白ベース、クリーンなデザイン
- **フォント**: 読みやすいサンセリフ体（例: Inter, Noto Sans JP）
- **メッセージバブル**: ユーザーとアシスタントで背景色を区別
- **コードブロック**: 暗めの背景色でシンタックスハイライト表示
- **ボタン**: ホバー時のフィードバック、クリック時のアニメーション

---

## 開発手順

### Phase 1: セットアップ
1. Next.jsプロジェクトの初期化
   ```bash
   npx create-next-app@latest ai-chat --typescript --tailwind --app
   cd ai-chat
   ```

2. 必要なパッケージのインストール
   ```bash
   npm install @anthropic-ai/sdk mongoose
   npm install react-markdown remark-gfm rehype-highlight
   npm install --save-dev @types/react-markdown
   ```

3. 環境変数の設定（`.env.local`）
   ```
   ANTHROPIC_API_KEY=your_claude_api_key
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-chat
   ```

### Phase 2: データベース・モデル
1. MongoDB接続設定（`src/lib/mongodb.ts`）
2. Mongooseスキーマ定義（`src/models/`）

### Phase 3: API開発
1. チャットAPI（ストリーミング対応）
2. 会話管理API（CRUD）

### Phase 4: フロントエンド開発
1. 基本的なチャットインターフェース
2. ストリーミング表示の実装
3. マークダウン・コードハイライト
4. 会話履歴一覧・選択機能

### Phase 5: テスト・改善
1. 動作テスト
2. エラーハンドリングの強化
3. UI/UXの調整

---

## 環境変数

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `ANTHROPIC_API_KEY` | Claude APIキー | `sk-ant-...` |
| `MONGODB_URI` | MongoDB接続文字列 | `mongodb+srv://...` |

---

## セキュリティ考慮事項

- APIキーは環境変数で管理し、クライアント側に露出させない
- MongoDBの接続文字列も環境変数で管理
- ユーザー入力のサニタイゼーション（XSS対策）
- レート制限の検討（過度なAPI使用を防ぐ）

---

## 今後の拡張可能性

- ユーザー認証機能の追加
- 複数のAIモデル選択機能
- 画像アップロード・解析機能（Claude Vision）
- 会話のエクスポート機能（PDF、テキスト）
- ダークモード対応
- 多言語対応

---

## 参考リンク

- [Next.js Documentation](https://nextjs.org/docs)
- [Anthropic Claude API Documentation](https://docs.anthropic.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [react-markdown](https://github.com/remarkjs/react-markdown)

---

## 完成イメージ

このプロジェクトは、シンプルで使いやすいAIチャットボットWebアプリケーションです。ユーザーはブラウザでアクセスし、Claude AIと自然な対話を行うことができます。会話履歴はMongoDBに保存され、過去の会話を振り返ることも可能です。ストリーミング表示により、レスポンスがリアルタイムで表示されるため、快適なユーザー体験を提供します。

---

**作成日**: 2025-12-31
**バージョン**: 1.0
