import dotenv from 'dotenv';
import app from './app';
import prisma from './config/prisma';

// Load ENV
dotenv.config();

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    // 1. Validate Database Connection
    console.log('🔌 Connecting to Database...');
    await prisma.$connect();
    console.log('✅ Database connected successfully.');

    // 2. Fire up listening socket
    app.listen(PORT, () => {
      console.log(`🚀 Server launched at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
