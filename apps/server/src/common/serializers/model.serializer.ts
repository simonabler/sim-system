import { Expose } from 'class-transformer';

export class ModelEntity {
  @Expose({ groups: ['default'] })
  id: number;
  [key: string]: any;

  constructor(id?: number) {
    if (id) {
      this.id = id;
    }
  }
}
