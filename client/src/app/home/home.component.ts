import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeEnum } from '../models/ewelink_enums';
import { SwitchService } from '../services/switch.service';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  public themeEnum = ThemeEnum;

  constructor(private router: Router, private switchService: SwitchService,  public themeService: ThemeService) { }

  ngOnInit() {
  }


  LogOut() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    this.switchService.isNewState.unsubscribe();
  }



}
