# dsh-locale-ja

DeepSeek Harness（DSH）デスクトップアプリ用の**日本語だけ**のロケールパック。
言語ピッカーに「日本語」を追加し、49 名前空間・2,606 キーの日本語辞書を登録する。

英語の基準辞書は DSH `0.2.1-rc.2` から抽出したもの（`tools/en.baseline.json`）。
未翻訳のキーは英語にフォールバックするので、DSH を更新してキーが増えても UI は壊れない。

## インストール

このプロジェクトはすでに `desktop` プロファイルへ link インストール済み。
`package.json` の依存と `dsh.profile.bundles` に `dsh-locale-ja` が入り、
`dsh-locale-pack` は依存・バンドルとも外してある。

```jsonc
// ~/.dsh/profiles/desktop/package.json（抜粋）
"dependencies": { "dsh-locale-ja": "link:/Volumes/D/Project/dsh-locale-ja" },
"dsh": { "profile": { "bundles": [ "...", "dsh-locale-ja", "..." ] } }
```

初回だけ DSH を再起動し、**Settings → Language → 日本語** を選ぶ。
再起動なしでは host 側の行が読み込まれないため、言語ピッカーに日本語は出ない。

ゼロから入れ直す場合:

```bash
dsh plugin --profile desktop add link:/Volumes/D/Project/dsh-locale-ja
# package.json の dsh.profile.bundles に "dsh-locale-ja" を追記する
```

### 元に戻す

バックアップは `~/.dsh/profiles/desktop/package.json.bak-before-locale-ja` と
`pnpm-lock.yaml.bak-before-locale-ja` に置いてある。

```bash
cd ~/.dsh/profiles/desktop
cp package.json.bak-before-locale-ja package.json
cp pnpm-lock.yaml.bak-before-locale-ja pnpm-lock.yaml
ln -s ../../../plugins-src/dsh-locale-pack node_modules/dsh-locale-pack
dsh plugin --profile desktop install
```

`dsh-locale-pack` の本体（`~/.dsh/plugins-src/dsh-locale-pack`）は消していない。

## 翻訳を直す

辞書は `locale/ja/<namespace>.json` にある。直接編集してもよいが、一覧で見たいときは CSV を使う。

```bash
npm run review        # docs/review.csv を出力（Numbers / Excel で開ける）
# ja 列だけ編集して保存
npm run apply-review  # CSV の ja 列を locale/ja/*.json に反映
npm run check         # キー網羅・プレースホルダー・用語の検査
npm run audit         # 自然さの観点で警告（「あなた」、約物、長すぎる文など）
npm run build         # lib/client.js を再生成
```

`check` は次を見る。

- 基準キーの欠落・余分なキー
- `{name}` などのプレースホルダーの不一致
- 空文字、英語ソースにない改行
- 英語のまま残っている値（単位・記号・技術名は除外）
- 用語表に反する表記（「副エージェント」「作業スペース」など）

`audit` は助言のみで、終了コードは変えない。指摘を直すときも CSV 経由が楽。

### 訳し直すとき

`docs/glossary.md` が唯一の判断基準。用語を変えるなら先にこのファイルを直す。

```bash
npm run batches 80    # work/batches/ に英語キーを分割
npm run polish        # 既存訳のレビュー用バッチを作る
npm run apply-polish  # レビュー結果を反映
npm run merge         # 翻訳結果を locale/ja/ に統合
```

## 構成

```text
locale/ja/*.json       日本語辞書（名前空間 = ファイル名）
lib/client.js          生成物。直接編集しない
lib/index.js           host 側は空
tools/en.baseline.json 英語の基準辞書（DSH 0.2.1-rc.2）
tools/build-client.mjs 辞書を client.js に埋め込む
tools/check.mjs        品質検査（終了コードあり）
tools/audit.mjs        自然さの監査（助言のみ）
tools/review.mjs       CSV の書き出し・取り込み
tools/make-batches.mjs 翻訳バッチの生成
tools/make-polish.mjs  推敲バッチの生成
tools/merge-out.mjs    バッチ結果の統合
tools/apply-polish.mjs 推敲結果の適用
docs/glossary.md       訳語と文体のガイドライン
docs/review.csv        レビュー用 CSV（生成物・2,606行）
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
