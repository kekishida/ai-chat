.PHONY: help init dev build start clean lint test deploy gcp-deploy gcp-terminate docker-build

# デフォルトターゲット - ヘルプを表示
help:
	@echo "AI Chat - 利用可能なコマンド:"
	@echo ""
	@echo "【開発】"
	@echo "  make init          - プロジェクトの初期化（依存関係のインストール）"
	@echo "  make dev           - 開発サーバーを起動（ホットリロード有効）"
	@echo "  make build         - 本番用にビルド"
	@echo "  make start         - 本番モードでサーバーを起動"
	@echo "  make lint          - コードのリント実行"
	@echo "  make clean         - ビルドファイルとキャッシュを削除"
	@echo ""
	@echo "【環境設定】"
	@echo "  make setup-env     - 環境変数ファイルのサンプルを作成"
	@echo "  make check-env     - 環境変数が設定されているか確認"
	@echo "  make mongodb-local - ローカルMongoDBコンテナを起動"
	@echo ""
	@echo "【デプロイ】"
	@echo "  make docker-build  - Dockerイメージをビルド"
	@echo "  make gcp-deploy    - Google Cloud Runにデプロイ"
	@echo "  make gcp-set-env   - Cloud Runの環境変数を設定"
	@echo "  make gcp-terminate - Cloud Runサービスを削除"
	@echo "  make deploy-vercel - Vercelにデプロイ"
	@echo ""
	@echo "【GitHub Actions セットアップ】"
	@echo "  make github-actions-setup - GitHub Actions用の設定を一括実行"
	@echo "  make gcp-create-sa        - サービスアカウントを作成"
	@echo "  make gcp-grant-sa-permissions - サービスアカウントに権限を付与"
	@echo "  make gcp-setup-wif        - Workload Identity Federationをセットアップ"
	@echo "  make gcp-create-sa-key    - サービスアカウントキーを作成（非推奨）"
	@echo ""

# 初期化 - 依存関係のインストール
init:
	@echo "📦 依存関係をインストール中..."
	npm install
	@echo "✅ インストール完了"
	@echo ""
	@echo "次のステップ:"
	@echo "  1. make setup-env で .env.local を作成"
	@echo "  2. .env.local に実際のAPIキーとMongoDB URIを設定"
	@echo "  3. make dev で開発サーバーを起動"

# 開発サーバー起動
dev:
	@echo "🚀 開発サーバーを起動中..."
	npm run dev

# 本番用ビルド
build:
	@echo "🔨 本番用にビルド中..."
	npm run build
	@echo "✅ ビルド完了"

# 本番モードでサーバー起動
start:
	@echo "▶️  本番モードでサーバーを起動中..."
	npm run start

# リント実行
lint:
	@echo "🔍 コードをチェック中..."
	npm run lint

# クリーンアップ
clean:
	@echo "🧹 クリーンアップ中..."
	rm -rf .next
	rm -rf node_modules
	rm -rf out
	@echo "✅ クリーンアップ完了"

# 環境変数サンプルファイルを.env.localにコピー
setup-env:
	@if [ ! -f .env.local ]; then \
		cp .env.example .env.local; \
		echo "✅ .env.local を作成しました"; \
		echo "⚠️  .env.local を編集して、実際のAPIキーとMongoDB URIを設定してください"; \
	else \
		echo "⚠️  .env.local は既に存在します"; \
	fi

# 環境変数の確認
check-env:
	@echo "🔍 環境変数を確認中..."
	@if [ -f .env.local ]; then \
		echo "✅ .env.local が存在します"; \
		if grep -q "your_claude_api_key_here" .env.local; then \
			echo "⚠️  ANTHROPIC_API_KEY がまだ設定されていません"; \
		else \
			echo "✅ ANTHROPIC_API_KEY が設定されています"; \
		fi; \
		if grep -q "your_mongodb_uri_here" .env.local; then \
			echo "⚠️  MONGODB_URI がまだ設定されていません"; \
		else \
			echo "✅ MONGODB_URI が設定されています"; \
		fi; \
	else \
		echo "❌ .env.local が見つかりません"; \
		echo "   'make setup-env' を実行してください"; \
	fi

