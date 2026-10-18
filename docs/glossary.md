# 日本語訳のガイドライン（dsh-locale-ja）

翻訳者はこのファイルを唯一の判断基準にする。迷ったら「DSH の UI として自然か」を優先する。

## 1. 文体

| 種類 | 文体 | 例 |
|---|---|---|
| ボタン・メニュー・タブ・見出し | 体言止め、または動詞の辞書形 | 「保存」「新規セッション」「サイドバーを開く」 |
| 説明文・通知・エラー | です・ます調 | 「履歴を読み込めませんでした。」 |
| 状態表示 | 体言止め | 「実行中」「完了」「待機中」 |
| チェックボックスのラベル | 体言止め | 「自動保存」 |

- 文末に「。」を付けるのは説明文・エラー文のみ。ボタンやラベルには付けない。
- 「あなた」「あなたの」は使わない。所有は「ご」「お客様」ではなく、単に省略する。
- 「〜することができます」は「〜できます」に短縮する。
- 「〜してください」は操作説明では可。ボタンでは使わない。
- 一文を長くしない。英語の一文が長い場合は「。」で二文に割る。

## 2. 用語（必ずこの表記）

| English | 日本語 |
|---|---|
| session | セッション |
| workspace | ワークスペース |
| agent | エージェント |
| subagent | サブエージェント |
| skill | スキル |
| plugin | プラグイン |
| tool / tool call | ツール / ツール呼び出し |
| turn | ターン |
| step | ステップ |
| goal | ゴール |
| plan / plan mode | プラン / プランモード |
| permission | 権限 |
| approval | 承認 |
| preset / agent preset | プリセット / エージェントプリセット |
| model | モデル |
| provider | プロバイダー |
| token | トークン |
| prompt / system prompt | プロンプト / システムプロンプト |
| context / compaction | コンテキスト / コンテキスト圧縮 |
| trajectory | 実行履歴 |
| deliverable | 成果物 |
| job / background job | ジョブ / バックグラウンドジョブ |
| schedule | スケジュール |
| workflow | ワークフロー |
| reference | 参照 |
| attachment | 添付ファイル |
| branch / fork | 分岐 / フォーク |
| retry | 再試行 |
| quota | クォータ |
| credential / API key | 認証情報 / APIキー |
| sandbox | サンドボックス |
| sidebar | サイドバー |
| terminal | ターミナル |
| browser | ブラウザ |
| document preview | ドキュメントプレビュー |
| voice input | 音声入力 |
| feedback | フィードバック |
| theme | テーマ |
| shortcut | ショートカット |
| account / sign in / sign out | アカウント / サインイン / サインアウト |
| reasoning / thinking | 推論 / 思考 |
| deep dive | 深掘り |
| cache hit | キャッシュヒット |
| usage | 使用量 |
| transcript / work details | 会話ログ / 作業の詳細 |
| snapshot / checkpoint | スナップショット / チェックポイント |
| turn navigation | ターン移動 |
| notification | 通知 |

### 訳してはいけないもの

製品名・技術名・ファイル名・コマンド・URL・略語はそのまま残す。

- 製品・サービス: DeepSeek, DSH, Cordis, GitHub, Git, npm, pnpm, Node.js, Python
- 技術: API, CLI, MCP, JSON, YAML, HTML, Markdown, URL, SDK, SSE, RAG, LSP, TTFT, TPS, LSP
- OS: macOS, Windows, Linux
- 拡張子・パス・環境変数: `.json`, `~/.dsh`, `DSH_HOME`, `{path}` など

## 3. プレースホルダー

`{name}` `{count}` `{message}` などの波括弧トークンは**一字も変えない**。並び順の変更は可、翻訳・空白追加は不可。

- `{count} messages` → `{count}件のメッセージ`
- `Failed: {message} ({code})` → `失敗しました: {message}（{code}）`
- `{n}h` → `{n}時間` ではなく `{n}h`（単位系として英語のまま使う箇所は維持）

日本語の助数詞は数字の直後に付ける（`{count} 件` ではなく `{count}件`）。

## 4. 記号・レイアウト

- 句読点は全角「、」「。」。括弧は全角「（）」。
- 省略記号は「…」（三点リーダー1個）。英語の `...` も `…` に統一する。
- 中黒「・」は並列に使う。カタカナ語の区切りには使わない。
- 文字列内の Markdown（`###`, `>`, `-`, `**`）と改行はそのまま維持する。
- 前後の半角スペースを残さない（英語由来の末尾スペースは削除してよい）。

## 5. 良い例 / 悪い例

| English | 良い | 悪い |
|---|---|---|
| New Session | 新規セッション | 新しいセッションを作成する |
| Open sidebar | サイドバーを開く | サイドバーを開いてください |
| Collapse sidebar | サイドバーを折りたたむ | サイドバーを崩壊させる |
| Loading history… | 履歴を読み込み中… | 履歴をロードしています・・・ |
| Failed to load history: {message} ({code}) | 履歴を読み込めませんでした: {message}（{code}） | 履歴の読み込みに失敗しました：{message}（{code}） |
| Deep diving for {duration} | {duration}深掘り中… | {duration}の間、深く潜っています |
| You can restore it later | 後で復元できます | あなたは後でそれを復元することができます |

## 6. 迷ったときの判断

1. 同じ概念が別画面にも出るなら、用語表の訳語を優先する（画面ごとに言い換えない）。
2. 直訳より、その画面でユーザーが取る行動が伝わる短い表現を選ぶ。
3. 英語にない情報を足さない。英語にある情報を落とさない。
4. どうしても自然な日本語にできない固有名詞は英語のまま残す。
