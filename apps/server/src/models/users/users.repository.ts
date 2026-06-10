import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { ModelRepository } from '../model.repository';
import { User } from './entities/user.entity';
import { extendedUserGroupsForSerializing, UserEntity } from './serializers/user.serializer';

@Injectable()
export class UsersRepository extends ModelRepository<User, UserEntity> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  transform(model: User): UserEntity {
    const tranformOptions = {
      groups: extendedUserGroupsForSerializing,
    };
    return plainToInstance(
      UserEntity,
      instanceToPlain(model, tranformOptions),
      tranformOptions,
    );
  }

  transformMany(models: User[]): UserEntity[] {
    return models.map((model) => this.transform(model));
  }
}