# Vercelにデプロイ（Vercel CLIが必要）
deploy-vercel:
	@echo "🚀 Vercelにデプロイ中..."
	@if ! command -v vercel &> /dev/null; then \
		echo "❌ Vercel CLIがインストールされていません"; \
		echo "   以下のコマンドでインストールしてください:"; \
		echo "   npm install -g vercel"; \
		exit 1; \
	fi
	vercel --prod

# 開発環境のフルセットアップ
setup: clean init setup-env
	@echo ""
	@echo "✅ セットアップ完了！"
	@echo ""
	@echo "次のステップ:"
	@echo "  1. .env.local を編集してAPIキーとMongoDB URIを設定"
	@echo "  2. make check-env で設定を確認"
	@echo "  3. make dev で開発サーバーを起動"

# MongoDB Dockerコンテナを起動（ローカル開発用）
mongodb-local:
	@echo "🐳 ローカルMongoDBコンテナを起動中..."
	@if ! command -v docker &> /dev/null; then \
		echo "❌ Dockerがインストールされていません"; \
		exit 1; \
	fi
	@if docker ps -a | grep -q ai-chat-mongodb; then \
		echo "既存のコンテナを起動中..."; \
		docker start ai-chat-mongodb; \
	else \
		echo "新しいコンテナを作成中..."; \
		docker run -d -p 27017:27017 --name ai-chat-mongodb mongo:latest; \
	fi
	@echo "✅ MongoDBがlocalhost:27017で起動しました"
	@echo "   接続文字列: mongodb://localhost:27017/ai-chat"

# MongoDB Dockerコンテナを停止
mongodb-stop:
	@echo "🛑 MongoDBコンテナを停止中..."
	docker stop ai-chat-mongodb
	@echo "✅ 停止完了"

# 全てのテストを実行
test:
	@echo "🧪 テストを実行中..."
	@echo "⚠️  テストはまだ実装されていません"

# 本番デプロイ前のチェック
pre-deploy: check-env lint build
	@echo "✅ デプロイ前チェック完了"
	@echo "   make deploy-vercel でデプロイできます"

# Dockerイメージをビルド
docker-build:
	@echo "🐳 Dockerイメージをビルド中..."
	docker build -t ai-chat:latest .
	@echo "✅ ビルド完了"
	@echo "   docker run -p 8080:8080 ai-chat:latest でローカルテスト可能"

# Google Cloud Runにデプロイ
gcp-deploy:
	@echo "🚀 Google Cloud Runにデプロイ中..."
	@if ! command -v gcloud &> /dev/null; then \
		echo "❌ Google Cloud SDKがインストールされていません"; \
		echo "   https://cloud.google.com/sdk/docs/install からインストールしてください"; \
		exit 1; \
	fi
	./deploy-gcp.sh

# Google Cloud Runの環境変数を設定
gcp-set-env:
	@if ! command -v gcloud &> /dev/null; then \
		echo "❌ Google Cloud SDKがインストールされていません"; \
		echo "   https://cloud.google.com/sdk/docs/install からインストールしてください"; \
		exit 1; \
	fi
	@echo "🔧 Cloud Runの環境変数を設定中..."
	@printf "ANTHROPIC_API_KEY: "; \
	read api_key; \
	printf "MONGODB_URI: "; \
	read mongo_uri; \
	gcloud run services update ai-chat \
		--region asia-northeast1 \
		--set-env-vars ANTHROPIC_API_KEY=$$api_key,MONGODB_URI=$$mongo_uri
	@echo "✅ 環境変数を設定しました"

