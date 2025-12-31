# AI Chat

Claude API を使用した AI チャットボットアプリケーション

## 機能

- ✅ Claude Sonnet 4 による高品質な対話
- ✅ リアルタイムストリーミング表示
- ✅ Markdown & コードハイライト対応
- ✅ 会話履歴の保存・管理（MongoDB）
- ✅ レスポンシブデザイン
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
```

### 3. 開発サーバーの起動

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

## ライセンス

MIT

## 貢献

プルリクエストを歓迎します！

## サポート

問題が発生した場合は、[Issues](../../issues) を作成してください。
