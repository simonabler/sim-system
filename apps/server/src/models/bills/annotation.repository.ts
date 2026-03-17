import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { ModelRepository } from '../model.repository';
import { Annotation } from './entities/annotation.entity';
import { allAnnotationForSerializing, AnnotationEntity } from './serializers/annotation.serializer';

@Injectable()
export class AnnotationRepository extends ModelRepository<Annotation, AnnotationEntity> {
  constructor(private dataSource: DataSource) {
    super(Annotation, dataSource.createEntityManager());
  }

  transform(model: Annotation): AnnotationEntity {
    const tranformOptions = {
      groups: allAnnotationForSerializing,
    };
    return plainToInstance(
      AnnotationEntity,
      instanceToPlain(model, tranformOptions),
      tranformOptions,
    );
  }

  transformMany(models: Annotation[]): AnnotationEntity[] {
    return models.map((model) => this.transform(model));
  }
}
