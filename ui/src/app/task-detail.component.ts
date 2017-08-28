import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Location } from '@angular/common';

import 'rxjs/add/operator/switchMap';

import { AppService } from './app.service';

@Component({
  selector: 'task-detail',
  templateUrl: './task-detail.component.html',
  styleUrls: [
    './task-detail.component.css'
  ]
})

export class TaskDetailComponent {
  @Input() task: any = {
    info: null
  };

  constructor(
    private appService: AppService,
    private route: ActivatedRoute,
    private location: Location
  ) {};

  ngOnInit(): void {
    this.route.paramMap
      .switchMap((params: ParamMap) => this.appService.getTaskInfo(params.get('id')))
      .subscribe(res => { console.log(res); this.task = res });

     console.log(this.task);
  }

  goBack(): void {
    this.location.back();
  }
}
