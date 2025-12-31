# デプロイ手順

## Google Cloud Run へのデプロイ

### 前提条件

1. Google Cloud SDK がインストールされていること
   ```bash
   # インストール確認
   gcloud --version

   # インストールされていない場合
   # https://cloud.google.com/sdk/docs/install
   ```

2. Docker がインストールされていること
   ```bash
   docker --version
   ```

3. Google Cloud にログイン済みであること
   ```bash
   gcloud auth login
   ```

### デプロイ手順

#### ステップ1: デプロイの実行

```bash
make gcp-deploy
```

または直接スクリプトを実行：

```bash
./deploy-gcp.sh
```

このコマンドは以下を実行します：
- プロジェクト設定（ai-chat-482910）
- 必要なAPIの有効化
- Dockerイメージのビルド
- Container Registryへのプッシュ
- Cloud Runへのデプロイ（最小インスタンス数: 0）

#### ステップ2: 環境変数の設定

デプロイ後、環境変数を設定する必要があります。

**方法1: Makefileを使用（対話式）**

```bash
make gcp-set-env
```

**方法2: gcloudコマンドを直接使用**

```bash
gcloud run services update ai-chat \
  --region asia-northeast1 \
  --set-env-vars ANTHROPIC_API_KEY=sk-ant-xxxxx,MONGODB_URI=mongodb+srv://...
```

**方法3: Google Cloud Console から設定**

1. https://console.cloud.google.com/run?project=ai-chat-482910 にアクセス
2. `ai-chat` サービスを選択
3. 「新しいリビジョンの編集とデプロイ」をクリック
4. 「変数とシークレット」タブで環境変数を追加：
   - `ANTHROPIC_API_KEY`: あなたのClaude APIキー
   - `MONGODB_URI`: あなたのMongoDB接続文字列
5. 「デプロイ」をクリック

### デプロイ設定

- **リージョン**: asia-northeast1 (東京)
- **最小インスタンス数**: 0
- **最大インスタンス数**: 10
- **メモリ**: 512Mi
- **CPU**: 1
- **ポート**: 8080
- **タイムアウト**: 300秒
- **認証**: 不要（誰でもアクセス可能）

### ローカルでDockerイメージをテスト

デプロイ前にローカルでテストする場合：

```bash
# イメージをビルド
make docker-build

# コンテナを起動
docker run -p 8080:8080 \
  -e ANTHROPIC_API_KEY=your_key \
  -e MONGODB_URI=your_uri \
  ai-chat:latest

# ブラウザで http://localhost:8080 にアクセス
```

### デプロイ後の確認

1. デプロイされたURLを確認：
   ```bash
   gcloud run services describe ai-chat --region asia-northeast1 --format 'value(status.url)'
   ```

2. ログを確認：
   ```bash
   gcloud run services logs read ai-chat --region asia-northeast1
   ```

3. サービスの詳細を確認：
   ```bash
   gcloud run services describe ai-chat --region asia-northeast1
   ```

### トラブルシューティング

#### デプロイが失敗する場合

1. Google Cloud SDKがインストールされているか確認
2. 正しいプロジェクトが設定されているか確認
   ```bash
   gcloud config get-value project
   ```
3. 必要なAPIが有効化されているか確認
   ```bash
   gcloud services list --enabled
   ```

#### アプリケーションが起動しない場合

1. ログを確認
   ```bash
   gcloud run services logs read ai-chat --region asia-northeast1 --limit 50
   ```

2. 環境変数が正しく設定されているか確認
   ```bash
   gcloud run services describe ai-chat --region asia-northeast1 --format 'value(spec.template.spec.containers[0].env)'
   ```

3. MongoDB接続文字列が正しいか確認

### コストについて

- **最小インスタンス数を0**に設定しているため、リクエストがない時は課金されません
- リクエストがあった時のみインスタンスが起動し、課金されます
- 無料枠の範囲内であれば追加費用は発生しません

詳細: https://cloud.google.com/run/pricing

### カスタムドメインの設定

カスタムドメインを使用する場合：

```bash
gcloud run services update ai-chat \
  --region asia-northeast1 \
  --allow-unauthenticated

gcloud beta run domain-mappings create \
  --service ai-chat \
  --domain your-domain.com \
  --region asia-northeast1
```

---

## GitHub Actions による自動デプロイ

GitHub Actions を使用すると、`main` ブランチへのプッシュで自動的に Cloud Run にデプロイできます。

### クイックスタート

```bash
# 一括セットアップコマンド
make github-actions-setup
```

このコマンドは以下を実行します：
1. サービスアカウントの作成
2. 権限の付与
3. Workload Identity Federation のセットアップ

### 手動セットアップ

詳しいセットアップ手順は [GITHUB_ACTIONS.md](./GITHUB_ACTIONS.md) を参照してください。

### GitHub Secrets の設定

GitHubリポジトリの Settings > Secrets and variables > Actions で以下を設定：

- `WIF_PROVIDER`: Workload Identity Provider の完全な名前
- `WIF_SERVICE_ACCOUNT`: `github-actions@ai-chat-482910.iam.gserviceaccount.com`
- `ANTHROPIC_API_KEY`: あなたのClaude APIキー
- `MONGODB_URI`: あなたのMongoDB接続文字列

### 使い方

```bash
# mainブランチにプッシュすると自動デプロイ
git add .
git commit -m "Deploy to production"
git push origin main
```

GitHubの「Actions」タブでデプロイの進行状況を確認できます。

---

## Vercel へのデプロイ

Vercelにデプロイする場合：

```bash
# Vercel CLIをインストール
npm install -g vercel

# デプロイ
make deploy-vercel
```

環境変数はVercelのダッシュボードで設定してください。
