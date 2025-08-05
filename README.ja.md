# saym - Say iMproved

従来の `say` コマンドを拡張し、ElevenLabsとCartesia APIを使用した高度な音声合成機能を提供する強力なテキスト読み上げコマンドラインツールです。自分の声から音声モデルを作成し、自然な音声で複数の言語を話すことができます。

## 実際の使用例（音声付き）

以下は、saymを使って日本語テキストを読み上げる音声付きの動画例です：

[📹️ saym使用例（クリックして音声付きで再生）](https://i.gyazo.com/319de9dd7df24aa583ea7972ffd50b3b.mp4)

この動画では、saymコマンドの説明文をElevenLabsの高品質な音声合成エンジンを使って読み上げています。音声をオンにして合成音声をお聞きください！

## 機能

- 🎤 **カスタム音声モデリング**: ElevenLabsとCartesiaを通じて自分の音声モデルを訓練・使用
- 🌍 **多言語サポート**: 自動翻訳により様々な言語でテキストを読み上げ
- 🎯 **高品質合成**: 複数のプロバイダーの高度なAI音声合成を活用
- 💬 **シンプルなCLIインターフェース**: ネイティブの `say` コマンドに似た使いやすいコマンドラインインターフェース
- 🔊 **音声出力オプション**: ファイルに保存またはスピーカーから直接再生
- 🎛️ **音声カスタマイズ**: 安定性、類似性ブースト、スタイルなどの音声パラメータを調整
- 🔄 **複数プロバイダー**: ElevenLabsとCartesia TTS APIの両方をサポート

## インストール

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/saym.git
cd saym

# 依存関係をインストール
npm install

# プロジェクトをビルド
npm run build

# APIキーを設定（少なくとも1つは必要）
export ELEVENLABS_API_KEY="your-elevenlabs-api-key"
export CARTESIA_API_KEY="your-cartesia-api-key"
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

# デフォルトのElevenLabsの代わりにCartesiaプロバイダーを使用
saym -p cartesia -v "694f9389-aac1-45b6-b726-9d9369183238" "Cartesiaからこんにちは！"

# ファイルから読み込み
saym -f input.txt

# 出力をファイルに保存
saym -o output.mp3 "この音声をファイルに保存"

# リアルタイム再生のための音声ストリーミング
saym -s "合成中にこのテキストをストリーミング"
```

### 音声管理

```bash
# 利用可能な音声をすべて表示（デフォルトプロバイダー）
saym voice list

# 特定のプロバイダーから音声を表示
saym voice list -p cartesia

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
saym config set ttsProvider cartesia       # デフォルトTTSプロバイダーを設定
saym config reset                          # デフォルトにリセット

# サポートされているプロバイダーを表示
saym providers
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
  "outputFormat": "mp3",
  "ttsProvider": "elevenlabs",
  "providers": {
    "elevenlabs": {
      "apiKey": "環境変数にない場合はオプション"
    },
    "cartesia": {
      "apiKey": "環境変数にない場合はオプション"
    }
  }
}
```

## 必要要件

- Node.js 18+ または Deno
- 少なくとも1つのTTSプロバイダーのAPIキー：
  - ElevenLabs APIアカウントとAPIキー、または
  - Cartesia APIアカウントとAPIキー
- FFmpeg（音声形式変換用）

## APIキーのセットアップ

ElevenLabsまたはCartesia（または両方）を使用できます。それぞれの設定方法は次のとおりです：

### ElevenLabsセットアップ

#### 1. ElevenLabsアカウントを作成

1. [ElevenLabs](https://elevenlabs.io/)にアクセスし、「Sign Up」をクリック
2. メールまたはGoogle/GitHub認証でアカウントを作成
3. サブスクリプションプランを選択（無料プランあり、利用制限付き）

#### 2. ElevenLabs APIキーを生成

1. ElevenLabsダッシュボードにログイン
2. プロフィールアイコン（右上）→「Profile + API Key」をクリック
3. APIセクションで「Generate API Key」をクリック
4. 生成されたAPIキーを即座にコピー（再度表示されません）

### Cartesiaセットアップ

#### 1. Cartesiaアカウントを作成

1. [Cartesia](https://cartesia.ai/)にアクセスしてアクセス登録
2. アカウントを作成してAPIアクセスを取得
3. Cartesiaは超低遅延TTSをSonicモデルで提供

#### 2. Cartesia APIキーを生成

1. Cartesiaダッシュボードにログイン
2. APIキーセクションに移動
3. APIキーを生成してコピー

### 3. APIキーの確認

APIキーの設定をテスト：

```bash
# 環境変数が設定されているか確認
echo $ELEVENLABS_API_KEY
echo $CARTESIA_API_KEY

# saym でテスト（ElevenLabs）
saym voice list

# saym でテスト（Cartesia）
saym voice list -p cartesia
```

## ライセンス

MITライセンス - 詳細はLICENSEファイルを参照してください
