# XTTS v2 クイックスタート

5分でXTTS v2を使い始めるための最短手順です。

## 1. インストール（1分）

```bash
# Python仮想環境を作成して有効化
python -m venv xtts-env
source xtts-env/bin/activate  # Windows: xtts-env\Scripts\activate

# Coqui TTSをインストール
pip install TTS
```

## 2. サーバー起動（2分）

```bash
# XTTSサーバーを起動（初回は自動でモデルをダウンロード）
tts-server --model_name tts_models/multilingual/multi-dataset/xtts_v2
```

サーバーが起動したら、ブラウザで http://localhost:8020/docs を開いて確認。

## 3. 音声サンプル準備（1分）

```bash
# 方法1: sayコマンドで音声生成（macOS）
say "Hello, this is my voice sample for XTTS" -o voice.wav

# 方法2: マイクで録音（macOS）
brew install sox  # 初回のみ
sox -d -r 22050 -c 1 voice.wav trim 0 10

# 方法3: 既存の音声ファイルを変換
ffmpeg -i your_voice.mp3 -ar 22050 -ac 1 voice.wav
```

## 4. saymで使用（1分）

新しいターミナルを開いて：

```bash
# 環境変数を設定
export XTTS_SERVER_URL="http://localhost:8020"
export XTTS_API_KEY="none"

# XTTSで音声合成
saym -p xtts -v "voice.wav" "こんにちは、XTTS v2のテストです"

# デフォルトに設定
saym use xtts
saym default-voice "voice.wav"
saym "これで簡単に使えます"
```

## よくある質問

### Q: サーバーを常時起動させたい
```bash
# バックグラウンドで起動
nohup tts-server --model_name tts_models/multilingual/multi-dataset/xtts_v2 > xtts.log 2>&1 &
```

### Q: GPUを使いたい
```bash
# GPU版をインストール
pip install TTS[gpu]

# GPU指定して起動
CUDA_VISIBLE_DEVICES=0 tts-server --model_name tts_models/multilingual/multi-dataset/xtts_v2
```

### Q: リモートサーバーで使いたい
```bash
# 全インターフェースでリッスン
tts-server --model_name tts_models/multilingual/multi-dataset/xtts_v2 --host 0.0.0.0

# クライアント側で接続
export XTTS_SERVER_URL="http://your-server:8020"
saym -p xtts -v "voice.wav" "リモートサーバーのテスト"
```

### Q: 日本語がうまく読み上げられない
```bash
# 言語を明示的に指定
saym -p xtts -v "voice.wav" -l ja "日本語のテキスト"
```

### Q: メモリ不足エラーが出る
```bash
# CPUモードで起動（遅いが省メモリ）
CUDA_VISIBLE_DEVICES="" tts-server --model_name tts_models/multilingual/multi-dataset/xtts_v2
```

## 次のステップ

- [詳細なセットアップガイド](./XTTS_SETUP.md)を読む
- 複数の音声サンプルを試す
- 異なる言語でテストする
- パフォーマンスを最適化する