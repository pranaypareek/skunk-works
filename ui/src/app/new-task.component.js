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
var NewTaskComponent = (function () {
    function NewTaskComponent(appService, router) {
        this.appService = appService;
        this.router = router;
        this.runtimes = ['Node 6.11.1', 'Ruby 2.1.5', 'Go 1.3.3'];
        this.model = {
            taskname: '',
            runtime: '',
            script: ''
        };
        this.tasks = [];
        this.submitted = false;
    }
    ;
    NewTaskComponent.prototype.onSubmit = function () {
        var _this = this;
        if (this.model.runtime === 'Ruby 2.1.5') {
            this.model.runtime = 'ruby';
        }
        else if (this.model.runtime === 'Go 1.3.3') {
            this.model.runtime = 'go';
        }
        else if (this.model.runtime === 'Node 6.11.1') {
            this.model.runtime = 'node';
        }
        this.appService.create(this.model)
            .then(function (task) {
            console.log(task);
            _this.submitted = true;
            _this.router.navigate(['/tasks']);
        });
    };
    Object.defineProperty(NewTaskComponent.prototype, "diagnostic", {
        // TODO: Remove this when we're done
        get: function () { return JSON.stringify(this.model); },
        enumerable: true,
        configurable: true
    });
    NewTaskComponent.prototype.newTask = function () {
        this.model = {
            taskname: '',
            runtime: '',
            script: ''
        };
    };
    return NewTaskComponent;
}());
NewTaskComponent = __decorate([
    core_1.Component({
        selector: 'new-task',
        templateUrl: './new-task.component.html',
        providers: [
            app_service_1.AppService
        ]
    }),
    __metadata("design:paramtypes", [app_service_1.AppService,
        router_1.Router])
], NewTaskComponent);
exports.NewTaskComponent = NewTaskComponent;
//# sourceMappingURL=new-task.component.js.map