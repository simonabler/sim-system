import { ArticleGroup } from './article-group.model';

export class Discount {
  id: number;
  value: number;
  articleGroup: ArticleGroup;

  public constructor(init?: Partial<Discount>) {
    Object.assign(this, init);
    this.articleGroup = new ArticleGroup(init?.articleGroup);

  }
}

