#!/bin/bash

# AI Chat - Google Cloud Run デプロイスクリプト

set -e

# 設定
PROJECT_ID="ai-chat-482910"
SERVICE_NAME="ai-chat"
REGION="asia-northeast1"  # 東京リージョン
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo "🚀 AI Chat を Google Cloud Run にデプロイします"
echo ""
echo "プロジェクトID: ${PROJECT_ID}"
echo "サービス名: ${SERVICE_NAME}"
echo "リージョン: ${REGION}"
echo ""

# 環境変数の確認
echo "⚠️  重要: Cloud Run上で以下の環境変数を設定する必要があります:"
echo "  - ANTHROPIC_API_KEY"
echo "  - MONGODB_URI"
echo ""
read -p "環境変数を後で設定することを理解しました。続行しますか？ (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "デプロイを中止しました"
    exit 1
fi

# Google Cloud プロジェクトを設定
echo "📋 Google Cloud プロジェクトを設定中..."
gcloud config set project ${PROJECT_ID}

# Container Registry APIを有効化（初回のみ必要）
echo "🔧 必要なAPIを有効化中..."
gcloud services enable containerregistry.googleapis.com
gcloud services enable run.googleapis.com

# Dockerイメージをビルド
echo "🔨 Dockerイメージをビルド中..."
docker build -t ${IMAGE_NAME}:latest .

# Container Registryにプッシュ
echo "📤 イメージをContainer Registryにプッシュ中..."
docker push ${IMAGE_NAME}:latest

# Cloud Runにデプロイ
echo "🚀 Cloud Runにデプロイ中..."
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE_NAME}:latest \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --min-instances 0 \
  --max-instances 10 \
  --memory 512Mi \
  --cpu 1 \
  --port 8080 \
  --timeout 300

echo ""
echo "✅ デプロイ完了！"
echo ""
echo "次のステップ:"
echo "1. Google Cloud Console でサービスを開く:"
echo "   https://console.cloud.google.com/run?project=${PROJECT_ID}"
echo ""
echo "2. 環境変数を設定:"
echo "   - ANTHROPIC_API_KEY: あなたのClaude APIキー"
echo "   - MONGODB_URI: あなたのMongoDB接続文字列"
echo ""
echo "3. 新しいリビジョンをデプロイ（環境変数を反映）"
echo ""
echo "または、以下のコマンドで環境変数を設定してデプロイ:"
echo ""
echo "gcloud run services update ${SERVICE_NAME} \\"
echo "  --region ${REGION} \\"
echo "  --set-env-vars ANTHROPIC_API_KEY=your_key_here,MONGODB_URI=your_uri_here"
