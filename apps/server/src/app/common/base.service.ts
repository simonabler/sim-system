import { Injectable, NotFoundException } from '@nestjs/common';
import { ModelRepository } from '../models/model.repository';
import { DeepPartial } from 'typeorm';
import { ModelEntity } from './serializers/model.serializer';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

@Injectable()
export class BaseService<T extends object, K extends ModelEntity> {

  constructor(
    private readonly repository: ModelRepository<T, K>
  ) {}

  get(
    id: number,
    relations: string[] = [],
    throwsException = true,
  ): Promise<K | null> {
    return this.repository.get(id, relations, throwsException);
  }

  getAll(
    relations: string[] = [],
    throwsException = true,
  ): Promise<K[] | null> {
    return this.repository.findAll({
      relations,
      throwsException,
    });
  }

  async delete(id: number, throwsException = true): Promise<boolean | null> {
    return this.repository
      .delete(id)
      .then((result) => {
        if (throwsException && (!result.affected || result.affected === 0)) {
          return Promise.reject(new NotFoundException('Model not found.'));
        }
        return Promise.resolve(true);
      })
      .catch((error) => Promise.reject(error));
  }

  async getByName(
    name: string,
    relations: string[] = [],
    throwsException = false,
  ): Promise<K | null> {
    return this.repository
      .getByNameDirect(name, relations, throwsException);
  }

  async create(inputs: DeepPartial<T>): Promise<K> {
    return await this.repository.createEntity(inputs);
  }

  async update(
    id: number,
    inputs: DeepPartial<T>,
  ): Promise<K> {
    return await this.repository.updateEntity(
      id,
      inputs as unknown as QueryDeepPartialEntity<T>,
    );
  }
}
