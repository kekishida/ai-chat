# AI Chat

Claude API を使用した AI チャットボットアプリケーション

## 機能

- ✅ Claude Sonnet 4 による高品質な対話
- ✅ リアルタイムストリーミング表示
- ✅ Markdown & コードハイライト対応
- ✅ 会話履歴の保存・管理（MongoDB）
- ✅ レスポンシブデザイン
- ✅ **ユーザー認証機能（NextAuth.js）**
- ✅ **招待コード制ユーザー登録**
- ✅ **ユーザーごとの会話履歴管理**
- ✅ Google Cloud Run へのデプロイ対応
- ✅ GitHub Actions による自動デプロイ（設定済み）

## 技術スタック

- **フロントエンド**: Next.js 15.5, React, TypeScript, Tailwind CSS
- **バックエンド**: Next.js API Routes
- **AI**: Claude API (Anthropic)
- **データベース**: MongoDB Atlas
- **デプロイ**: Google Cloud Run
- **CI/CD**: GitHub Actions

## クイックスタート

### 1. 依存関係のインストール

```bash
make init
```

### 2. 環境変数の設定

```bash
make setup-env
```

`.env.local` を編集して、以下を設定：

```env
ANTHROPIC_API_KEY=your_claude_api_key_here
MONGODB_URI=your_mongodb_uri_here

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here  # openssl rand -base64 32 で生成
ADMIN_EMAIL=admin@example.com
ADMIN_INVITE_CODE=INITIAL_INVITE_CODE
```

### 3. データベースの初期化（初回のみ）

認証システムの初期化とadminユーザーの作成：

```bash
npm run migrate:auth
```

マイグレーション完了後、以下の認証情報が利用可能になります：
- **ユーザー名**: `admin`
- **パスワード**: `admin123`
- **招待コード**: `INVITE_CODE_001`, `INVITE_CODE_002`, `INVITE_CODE_003`

⚠️ **重要**: 初回ログイン後、必ずパスワードを変更してください。

### 4. 開発サーバーの起動

```bash
make dev
```

ブラウザで http://localhost:3000 にアクセス

## デプロイ

### Google Cloud Run へのデプロイ

詳細は [DEPLOY.md](./DEPLOY.md) を参照

```bash
# 手動デプロイ
make gcp-deploy

# 環境変数の設定
make gcp-set-env
```

### GitHub Actions による自動デプロイ

詳細は [GITHUB_ACTIONS.md](./GITHUB_ACTIONS.md) を参照

```bash
# セットアップ
make github-actions-setup

# mainブランチへのプッシュで自動デプロイ
git push origin main

# デプロイしたサービスの削除（terminate）
# GitHub Actionsページから「Terminate Cloud Run Service」ワークフローを手動実行
# または
make gcp-terminate
```

## 利用可能なコマンド

```bash
make help  # 全コマンドを表示
```

### 開発

- `make init` - プロジェクトの初期化
- `make dev` - 開発サーバーを起動
- `make build` - 本番用ビルド
- `make lint` - コードのリント実行

### デプロイ

- `make docker-build` - Docker イメージをビルド
- `make gcp-deploy` - Cloud Run にデプロイ
- `make gcp-terminate` - Cloud Run サービスを削除
- `make deploy-vercel` - Vercel にデプロイ

### GitHub Actions

- `make github-actions-setup` - GitHub Actions 用の設定を一括実行

## プロジェクト構成

```
ai-chat/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/          # API Routes
│   │   ├── globals.css   # グローバルスタイル
│   │   ├── layout.tsx    # ルートレイアウト
│   │   └── page.tsx      # ホームページ
│   ├── components/       # React コンポーネント
│   ├── lib/              # ユーティリティライブラリ
│   └── models/           # MongoDB モデル
├── .github/
│   └── workflows/        # GitHub Actions ワークフロー
├── public/               # 静的ファイル
├── Dockerfile            # Docker 設定
├── Makefile              # タスク定義
├── DEPLOY.md             # デプロイ手順
└── GITHUB_ACTIONS.md     # GitHub Actions セットアップ
```

## 環境変数

| 変数名 | 説明 | 必須 |
|--------|------|------|
| `ANTHROPIC_API_KEY` | Claude API キー | ✅ |
| `MONGODB_URI` | MongoDB 接続文字列 | ✅ |
| `NEXTAUTH_URL` | アプリケーションURL | ✅ |
| `NEXTAUTH_SECRET` | NextAuth シークレットキー (`openssl rand -base64 32`で生成) | ✅ |
| `ADMIN_EMAIL` | 管理者のメールアドレス | ✅ |
| `ADMIN_INVITE_CODE` | 初期招待コード | ✅ |

## 認証機能

### ログイン

アプリケーションにアクセスすると、ログインページにリダイレクトされます。

初期認証情報:
- ユーザー名: `admin`
- パスワード: `admin123`

### ユーザー登録

新規ユーザーは招待コードが必要です：

1. サインアップページにアクセス
2. ユーザー名、パスワード、招待コードを入力
3. 登録完了後、ログインページへリダイレクト

### 招待コード管理

管理者は新しい招待コードを生成できます：

```bash
# POST /api/invite-codes
# 本文: { "expiresInDays": 7 } (オプション)
```

### セキュリティ

- パスワードは bcrypt（cost factor 12）でハッシュ化
- 招待コードは crypto.randomBytes(16) で生成
- セッションは JWT で管理
- API認証: 全エンドポイントでユーザー検証
- データ分離: userIdによる完全なデータ隔離

## ライセンス

MIT

## 貢献

プルリクエストを歓迎します！

## サポート

問題が発生した場合は、[Issues](../../issues) を作成してください。
