# MSU Dashboard

これは引継ぎ内容.md の方針に基づいて作成したローカル前提のモックダッシュボードです。

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

デプロイは、フロントエンドをビルドしてWorkerを公開します。

```bash
npm run worker:deploy
```

フロントエンドとWorkerを別ドメインに配置する場合は、フロントエンドのビルド時にWorker URLを指定します。

```powershell
$env:VITE_MSU_WORKER_URL = 'https://msu-dashboard-api.example.workers.dev/api/msu'
npm run build
```

その場合は、Workerの環境変数 `ALLOWED_ORIGINS` にフロントエンドの完全一致Originをカンマ区切りで設定してください。同一Originのリバースプロキシ配下で `/api/msu` をWorkerへ転送する場合は、`VITE_MSU_WORKER_URL` と `ALLOWED_ORIGINS` は不要です。

## ビルド

```bash
npm run build
```




```powershell
Set-Location 'd:\dev\MSU Dashboard'; cmd /c npm run dev -- --host 0.0.0.0
```
http://localhost:5173/