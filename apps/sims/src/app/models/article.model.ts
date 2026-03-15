import { ArticleGroup } from './article-group.model';

export class Article {
  id: number;
  name: string;
  description: string;
  type: string;
  artNumber: string;
  code: string;
  supplier: string;
  imgPath: string;
  price: number;
  stock: number;
  unit: string;
  singlePos: Boolean;
  trackStock: Boolean;
  noDiscount: Boolean;
  articleGroup: ArticleGroup;

  /*
  
  artNumber: "33234"
code: "M555555"
createdAt: "2021-12-09T10:19:16.000Z"
id: 1
imgPath: ""
inventoryDate: ""
inventoryStock: ""
name: "555555"
noDiscount: true
price: 4.55
singlePos: true
trackStock: true
type: "Schraube"
unit: "pc"
updatedAt: "2021-12-09T10:19:16.000Z"
  */

  public constructor(init?: Partial<Article>) {
    this.name = '';
    this.code = '';
    this.description = '';
    this.artNumber = '';
    this.type = '';
    this.supplier = '';
    this.unit = '';

    this.singlePos = false;
    this.trackStock = false;
    this.noDiscount = false;
    Object.assign(this, init);

    this.articleGroup = new ArticleGroup(init?.articleGroup);
  }

}

