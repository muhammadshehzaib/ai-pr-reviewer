import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

export class SocketService {
  private static io: Server;

  static init(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    this.io.on('connection', (socket) => {
      console.log(`⚡ Websocket Client Connected: ${socket.id}`);

      socket.on('disconnect', () => {
        console.log(`🔌 Client Disconnected: ${socket.id}`);
      });
    });

    console.log('📡 Socket.IO system ready for deployment.');
    return this.io;
  }

  /**
   * Pushes live updates from workers directly to frontend clients listening for specific Repo events.
   */
  static emitStatus(jobId: string, message: string, status: string, data?: any) {
    if (!this.io) {
      console.warn('⚠️ Cannot emit, Socket not initialized yet.');
      return;
    }

    this.io.emit(`job-update:${jobId}`, {
      message,
      status,
      timestamp: new Date(),
      ...data,
    });

    // Also emit globally to an activities feed
    this.io.emit('dashboard:activity', { jobId, message, status });
  }
}
