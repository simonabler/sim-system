import { Article } from './article.model';

export class Order {
  id: number;
  article: Article;
  amount: number;
  price: number;
  customerRabatt: number;
  articleGroupRabatt: number;
  createdAt: Date;
  public constructor(init?: Partial<Order>) {
    Object.assign(this, init);
    if (init?.article)
      this.article = new Article(init?.article);
  }

  getPrice() {
    return this.amount * this.price * (1.0 - this.customerRabatt / 100.0) * (1.0 - this.articleGroupRabatt / 100.0);
  }

}

