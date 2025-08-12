# XTTS v2 セットアップガイド

XTTS v2は、Coqui AIが開発した高品質な多言語音声合成システムです。自分のサーバーで動作させることができ、APIコストなしで利用できます。

## 動作確認済みの方法（macOS/Linux）

```bash
# 1. Python仮想環境を作成して有効化
python3 -m venv ~/python/xtts-env
source ~/python/xtts-env/bin/activate

# 2. 必要なパッケージをインストール
pip install TTS flask flask-cors

# 3. カスタムサーバースクリプトをダウンロード
curl -o ~/python/xtts_server.py https://raw.githubusercontent.com/champierre/saym/main/scripts/xtts_server.py
# または、上記で作成したxtts_server.pyを使用

# 4. サーバーを起動（初回はモデルを自動ダウンロード）
python3 ~/python/xtts_server.py --port 8020

# 別ターミナルで動作確認
curl http://localhost:8020/health
```

## 2. 音声サンプル準備

XTTS v2では、あなたの声をクローンするために6-10秒程度の音声サンプルが必要です。以下の方法で録音してください：

```bash
# macOSの場合（コマンドラインで録音）
# 1. QuickTime Playerで録音
open -a "QuickTime Player"
# 新規オーディオ録音 > 録音 > 6-10秒間話す > 停止 > voice.wavとして~/python/に保存

# 2. または sox コマンドで録音（事前にbrew install soxが必要）
sox -d -r 22050 -c 1 ~/python/voice.wav trim 0 10

# Linuxの場合（arecord使用）
arecord -f cd -t wav -d 10 ~/python/voice.wav

# 既存の音声ファイルを使用する場合（適切な形式に変換）
ffmpeg -i your_voice_file.mp3 -ar 22050 -ac 1 ~/python/voice.wav
```

**録音のコツ：**
- はっきりと話す（6-10秒程度）
- 背景ノイズを避ける
- 自然な口調で話す

## 3. saymで使用

```bash
# 環境変数を設定
export XTTS_SERVER_URL="http://localhost:8020"
export XTTS_API_KEY="none"

# XTTSで音声合成
saym -p xtts -v "~/python/voice.wav" "こんにちは、XTTS v2のテストです"

# デフォルトに設定して使用
saym use xtts
saym default-voice "~/python/voice.wav"
saym "これで簡単に使えます"
```

