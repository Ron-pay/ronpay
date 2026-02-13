import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as Sentry from '@sentry/node';

import { AppModule } from './app.module';
import { logger } from './common/logger';

async function bootstrap() {
  // Initialize Sentry for error tracking (production only)
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    const integrations: any[] = [];
    try {
      const { nodeProfilingIntegration } = await import('@sentry/profiling-node');
      integrations.push(nodeProfilingIntegration());
    } catch (error) {
      logger.warn('Failed to load Sentry profiling integration', { error: error.message });
    }

    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      integrations,
      tracesSampleRate: 0.1, // 10% of transactions for performance monitoring
      profilesSampleRate: 0.1,
    });
    logger.info('Sentry error tracking initialized');
  }

  const app = await NestFactory.create(AppModule, {
    logger: false,
  });

  app.useLogger(logger);

  const allowedOrigins: (string | RegExp)[] = [
    'http://localhost:3000',
    'https://ronpay.xyz',
    'https://www.ronpay.xyz',
    'https://ronpay.app',
    'https://www.ronpay.app',
    'https://ronpay.vercel.app',
  ];

  if (process.env.NODE_ENV !== 'production') {
    allowedOrigins.push(
      /\.ngrok-free\.dev$/,
      /\.ngrok\.io$/,
    );
  }

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);

  logger.info(`RonPay backend running on port ${port}`, {
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
  });
}

bootstrap().catch((error) => {
  logger.error('Failed to start application', { error: error.stack });
  process.exit(1);
});


