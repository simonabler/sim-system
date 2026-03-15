
export class ArticleGroup {
  id: number;

  name: string;

  public constructor(init?: Partial<ArticleGroup>) {
    this.name = '';
    Object.assign(this, init);
  }
}

