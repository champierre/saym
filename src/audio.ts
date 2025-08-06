import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { Readable } from 'stream';

const execAsync = promisify(exec);

export class AudioPlayer {
  private tempDir: string;

  constructor() {
    this.tempDir = path.join(os.tmpdir(), 'saym');
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * Play audio from buffer
   */
  async playAudio(audioBuffer: Buffer, format: string = 'mp3'): Promise<void> {
    const tempFile = path.join(this.tempDir, `temp_${Date.now()}.${format}`);
    
    try {
      await fs.promises.writeFile(tempFile, audioBuffer);
      await this.playFile(tempFile);
    } finally {
      // Clean up temp file
      if (fs.existsSync(tempFile)) {
        await fs.promises.unlink(tempFile);
      }
    }
  }

  /**
   * Play audio from stream
   */
  async playStream(audioStream: Readable, format: string = 'mp3'): Promise<void> {
    const tempFile = path.join(this.tempDir, `stream_${Date.now()}.${format}`);
    
    try {
      // Save stream to temp file
      await new Promise<void>((resolve, reject) => {
        const writeStream = fs.createWriteStream(tempFile);
        audioStream.pipe(writeStream);
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
        audioStream.on('error', reject);
      });

      await this.playFile(tempFile);
    } finally {
      // Clean up temp file
      if (fs.existsSync(tempFile)) {
        await fs.promises.unlink(tempFile);
      }
    }
  }

  /**
   * Play audio file
   */
  async playFile(filePath: string): Promise<void> {
    const platform = process.platform;
    let command: string;

    switch (platform) {
      case 'darwin': // macOS
        command = `afplay "${filePath}"`;
        break;
      case 'linux': {
        // Try multiple players in order of preference
        const players = ['mpg123', 'ffplay', 'aplay', 'mplayer'];
        const availablePlayer = await this.findAvailablePlayer(players);
        if (!availablePlayer) {
          throw new Error('No audio player found. Please install mpg123, ffplay, or mplayer.');
        }
        command = `${availablePlayer} "${filePath}"`;
        break;
      }
      case 'win32': // Windows
        command = `powershell -c "(New-Object Media.SoundPlayer '${filePath}').PlaySync();"`;
        break;
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }

    try {
      await execAsync(command);
    } catch (error) {
      throw new Error(`Failed to play audio: ${error}`);
    }
  }

  /**
   * Convert audio format using ffmpeg
   */
  async convertAudio(inputPath: string, outputPath: string): Promise<void> {
    const ffmpegAvailable = await this.isCommandAvailable('ffmpeg');
    if (!ffmpegAvailable) {
      throw new Error('ffmpeg is required for audio format conversion. Please install ffmpeg.');
    }

    try {
      await execAsync(`ffmpeg -i "${inputPath}" -y "${outputPath}"`);
    } catch (error) {
      throw new Error(`Failed to convert audio: ${error}`);
    }
  }

  /**
   * Find available audio player on Linux
   */
  private async findAvailablePlayer(players: string[]): Promise<string | null> {
    for (const player of players) {
      if (await this.isCommandAvailable(player)) {
        return player;
      }
    }
    return null;
  }

  /**
   * Check if a command is available
   */
  private async isCommandAvailable(command: string): Promise<boolean> {
    try {
      await execAsync(`which ${command}`);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Clean up temp directory
   */
  async cleanup(): Promise<void> {
    try {
      const files = await fs.promises.readdir(this.tempDir);
      await Promise.all(
        files.map(file => fs.promises.unlink(path.join(this.tempDir, file)))
      );
    } catch (error) {
      console.error('Failed to clean up temp files:', error);
    }
  }
}