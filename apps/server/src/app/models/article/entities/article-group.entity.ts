import { Expose } from 'class-transformer';
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { IArticleGroup } from '../interfaces/article-group.interface';
import { Article } from './article.entity';


@Entity({ name: 'article-groups' })
export class ArticleGroup implements IArticleGroup {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ nullable: false, length: 50 })
  name!: string;

  @OneToMany(() => Article, (article) => article.articleGroup)
  articles: Article[];

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;
}
