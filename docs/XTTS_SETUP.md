# XTTS v2 セットアップガイド

XTTS v2は、Coqui AIが開発した高品質な多言語音声合成システムです。自分のサーバーで動作させることができ、APIコストなしで利用できます。

## 目次
- [特徴](#特徴)
- [システム要件](#システム要件)
- [インストール方法](#インストール方法)
- [サーバーの起動](#サーバーの起動)
- [saymでの使用方法](#saymでの使用方法)
- [音声サンプルの準備](#音声サンプルの準備)
- [トラブルシューティング](#トラブルシューティング)
- [詳細設定](#詳細設定)

## 特徴

- **多言語対応**: 16言語に対応（日本語、英語、スペイン語、フランス語など）
- **音声クローニング**: 短い音声サンプル（6-10秒）から声を複製
- **セルフホスト**: 自分のサーバーで動作、プライバシー保護
- **無料**: APIコストなし、GPUがあれば高速処理

## システム要件

### 最小要件
- Python 3.8以上
- 4GB RAM
- 5GB ディスク空き容量

### 推奨要件
- Python 3.9-3.11
- 8GB RAM以上
- NVIDIA GPU（CUDA対応）
- 10GB ディスク空き容量

## インストール方法

### 方法1: pipでインストール（推奨）

```bash
# 仮想環境を作成（推奨）
python -m venv xtts-env
source xtts-env/bin/activate  # Windows: xtts-env\Scripts\activate

# Coqui TTSをインストール
pip install TTS

# GPUサポート（CUDA）を有効にする場合
pip install TTS[gpu]
```

### 方法2: Dockerを使用

```bash
# Docker イメージをプル
docker pull ghcr.io/coqui-ai/tts

# コンテナを起動
docker run -it -p 8020:8020 \
  -v ~/tts-models:/root/.local/share/tts \
  ghcr.io/coqui-ai/tts \
  tts-server --model_name tts_models/multilingual/multi-dataset/xtts_v2
```

### 方法3: ソースからインストール

```bash
# リポジトリをクローン
git clone https://github.com/coqui-ai/TTS
cd TTS

# 開発モードでインストール
pip install -e .
```

## サーバーの起動

### 基本的な起動

```bash
# デフォルト設定で起動（ポート8020）
tts-server --model_name tts_models/multilingual/multi-dataset/xtts_v2
```

### カスタム設定での起動

```bash
# カスタムポートで起動
tts-server --model_name tts_models/multilingual/multi-dataset/xtts_v2 --port 8080

# GPUを指定して起動
CUDA_VISIBLE_DEVICES=0 tts-server --model_name tts_models/multilingual/multi-dataset/xtts_v2

# デバッグモードで起動
tts-server --model_name tts_models/multilingual/multi-dataset/xtts_v2 --debug
```

### システムサービスとして起動（Linux）

`/etc/systemd/system/xtts.service`を作成:

```ini
[Unit]
Description=XTTS v2 TTS Server
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/home/your-username
Environment="PATH=/home/your-username/xtts-env/bin"
ExecStart=/home/your-username/xtts-env/bin/tts-server --model_name tts_models/multilingual/multi-dataset/xtts_v2
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
# サービスを有効化して起動
sudo systemctl enable xtts
sudo systemctl start xtts
sudo systemctl status xtts
```

## saymでの使用方法

### 環境変数の設定

```bash
# XTTSサーバーのURL（デフォルト: http://localhost:8020）
export XTTS_SERVER_URL="http://localhost:8020"

# 認証が必要な場合のAPIキー（オプション）
export XTTS_API_KEY="your-api-key"  # または "none" で認証なし
```

### 基本的な使用方法

```bash
# XTTSを使用してテキストを読み上げ
saym -p xtts -v "voice.wav" "こんにちは、XTTS v2です！"

# デフォルトプロバイダーとして設定
saym use xtts
saym default-voice "my_voice.wav"

# 設定後はシンプルに使用
saym "これはXTTS v2で読み上げています"
```

### 利用可能な音声を確認

```bash
# XTTSサーバーで利用可能な音声ファイルを表示
saym voices -p xtts
```

## 音声サンプルの準備

### 音声サンプルの要件

- **形式**: WAV形式（推奨）またはMP3
- **長さ**: 6-10秒が理想的
- **品質**: 
  - サンプリングレート: 22050Hz以上
  - ビット深度: 16bit以上
  - モノラルまたはステレオ
- **内容**: クリアな音声、背景ノイズが少ない

### 音声サンプルの作成

```bash
# 既存の音声ファイルを適切な形式に変換
ffmpeg -i input.mp3 -ar 22050 -ac 1 voice.wav

# macOS: まずsoxをインストール
brew install sox

# 音声を録音（macOS）
sox -d -r 22050 -c 1 voice.wav trim 0 10

# 音声を録音（Linux）
arecord -f cd -t wav -d 10 voice.wav
```

### 音声サンプルの配置

XTTSサーバーが音声ファイルにアクセスできる場所に配置:

```bash
# XTTSサーバーのディレクトリ構造例
~/xtts-voices/
├── japanese_male.wav
├── japanese_female.wav
├── english_narrator.wav
└── custom_voice.wav
```

## トラブルシューティング

### サーバーが起動しない

```bash
# ポートが使用中か確認
lsof -i :8020  # macOS/Linux
netstat -ano | findstr :8020  # Windows

# 別のポートで起動
tts-server --model_name tts_models/multilingual/multi-dataset/xtts_v2 --port 8081
```

### メモリ不足エラー

```bash
# CPUモードで起動（遅いが省メモリ）
CUDA_VISIBLE_DEVICES="" tts-server --model_name tts_models/multilingual/multi-dataset/xtts_v2

# バッチサイズを小さくする
tts-server --model_name tts_models/multilingual/multi-dataset/xtts_v2 --batch_size 1
```

### 音声品質が悪い

1. **音声サンプルの品質を確認**
   ```bash
   # 音声ファイルの情報を表示
   ffprobe voice.wav
   ```

2. **高品質な音声サンプルを使用**
   ```bash
   # ノイズ除去
   sox voice.wav voice_clean.wav noisered noise.prof 0.3
   ```

3. **言語設定を明示的に指定**
   ```bash
   saym -p xtts -v "voice.wav" -l ja "日本語のテキスト"
   ```

### 接続エラー

```bash
# サーバーが起動しているか確認
curl http://localhost:8020/docs

# ファイアウォール設定を確認（リモートサーバーの場合）
sudo ufw allow 8020/tcp  # Ubuntu/Debian
sudo firewall-cmd --add-port=8020/tcp --permanent  # CentOS/RHEL
```

## 詳細設定

### 設定ファイル（.saymrc）

```json
{
  "ttsProvider": "xtts",
  "providers": {
    "xtts": {
      "apiKey": "none",
      "serverUrl": "http://localhost:8020",
      "defaultVoice": "my_voice.wav"
    }
  }
}
```

### 複数のXTTSサーバーを使用

```bash
# 開発環境
export XTTS_SERVER_URL="http://localhost:8020"
saym -p xtts "開発環境のテスト"

# 本番環境
export XTTS_SERVER_URL="https://xtts.example.com"
saym -p xtts "本番環境のテスト"
```

### Nginxリバースプロキシ設定

```nginx
server {
    listen 443 ssl http2;
    server_name xtts.example.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:8020;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # タイムアウト設定（長いテキストの処理用）
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
```

### パフォーマンスチューニング

```bash
# GPU使用時の最適化
export CUDA_VISIBLE_DEVICES=0
export TF_FORCE_GPU_ALLOW_GROWTH=true

# CPUスレッド数の設定
export OMP_NUM_THREADS=4

# メモリ使用量の制限
export PYTORCH_CUDA_ALLOC_CONF=max_split_size_mb:512
```

## 対応言語

XTTS v2は以下の言語に対応しています：

- 🇯🇵 日本語 (ja)
- 🇬🇧 英語 (en)
- 🇪🇸 スペイン語 (es)
- 🇫🇷 フランス語 (fr)
- 🇩🇪 ドイツ語 (de)
- 🇮🇹 イタリア語 (it)
- 🇵🇹 ポルトガル語 (pt)
- 🇵🇱 ポーランド語 (pl)
- 🇹🇷 トルコ語 (tr)
- 🇷🇺 ロシア語 (ru)
- 🇳🇱 オランダ語 (nl)
- 🇨🇿 チェコ語 (cs)
- 🇸🇦 アラビア語 (ar)
- 🇨🇳 中国語 (zh-cn)
- 🇭🇺 ハンガリー語 (hu)
- 🇰🇷 韓国語 (ko)
- 🇮🇳 ヒンディー語 (hi)

## リソース

- [Coqui TTS GitHub](https://github.com/coqui-ai/TTS)
- [XTTS v2 ドキュメント](https://docs.coqui.ai/en/latest/models/xtts.html)
- [Coqui TTS フォーラム](https://github.com/coqui-ai/TTS/discussions)
- [saym GitHub](https://github.com/yourusername/saym)

## ライセンス

XTTS v2は[Coqui Public Model License](https://coqui.ai/cpml)の下で提供されています。商用利用の際はライセンス条項を確認してください。