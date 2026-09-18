import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { AppConfig } from './config/configuration';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get<ConfigService<AppConfig, true>>(ConfigService);

  app.setGlobalPrefix(config.get('apiGlobalPrefix', { infer: true }));

  const defaultHelmet = helmet();
  const swaggerHelmet = helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  });

  app.use(
    (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      if (req.path.startsWith('/docs')) {
        return swaggerHelmet(req, res, next);
      }
      return defaultHelmet(req, res, next);
    },
  );
  app.use(express.json({ limit: '50kb' }));
  app.use(express.urlencoded({ extended: true, limit: '50kb' }));
  app.use(cookieParser());
  app.use(compression());

  app.enableCors({
    origin: config.get('corsOrigins', { infer: true }),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('OJS Nutrition API')
    .setDescription(
      'OJS Nutrition e-ticaret platformu kurumsal REST API sözleşmesi ve canlı OpenAPI dokümantasyonu.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag(
      'auth',
      'Kimlik doğrulama, oturum yönetimi, token rotasyonu ve oturum iptali',
    )
    .addTag('users', 'Kullanıcı hesap ve profil yönetimi')
    .addTag(
      'products',
      'Ürün kataloğu, arama, filtreleme, sayfalama ve çok satanlar',
    )
    .addTag('categories', 'Kategori hiyerarşisi ve menü ağacı')
    .addTag('cart', 'Kullanıcı ve misafir sepeti, sepet birleştirme')
    .addTag('addresses', 'Teslimat ve fatura adresleri yönetimi')
    .addTag('locations', 'Ülke, il ve ilçe coğrafi hiyerarşi lookup servisleri')
    .addTag(
      'orders',
      'Sipariş oluşturma, kargo hesaplama, sipariş geçmişi ve durum yönetimi',
    )
    .addTag(
      'reviews',
      'Ürün yorumları, puanlama istatistikleri ve admin moderasyonu',
    )
    .addTag('faq', 'Sıkça sorulan sorular (SSS) yönetimi')
    .addTag('contact', 'İletişim formu mesaj gönderimi ve admin mesaj takibi')
    .addTag(
      'media',
      'Güvenli görsel yükleme (magic bytes, MIME kontrolü ve 5MB sınır)',
    )
    .addTag(
      'payments',
      'iyzico ödeme sağlayıcısı webhook bildirim entegrasyonu',
    )
    .addTag('admin', 'Yönetici paneli ve sistem metrikleri')
    .build();
  SwaggerModule.setup(
    'docs',
    app,
    SwaggerModule.createDocument(app, swaggerConfig),
    {
      swaggerOptions: {
        persistAuthorization: true,
      },
      customSiteTitle: 'OJS Nutrition API Docs',
    },
  );

  const port = config.get('port', { infer: true });
  await app.listen(port);
}

void bootstrap();
