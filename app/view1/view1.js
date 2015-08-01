'use strict';

angular.module('myApp.view1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
  });
}])
.constant('modulePrefix', 'view1')
.constant('onCustomerNumberChanged', 'onCustomerNumberChanged')
.factory('view1EventService', ['$rootScope', 'modulePrefix', function view1EventService($rootScope, modulePrefix) {
    var service = {
        subscribe: function(scope, eventName, callback) {
            var adjEventName = modulePrefix.concat(eventName);
            return scope.$on(adjEventName, callback);
        },
        unsubscribe: function (scope, eventName, callback) {
            var adjEventName = modulePrefix.concat(eventName);
            return scope.$off(adjEventName, callback);
        },
        broadcast: function(eventName, data) {
            var adjEventName = modulePrefix.concat(eventName);
            $rootScope.$broadcast(adjEventName, data);
        }
    }
    return service;
}])
.controller('View1Ctrl', [function () {
}])
.controller('searchCustomerController', ['$scope', 'onCustomerNumberChanged', 'view1EventService', function ($scope, onCustomerNumberChanged, view1EventService) {
    $scope.searchText = "1234";
    $scope.startSearch = function() {
        view1EventService.broadcast(onCustomerNumberChanged, { data: $scope.searchText });
    }
}])
.controller('accountSummaryController', ['$scope', 'onCustomerNumberChanged', 'view1EventService', function ($scope, onCustomerNumberChanged, view1EventService) {
    $scope.accounts = [];
    view1EventService.subscribe($scope, onCustomerNumberChanged, function (events, args) {
        if (!args.data) {
            $scope.accounts = [];
        }else if (args.data === "1234") {
            $scope.accounts  = [{ accountName: "Household", accountBalance: 300 }];
        } else {
            $scope.accounts  = [{ accountName: "Personal", accountBalance: 6150 }, { accountName: "Corporate", accountBalance: 56000 }];
        }

        });
    }])
.directive('searchCustomer', function () {
    return {
        restrict: 'EA',
        scope: "=",
        controller: 'searchCustomerController',
        templateUrl: 'view1/SearchCustomer.cshtml'
    }
})
.directive('accountSummary', function () {
    return {
        restrict: 'EA',
        scope: "=",
        controller: 'accountSummaryController',
        templateUrl: 'view1/AccountSummary.cshtml'
    }
});
