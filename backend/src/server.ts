import './config/env'; // load dotenv first
import app from './app';
import { env } from './config/env';
import { prisma } from './lib/prisma';

async function main() {
  // Verify DB connection
  await prisma.$connect();
  console.log('✓ Database connected');

  app.listen(env.port, () => {
    console.log(`✓ FoodFlow API running on http://localhost:${env.port}`);
    console.log(`  Environment : ${env.nodeEnv}`);
    console.log(`  CORS origin : ${env.clientUrl}`);
  });
}

main().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
