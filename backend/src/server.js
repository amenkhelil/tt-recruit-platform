const app = require('./app');
const env = require('./config/env');
const connectDB = require('./config/db');

async function bootstrap() {
  await connectDB();
  app.listen(env.PORT, () => {
    console.log(`TT Recruit backend running on port ${env.PORT} [${env.NODE_ENV}]`);
  });
}

bootstrap();