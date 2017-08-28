"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var app_service_1 = require("./app.service");
var TasksComponent = (function () {
    function TasksComponent(appService, router) {
        this.appService = appService;
        this.router = router;
        this.finished = false;
        this.model = {};
    }
    ;
    TasksComponent.prototype.ngOnInit = function () {
        this.getTasks();
    };
    TasksComponent.prototype.getTasks = function () {
        var _this = this;
        this.appService
            .getTasks()
            .then(function (tasks) {
            _this.tasks = tasks;
        });
    };
    TasksComponent.prototype.onSelect = function (task) {
        this.selectedTask = task;
    };
    TasksComponent.prototype.gotoDetail = function (task) {
        this.router.navigate(['/detail', task.taskname]);
    };
    TasksComponent.prototype.run = function (task) {
        var _this = this;
        this.appService
            .run(task.taskname, task.runtime)
            .then(function (task) {
            _this.finished = true;
            _this.model = task;
            console.log(task);
        });
    };
    TasksComponent.prototype.delete = function (task) {
        var _this = this;
        this.appService
            .delete(task.taskname, task.runtime)
            .then(function () {
            _this.tasks = _this.tasks.filter(function (t) { return t !== task; });
            if (_this.selectedTask === task) {
                _this.selectedTask = null;
            }
        });
    };
    return TasksComponent;
}());
TasksComponent = __decorate([
    core_1.Component({
        selector: 'tasks',
        templateUrl: './tasks.component.html',
        providers: [
            app_service_1.AppService
        ]
    }),
    __metadata("design:paramtypes", [app_service_1.AppService,
        router_1.Router])
], TasksComponent);
exports.TasksComponent = TasksComponent;
//# sourceMappingURL=tasks.component.js.map