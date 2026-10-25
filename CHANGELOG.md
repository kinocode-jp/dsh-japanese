# 変更履歴

## 0.1.13 (2026-10-25)

- 日本語の言語登録が返す解除処理をライフサイクルに渡し、プラグインの停止・再読み込み時に登録を正しく解放
- 停止・再登録・重複登録時の所有権を確認する回帰テストを追加
- README の公開案内を GitHub Actions の Trusted Publishing 手順に統一

## 0.1.12 (2026-10-23)

- モデル画面の「customized」の訳を「詳細設定」に変更
- プラグイン一覧の表示名を「日本語化パック (dsh-japanese)」に（英語・中国語の表示名も追加）

## 0.1.11 (2026-10-19)

- 公開を GitHub の組織 kinocode-jp の GitHub Actions（npm の Trusted Publishing）に切り替え。npm の公開者は「GitHub Actions」になり、来歴（provenance）が付く。機能の変更なし

## 0.1.10 (2026-10-18)

- セッションタイトルを常に日本語で付ける。本体のタイトル自動生成（`session-title-llm`）を無効にし、
  日本語で付ける提供元 `session-title-japanese-llm` を登録する。簡体字が混じったら一度だけ付け直す
- ホスト側の依存として `@deepseek-ai/dsh-session-title` と `@deepseek-ai/dsh-session-title-llm` を追加（peerDependencies）

## 0.1.9 (2026-10-18)

- `--ds-font-family-sans` を日本語スタックで定義。DSH はこの変数を定義していないため、
  `dsh-cost-meter` などが `system-ui` にフォールバックし、漢字が中国語フォントで描かれていた

## 0.1.8 (2026-10-18)

- 約物の詰め: `text-spacing-trim: trim-start` で行頭の全角約物の余白を詰める
- 見出しのプロポーショナルかな: `h1`〜`h6` に `font-feature-settings: "palt"`

## 0.1.7 (2026-10-18)

- 日本語の改行を文節単位に（`word-break: auto-phrase`、Chromium 119+）
- 禁則処理と合わせて、日本語らしい折り返しに

## 0.1.6 (2026-10-18)

- 外部プラグイン追加: `dsh-rewind-plugin`（`rewind` 37）、`@goodandready/dsh-shadow-auditor`（74）
- 78 → 80名前空間、5,909 → 6,020キー

## 0.1.5 (2026-10-18)

- 日本語組版: `line-break: strict` による禁則処理を既定で適用
- 日付・時刻: `clock.ymd` / `date.ymd` を `{y}/{m}/{d}` に、所要時間を「1時間20分」表記に統一
- 外部プラグイン追加: `dsh-subscriptions`（293）、`dsh-clinebot`（212）
- README を導入・FAQ・対応プラグイン一覧を含む構成に刷新
- 76 → 78名前空間、5,404 → 5,909キー

## 0.1.4 (2026-10-18)

- 人気外部プラグインの残りを追加（1,602キー）
  - `dshmarket`（`dsh-market` 733）、`@goodandready/dsh-cron`（385）、`@goodandready/dsh-key-rotation`（210）
  - `dsh-workbuddy-connect`（settings.workbuddy 125）、`@cola1900/dsh-ppt`（63）、`dsh-wsl-tray`（43）
  - `dsh-plugin-uisfx`（20）、`@dingpenghui/dsh-conversation-language`（12）、`@goodandready/dsh-context-lens`（11）
- 67 → 76名前空間、3,802 → 5,404キー

## 0.1.3 (2026-10-18)

- 人気外部プラグインのうち DSH ロケールを使うものを追加（702キー）
  - `@feng0531/dsh-vcs` 0.4.10 — `local.vcs` 260キー
  - `@eddyskywalker/dsh-chatgpt-subscription` 0.27.1 — `dsh-workbuddy` 102 / `dsh-progress-updates` 28
  - `@goodandready/dsh-image-gen` 0.12.2 — `dsh-image-gen` 312
- 65 → 67名前空間、3,100 → 3,802キー

## 0.1.2 (2026-10-18)

- 外部プラグイン `dsh-agy` 0.4.6 の `agy` 名前空間（224キー）を日本語化
- これで 63名前空間・3,100キー

## 0.1.1 (2026-10-18)

- 初回抽出で漏れていた13名前空間・270キーを追加
  - `schedule.manager`（Automation tasks ページ）134キー
  - `job`（バックグラウンドジョブ）40キー
  - ドキュメントプレビュー各形式（`sidebarOffice` / `sidebarExcel` / `sidebarPdf` / `sidebarImage` / `documentHtml` / `documentMarkdown` / `sidebarCodePreview`）
  - `slash.menu`、`settings.locale`、`shortcuts.layout`、`deepseek-model-label-1017`
- 既存名前空間の新規キー29件（`schedule.catalog`、`sidebarDocumentPreview`）

## 0.1.0 (2026-10-18)

- 初版。DSH 0.2.1-rc.2 の英語基準辞書（49名前空間・2,606キー）を日本語化
- 言語ピッカーに「日本語」を登録（`addLanguage` fallback: en）
- 日本語優先フォントスタックを root 既定として適用（本文・コード・ターミナル）
- 品質ツール: `check`（キー網羅・プレースホルダー・用語）、`audit`（自然さ）、`review`（CSV往復）
