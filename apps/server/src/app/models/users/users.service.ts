import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersRepository } from './users.repository';
import { UserEntity } from './serializers/user.serializer';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { plainToClass } from 'class-transformer';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersRepository)
    private readonly usersRepository: UsersRepository,
  ) { }

  get(
    id: number,
    relations: string[] = [],
    throwsException = true,
  ): Promise<UserEntity | null> {
    return this.usersRepository.get(id, relations, throwsException);
  }



  
  getAll(
    relations: string[] = [],
    throwsException = true,
  ): Promise<UserEntity[] | null> {
    return this.usersRepository.findAll({ relations, throwsException });
  }

  async delete(id: number, throwsException = true): Promise<boolean | null> {
    return this.usersRepository
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
    name: number,
    relations: string[] = [],
    throwsException = false,
  ): Promise<UserEntity | null> {
    return this.usersRepository
      .findOne({
        where: { username: name },
        relations,
      })
      .then((entity) => {
        if (!entity && throwsException) {
          return Promise.reject(new NotFoundException('Model not found.'));
        }

        return Promise.resolve(
          entity ? this.usersRepository.transform(entity) : null,
        );
      })
      .catch((error) => Promise.reject(error));
  }
  create(inputs: CreateUserDto, relations: string[] = []): Promise<UserEntity> {
    return this.usersRepository.createEntity(inputs, relations);
  }
  update(user: UserEntity, inputs: UpdateUserDto): Promise<UserEntity> {
    return this.usersRepository.updateEntity(user.id, inputs);
  }
}
