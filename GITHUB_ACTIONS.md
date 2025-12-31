# GitHub Actions による自動デプロイ設定

このドキュメントでは、GitHub Actions を使用して Google Cloud Run に自動デプロイする方法を説明します。

## 概要

`main` ブランチにプッシュすると、自動的に以下が実行されます：

1. Docker イメージのビルド
2. Google Container Registry へのプッシュ
3. Cloud Run へのデプロイ

## セットアップ手順

### ステップ1: Google Cloud サービスアカウントの作成

```bash
# プロジェクトを設定
gcloud config set project ai-chat-482910

# サービスアカウントを作成
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions Deployment Account"

# サービスアカウントのメールアドレスを取得
export SA_EMAIL="github-actions@ai-chat-482910.iam.gserviceaccount.com"

# 必要な権限を付与
gcloud projects add-iam-policy-binding ai-chat-482910 \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding ai-chat-482910 \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding ai-chat-482910 \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/iam.serviceAccountUser"
```

### ステップ2: Workload Identity Federation の設定

```bash
# Workload Identity Pool を作成
gcloud iam workload-identity-pools create "github-pool" \
  --project="ai-chat-482910" \
  --location="global" \
  --display-name="GitHub Actions Pool"

# Workload Identity Provider を作成
gcloud iam workload-identity-pools providers create-oidc "github-provider" \
  --project="ai-chat-482910" \
  --location="global" \
  --workload-identity-pool="github-pool" \
  --display-name="GitHub Provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" \
  --attribute-condition="assertion.repository_owner == 'YOUR_GITHUB_USERNAME'" \
  --issuer-uri="https://token.actions.githubusercontent.com"

# サービスアカウントに権限を付与
gcloud iam service-accounts add-iam-policy-binding "${SA_EMAIL}" \
  --project="ai-chat-482910" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/305729078114/locations/global/workloadIdentityPools/github-pool/attribute.repository/YOUR_GITHUB_USERNAME/ai-chat"

# Workload Identity Provider の完全な名前を取得
gcloud iam workload-identity-pools providers describe "github-provider" \
  --project="ai-chat-482910" \
  --location="global" \
  --workload-identity-pool="github-pool" \
  --format="value(name)"
```

**注意:** `YOUR_GITHUB_USERNAME` を実際のGitHubユーザー名に置き換えてください。

### ステップ3: GitHub Secrets の設定

GitHubリポジトリの Settings > Secrets and variables > Actions で以下のシークレットを追加：

1. **WIF_PROVIDER**
   - 上記コマンドで取得した Workload Identity Provider の完全な名前
   - 形式: `projects/305729078114/locations/global/workloadIdentityPools/github-pool/providers/github-provider`

2. **WIF_SERVICE_ACCOUNT**
   - サービスアカウントのメールアドレス
   - 値: `github-actions@ai-chat-482910.iam.gserviceaccount.com`

3. **ANTHROPIC_API_KEY**
   - Claude API キー
   - 値: `sk-ant-api03-...`

4. **MONGODB_URI**
   - MongoDB Atlas 接続文字列
   - 値: `mongodb+srv://...`

### ステップ4: GitHub リポジトリの初期化（まだの場合）

```bash
# Gitリポジトリを初期化
git init

# .gitignoreを確認（既に存在）
# リモートリポジトリを追加
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/ai-chat.git

# 全ファイルをステージング
git add .

# コミット
git commit -m "Initial commit with GitHub Actions deployment"

# mainブランチにプッシュ
git branch -M main
git push -u origin main
```

### ステップ5: デプロイの実行

#### 自動デプロイ
`main` ブランチにプッシュすると自動的にデプロイが開始されます：

```bash
git add .
git commit -m "Update application"
git push origin main
```

#### 手動デプロイ
GitHub の Actions タブから「Deploy to Cloud Run」ワークフローを選択し、「Run workflow」をクリック

### ステップ6: サービスの削除（Terminate）

デプロイしたCloud Runサービスを削除する場合：

#### GitHub Actionsを使用して削除
1. GitHub の Actions タブにアクセス
2. 「Terminate Cloud Run Service」ワークフローを選択
3. 「Run workflow」をクリック
4. オプション: Dockerイメージも削除する場合は「Delete Docker images from GCR」にチェック
5. ワークフローが完了すると、Cloud Runサービスが削除されます

#### ローカルから削除
```bash
# Cloud RunサービスとオプションでDockerイメージを削除
make gcp-terminate

# または直接gcloudコマンドを使用
gcloud run services delete ai-chat --region asia-northeast1
```

**注意:** サービスを削除すると、アプリケーションにアクセスできなくなります。削除する前に、本当に必要か確認してください。

## トラブルシューティング

### 認証エラーが発生する場合

1. サービスアカウントに正しい権限が付与されているか確認
2. Workload Identity Federation の設定が正しいか確認
3. GitHub Secrets が正しく設定されているか確認

### ビルドエラーが発生する場合

1. Dockerfile が正しいか確認
2. package.json の依存関係が最新か確認
3. ローカルでビルドが成功するか確認: `make docker-build`

### デプロイエラーが発生する場合

1. Cloud Run API が有効化されているか確認
2. Container Registry API が有効化されているか確認
3. サービスアカウントに `roles/run.admin` 権限があるか確認

## セキュリティのベストプラクティス

1. **Workload Identity Federation を使用** - サービスアカウントキーを使わないため、より安全
2. **最小権限の原則** - 必要最小限の権限のみを付与
3. **シークレットの管理** - GitHub Secrets に機密情報を保存、コードにハードコーディングしない
4. **リポジトリの制限** - Workload Identity Provider で特定のリポジトリのみ許可

## 代替方法: サービスアカウントキーを使用（非推奨）

Workload Identity Federation のセットアップが難しい場合、従来のサービスアカウントキー方式も使用できます：

```bash
# サービスアカウントキーを作成
gcloud iam service-accounts keys create key.json \
  --iam-account=github-actions@ai-chat-482910.iam.gserviceaccount.com

# key.jsonの内容をBase64エンコード
base64 key.json

# GitHub Secretsに GCP_SA_KEY という名前で追加
```

`.github/workflows/deploy.yml` の認証部分を以下に変更：

```yaml
- name: Authenticate to Google Cloud
  uses: google-github-actions/auth@v2
  with:
    credentials_json: ${{ secrets.GCP_SA_KEY }}
```

**注意:** セキュリティ上の理由から、Workload Identity Federation の使用を強く推奨します。

## 参考リンク

- [GitHub Actions for Google Cloud](https://github.com/google-github-actions)
- [Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation)
- [Cloud Run Deployment](https://cloud.google.com/run/docs/deploying)
