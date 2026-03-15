import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AnnotationRepository } from './annotation.repository';
import { AnnotationEntity } from './serializers/annotation.serializer';
import { BaseService } from '../../common/base.service';
import { Annotation } from './entities/annotation.entity';

@Injectable()
export class AnnotationService  extends BaseService<Annotation, AnnotationEntity> {
  constructor(
    @InjectRepository(AnnotationRepository)
    private readonly annotationRepository: AnnotationRepository,
  ) {
    super(annotationRepository)
  }

  
}
