import { Expose, Type } from 'class-transformer';
import { ModelEntity } from '../../../common/serializers/model.serializer';
import { IAnnotation } from '../interfaces/annotation.interface';
import { ISlipsheet } from '../interfaces/slipsheet.interface';
import { SlipsheetEntity } from './slipsheet.serializer';

export const defaultAnnotationForSerializing: string[] = [
  'default',
  'annotation.timestamps',
];
export const extendedAnnotationForSerializing: string[] = [
  ...defaultAnnotationForSerializing,
];
export const allAnnotationForSerializing: string[] = [
  ...extendedAnnotationForSerializing,
];
export class AnnotationEntity extends ModelEntity implements IAnnotation {

  @Expose({ groups: ['default'] })
  text: string;
  
  @Expose({ groups: ['default'] })
  @Type(()=>SlipsheetEntity)
  slipsheet: SlipsheetEntity;

  @Expose({ groups: ['annotation.timestamps'] })
  createdAt: Date;
  @Expose({ groups: ['annotation.timestamps'] })
  updatedAt: Date;
}
