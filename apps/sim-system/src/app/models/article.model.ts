export class ArticleGroup {
  id!: number;
  name: string;
  constructor(init?: Partial<ArticleGroup>) {
    this.name = '';
    Object.assign(this, init);
  }
}

export class Article {
  id!: number;
  name: string;
  description: string;
  type: string;
  artNumber: string;
  code: string;
  supplier: string;
  imgPath!: string;
  price!: number;
  stock!: number;
  unit: string;
  inventoryDate!: string;
  inventoryStock!: number;
  singlePos: boolean;
  trackStock: boolean;
  noDiscount: boolean;
  articleGroup: ArticleGroup;

  constructor(init?: Partial<Article>) {
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
