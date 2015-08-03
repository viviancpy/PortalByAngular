(function () {
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
})
.factory('scriptLoadService', ['$q', '$window', function scriptLoadService($q, $window) {
    var self = this;
            
    var loadJs = function (scriptResource) {
            var deferred = $q.defer();
            // $window.initialize = function () {
            //     deferred.resolve();
            // };
            // thanks to Emil Stenström: http://friendlybit.com/js/lazy-loading-asyncronous-javascript/
            var load_script = function(){ 
                var loadedScripts = document.getElementsByTagName('script');
                var scriptLoaded = false;
                for (var i = 0; i < loadedScripts.length; i++) {
                    scriptLoaded = scriptLoaded || (loadedScripts[i].outerHTML == '<script src="' + scriptResource + '"></script>')
                }

                // if (!scriptLoaded){
                //     var s = document.createElement('script'); // use global document since Angular's $document is weak
                //     if (s.readyState){  //IE
                //         s.onreadystatechange = function(){
                //             if (s.readyState == "loaded" || s.readyState == "complete"){
                //                 s.onreadystatechange = null;
                //                 deferred.resolve();
                //             }
                //         };
                //     } else {  //Others
                //         s.onload = function(){
                //             deferred.resolve();
                //         };
                //     }
                 
                //     s.src = scriptResource; // example: 'https://maps.googleapis.com/maps/api/js?sensor=false&callback=initialize'
                //     document.body.appendChild(s);
                // }
                if (!scriptLoaded){
                    var s = document.createElement('script'); // use global document since Angular's $document is weak
                    s.src = scriptResource; // example: 'https://maps.googleapis.com/maps/api/js?sensor=false&callback=initialize'
                    document.body.appendChild(s);
                }

                deferred.resolve();
            }

            // if ($window.attachEvent) {  
            //     $window.attachEvent('onload', load_script); 
            // } else {
            //     $window.addEventListener('load', load_script, false);
            // }
            load_script();
            return deferred.promise;
        }

    var service = {
        loadJs: loadJs
    };
    return service;
}])
.factory('htmlLoadService', ['$http', function($http){
    var loadHtml = function(url, callback){
            $http.jsonp(url).success(function(data,status,headers,config) {
              console.warn(data);
              callback(data);
            }).error(function(data, status,headers, config) {
                console.log('error in jsonp');
            });
    }
    var service = {
        loadHtml: loadHtml
    };
    return service;
}])
.factory('externalComponentService', ['$q', '$window', 'scriptLoadService', 'htmlLoadService', function externalComponentService($q, $window, scriptLoadService, htmlLoadService) {
    var self = this;
    var loadedComponents = {};
    var service = {
        isLoaded: function(componentName){
            return (componentName in loadedComponents)
        },
        loadScripts: function(holderId, componentName, scriptResources){
            if (!(componentName in loadedComponents)) {

                // ----- BEGIN: ScriptResources
                var scriptResourcePromises = [];
                if (scriptResources && scriptResources.length > 0){

                    for (var r = 0; r < scriptResources.length; r++){
                        // Ensure all loaded scripts doe not contain the scriptResources before adding
                        
                            var p = scriptLoadService.loadJs(scriptResources[r]);
                            scriptResourcePromises.push(p);
                         
                    }
                    
                }
                // ----- END: ScriptResources

                $q.all(scriptResourcePromises).then(function (result){
                    loadedComponents[componentName] = scriptResources;
                    console.log(loadedComponents);
                }, function (error){
                    console.log('Failed loading all scriptResources. STOP loading.');
                });
              

            }
        },
        loadHtml: function(htmlPath, callback){
            return htmlLoadService.loadHtml(htmlPath, callback);
        }
    }
    return service;
}])
.directive('externalComponentHolder', ['externalComponentService', function(externalComponentService){

    return {
        restrict: 'E',
        scope: {
            holderId : '=',
            componentName : '=',
            scriptResources : '=',
            scriptPath : '=',
            htmlPath: '=',
            stylePath: '='
        },
        template: '<div ng-include="getContentUrl()"" style="background-color:#b0c4de"></div>',
        link: function(scope, element, attrs){
            scope.getContentUrl = function() {
                return scope.htmlPath;
            }
            if (externalComponentService.isLoaded(scope.componentName)) {
                console.log(scope.componentName.concat(' is already loaded. Skip the load script process.'));
            }else{
                console.log(scope.componentName.concat(' is not loaded. Start loading scripts...'));
                externalComponentService.loadScripts(scope.holderId, scope.componentName, scope.scriptResources);
                console.log(scope.componentName.concat(' is now loaded. Scripts loading ends.'));
            }    
        }
    }
}])
})(jQuery);