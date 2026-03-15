import { EntityRepository } from 'typeorm';
import { Annotation } from './entities/annotation.entity';
import { ModelRepository } from '../model.repository';
import {
  allAnnotationForSerializing,
  AnnotationEntity,
} from './serializers/annotation.serializer';
import { classToPlain, plainToClass } from 'class-transformer';
@EntityRepository(Annotation)
export class AnnotationRepository extends ModelRepository<Annotation, AnnotationEntity> {
  transform(model: Annotation): AnnotationEntity {
    const tranformOptions = {
      groups: allAnnotationForSerializing,
    };
    return plainToClass(
      AnnotationEntity,
      classToPlain(model, tranformOptions),
      tranformOptions,
    );
  }
  transformMany(models: Annotation[]): AnnotationEntity[] {
    return models.map((model) => this.transform(model));
  }
}
