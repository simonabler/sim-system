import { IArticle } from "./article.interface";

export interface IInventory {
  id: number;
  amountNew: number;
  diff: number;
  article: IArticle;
  createdAt: Date;
  updatedAt: Date;
}
