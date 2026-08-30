




他のAI
https://docs.windsurf.com/ja/windsurf/getting-started
https://cursor.com/ja/pricing

TODO:
- 週ボス報酬確認画面
- タスク設定
- Weekly Rewards
  - APIコールボタンの設置
  - 手動でTargetBossを設定
    - 先週との比較を行いボス討伐済み判定

  - [x] BossProgress反映

NEED FIX:

- bossNames.layerIDにボス名称が途中でセットされている`https://chatgpt.com/c/6a6cd9b6-3ee0-83e8-bde1-cd82eca3946d`
- イベントガントチャートを追加
- アバター補充タイマーを追加
- キャラアイコン拡大
- リワードのキャッシュが適切か確認。（なんか5分とかで再取得してそう..）-> ボスの進捗だけっぽい？けど複数名利用なら絶対対策しないと制限超える！


bash`npx vite`

http://localhost:5173/?walletAddress=0x24eb476d0E7B9d2099323E633FF0f16f5A64c067











DONE:

- 週ボス報酬のキャッシュが機能していない？ログを見るに毎回hitがFalse　★MapをsessionStorageに変更 `https://chatgpt.com/c/6a6cd567-9d5c-83ee-a580-104e32121e10`