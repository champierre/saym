# saym 使用例 - 自分の声モデルを作成して使用する

## 1. 環境設定

```bash
# ElevenLabsのAPIキーを設定
export ELEVENLABS_API_KEY="your-api-key-here"

# パッケージをインストール
npm install

# ビルド
npm run build
```

## 2. 自分の声モデルを作成

### 音声サンプルの準備
- 30秒以上のクリアな音声録音を用意
- 対応フォーマット: MP3, WAV, M4A, OGG, FLAC
- ファイルサイズ: 各ファイル10MB以下
- ファイル数: 最大25ファイル

### 声モデルの作成コマンド

```bash
# 単一のサンプルファイルから作成
node dist/cli.js voice create -n "My Voice" -d "私の声モデル" -s my_voice_sample.mp3

# 複数のサンプルファイルから作成（推奨）
node dist/cli.js voice create \
  --name "My Voice" \
  --description "高品質な私の声モデル" \
  --samples sample1.mp3 sample2.wav sample3.m4a
```

## 3. 作成した声モデルを使用

```bash
# 声モデルのリストを確認
node dist/cli.js voice list

# 作成した声IDを使って音声合成
node dist/cli.js --voice <your-voice-id> "こんにちは、これは私の声です"

# デフォルト音声として設定
node dist/cli.js config set defaultVoice <your-voice-id>

# 以降はvoiceオプション無しで使用可能
node dist/cli.js "デフォルトで私の声が使われます"
```

## 4. 高度な使用例

### 音声パラメータの調整

```bash
# 安定性と類似性を調整
node dist/cli.js \
  --voice <your-voice-id> \
  --stability 0.8 \
  --similarity 0.9 \
  --style 0.2 \
  "より自然な音声になります"
```

### ファイル出力

```bash
# MP3ファイルとして保存
node dist/cli.js --voice <your-voice-id> -o output.mp3 "この音声をファイルに保存"

# WAVフォーマットで保存
node dist/cli.js --voice <your-voice-id> --format wav -o output.wav "WAVファイルとして保存"
```

### ストリーミング再生

```bash
# リアルタイムストリーミング（長文に最適）
node dist/cli.js --voice <your-voice-id> -s "長い文章をストリーミングで再生します..."
```

## 5. 声モデルの管理

```bash
# 不要な声モデルを削除
node dist/cli.js voice delete <voice-id>

# 設定を確認
node dist/cli.js config show
```

## トラブルシューティング

1. **APIキーエラー**: 環境変数 `ELEVENLABS_API_KEY` が正しく設定されているか確認
2. **音声サンプルエラー**: ファイル形式とサイズを確認（MP3/WAV推奨、10MB以下）
3. **再生エラー**: macOSでは `afplay` が自動的に使用されます
4. **ビルドエラー**: Node.js 18以上がインストールされているか確認