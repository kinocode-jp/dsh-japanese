# @kinocode/dsh-japanese

DeepSeek Harness（DSH）デスクトップアプリ用の**日本語パック**。
言語ピッカーに「日本語」を追加し、76名前空間・5,404キーの辞書と、日本語優先のフォント設定を入れる。

> **非公式プラグインです。** DeepSeek / DeepSeek Harness の公式配布物ではありません。

英語の基準辞書は DSH `0.2.1-rc.2` から抽出したもの（`tools/en.baseline.json`）。
未翻訳のキーは英語にフォールバックするので、DSH を更新してキーが増えても UI は壊れない。

## インストール

npm から入れる場合（公開後）:

```bash
dsh plugin --profile desktop add @kinocode/dsh-japanese
```

または **Plugins** 画面で `@kinocode/dsh-japanese` を指定してインストールする。
`dsh.bundle.patch` を宣言しているので、プロファイルの `dsh.profile.bundles` には自動で追加される。

入れたあと DSH を再起動し、**Settings → Language → 日本語** を選ぶ。

ローカルの作業ツリーから入れる場合:

```bash
dsh plugin --profile desktop add link:/Volumes/D/Project/dsh-japanese
```

このリポジトリは現在この link 方式で `desktop` プロファイルに入っている。

### 元に戻す

`~/.dsh/profiles/desktop/package.json.bak-before-locale-ja` と
`pnpm-lock.yaml.bak-before-locale-ja` に、導入前のバックアップがある。

## 何を変えるか

| 領域 | 内容 | 状態 |
|---|---|---|
| 日本語辞書 | 76名前空間・5,404キー。です・ます調、用語統一 | 実装済み |
| フォント | 本文・コード・ターミナルを日本語優先スタックに | 実装済み |
| 外部プラグイン | `dsh-agy`、`dsh-vcs`、`dsh-chatgpt-subscription`、`dsh-image-gen` の UI | 実装済み |
| 組版 | 禁則処理・約物まわりの調整 | 検討中 |
| 日付・数値 | 和暦ではなく `YYYY/MM/DD`、桁区切り | 検討中 |

## フォント（日本語優先）

DSH の既定スタックは日本語書体より先に `PingFang SC` / `Hiragino Sans GB`（簡体字中国語）を
並べているため、日本語UIでも漢字が中国語字形になる。このプラグインは `<html>` に次の既定を入れる。

| 用途 | スタック |
|---|---|
| 本文 | `"Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", "Noto Sans CJK JP", "Yu Gothic UI", "Yu Gothic", Meiryo, -apple-system, …` |
| コード | `"SF Mono", "JetBrains Mono", "Fira Code", Menlo, Monaco, Consolas, "Hiragino Sans", "Noto Sans JP", …` |
| ターミナル | コードと同じ |

Settings でフォントを指定すると `<body>` に書かれ、そちらが優先される。空欄に戻すとこの既定に戻る。

### 再起動せずに反映する

Settings → 一般 → その他のフォント設定 → **テキストフォント** に次を貼る（入力欄は200文字まで）。

```text
"Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic", Meiryo, sans-serif
```

**コードフォント** には次を貼る。

```text
"SF Mono", Menlo, "Hiragino Sans", "Yu Gothic", monospace
```

Latin も Hiragino の字形に揃えたい場合はこのままでよい。Latin だけ SF Pro に戻したい場合は
先頭に `-apple-system, ` を足す（例: `-apple-system, "Hiragino Sans", …`）。

## 対応している外部プラグイン

各プラグインが DSH のロケール名前空間を使っている場合だけ、このパックに `ja` を足せる。
対応版は `tools/vendor/manifest.json` に固定してある。

