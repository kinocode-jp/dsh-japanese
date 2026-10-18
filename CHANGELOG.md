# 変更履歴

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
