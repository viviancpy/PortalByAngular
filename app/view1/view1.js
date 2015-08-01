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
.directive('lazyLoad', ['$window', '$q', function ($window, $q) {
        function load_script() {
            var s = document.createElement('script'); // use global document since Angular's $document is weak
            s.src = 'https://maps.googleapis.com/maps/api/js?sensor=false&callback=initialize';
            document.body.appendChild(s);
        }
        function lazyLoadApi(key) {
            var deferred = $q.defer();
            $window.initialize = function () {
                deferred.resolve();
            };
            // thanks to Emil Stenström: http://friendlybit.com/js/lazy-loading-asyncronous-javascript/
            if ($window.attachEvent) {  
                $window.attachEvent('onload', load_script); 
            } else {
                $window.addEventListener('load', load_script, false);
            }
            return deferred.promise;
        }
        return {
            restrict: 'E',
            link: function (scope, element, attrs) { // function content is optional
            // in this example, it shows how and when the promises are resolved
                if ($window.google && $window.google.maps) {
                    console.log('gmaps already loaded');
                } else {
                    lazyLoadApi().then(function () {
                        console.log('promise resolved');
                        if ($window.google && $window.google.maps) {
                            console.log('gmaps loaded');
                        } else {
                            console.log('gmaps not loaded');
                        }
                    }, function () {
                        console.log('promise rejected');
                    });
                }
            }
        };
    }])
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
                    console.log(loadedScripts[i].outerHTML);
                    console.log('<script src="' + scriptResource + '"></script>');
                    scriptLoaded = scriptLoaded || (loadedScripts[i].outerHTML == '<script src="' + scriptResource + '"></script>')
                }

                if (!scriptLoaded){
                    var s = document.createElement('script'); // use global document since Angular's $document is weak
                    s.src = scriptResource; // example: 'https://maps.googleapis.com/maps/api/js?sensor=false&callback=initialize'
                    document.body.appendChild(s);
                }
                deferred.resolve();
            }

            if ($window.attachEvent) {  
                $window.attachEvent('onload', load_script); 
            } else {
                $window.addEventListener('load', load_script, false);
            }
            return deferred.promise;
        }

    // var loadScriptResource = function(componentId, scriptResource){
    //     return $.ajax({
    //         dataType: "script",
    //         cache: true,
    //         url: scriptResource
    //       });
    // }

    var service = {
        loadJs: loadJs
    };
    return service;
}])

.factory('externalComponentService', ['$q', 'scriptLoadService', function externalComponentService($q, scriptLoadService) {
    var self = this;
    var loadedComponents = {};
    var service = {
        isLoaded: function(componentName){
            return (componentName in loadedComponents)
        },
        loadScripts: function(componentName, scriptResources){
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
            htmlPath: '=',
            stylePath: '='
        },
        link: function(scope, element, attrs){
            if (externalComponentService.isLoaded(scope.componentName)) {
                console.log(scope.componentName.concat(' is already loaded'));
            }else{
                console.log(scope.componentName.concat(' is not loaded'));
                externalComponentService.loadScripts(scope.componentName, scope.scriptResources);
            }
        }
    }
}])
})(jQuery);