import { IArticleGroup } from "../../article/interfaces/article-group.interface";
import { ICustomer } from "../../customer/interfaces/customer.interface";

export interface IDiscount {

    value: number;
    articleGroup: IArticleGroup;
    customer: ICustomer;
}