| プラグイン | 名前空間 | キー | 版 |
|---|---|---|---|
| dsh-agy | `agy` | 224 | 0.4.6 |
| dshmarket | `dsh-market` | 733 | 1.66.37 |
| @goodandready/dsh-cron | `dsh-cron` | 385 | 0.3.8 |
| @goodandready/dsh-image-gen | `dsh-image-gen` | 312 | 0.12.2 |
| @feng0531/dsh-vcs | `local.vcs` | 260 | 0.4.10 |
| @goodandready/dsh-key-rotation | `dsh-key-rotation` | 210 | 0.8.63 |
| dsh-workbuddy-connect | `settings.workbuddy` | 125 | 0.7.8 |
| @eddyskywalker/dsh-chatgpt-subscription | `dsh-workbuddy`, `dsh-progress-updates` | 130 | 0.27.1 |
| @cola1900/dsh-ppt | `dsh-ppt` | 63 | 0.3.4 |
| dsh-wsl-tray | `dsh-wsl-tray` | 43 | 0.1.7 |
| dsh-plugin-uisfx | `dsh-plugin-uisfx` | 20 | 0.1.1 |
| @dingpenghui/dsh-conversation-language | `settings.conversation-language` | 12 | 3.2.5 |
| @goodandready/dsh-context-lens | `dsh-context-lens` | 11 | 0.1.33 |

DSH のロケールを使わず独自の中文/English 切替を持つプラグイン（`dsh-cost-meter`、`dsh-free-search` など）は、
このパックでは日本語化できない。

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
tools/build-client.mjs 辞書とフォント既定を client.js に埋め込む
tools/check.mjs        品質検査（終了コードあり）
tools/audit.mjs        自然さの監査（助言のみ）
tools/review.mjs       CSV の書き出し・取り込み
tools/make-batches.mjs 翻訳バッチの生成
tools/make-polish.mjs  推敲バッチの生成
tools/merge-out.mjs    バッチ結果の統合
tools/apply-polish.mjs 推敲結果の適用
docs/glossary.md       訳語と文体のガイドライン
docs/review.csv        レビュー用 CSV（生成物・5,404行）
```

## 公開（メンテナ向け）

手順と現在の公開状態は **[docs/RELEASING.md](docs/RELEASING.md)** にまとめてある。

要点だけ:

- npm アカウントは `@kinocode` オーガニゼーション、認証は**パスキー**
- パスキーのため、非対話シェルからの `npm publish` は `EOTP` で止まる。**公開は人がターミナルで実行する**
- エージェント側は「バージョン更新・翻訳・検査・ビルド・`npm pack` 確認・コミット」までを担当する

```bash
cd /Volumes/D/Project/dsh-japanese
npm login --auth-type=web    # 初回のみ。ブラウザでパスキー認証
npm publish --access public  # ブラウザ認証のあと公開
```

- `prepublishOnly` で `check` と `build` が自動実行される
- `package.json` の `private` は外してある
- `files` に `lib` / `locale` / `cordis.patch.yml` / `README` / `LICENSE` / `CHANGELOG` が入る
- 公開前に `npm pack --dry-run` で中身を確認する
- `dsh.engines.dsh` が対応範囲。DSH 側の互換チェックは `engines` と peerDependencies を見る
- pnpm の `minimumReleaseAge` により、公開直後の版はインストールが遅れることがある
- DSH には公式マーケットは無い。配布は npm か Git、または自前の market index（実験的機能）になる

### 現在の公開状態

| 項目 | 値 |
|---|---|
| ローカル | 0.1.4（76名前空間 / 5,404キー） |
| npm の latest | 0.1.0 |
| 公開待ち | 0.1.1〜0.1.4 |

## DSH を更新したとき

1. 新しい `en.baseline.json` を用意する
2. `node tools/check.mjs` で不足キーを確認する
3. 不足分だけ翻訳して追記する
4. `npm run build` → 再起動

## メモ

- `addLanguage({ id: 'ja', label: '日本語', fallback: 'en' })` で言語を登録する
- 辞書は `ctx.locale.register(namespace, { ja: dict })` で登録する
- フォントは `<html>` の CSS 変数（`--dsh-font-family-*`）で既定を入れ、Settings の指定（`<body>`）に譲る
- 二重ロード時は「already registered」を握りつぶす（GUI の起動を止めない）
