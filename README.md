# @kinocode/dsh-japanese

![npm](https://img.shields.io/npm/v/@kinocode/dsh-japanese)
![license](https://img.shields.io/npm/l/@kinocode/dsh-japanese)

DeepSeek Harness（DSH）デスクトップアプリを**日本語で使うためのパック**。
言語ピッカーに「日本語」を追加し、80名前空間・6,020キーの辞書、日本語優先フォント、禁則処理、
日本の日付表記をまとめて入れる。

> **非公式プラグインです。** DeepSeek / DeepSeek Harness の公式配布物ではありません。

## できること

| 領域 | 内容 |
|---|---|
| 日本語辞書 | DSH本体の49名前空間＋取りこぼし13＋外部プラグイン16。です・ます調、用語統一 |
| フォント | `PingFang SC`（中国語）より先に `Hiragino Sans` / `Noto Sans JP` を使う |
| 組版 | `line-break: strict` で禁則処理（小書き文字・長音・閉じ括弧の前で折り返さない） |
| 日付 | `{y}/{m}/{d}` 形式。所要時間は「1時間20分」表記 |
| 外部プラグイン | DSHのロケールを使うものだけ、設定画面まで日本語化 |

## インストール

```bash
dsh plugin --profile desktop add @kinocode/dsh-japanese
```

または **Plugins** 画面で `@kinocode/dsh-japanese` を指定する。
`dsh.bundle.patch` を宣言しているので、プロファイルの `dsh.profile.bundles` には自動で追加される。

入れたあと DSH を**完全に終了して再起動**し、**Settings → Language → 日本語** を選ぶ。

### アンインストール

```bash
dsh plugin --profile desktop remove @kinocode/dsh-japanese
```

## 対応している外部プラグイン

各プラグインが DSH のロケール名前空間を使っている場合だけ、このパックに `ja` を足せる。
対応版は `tools/vendor/manifest.json` に固定してある。

| プラグイン | 名前空間 | キー |
|---|---|---|
| dshmarket | `dsh-market` | 733 |
| @goodandready/dsh-cron | `dsh-cron` | 385 |
| @goodandready/dsh-image-gen | `dsh-image-gen` | 312 |
| @goodandready/dsh-subscriptions | `dsh-subscriptions` | 293 |
| @feng0531/dsh-vcs | `local.vcs` | 260 |
| dsh-agy | `agy` | 224 |
| @goodandready/dsh-clinebot | `dsh-clinebot` | 212 |
| @goodandready/dsh-key-rotation | `dsh-key-rotation` | 210 |
| @eddyskywalker/dsh-chatgpt-subscription | `dsh-workbuddy`, `dsh-progress-updates` | 130 |
| dsh-workbuddy-connect | `settings.workbuddy` | 125 |
| @cola1900/dsh-ppt | `dsh-ppt` | 63 |
| dsh-wsl-tray | `dsh-wsl-tray` | 43 |
| dsh-plugin-uisfx | `dsh-plugin-uisfx` | 20 |
| @dingpenghui/dsh-conversation-language | `settings.conversation-language` | 12 |
| @goodandready/dsh-context-lens | `dsh-context-lens` | 11 |
| @goodandready/dsh-shadow-auditor | `dsh-shadow-auditor` | 74 |
| dsh-rewind-plugin | `rewind` | 37 |

### セッションタイトルを日本語で付ける

DSH 本体のタイトル自動生成は「メッセージと同じ言語で」と指示するだけなので、漢字を含む日本語の
メッセージに中国語（簡体字）のタイトルが付くことがある（例: 「图像生成功能可用性」）。
このパックは本体の `session-title-llm` を無効にし、代わりに常に日本語でタイトルを付ける提供元
（`session-title-japanese-llm`）を登録する。返ってきたタイトルに簡体字が含まれていれば、一度だけ付け直す。
長さや上限は本体と同じ（約 10 文字、入力 4096 バイト、60 秒）。

### 対応できないもの

上流の `dsh-cost-meter` と `dsh-free-search` は DSH のロケールを使わず、独自の中文/English切替を持つ。
（日本語フォーク `@kinocode/dsh-cost-meter-ja` は、日本語の辞書を自分で DSH のロケールに登録する）
このパックでは日本語化できない（プラグイン本体の対応が必要）。

`@goodandready/dsh-plugin-notify` は名前空間に `/` を含むため、ファイル名＝名前空間という
このパックの構成に載せられない。

## よくある質問

**Q. 言語ピッカーに日本語が出ない**
DSH を再起動していない可能性が高い。ウィンドウの再読み込みではなく、完全終了 → 起動。

**Q. 漢字が中国語の字形になる**
DSH の既定フォントが `PingFang SC` 優先のため。このパックは日本語優先スタックを既定に入れるが、
Settings でフォントを指定している場合はそちらが優先される。
Settings → 一般 → その他のフォント設定 → テキストフォントを空にするか、次を貼る。

```text
"Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic", Meiryo, sans-serif
```

**Q. 一部の設定画面だけ英語のまま**
そのプラグインが DSH のロケールを使っていない可能性がある。プラグイン名を教えてもらえれば切り分ける。

**Q. DSH を更新したら一部英語に戻った**
DSH がキーを追加している。`npm run check` で不足を確認し、その分を翻訳して再ビルドする。

## 翻訳を直す

辞書は `locale/ja/<namespace>.json`。一覧で見たいときは CSV を使う。

```bash
npm run review        # docs/review.csv を出力（Numbers / Excel で開ける）
# ja 列だけ編集して保存
npm run apply-review  # CSV の ja 列を locale/ja/*.json に反映
npm run check         # キー網羅・プレースホルダー・用語の検査
npm run audit         # 自然さの観点で警告
npm run build         # lib/client.js を再生成
```

用語と文体の判断基準は `docs/glossary.md`。用語を変えるなら先にこのファイルを直す。

## 構成

```text
locale/ja/*.json        日本語辞書（名前空間 = ファイル名）
lib/client.js           生成物。直接編集しない
lib/index.js            host 側は空
tools/en.baseline.json  英語の基準辞書
tools/vendor/manifest.json 外部プラグインの対応版
tools/build-client.mjs  辞書・フォント・組版を client.js に埋め込む
tools/check.mjs         品質検査（終了コードあり）
tools/audit.mjs         自然さの監査（助言のみ）
tools/review.mjs        CSV の書き出し・取り込み
docs/glossary.md        訳語と文体のガイドライン
docs/review.csv         レビュー用 CSV（生成物）
```

## メンテナ向け

```bash
npm publish --access public   # @kinocode スコープ
```

- `private` は外してある。`files` に `lib` / `locale` / `cordis.patch.yml` / README / LICENSE / CHANGELOG が入る
- 公開前に `npm pack --dry-run` で中身を確認する
- pnpm の `minimumReleaseAge` により、公開直後の版はインストールが遅れることがある
- DSH には公式マーケットが無い。配布は npm か Git、または自前の market index（実験的機能）になる
