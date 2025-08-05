# saym - Say iMproved

従来の `say` コマンドを拡張し、ElevenLabs APIを使用した高度な音声合成機能を提供する強力なテキスト読み上げコマンドラインツールです。自分の声から音声モデルを作成し、自然な音声で複数の言語を話すことができます。

## 実際の使用例

以下は、saymを使って日本語テキストを読み上げる実際の例です：

[saym使用例]([https://gyazo.com/b8b46d3b777ec97618d920183a1889fa](https://i.gyazo.com/b8b46d3b777ec97618d920183a1889fa.mp4))

この例では、saymコマンドの説明文をElevenLabsの高品質な音声合成エンジンを使って読み上げています。

## 機能

- 🎤 **カスタム音声モデリング**: ElevenLabsを通じて自分の音声モデルを訓練・使用
- 🌍 **多言語サポート**: 自動翻訳により様々な言語でテキストを読み上げ
- 🎯 **高品質合成**: ElevenLabsの高度なAI音声合成を活用
- 💬 **シンプルなCLIインターフェース**: ネイティブの `say` コマンドに似た使いやすいコマンドラインインターフェース
- 🔊 **音声出力オプション**: ファイルに保存またはスピーカーから直接再生
- 🎛️ **音声カスタマイズ**: 安定性、類似性ブースト、スタイルなどの音声パラメータを調整

## インストール

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/saym.git
cd saym

# 依存関係をインストール
npm install

# プロジェクトをビルド
npm run build

# ElevenLabs APIキーを設定
export ELEVENLABS_API_KEY="your-api-key-here"
```

### saym の実行方法

#### オプション1: npm/node を直接使用（開発時推奨）

```bash
# npm で実行
npm run dev "こんにちは世界"

# またはビルド済みバージョンを実行
node dist/cli.js "こんにちは世界"
```

#### オプション2: グローバルインストール

```bash
# グローバルにインストール
npm install -g .

# saym コマンドが使用可能に
saym "こんにちは世界"
```

#### オプション3: エイリアスを作成

```bash
# ~/.zshrc または ~/.bashrc に追加
alias saym="node /path/to/saym/dist/cli.js"

# シェル設定をリロード
source ~/.zshrc

# 使用可能に
saym "こんにちは世界"
```

## 使用方法

### 基本的な使い方

注: グローバルインストールしていない場合は、`saym` を `node dist/cli.js` に置き換えてください。

```bash
# デフォルト音声でテキストを読み上げ
saym "Hello, world!"
# または: node dist/cli.js "Hello, world!"

# 音声IDまたは名前で特定の音声モデルを使用
saym -v "voice-id-or-name" "これは私のカスタム音声です"

# ファイルから読み込み
saym -f input.txt

# 出力をファイルに保存
saym -o output.mp3 "この音声をファイルに保存"

# リアルタイム再生のための音声ストリーミング
saym -s "合成中にこのテキストをストリーミング"
```

### 音声管理

```bash
# 利用可能な音声をすべて表示
saym voice list

# 音声サンプルからカスタム音声モデルを作成
saym voice create -n "私の声" -d "個人用音声モデル" -s sample1.mp3 sample2.wav sample3.m4a

# カスタム音声を削除
saym voice delete <voice-id>
```

### 高度なオプション

```bash
# 音声パラメータを調整
saym --stability 0.8 --similarity 0.9 --style 0.2 "微調整された音声出力"

# 異なる音声形式を使用
saym --format wav -o output.wav "WAVファイルとして保存"

# 設定管理
saym config show                           # 現在の設定を表示
saym config set defaultVoice <voice-id>    # デフォルト音声を設定
saym config reset                          # デフォルトにリセット
```

### 自分の音声モデルを作成

1. **音声サンプルを準備**
   - 最低30秒のクリアな音声を録音
   - 高品質な録音を使用（背景ノイズを最小限に）
   - サポート形式: MP3、WAV、M4A、OGG、FLAC
   - 最大25ファイル、1ファイルあたり10MB

2. **音声モデルを作成**
   ```bash
   saym voice create \
     --name "私の個人音声" \
     --description "TTS用のカスタム音声" \
     --samples voice_sample_*.mp3
   ```

3. **音声を使用**
   ```bash
   # 作成時に返される音声IDを使用
   saym --voice <your-voice-id> "こんにちは、これは私の声です！"
   
   # またはデフォルトとして設定
   saym config set defaultVoice <your-voice-id>
   saym "今はデフォルトで私の声を使用しています！"
   ```

## 設定

ホームディレクトリに `.saymrc` ファイルを作成してデフォルト設定を行います：

```json
{
  "defaultVoice": "your-voice-id",
  "defaultLanguage": "ja",
  "autoTranslate": true,
  "outputFormat": "mp3"
}
```

## 必要要件

- Node.js 18+ または Deno
- ElevenLabs APIアカウントとAPIキー
- FFmpeg（音声形式変換用）

## APIキーのセットアップ

### 1. ElevenLabsアカウントを作成

1. [ElevenLabs](https://elevenlabs.io/)にアクセスし、「Sign Up」をクリック
2. メールまたはGoogle/GitHub認証でアカウントを作成
3. サブスクリプションプランを選択（無料プランあり、利用制限付き）

### 2. APIキーを生成

1. ElevenLabsダッシュボードにログイン
2. プロフィールアイコン（右上）→「Profile + API Key」をクリック
3. APIセクションで「Generate API Key」をクリック
4. 生成されたAPIキーを即座にコピー（再度表示されません）

### 3. APIキーの確認

APIキーの設定をテスト：

```bash
# 環境変数が設定されているか確認
echo $ELEVENLABS_API_KEY

# saym でテスト
saym voice list
```

## ライセンス

MITライセンス - 詳細はLICENSEファイルを参照してください