# Google Cloud Runサービスを削除（terminate）
gcp-terminate:
	@if ! command -v gcloud &> /dev/null; then \
		echo "❌ Google Cloud SDKがインストールされていません"; \
		echo ""; \
		echo "以下のいずれかの方法でCloud Runサービスを削除してください:"; \
		echo ""; \
		echo "【方法1】GitHub Actionsを使用（推奨）"; \
		echo "  1. https://github.com/kekishida/ai-chat/actions にアクセス"; \
		echo "  2. 'Terminate Cloud Run Service' ワークフローを選択"; \
		echo "  3. 'Run workflow' をクリック"; \
		echo ""; \
		echo "【方法2】Google Cloud Consoleから手動削除"; \
		echo "  https://console.cloud.google.com/run?project=ai-chat-482910"; \
		echo ""; \
		echo "【方法3】Google Cloud SDKをインストール"; \
		echo "  curl https://sdk.cloud.google.com | bash"; \
		echo "  exec -l \$$SHELL"; \
		echo "  gcloud auth login"; \
		echo "  gcloud config set project ai-chat-482910"; \
		exit 1; \
	fi
	@echo "⚠️  警告: Cloud Runサービス 'ai-chat' を削除します"
	@echo ""
	@printf "本当に削除しますか？ (yes/no): "; \
	read REPLY; \
	if [ "$$REPLY" = "yes" ]; then \
		echo "🗑️  Cloud Runサービスを削除中..."; \
		if gcloud run services delete ai-chat --region asia-northeast1 --quiet; then \
			echo "✅ サービスを削除しました"; \
			echo ""; \
			printf "Dockerイメージも削除しますか？ (yes/no): "; \
			read REPLY2; \
			if [ "$$REPLY2" = "yes" ]; then \
				echo "🗑️  Dockerイメージを削除中..."; \
				gcloud container images delete gcr.io/ai-chat-482910/ai-chat:latest --quiet 2>/dev/null || echo "⚠️  latest イメージが見つかりません"; \
				IMAGES=$$(gcloud container images list-tags gcr.io/ai-chat-482910/ai-chat --format="get(digest)" 2>/dev/null); \
				if [ -n "$$IMAGES" ]; then \
					for DIGEST in $$IMAGES; do \
						echo "削除中: gcr.io/ai-chat-482910/ai-chat@$$DIGEST"; \
						gcloud container images delete gcr.io/ai-chat-482910/ai-chat@$$DIGEST --quiet 2>/dev/null || echo "⚠️  $$DIGEST の削除に失敗"; \
					done; \
				fi; \
				echo "✅ Dockerイメージを削除しました"; \
			else \
				echo "ℹ️  Dockerイメージは保持されました"; \
			fi; \
		else \
			echo "❌ サービスの削除に失敗しました"; \
			exit 1; \
		fi; \
	else \
		echo "❌ 削除をキャンセルしました"; \
	fi

# GitHub Actions セットアップ用のヘルパーコマンド
gcp-create-sa:
	@if ! command -v gcloud &> /dev/null; then \
		echo "❌ Google Cloud SDKがインストールされていません"; \
		echo "   https://cloud.google.com/sdk/docs/install からインストールしてください"; \
		exit 1; \
	fi
	@echo "🔧 GitHub Actions用のサービスアカウントを作成中..."
	gcloud iam service-accounts create github-actions \
		--display-name="GitHub Actions Deployment Account" \
		--project=ai-chat-482910
	@echo "✅ サービスアカウントを作成しました"

gcp-grant-sa-permissions:
	@if ! command -v gcloud &> /dev/null; then \
		echo "❌ Google Cloud SDKがインストールされていません"; \
		echo "   https://cloud.google.com/sdk/docs/install からインストールしてください"; \
		exit 1; \
	fi
	@echo "🔧 サービスアカウントに権限を付与中..."
	gcloud projects add-iam-policy-binding ai-chat-482910 \
		--member="serviceAccount:github-actions@ai-chat-482910.iam.gserviceaccount.com" \
		--role="roles/run.admin"
	gcloud projects add-iam-policy-binding ai-chat-482910 \
		--member="serviceAccount:github-actions@ai-chat-482910.iam.gserviceaccount.com" \
		--role="roles/storage.admin"
	gcloud projects add-iam-policy-binding ai-chat-482910 \
		--member="serviceAccount:github-actions@ai-chat-482910.iam.gserviceaccount.com" \
		--role="roles/iam.serviceAccountUser"
	@echo "✅ 権限を付与しました"

