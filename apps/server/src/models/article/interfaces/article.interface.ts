import { ArticleGroup } from '../entities/article-group.entity';
import { IArticleGroup } from './article-group.interface';

export interface IArticle {
  name: string;
  code: string;
  price: number;
  stock: number | null;
  inventoryStock: number;
  inventoryDate: Date;
  type: string;
  imgPath: string;
  unit: string;
  artNumber: string;
  articleGroup: IArticleGroup;
  singlePos: boolean;
  trackStock: boolean;
  noDiscount: boolean;
}
