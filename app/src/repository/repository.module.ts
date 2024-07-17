import { DynamicModule, Module } from '@nestjs/common';
import { RepositoryModuleOptions } from './interfaces/repository-options.interface';
import { MinioModule } from './providers/minio/minio.module';
import { MinioProvider } from './providers/minio/minio.provider';

/**
 * Repository module is a dynamic module that allows to register a repository provider.
 * How to use:
 *  - Import the module in the app module and call the `forRoot` method with the provider and the provider options.
 *  - Inject the `RepositoryProvider` token in the constructor of the service that needs to use the repository.
 *  - Use the repository provider to save, retrieve, and delete data.
 * Example:
 * ```
 * // app.module.ts
 * @Module({
 *  imports: [
 *   RepositoryModule.forRoot({
 *    provider: RepositoryProvider.Minio,
 *    endPoint: 'localhost',
 *    port: 9000,
 *    useSSL: false,
 *    accessKey: 'accessKey', // replace with your access key
 *    secretKey: 'secretKey', // replace with your secret key
 *    bucket: 'bucketName', // replace with your bucket name
 *   }),
 *  ],
 *  controllers: [AppController],
 *  providers: [AppService],
 * })
 *
 * // app.service.ts
 * @Injectable()
 * export class AppService {
 *  constructor(
 *   @Inject('RepositoryProvider')
 *   private readonly repositoryProvider: IRepositoryProvider,
 *  ) {}
 * }
 * ```
 *
 */

@Module({})
export class RepositoryModule {
  static forRoot(options?: RepositoryModuleOptions): DynamicModule {
    const imports = [];
    const providers = [];
    const exports = [];
    switch (options?.provider) {
      case 'minio':
        imports.push(MinioModule.forRoot(options));
        providers.push({
          provide: 'RepositoryProvider',
          useExisting: MinioProvider,
        });
        exports.push('RepositoryProvider');
        break;
      default:
        throw new Error('Invalid provider');
    }

    return {
      module: RepositoryModule,
      imports,
      providers,
      exports,
    };
  }
}
