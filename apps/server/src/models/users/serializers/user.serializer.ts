import { Expose } from 'class-transformer';
import { IUser } from '../interfaces/user.interface';
import { ModelEntity } from '../../../common/serializers/model.serializer';

export const defaultUserGroupsForSerializing: string[] = [
  'default',
  'user.default',
];
export const nameUserGroupsForSerializing: string[] = ['user.name'];
export const extendedUserGroupsForSerializing: string[] = [
  ...defaultUserGroupsForSerializing,
  'user.timestamps',
];
export const allUserGroupsForSerializing: string[] = [
  ...extendedUserGroupsForSerializing,
  'user.password',
];
export class UserEntity extends ModelEntity implements IUser {
  @Expose({ groups: ['default', 'user.default', 'user.name'] })
  email: string;
  @Expose({ groups: ['default', 'user.default', 'user.name'] })
  name: null | string;
  @Expose({ groups: ['default', 'user.default', 'user.name'] })
  username: null | string;
  @Expose({ groups: ['user.password'] })
  password: string;
  @Expose({ groups: ['default', 'user.default'] })
  ldapUser: boolean;
  @Expose({ groups: ['user.timestamps'] })
  createdAt: Date;
  @Expose({ groups: ['user.timestamps'] })
  updatedAt: Date;

  getName() {
    return this.name;
  }
}
