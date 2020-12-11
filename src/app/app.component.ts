import { Component, OnInit, HostListener } from '@angular/core';
import { AuthenticationService } from './_services';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'rowanwood';
  
  
  constructor(private authService: AuthenticationService) { }

  ngOnInit() {
   
  }
 
  @HostListener('document:keyup', ['$event'])
  @HostListener('document:click', ['$event'])
  @HostListener('document:wheel', ['$event'])
  @HostListener('document:mouseover', ['$event'])
  resetTimer() {
    this.authService.notifyUserAction();
  }






 }
