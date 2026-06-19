import dotenv from 'dotenv';
import http from 'http';
dotenv.config();

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    const [{ default: app }, { default: prisma }, { SocketService }] = await Promise.all([
      import('./app'),
      import('./config/prisma'),
      import('./config/socket'),
    ]);

    // Pre-initialize our background tasks immediately on boot, after env is loaded.
    await import('./workers/analysis.worker');

    // Wrap Express with HTTP Server required for WebSockets
    const server = http.createServer(app);

    // 1. Validate Database Connection
    console.log('🔌 Connecting to Database...');
    await prisma.$connect();
    console.log('✅ Database connected successfully.');

    // 2. Initialize Socket.IO layer
    SocketService.init(server);

    // 3. Fire up listening socket
    server.listen(PORT, () => {
      console.log(`🚀 Server launched at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
