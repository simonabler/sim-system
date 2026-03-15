import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute, NavigationStart } from '@angular/router';

@Component({
  // tslint:disable-next-line
  selector: 'app-main',
  template: '<router-outlet></router-outlet> '
})
export class AppComponent implements OnInit {
  constructor(private router: Router, private route: ActivatedRoute) { }

  _timeoutHandler;
  _isScanning = false;
  _inputString: string = '';
  key;

  ngOnInit() {

    document.addEventListener('keydown', this.handleKeyboardEvent.bind(this), true);


    this.router.events.subscribe((evt) => {

      if (evt instanceof NavigationStart) {
        if (navigator.userAgent.match(/Android/i) && evt.url === '/') {
          this.router.navigate(['/mobile/tracking']);
        }
      }

      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0);
    });
  }





  handleKeyboardEvent(event: KeyboardEvent) {
    // console.log('handleKeyboardEvent Key ' + event.key)
    console.log(event);

    if (this._timeoutHandler) {
        clearTimeout(this._timeoutHandler);
    }

    if (!this._isScanning && event.key === '^') {
        this._isScanning = true;
    }

    if (this._isScanning) {
        event.preventDefault();
    }


    if (event.key.length === 1) {
        this._inputString += event.key;

        this._timeoutHandler = setTimeout(() => {
            this._isScanning = false;
            if (this._inputString.length <= 5) {
                this._inputString = '';
                return;
            }
            document.dispatchEvent(new CustomEvent('onbarcodescaned', { 'detail': this._inputString.replace('^', '') }));
            this._inputString = '';
        }, 200);
    }
}




}
