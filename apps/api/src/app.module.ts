import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { join } from 'node:path';

import configuration, { AppConfig, validateEnv } from './config';
import { PrismaModule } from './prisma';

import {
  AllExceptionsFilter,
  ResponseInterceptor,
  JwtAuthGuard,
  RolesGuard,
} from './common';

import { AuthModule } from './auth';
import { UsersModule } from './users';
import { AddressesModule } from './addresses';
import { LocationsModule } from './locations';
import { ProductsModule } from './products';
import { CartModule } from './cart';
import { OrdersModule } from './orders';
import { PaymentsModule } from './payments';
import { ReviewsModule } from './reviews';
import { FaqModule } from './faq';
import { ContactModule } from './contact';
import { MediaModule } from './media';
import { AdminModule } from './admin';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configuration],
      validate: validateEnv,
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig, true>) => {
        const throttle = config.get('throttle', { infer: true });
        return [{ ttl: throttle.ttl * 1000, limit: throttle.limit }];
      },
    }),
    ServeStaticModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig, true>) => [
        {
          rootPath: join(
            process.cwd(),
            config.get('media', { infer: true }).storagePath,
          ),
          serveRoot: '/media',
          serveStaticOptions: { index: false, fallthrough: false },
        },
      ],
    }),
    PrismaModule,

    AuthModule,
    UsersModule,
    AddressesModule,
    LocationsModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    PaymentsModule,
    ReviewsModule,
    FaqModule,
    ContactModule,
    MediaModule,
    AdminModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    // Whitelist auth: her route korumalı, @Public() hariç (BACKEND_PLAN §3).
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    // @Roles('admin') taşıyan route'larda çalışır; JwtAuthGuard'dan sonra.
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
