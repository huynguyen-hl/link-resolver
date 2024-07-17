import { Inject, Injectable } from '@nestjs/common';
import * as Minio from 'minio';
import { InjectRepository } from '../../repository.decorators';
import { REPOSITORY_MODULE_OPTIONS } from '../../repository.constants';
import { RepositoryModuleOptions } from '../../interfaces/repository-options.interface';
import {
  IRepositoryProvider,
  SaveParams,
} from '../provider.repository.interface';

@Injectable()
export class MinioProvider implements IRepositoryProvider {
  constructor(
    @InjectRepository('Minio')
    private minioClient: Minio.Client,
    @Inject(REPOSITORY_MODULE_OPTIONS)
    private options: RepositoryModuleOptions,
  ) {}

  async save(data: SaveParams): Promise<void> {
    const metaData = {
      'Content-Type': 'application/json',
    };
    const stringifiedData = JSON.stringify(data);

    await this.minioClient.putObject(
      this.options.bucket,
      data.id,
      stringifiedData,
      stringifiedData.length,
      metaData,
    );
    return;
  }

  async one<T>(id: string): Promise<T> {
    const streamReadable = await this.minioClient.getObject(
      this.options.bucket,
      id,
    );
    const chunks = [];
    for await (const chunk of streamReadable) {
      chunks.push(chunk);
    }
    const data = Buffer.concat(chunks);
    return JSON.parse(data.toString());
  }

  async all<T>(category: string): Promise<T[]> {
    const dataStream = this.minioClient.listObjects(
      this.options.bucket,
      category,
    );
    const data: T[] = [];

    for await (const obj of dataStream) {
      const singleData = await this.one<T>(obj.name);
      data.push(singleData);
    }
    return data;
  }

  async delete(id: string): Promise<void> {
    return await this.minioClient.removeObject(this.options.bucket, id);
  }
}
