import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AppService } from './app.service';

@Component({
  selector: 'new-task',
  templateUrl: './new-task.component.html',
  providers: [
    AppService
  ]
})
export class NewTaskComponent {

  constructor(
    private appService: AppService,
    private router: Router
  ) {};

  runtimes = ['Node 6.11.1', 'Ruby 2.1.5', 'Go 1.3.3'];

  private model = {
    taskname: '',
    runtime: '',
    script: ''
  };
  tasks: any = [];
  submitted = false;

  onSubmit() {
    if (this.model.runtime === 'Ruby 2.1.5') {
      this.model.runtime = 'ruby'
    } else if (this.model.runtime === 'Go 1.3.3') {
      this.model.runtime = 'go'
    } else if (this.model.runtime === 'Node 6.11.1') {
      this.model.runtime = 'node'
    }

    this.appService.create(this.model)
      .then(task => {
        console.log(task);
        this.submitted = true;
        this.router.navigate(['/tasks']);
      });
  }

  // TODO: Remove this when we're done
  get diagnostic() { return JSON.stringify(this.model); }

  newTask() {
    this.model = {
      taskname: '',
      runtime: '',
      script: ''
    };
  }
}
