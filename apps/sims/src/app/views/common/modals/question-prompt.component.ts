import { Component, OnInit } from "@angular/core";
import { BsModalRef } from "ngx-bootstrap";
import { Observable, Subject } from "rxjs";

@Component({
  selector: 'modal-content',
  template: `
      <div class="modal-header">
        <h4 class="modal-title pull-left">{{title}}</h4>
        <button type="button" class="close pull-right" aria-label="Close" (click)="bsModalRef.hide()">
        <span aria-hidden="true">&times;</span>
      </button>
      </div>
      <div class="modal-body">
          {{message}}
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default btn-success" (click)="onExit(true)">{{successBtnName}}</button>
        <button type="button" class="btn btn-default" (click)="onExit(false)">{{closeBtnName}}</button>
      </div>
    `
})

export class QuestionPromptContentComponent implements OnInit {
  title: string;
  message: string;
  closeBtnName: string;
  successBtnName: string;
  successSubject: Subject<boolean> = new Subject<boolean>();
  success: Observable<boolean> = this.successSubject.asObservable();

  constructor(public bsModalRef: BsModalRef) { }

  ngOnInit() {
  }

  onExit(state: boolean) {
    this.successSubject.next(state);
    this.bsModalRef.hide();
  }

}