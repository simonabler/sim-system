import { Injectable } from '@nestjs/common';
import { AnnotationRepository } from './annotation.repository';
import { AnnotationEntity } from './serializers/annotation.serializer';
import { BaseService } from '../../common/base.service';
import { Annotation } from './entities/annotation.entity';

@Injectable()
export class AnnotationService extends BaseService<Annotation, AnnotationEntity> {
  constructor(
    private readonly annotationRepository: AnnotationRepository,
  ) {
    super(annotationRepository);
  }
}
