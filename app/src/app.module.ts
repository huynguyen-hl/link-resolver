import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RepositoryModule } from './repository/repository.module';
import { RepositoryProvider } from './repository/interfaces/repository-options.interface';
import { ConfigModule } from '@nestjs/config';
import { I18nModule } from 'nestjs-i18n';
import { i18nConfig } from './i18n/i18n.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.development.local', '.env.development'],
    }),
    RepositoryModule.forRoot({
      provider: RepositoryProvider.Minio,
      endPoint: process.env.MINIO_ENDPOINT,
      port: +process.env.MINIO_PORT,
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY,
      secretKey: process.env.MINIO_SECRET_KEY,
      bucket: process.env.MINIO_BUCKET_NAME,
    }),
    I18nModule.forRoot(i18nConfig),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
