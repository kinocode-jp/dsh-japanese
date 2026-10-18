# dsh-locale-ja

DeepSeek Harness（DSH）デスクトップアプリ用の**日本語だけ**のロケールパック。
言語ピッカーに「日本語」を追加し、49 名前空間・2,606 キーの日本語辞書を登録する。

英語の基準辞書は DSH `0.2.1-rc.2` から抽出したもの（`tools/en.baseline.json`）。
未翻訳のキーは英語にフォールバックするので、DSH を更新してキーが増えても UI は壊れない。

## インストール

```bash
dsh plugin --profile desktop add link:/Volumes/D/Project/dsh-locale-ja
```

インストール後に DSH を再起動し、**Settings → Language → 日本語** を選ぶ。

既存の `dsh-locale-pack`（26 言語）が入っている場合は、`ja` の二重登録を避けるため先に外す:

```bash
dsh plugin --profile desktop remove dsh-locale-pack
```

## 翻訳を直す

辞書は `locale/ja/<namespace>.json` にある。直接編集してもよいが、一覧で見たいときは CSV を使う。

```bash
npm run review        # docs/review.csv を出力（Numbers / Excel で開ける）
# ja 列だけ編集して保存
npm run apply-review  # CSV の ja 列を locale/ja/*.json に反映
npm run check         # キー網羅・プレースホルダー・用語の検査
npm run build         # lib/client.js を再生成
```

`check` は次を見る。

- 基準キーの欠落・余分なキー
- `{name}` などのプレースホルダーの不一致
- 空文字、改行入り
- 英語のまま残っている値
- 用語表に反する表記（「副エージェント」「作業スペース」など）

## 構成

```text
locale/ja/*.json      日本語辞書（名前空間 = ファイル名）
lib/client.js         生成物。直接編集しない
lib/index.js          host 側は空
tools/en.baseline.json 英語の基準辞書（DSH 0.2.1-rc.2）
tools/build-client.mjs 辞書を client.js に埋め込む
tools/check.mjs       品質検査
tools/review.mjs      CSV の書き出し・取り込み
tools/make-batches.mjs 翻訳バッチの生成
docs/glossary.md      訳語と文体のガイドライン
docs/review.csv       レビュー用 CSV（生成物）
```

## DSH を更新したとき

1. 新しい `en.baseline.json` を用意する
2. `node tools/check.mjs` で不足キーを確認する
3. 不足分だけ翻訳して追記する
4. `npm run build` → 再起動

## メモ

- `addLanguage({ id: 'ja', label: '日本語', fallback: 'en' })` で言語を登録する
- 辞書は `ctx.locale.register(namespace, { ja: dict })` で登録する
- 二重ロード時は「already registered」を握りつぶす（GUI の起動を止めない）
