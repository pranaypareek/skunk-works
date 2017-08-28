import { Component } from '@angular/core';

@Component({
  selector: 'my-app',
  template: `
    <div class="container-fluid">
      <nav>
        <a routerLink="/new" routerLinkActive="active">New Task</a>
        <a routerLink="/tasks" routerLinkActive="active">Tasks</a>
      </nav>
      <router-outlet></router-outlet>
    </div>
  `,
  styleUrls: [
    './app.component.css'
  ]
})
export class AppComponent {
  title = 'Task Exec λ';
}