gcp-setup-wif:
	@if ! command -v gcloud &> /dev/null; then \
		echo "❌ Google Cloud SDKがインストールされていません"; \
		echo "   https://cloud.google.com/sdk/docs/install からインストールしてください"; \
		exit 1; \
	fi
	@echo "🔧 Workload Identity Federationをセットアップ中..."
	@printf "GitHubユーザー名を入力してください: "; \
	read github_user; \
	gcloud iam workload-identity-pools create "github-pool" \
		--project="ai-chat-482910" \
		--location="global" \
		--display-name="GitHub Actions Pool" || true; \
	gcloud iam workload-identity-pools providers create-oidc "github-provider" \
		--project="ai-chat-482910" \
		--location="global" \
		--workload-identity-pool="github-pool" \
		--display-name="GitHub Provider" \
		--attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" \
		--attribute-condition="assertion.repository_owner == '$$github_user'" \
		--issuer-uri="https://token.actions.githubusercontent.com" || true; \
	gcloud iam service-accounts add-iam-policy-binding "github-actions@ai-chat-482910.iam.gserviceaccount.com" \
		--project="ai-chat-482910" \
		--role="roles/iam.workloadIdentityUser" \
		--member="principalSet://iam.googleapis.com/projects/305729078114/locations/global/workloadIdentityPools/github-pool/attribute.repository/$$github_user/ai-chat"
	@echo ""
	@echo "✅ Workload Identity Federationのセットアップ完了"
	@echo ""
	@echo "以下の情報をGitHub Secretsに設定してください："
	@echo ""
	@gcloud iam workload-identity-pools providers describe "github-provider" \
		--project="ai-chat-482910" \
		--location="global" \
		--workload-identity-pool="github-pool" \
		--format="value(name)" | \
		awk '{print "WIF_PROVIDER: " $$1}'
	@echo "WIF_SERVICE_ACCOUNT: github-actions@ai-chat-482910.iam.gserviceaccount.com"

gcp-create-sa-key:
	@if ! command -v gcloud &> /dev/null; then \
		echo "❌ Google Cloud SDKがインストールされていません"; \
		echo "   https://cloud.google.com/sdk/docs/install からインストールしてください"; \
		exit 1; \
	fi
	@echo "⚠️  注意: サービスアカウントキーの使用は非推奨です"
	@echo "   可能な限り Workload Identity Federation を使用してください"
	@echo ""
	@printf "本当に続行しますか？ (y/N): "; \
	read REPLY; \
	if [ "$$REPLY" = "y" ] || [ "$$REPLY" = "Y" ]; then \
		gcloud iam service-accounts keys create key.json \
			--iam-account=github-actions@ai-chat-482910.iam.gserviceaccount.com; \
		echo ""; \
		echo "✅ key.json を作成しました"; \
		echo ""; \
		echo "GitHub Secretsに設定する値:"; \
		echo "GCP_SA_KEY:"; \
		base64 -w 0 key.json; \
		echo ""; \
		echo ""; \
		echo "⚠️  セキュリティのため、設定後は key.json を削除してください:"; \
		echo "   rm key.json"; \
	fi

github-actions-setup: gcp-create-sa gcp-grant-sa-permissions gcp-setup-wif
	@echo ""
	@echo "✅ GitHub Actionsのセットアップが完了しました"
	@echo ""
	@echo "次のステップ:"
	@echo "1. GITHUB_ACTIONS.md を参照してGitHub Secretsを設定"
	@echo "2. GitリポジトリをGitHubにプッシュ"
	@echo "3. mainブランチにプッシュすると自動デプロイが開始されます"
