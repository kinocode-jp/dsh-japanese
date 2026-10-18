# リリース手順

`@kinocode/dsh-japanese` を npm へ公開するときの手順と、現在の公開状態をまとめる。

## 現在の状態（2026-10-18 時点のスナップショット）

> 最新の翻訳状況は `node tools/check.mjs` で確認する。外部プラグインの名前空間は随時追加されるため、下表より `check` が正しい。

| 項目 | 値 |
|---|---|
| ローカルのバージョン | **0.1.4** |
| 翻訳範囲 | 76名前空間 / 5,404キー |
| npm の latest | **0.1.0**（0.1.1〜0.1.4 は未公開） |
| npm アカウント | `@kinocode` オーガニゼーションの owner |
| 認証方式 | **パスキー（WebAuthn）** |

## パスキー認証の制約

npm の2段階認証をパスキーで行っているため、**非対話のシェルからは公開できない**。

- `npm publish` は TTY 上でブラウザ認証（または認証コード）を要求する
- パイプやエージェント経由の実行では `EOTP` で止まる
- `--otp=` に渡せる6桁コードは、パスキー運用では発行されない

そのため、**公開だけは必ず人がターミナルから実行する**。エージェント側は「バージョン更新・翻訳・検査・ビルド・パッケージ確認・コミット」までを担当する。

## リリース手順

### 1. 事前確認（エージェントでも可）

```bash
cd /Volumes/D/Project/dsh-japanese
node tools/check.mjs          # 欠落・プレースホルダー・用語
node tools/build-client.mjs   # lib/client.js を再生成
node tools/smoke.mjs          # バンドルの読み込み確認
npm pack --dry-run            # 同梱物とサイズの確認
git status --short            # 未コミットが無いこと
```

`prepublishOnly` を設定してあるので、`npm publish` 実行時にも `check` と `build` が走る。

### 2. バージョン更新

`package.json` の `version` と `CHANGELOG.md` を更新してコミットする。

```bash
npm version patch --no-git-tag-version   # 例: 0.1.4 -> 0.1.5
# CHANGELOG.md に追記
git add -A && git commit -m "v0.1.5"
```

### 3. 公開（人がターミナルで実行）

```bash
cd /Volumes/D/Project/dsh-japanese
npm login --auth-type=web   # 初回のみ。ブラウザでパスキー認証
npm publish --access public
```

- 「Press ENTER to open in the browser」と出たら Enter を押し、ブラウザでパスキーを承認する
- URL が表示された場合は、その URL を開いて承認する
- 成功すると `+ @kinocode/dsh-japanese@0.1.4` のように表示される

### 4. 公開後の確認

```bash
npm view @kinocode/dsh-japanese dist-tags
npm view @kinocode/dsh-japanese versions --json
```

`latest` が今回のバージョンになり、`versions` に追加されていれば完了。

### 5. 利用者側の更新

```bash
dsh plugin --profile desktop add @kinocode/dsh-japanese@0.1.4
```

または Plugins 画面でバージョンを指定してインストール。反映には DSH の再起動が必要。

## トラブルシューティング

| 症状 | 原因と対処 |
|---|---|
| `EOTP` で止まる | 非対話環境。人がターミナルから実行する |
| ブラウザが開かない | 表示された URL を手動で開く。`npm login --auth-type=web` をやり直す |
| `403 Forbidden` | `@kinocode` オーガニゼーションの権限、またはパッケージ名の重複を確認 |
| 公開直後にインストールできない | pnpm の `minimumReleaseAge` により、公開から一定期間は自動インストールされない。日数を置くか、バージョンを明示して入れる |
| `latest` が古いまま | `dist-tags` を確認。必要なら `npm dist-tag add @kinocode/dsh-japanese@0.1.4 latest` |

## バージョニング方針

- `0.1.x`: 翻訳の追加・修正、外部プラグイン名前空間の追加
- `0.2.0`: 辞書形式やフォント既定など、利用者に見える挙動の変更
- DSH 本体の更新で名前空間が増えた場合は、`check` の差分を埋めてから minor/patch を判断する

## 公開済みバージョンの履歴

| バージョン | 状態 | 内容 |
|---|---|---|
| 0.1.0 | 公開済み | 初版（49名前空間 / 2,606キー、フォント既定） |
| 0.1.1 | 未公開 | 取りこぼし13名前空間の追加 |
| 0.1.2 | 未公開 | `agy`（Antigravity）追加 |
| 0.1.3 | 未公開 | 外部プラグイン4種の追加 |
| 0.1.4 | **公開待ち** | 外部プラグイン9種を追加（76名前空間 / 5,404キー） |
