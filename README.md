# Question Support

本アプリケーションは、大学の学部生を対象とした「質問受付・管理システム」です。学生からの質問をフォーム経由で収集し、Geminiによる自動分類、管理者による回答、自動返信、投稿制限などを一元的に管理する機能を備えています。

## 主な機能

- 質問フォーム（学年・名前・学籍番号・メールアドレス付き）
- Geminiを利用した質問内容の自動カテゴリ分類
- Firebase Functionsによる投稿制限・BAN判定（DoS対策含む）
- Firestoreによるデータ管理（質問、投稿者、匿名アーカイブ）
- 管理者ダッシュボード（認証付き）
- 回答プレビュー・送信（sendGrid APIを使用）

## 技術スタック

- React（TypeScript）
- Firebase（Hosting / Firestore / Functions / Auth）
- Gemini API（自然言語処理による分類）
- sendGrid API（自動返信メール）
- Docker / Firebase Emulator Suite（ローカル開発環境）

## 想定ユースケース

- 大学の学部生からの質問対応業務の効率化
- 教務補助・学生サポート業務の支援
- 管理者による一元的な返信・対応履歴の追跡

## 開発の狙い

実際の大学業務において活用可能な質問管理・支援システムを、LLM（大規模言語モデル）およびFirebaseを中心としたサーバーレス技術により構築。インフラ・認証・通知・ログ管理・自動化などをすべてフルスタックで設計・開発しています。

## アプリケーションURL
[質問フォーム](https://question-support.web.app/)
[管理者画面](https://question-support.web.app/login)

## ログイン情報
本アプリケーションの管理者機能は、Google認証を利用し、許可されたゼミ生（回答者）のみがアクセスできる仕様となっております。
評価の際は、お手数ですが以下のデモ用Googleアカウントでログインをお試しください。

デモ用Googleアカウント: qsup.demo@gmail.com
パスワード: qsup2025Demo

🔧 Getting Started (ローカルでの開発)
このプロジェクトはDocker Composeを使用して、簡単にローカル開発環境を構築・起動できます。

1. 前提条件
Docker Desktop (DockerとDocker Composeが含まれています)
Firebase CLI

2. リポジトリをクローン
```bash
git clone git@github.com:Tsuchiya0436/question-support.git
cd question-support
```

3. 環境変数の設定
フロントエンド
frontend ディレクトリのルートに .env ファイルを作成し、Firebaseプロジェクトの情報を設定します。

(例: frontend/.env)

コード スニペット

# Create React Appでは、環境変数の頭に REACT_APP_ を付ける必要があります
```bash
REACT_APP_FIREBASE_API_KEY="your_api_key"
REACT_APP_FIREBASE_AUTH_DOMAIN="your_auth_domain"
```

バックエンド (Firebase Functions)
APIキーなど、秘密情報はFirebase Functionsの環境変数として設定します。

# プロジェクトのルートディレクトリで以下のコマンドを実行
```bash
firebase functions:config:set sendgrid.key="YOUR_SENDGRID_API_KEY"
firebase functions:config:set gemini.key="YOUR_GEMINI_API_KEY"
```

4. 開発環境の起動
以下のコマンドを実行すると、フロントエンドの開発サーバーとFirebase Functionsエミュレータがバックグラウンドで起動します。

```bash
docker compose up -d
```

フロントエンド: http://localhost:3000

5. 開発環境の停止

```bash
docker compose down
```