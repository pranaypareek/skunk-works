import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Task } from './task';
import { AppService } from './app.service';

@Component({
  selector: 'tasks',
  templateUrl: './tasks.component.html',
  providers: [
    AppService
  ]
})

export class TasksComponent implements OnInit {
  tasks: Task[];
  selectedTask: Task;
  finished = false;
  model = {};

  constructor(
    private appService: AppService,
    private router: Router
  ) {};

  ngOnInit(): void {
    this.getTasks();
  }

  getTasks(): void {
    this.appService
      .getTasks()
      .then(tasks => {
        this.tasks = tasks;
      });
  }

  onSelect(task: Task): void {
    this.selectedTask = task;
  }

  gotoDetail(task: Task): void {
    this.router.navigate(['/detail', task.taskname]);
  }

  run(task: Task): void {
    this.appService
      .run(task.taskname, task.runtime)
      .then(task => {
        this.finished = true;
        this.model = task;
        console.log(task);
      });
  }

  delete(task: Task): void {
    this.appService
      .delete(task.taskname, task.runtime)
      .then(() => {
        this.tasks = this.tasks.filter(t => t !== task);
        if (this.selectedTask === task) { this.selectedTask = null; }
      });
  }
}
