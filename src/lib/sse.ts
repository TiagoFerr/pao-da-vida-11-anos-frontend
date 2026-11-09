import { SsePayloadEnvelope } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export type SseEventHandler = (event: SsePayloadEnvelope) => void;

class SseManager {
  private eventSource: EventSource | null = null;
  private listeners: Set<SseEventHandler> = new Set();
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private retryCount = 0;
  private maxRetries = 10;

  public connect(token?: string | null) {
    this.disconnect();

    const authToken = token || localStorage.getItem('ce_access_token');
    const url = new URL(`${API_BASE_URL}/sse/stream`, window.location.origin);
    if (authToken) {
      url.searchParams.set('token', authToken);
    }

    try {
      this.eventSource = new EventSource(url.toString());

      this.eventSource.onopen = () => {
        this.retryCount = 0;
      };

      this.eventSource.onmessage = (e) => {
        try {
          const parsed: SsePayloadEnvelope = JSON.parse(e.data);
          this.notify(parsed);
        } catch {
          // Heartbeat ping ou formato texto
        }
      };

      this.eventSource.onerror = () => {
        this.disconnect();
        if (this.retryCount < this.maxRetries) {
          const backoff = Math.min(1000 * Math.pow(1.5, this.retryCount), 30000);
          this.retryCount++;
          this.reconnectTimeout = setTimeout(() => {
            this.connect(token);
          }, backoff);
        }
      };
    } catch {
      // Ignora erro se EventSource não for suportado
    }
  }

  public disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  public subscribe(handler: SseEventHandler): () => void {
    this.listeners.add(handler);
    return () => {
      this.listeners.delete(handler);
    };
  }

  private notify(event: SsePayloadEnvelope) {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch {
        // Protege loop de erro individual
      }
    });
  }
}

export const sseManager = new SseManager();
