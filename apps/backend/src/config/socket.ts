import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { AuthService, AuthTokenPayload } from '../services/auth.service';

/**
 * Sockets authenticate with the same JWT as the REST API: the `auth_token`
 * cookie set by the OAuth flow, or a token passed in the handshake `auth`
 * payload (non-browser clients).
 */
function extractToken(socket: Socket): string | undefined {
  const cookieHeader = socket.handshake.headers.cookie;
  if (cookieHeader) {
    for (const part of cookieHeader.split(';')) {
      const eq = part.indexOf('=');
      if (eq !== -1 && part.slice(0, eq).trim() === 'auth_token') {
        return decodeURIComponent(part.slice(eq + 1).trim());
      }
    }
  }
  const token = (socket.handshake.auth as { token?: unknown } | undefined)?.token;
  return typeof token === 'string' ? token : undefined;
}

export class SocketService {
  private static io: Server;

  static init(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    // Reject unauthenticated sockets at the handshake — job updates carry
    // per-user data and must never reach anonymous clients.
    this.io.use((socket, next) => {
      const token = extractToken(socket);
      if (!token) return next(new Error('Unauthorized: missing credentials'));
      try {
        socket.data.auth = AuthService.verifyToken(token);
        return next();
      } catch {
        return next(new Error('Unauthorized: invalid token'));
      }
    });

    this.io.on('connection', (socket) => {
      const auth = socket.data.auth as AuthTokenPayload;
      // One room per user, so workers can emit to the job owner only.
      socket.join(`user:${auth.userId}`);
      console.log(`⚡ Websocket Client Connected: ${socket.id} (user ${auth.userId})`);

      socket.on('disconnect', () => {
        console.log(`🔌 Client Disconnected: ${socket.id}`);
      });
    });

    console.log('📡 Socket.IO system ready for deployment.');
    return this.io;
  }

  /**
   * Pushes live updates from workers to the job owner's clients only.
   */
  static emitStatus(userId: string, jobId: string, message: string, status: string, data?: any) {
    if (!this.io) {
      console.warn('⚠️ Cannot emit, Socket not initialized yet.');
      return;
    }

    const room = `user:${userId}`;

    this.io.to(room).emit(`job-update:${jobId}`, {
      message,
      status,
      timestamp: new Date(),
      ...data,
    });

    // Also emit to the owner's activities feed
    this.io.to(room).emit('dashboard:activity', { jobId, message, status });
  }
}
