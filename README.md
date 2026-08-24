# MSU Dashboard

GitHub Pagesで配信する静的ダッシュボードです。ブラウザからMSU APIへ直接アクセスせず、Cloudflare WorkerをAPIプロキシとして利用します。

## 機能

- Daily
- Boss
- Weekly Rewards

## 実行

```bash
npm install
npm run dev
```

## MSU API Worker

ブラウザは `/api/msu/*` にアクセスし、MSU APIへのリクエストと `x-nxopen-api-key` の付与はCloudflare Workerが行います。APIキーをViteの環境変数やクライアントコードに設定しないでください。

初回だけWranglerへログインし、APIキーをSecretとして登録します。

```bash
npx wrangler login
npx wrangler secret put MSU_API_KEY
```

`wrangler secret put` で登録したSecretはCloudflare上のデプロイ用です。ローカルの `wrangler dev` では、プロジェクト直下に `.dev.vars` を作成して同じ名前の値を設定してください。このファイルはGitへコミットしないでください。

```dotenv
MSU_API_KEY="ここにMSU APIキー"
```

ローカルでは、2つのターミナルでWorkerとViteを起動します。

```bash
npm run worker:dev
npm run dev
```

Workerのデプロイは、フロントエンドとは独立して行います。

```bash
npm run worker:deploy
```

### GitHub Pagesへの公開

1. Cloudflare Workerをデプロイし、Worker URLを確認します。
2. GitHubリポジトリの **Settings > Secrets and variables > Actions > Variables** で、`MSU_WORKER_URL` に次のような完全なURLを登録します。

	```text
	https://msu-dashboard-api.example.workers.dev/api/msu
	```

3. Cloudflare Workerの `ALLOWED_ORIGINS` に、GitHub PagesのOriginを完全一致で登録します。通常は次の形式です。

	```text
	https://<ユーザー名>.github.io
	```

	`wrangler.toml` の `[vars]` に `ALLOWED_ORIGINS = "https://<ユーザー名>.github.io"` を追加してから、次のコマンドを実行します。

	```bash
	npx wrangler secret put MSU_API_KEY
	npm run worker:deploy
	```

4. GitHubリポジトリの **Settings > Pages** で、Sourceを **GitHub Actions** に設定します。
5. `main` ブランチへpushすると、`.github/workflows/deploy-pages.yml` がビルドしてGitHub Pagesへ公開します。

Pagesのサブパスでも動作するよう、Viteは相対URLで静的ファイルを生成します。Worker URLはビルド時に `MSU_WORKER_URL` から `VITE_MSU_WORKER_URL` として注入されます。

手元でPages用ビルドを確認する場合は、次のように実行します。

```powershell
$env:VITE_MSU_WORKER_URL = 'https://msu-dashboard-api.example.workers.dev/api/msu'
npm run build
```

`ALLOWED_ORIGINS` は複数のOriginをカンマ区切りで指定できます。同一Originのリバースプロキシ配下で `/api/msu` をWorkerへ転送する場合は、`VITE_MSU_WORKER_URL` と `ALLOWED_ORIGINS` は不要です。

## ビルド

```bash
npm run build
```




```powershell
Set-Location 'd:\dev\MSU Dashboard'; cmd /c npm run dev -- --host 0.0.0.0
```
http://localhost:5173/