registerScript();

function Filter(type, key) {
    return {
        type: type,
        key: key
    }
}

function TextFilter(key, value, isRegex) {
    var filter = new Filter('text', key);
    filter.value = value;
    filter.regex = isRegex;
    return filter;
};

function NumericalFilter(key, minValue, maxValue) {
    var filter = new Filter('numerical', key);
    filter.minValue = minValue;
    filter.maxValue = maxValue;
    return filter;
};

function DateFilter(key, minDate, maxDate) {
    var filter = new Filter('date', key);
    filter.minDate = minDate;
    filter.maxDate = maxDate;
    return filter;
};

function Selector(textFilters, numericalFilters) {
    return {
        textFilters: textFilters,
        numericalFilters: numericalFilters
    };
}

function ServiceParams(cpu, granularity, groupby, partition, sessionId, timeout, nextFactor) {
    return {
        "aggregateService.cpu": cpu,
        "aggregateService.granularity": granularity,
        "aggregateService.groupby": groupby,
        "aggregateService.partition": partition,
        "aggregateService.sessionId": sessionId,
        "aggregateService.timeout": timeout,
        "measurementService.nextFactor": nextFactor
    };
}

function RTMPayload(selectorCollection, serviceParams) {
    return {
        selectors1: selectorCollection,
        serviceParams: serviceParams
    };
}


function DefaultTextFilter() {
    return new TextFilter('', '', false);
};

function DefaultNumericalFilter() {
    return new NumericalFilter('value', 0, 1);
};

function DefaultDateFilter() {
    return new DateFilter('begin', 0, 1577840400000);
};

function DefaultSelector() {
    return {
        textFilters: [new DefaultTextFilter()],
        numericalFilters: []
    };
}

function DefaultServiceParams() {
    return new ServiceParams(
    /* "aggregateService.cpu": */ "1",
    /* "aggregateService.granularity": */ "auto",
    /* "aggregateService.groupby": */ "name",
    /* "aggregateService.partition": */ "8",
    /* "aggregateService.sessionId": */ "defaultSid",
    /* "aggregateService.timeout": */ "600",
    /* "measurementService.nextFactor": */ "0");
}

function DefaultRTMPayload() {
    return new RTMPayload([new DefaultSelector()], new DefaultServiceParams());
}


angular.module('rtm-controls', [])

    .directive('rtmControls', function () {
        return {
            restrict: 'E',
            scope: {
                payload: '='
            },

            templateUrl: resolveTemplateURL('rtm-controls.js', 'rtm-controls.html'),
            controller: function ($scope) {

                $scope.addSelector = function(){
                    $scope.payload.selectors1.push(new DefaultSelector());
                };

                $scope.clearAll = function(){
                    $scope.payload.selectors1.length = 0;
                };

                $scope.removeSelector = function(idx){
                    $scope.payload.selectors1.splice(idx, 1);
                };

            }
        };
    })
    .directive('rtmSelector', function () {
        return {
            restrict: 'E',
            scope: {
                textfilters: '=',
                numericalfilters: '=',
            },

            templateUrl: resolveTemplateURL('rtm-controls.js', 'rtm-selector.html'),
            controller: function ($scope) {
                //console.log(angular.toJson($scope.textfilters));
                //console.log(angular.toJson($scope.numericalfilters));

                $scope.addTextFilter = function(){
                    $scope.textfilters.push(new DefaultTextFilter());
                };

                $scope.addNumericalFilter = function(){
                    $scope.numericalfilters.push(new DefaultNumericalFilter());
                };

                $scope.addDateFilter = function(){
                    $scope.numericalfilters.push(new DefaultDateFilter());
                };

                
                $scope.removeTextfilter = function(idx){
                    $scope.textfilters.splice(idx, 1);
                };

                $scope.removeNumericalfilter = function(idx){
                    $scope.numericalfilters.splice(idx, 1);
                };
            }
        };
    })
    .directive('rtmServiceParams', function () {
        return {
            restrict: 'E',
            scope: {
                filter: '='
            },

            templateUrl: resolveTemplateURL('rtm-controls.js', 'rtm-service-params.html'),
            controller: function ($scope) {

            }
        };
    })
    .directive('rtmTextFilter', function () {
        return {
            restrict: 'E',
            scope: {
                key: '=',
                value: '=',
                regex: '='
            },

            templateUrl: resolveTemplateURL('rtm-controls.js', 'rtm-text-filter.html'),
            controller: function ($scope) {
                $scope.setKey = function(key){
                    $scope.key = key;
                };
            }
        };
    })
    .directive('rtmNumericalFilter', function () {
        return {
            restrict: 'E',
            scope: {
                key: '=',
                minvalue: '=',
                maxvalue: '='
            },

            templateUrl: resolveTemplateURL('rtm-controls.js', 'rtm-numerical-filter.html'),
            controller: function ($scope) {

                $scope.setKey = function(key){
                    $scope.key = key;
                };
            }
        };
    })
    .directive('rtmDateFilter', function () {
        return {
            restrict: 'E',
            scope: {
                key: '=',
                mindate: '=',
                maxdate: '='
            },

            templateUrl: resolveTemplateURL('rtm-controls.js', 'rtm-date-filter.html'),
            controller: function ($scope) {
                $scope.setMaxDate = function(timestamp){
                    $scope.maxmodel = new Date(timestamp);
                };

                $scope.setMinDate = function(timestamp){
                    $scope.maxmodel = new Date(timestamp);
                };

                $scope.setKey = function(key){
                    $scope.key = key;
                };
            }
        };
    })
   