/**
 * client-side only WebTorrent manager.
 * This file must only be imported in client components.
 */

import type WebTorrent from 'webtorrent';

export interface TorrentStreamState {
  status: 'idle' | 'connecting' | 'metadata' | 'downloading' | 'ready' | 'error';
  peers: number;
  downloadSpeed: number;
  uploadSpeed: number;
  progress: number;
  timeRemaining: number | null;
  error: string | null;
  numFiles: number;
}

export class FlixoraTorrentClient {
  private client: WebTorrent.Instance | null = null;
  private currentTorrent: WebTorrent.Torrent | null = null;
  private progressInterval: ReturnType<typeof setInterval> | null = null;

  async initialize(): Promise<void> {
    if (this.client) return;
    const WebTorrentLib = (await import('webtorrent')).default;
    this.client = new WebTorrentLib();
    
    this.client?.on('error', (err) => {
      console.error('WebTorrent Client Error:', err);
    });
  }

  async streamToVideo(
    magnetUri: string,
    videoElement: HTMLVideoElement,
    onStateChange: (state: TorrentStreamState) => void,
    startTime: number = 0
  ): Promise<void> {
    await this.initialize();
    if (this.currentTorrent) {
      await this.destroyCurrent();
    }

    if (!this.client) return;

    // Emit 'connecting' immediately so the UI shows the right state
    onStateChange({
      status: 'connecting',
      peers: 0,
      downloadSpeed: 0,
      uploadSpeed: 0,
      progress: 0,
      timeRemaining: null,
      error: null,
      numFiles: 0
    });

    const connectionTimeout = setTimeout(() => {
      if (this.currentTorrent && (this.currentTorrent.progress === 0)) {
        onStateChange({
          status: 'error',
          peers: 0,
          downloadSpeed: 0,
          uploadSpeed: 0,
          progress: 0,
          timeRemaining: null,
          error: 'No peers found. Try a different quality or use the trailer.',
          numFiles: 0
        });
        if (this.progressInterval) {
          clearInterval(this.progressInterval);
          this.progressInterval = null;
        }
        this.destroyCurrent();
      }
    }, 45000);

    this.client.add(magnetUri, (torrent) => {
      this.currentTorrent = torrent;
      
      onStateChange({
        status: 'metadata',
        peers: torrent.numPeers,
        downloadSpeed: 0,
        uploadSpeed: 0,
        progress: 0,
        timeRemaining: null,
        error: null,
        numFiles: torrent.files.length
      });

      // Find the largest video file
      const videoFile = torrent.files
        .filter(f => f.name.match(/\.(mp4|mkv|avi|mov|webm)$/i))
        .sort((a, b) => b.length - a.length)[0];

      if (!videoFile) {
        onStateChange({
          status: 'error',
          peers: torrent.numPeers,
          downloadSpeed: 0,
          uploadSpeed: 0,
          progress: 0,
          timeRemaining: null,
          error: 'No playable video file found',
          numFiles: torrent.files.length
        });
        return;
      }

      this.progressInterval = setInterval(() => {
        if (!this.currentTorrent) {
          if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
          }
          return;
        }

        const isReady = torrent.progress > 0.01;
        if (isReady) clearTimeout(connectionTimeout);

        onStateChange({
          status: isReady ? 'ready' : 'downloading',
          peers: torrent.numPeers,
          downloadSpeed: torrent.downloadSpeed,
          uploadSpeed: torrent.uploadSpeed,
          progress: torrent.progress,
          timeRemaining: torrent.timeRemaining,
          error: null,
          numFiles: torrent.files.length
        });
      }, 500);

      videoFile.renderTo(videoElement, { autoplay: true }, (err) => {
        if (err) {
          onStateChange({
            status: 'error',
            peers: torrent.numPeers,
            downloadSpeed: 0,
            uploadSpeed: 0,
            progress: 0,
            timeRemaining: null,
            error: err instanceof Error ? err.message : 'Render failed',
            numFiles: torrent.files.length
          });
        } else if (startTime > 0) {
          videoElement.currentTime = startTime;
        }
      });
    });
  }

  async destroyCurrent(): Promise<void> {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
    if (this.currentTorrent) {
      try {
        this.currentTorrent.destroy();
      } catch (e) {
        console.warn('Error destroying torrent:', e);
      }
      this.currentTorrent = null;
    }
  }

  async destroy(): Promise<void> {
    await this.destroyCurrent();
    if (this.client) {
      this.client.destroy();
      this.client = null;
    }
  }

  formatSpeed(bytesPerSec: number): string {
    if (bytesPerSec >= 1048576) return `${(bytesPerSec / 1048576).toFixed(1)} MB/s`;
    if (bytesPerSec >= 1024) return `${(bytesPerSec / 1024).toFixed(0)} KB/s`;
    return `${bytesPerSec} B/s`;
  }
}

export const torrentClient = new FlixoraTorrentClient();
