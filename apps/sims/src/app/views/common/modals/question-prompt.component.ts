import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-question-prompt',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-header">
      <h4>{{ title }}</h4>
    </div>
    <div class="modal-body"><p>{{ message }}</p></div>
    <div class="modal-footer">
      <button class="btn btn-success" (click)="confirm.emit(true)">{{ successBtnName }}</button>
      <button class="btn btn-secondary" (click)="confirm.emit(false)">{{ closeBtnName }}</button>
    </div>`,
})
export class QuestionPromptContentComponent {
  @Input() title = 'Bestätigen';
  @Input() message = 'Fortfahren?';
  @Input() closeBtnName = 'Abbrechen';
  @Input() successBtnName = 'OK';
  @Output() confirm = new EventEmitter<boolean>();
}
