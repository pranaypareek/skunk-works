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
var common_1 = require("@angular/common");
require("rxjs/add/operator/switchMap");
var app_service_1 = require("./app.service");
var TaskDetailComponent = (function () {
    function TaskDetailComponent(appService, route, location) {
        this.appService = appService;
        this.route = route;
        this.location = location;
        this.task = {
            info: null
        };
    }
    ;
    TaskDetailComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.route.paramMap
            .switchMap(function (params) { return _this.appService.getTaskInfo(params.get('id')); })
            .subscribe(function (res) { console.log(res); _this.task = res; });
        console.log(this.task);
    };
    TaskDetailComponent.prototype.goBack = function () {
        this.location.back();
    };
    return TaskDetailComponent;
}());
__decorate([
    core_1.Input(),
    __metadata("design:type", Object)
], TaskDetailComponent.prototype, "task", void 0);
TaskDetailComponent = __decorate([
    core_1.Component({
        selector: 'task-detail',
        templateUrl: './task-detail.component.html',
        styleUrls: [
            './task-detail.component.css'
        ]
    }),
    __metadata("design:paramtypes", [app_service_1.AppService,
        router_1.ActivatedRoute,
        common_1.Location])
], TaskDetailComponent);
exports.TaskDetailComponent = TaskDetailComponent;
//# sourceMappingURL=task-detail.component.js.map