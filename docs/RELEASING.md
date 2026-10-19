# リリース手順

`@kinocode/dsh-japanese` を npm へ公開するときの手順と、現在の公開状態をまとめる。

## 現在の状態（2026-10-18 時点のスナップショット）

> 最新の翻訳状況は `node tools/check.mjs` で確認する。外部プラグインの名前空間は随時追加されるため、下表より `check` が正しい。

| 項目 | 値 |
|---|---|
| ローカルのバージョン | **0.1.4** |
| 翻訳範囲 | 76名前空間 / 5,404キー |
| npm の latest | **0.1.0**（0.1.1〜0.1.4 は未公開） |
| 公開の方法 | kinocode-jp のリポジトリから GitHub Actions（Trusted Publishing）で公開 |

## 公開の名義（決まり）

- `@kinocode/dsh-japanese` は、GitHub の組織 **kinocode-jp** の公開リポジトリ `kinocode-jp/dsh-japanese` から、GitHub Actions の「Publish to npm」（`.github/workflows/publish.yml`）で公開する。npm の Trusted Publishing（OIDC）を使う。
- **個人の npm アカウントから `npm publish` しない。** 手元から公開すると、npm に公開者としてその個人アカウントの名前とメールアドレスが記録され、公開データに載る。Trusted Publishing なら、公開者は「GitHub Actions」と記録され、どのリポジトリのどのコミットから作ったか（provenance）が付く。npm のトークンも保存しない。
- npm の組織 `kinocode` は、ログインも公開もできない（公開するのは、組織に入っているユーザーか、登録したワークフロー）。
- コミットの作者は `kinocode <noreply@kinocode.jp>` にする。PR は GitHub の画面でマージしない（画面でマージすると、操作した人の個人の名前とメールが作者になる）。手元で fast-forward してから push する。

## 公開の手順

1. `package.json` の `version`を上げ、CHANGELOG があれば追記してコミットする（作者は kinocode）。
2. PR を作り、CI が通ったら手元で `main` に fast-forward して push する。
3. `node tools/check.mjs`・`node tools/build-client.mjs`・`node tools/smoke.mjs`・`npm pack --dry-run` で確かめる（ワークフローでも、公開時に `prepublishOnly` が `check` と `build` を実行する）。
4. 版のタグを付けて push する。

   ```bash
   git tag v<version>
   git push origin v<version>
   ```

5. 「Publish to npm」が、タグと `package.json` の `version` が同じかを確かめてから公開する。違えば止まる。
6. 確かめる。

   ```bash
   npm view @kinocode/dsh-japanese version
   npm view @kinocode/dsh-japanese@<version> _npmUser   # GitHub Actions になっていること
   ```

## 最初に一度だけ: npm 側の設定（組織のオーナーがブラウザで行う）

1. npmjs.com でパッケージ `@kinocode/dsh-japanese` の **Settings** を開き、**Trusted Publisher** で **GitHub Actions** を選んで、次を登録する。
   - Organization or user: `kinocode-jp`
   - Repository: `dsh-japanese`
   - Workflow filename: `publish.yml`
2. 同じ画面の **Publishing access** で「Require two-factor authentication and disallow tokens」を選ぶ。トークンでの公開が止まり、ワークフローからの公開と、2 段階認証付きの手作業だけになる。
3. 個人アカウントを組織 `kinocode` から外すときは、組織のオーナーが少なくとも 1 人残るようにする。すでに公開した版の公開者の記録は、あとから変えられない。

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

### 3. 公開（GitHub Actions）

上の「公開の手順」のとおり、`v<version>` のタグを push すると、ワークフロー「Publish to npm」が公開する。個人の npm アカウントで `npm login` / `npm publish` はしない。

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
| ワークフローが `ENEEDAUTH` / `403` で止まる | npm 側で Trusted Publisher（`kinocode-jp` / `dsh-japanese` / `publish.yml`）が登録されているか確かめる |
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
