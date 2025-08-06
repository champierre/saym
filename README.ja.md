# saym - Say iMproved

従来の `say` コマンドを拡張し、ElevenLabsとCartesia APIを使用した高度な音声合成機能を提供する強力なテキスト読み上げコマンドラインツールです。複数のプロバイダーから提供される高品質な音声モデルを使用して、自然な音声でテキストを読み上げることができます。

## 実際の使用例（音声付き）

以下は、saymを使って日本語テキストを読み上げる音声付きの動画例です：

[📹️ saym使用例（クリックして音声付きで再生）](https://i.gyazo.com/319de9dd7df24aa583ea7972ffd50b3b.mp4)

この動画では、saymコマンドの説明文をElevenLabsの高品質な音声合成エンジンを使って読み上げています。音声をオンにして合成音声をお聞きください！

## 機能

- 🎯 **高品質合成**: 複数のプロバイダーの高度なAI音声合成を活用
- 💬 **シンプルなCLIインターフェース**: ネイティブの `say` コマンドに似た使いやすいコマンドラインインターフェース
- 🔊 **音声出力オプション**: ファイルに保存またはスピーカーから直接再生
- 🎛️ **音声カスタマイズ**: プロバイダー最適化設定による高品質音声合成
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

# 正確な発音のために言語を指定（日本語などの非英語に重要）
saym -v "voice-id" -l ja "今日は良い天気ですね"

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
# 現在のプロバイダーで利用可能な音声を表示（所有音声のみ）
saym voices

# 特定のプロバイダーから音声を表示
saym voices -p cartesia

# すべての公開音声を表示（既製音声を含む）
saym voices --all
```

### 言語サポート

```bash
# ElevenLabsで日本語（正確な発音のため推奨）
saym -v "japanese-voice-id" -l ja "今日は良い天気ですね"

# スペイン語で言語を明示的に指定
saym -v "spanish-voice-id" -l es "Hola, ¿cómo estás?"

# Cartesia（自動言語検出）
saym -p cartesia -v "voice-id" "今日は"
```

### 高度なオプション

```bash
# 異なる音声形式を使用
saym --format wav -o output.wav "WAVファイルとして保存"

# 設定管理
saym config show                      # 現在の設定を表示
saym use elevenlabs                   # ElevenLabsに切り替え（簡単！）
saym use cartesia                     # Cartesiaに切り替え（簡単！）
saym default-voice <voice-id>         # 現在のプロバイダーのデフォルト音声を設定
saym default-voice <voice-id> -p cartesia # 特定プロバイダーのデフォルト音声を設定

# 上級者向け設定
saym config provider elevenlabs       # プロバイダー設定の別方法
saym config voice <voice-id>          # 音声設定の別方法
saym config reset                     # デフォルトにリセット

# サポートされているプロバイダーを表示
saym providers
```

### カスタム音声モデルの使用

カスタム音声モデルを作成するには、ElevenLabsまたはCartesiaのウェブインターフェースを使用してください：

- **ElevenLabs**: [ElevenLabs Voice Lab](https://elevenlabs.io/voice-lab)にアクセスしてカスタム音声を作成・訓練
- **Cartesia**: [Cartesia](https://cartesia.ai/)にアクセスして音声クローニング機能を利用

これらのサービスでカスタム音声を作成したら、saymで使用できます：

```bash
# カスタム音声IDを使用
saym --voice <your-voice-id> "こんにちは、これは私の声です！"

# またはデフォルトとして設定
saym config set defaultVoice <your-voice-id>
saym "今はデフォルトで私の声を使用しています！"
```

## 設定

ホームディレクトリに `.saymrc` ファイルを作成してデフォルト設定を行います：

```json
{
  "defaultVoice": "グローバルフォールバック音声ID",
  "defaultLanguage": "ja",
  "outputFormat": "mp3",
  "ttsProvider": "elevenlabs",
  "providers": {
    "elevenlabs": {
      "apiKey": "環境変数にない場合はオプション",
      "defaultVoice": "elevenlabs専用音声ID"
    },
    "cartesia": {
      "apiKey": "環境変数にない場合はオプション",
      "defaultVoice": "cartesia専用音声ID"
    }
  }
}
```

### デフォルトプロバイダーと音声の設定

saymは音声選択に優先順位システムを使用します：
1. **コマンドライン指定** (`-v voice-id`) - 最優先
2. **プロバイダー固有デフォルト音声** - プロバイダーごとのデフォルト
3. **グローバルデフォルト音声** - 全プロバイダーのフォールバック

#### ステップ1: デフォルトTTSプロバイダーの選択

```bash
# ElevenLabsをデフォルトに設定（高品質、高価）
saym use elevenlabs

# またはCartesiaをデフォルトに設定（超低遅延、コスト効率的）
saym use cartesia
```

#### ステップ2: 利用可能な音声を確認

```bash
# デフォルトプロバイダーの音声一覧
saym voice list

# 特定プロバイダーの音声一覧
saym voice list -p elevenlabs
saym voice list -p cartesia

# すべての音声を表示（公開音声も含む）
saym voice list --all
saym voice list -p cartesia --all
```

#### ステップ3: プロバイダー固有デフォルト音声の設定

```bash
# ElevenLabsのデフォルト音声を設定
saym config set-default-voice elevenlabs "21m00Tcm4TlvDq8ikWAM"

# Cartesiaのデフォルト音声を設定
saym config set-default-voice cartesia "694f9389-aac1-45b6-b726-9d9369183238"

# オプション: グローバルフォールバック音声を設定
saym config set defaultVoice "some-voice-id"
```

#### ステップ4: 設定のテスト

```bash
# デフォルトプロバイダーとその音声を使用
saym "こんにちは世界"

# 特定プロバイダーとそのデフォルト音声を使用
saym -p elevenlabs "ElevenLabsからこんにちは"
saym -p cartesia "Cartesiaからこんにちは"

# 特定の音声で上書き
saym -p elevenlabs -v "different-voice-id" "特定の音声でこんにちは"
```

#### ステップ5: 設定の確認

```bash
# 現在の設定をすべて表示
saym config show

# サポートされているプロバイダーを表示
saym providers
```

### クイック設定例

**ElevenLabsユーザー向け（超簡単！）:**
```bash
# 1. ElevenLabsに切り替え
saym use elevenlabs

# 2. 好みの音声を見つける
saym voice list

# 3. デフォルトとして設定
saym default-voice "your-voice-id"

# 4. テスト
saym "これはElevenLabsのデフォルト音声を使用します"
```

**Cartesiaユーザー向け（超簡単！）:**
```bash
# 1. Cartesiaに切り替え
saym use cartesia

# 2. 好みの音声を見つける（デフォルトでは所有音声のみ）
saym voice list

# 3. デフォルトとして設定
saym default-voice "your-voice-id"

# 4. テスト
saym "これはCartesiaのデフォルト音声を使用します"
```

**両プロバイダーを使用するユーザー向け:**
```bash
# デフォルトプロバイダーを設定
saym use cartesia

# 両プロバイダーのデフォルト音声を設定
saym default-voice "cartesia-voice-id"              # 現在の（cartesia）用
saym default-voice "elevenlabs-voice-id" -p elevenlabs  # elevenlabs用

# 簡単に切り替え可能:
saym "Cartesiaを使用（デフォルトプロバイダー）"
saym -p elevenlabs "ElevenLabsとそのデフォルト音声を使用"
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
