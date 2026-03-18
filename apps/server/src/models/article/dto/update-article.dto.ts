import { PartialType } from '@nestjs/mapped-types';
import { CreateArticleDto } from './create-article.dto';

// PartialType macht alle Felder optional + behält alle Validator-Decorators bei.
// Nötig für PATCH: CreateArticleDto hat @IsNotEmpty() auf allen Feldern — diese
// würden bei leeren Strings (type:"", unit:"" etc.) die Validation zum Scheitern bringen.
export class UpdateArticleDto extends PartialType(CreateArticleDto) {}
