import { NgModule } from '@angular/core';
import { ShoppingcartComponent } from './views/shoppingcart/shoppingcart.component';
import { CommonModule } from '@angular/common';
import { ModalModule } from 'ngx-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { QuestionPromptContentComponent } from './views/common/modals/question-prompt.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ModalModule.forRoot(),
        NgSelectModule,],
    entryComponents: [QuestionPromptContentComponent],
    declarations: [ShoppingcartComponent, QuestionPromptContentComponent],
    exports: [ShoppingcartComponent,QuestionPromptContentComponent]
})
export class SharedModule {
}
