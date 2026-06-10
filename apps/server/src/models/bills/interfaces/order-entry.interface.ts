import { IArticle } from '../../article/interfaces/article.interface';
import { ISlipsheet } from './slipsheet.interface';

export interface IOrderEntry {
  text: string;
  amount: number;
  price: number;
  customerRabatt: number;
  articleGroupRabatt: number;
  article: IArticle;
  slipsheet: ISlipsheet;
}
