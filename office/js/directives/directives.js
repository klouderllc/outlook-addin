/*!
 * Copyright (C) www.vtiger.com. All rights reserved.
 * Vtiger Commercial License. Reverse engineering restricted.
 */

function registerAppDirectives() {
    
    var app = angular.module('VtigerOutlookAddon');
    /**
     * Use directive date-picker on a text input for a date picker
     * 
     * dependencies : 
     * jQuery, keith-wood datepick plugin, moment.js
     */
    app.directive('datePicker', ["$localStorageService",function ($localStorageService) {
        return {
            restrict : 'EA',
            require : 'ngModel',
            link : function (scope, element, attrs, ngModelCtrl) {
                jQuery(function() {
                    var date_format = 'dd-mm-yyyy';
                    var pref_date_format = $localStorageService.get('date_format');
                    if(pref_date_format)
                        date_format = pref_date_format;
                    
                    element.datepick({
                        onSelect: function(date) {
                            var dateObj = new Date(date);
                            var formattedDate = moment(dateObj).format("YYYY-MM-DD");
                            ngModelCtrl.$setViewValue(formattedDate);
                            scope.$apply();
                        },
                        dateFormat: date_format
                    });
                });
            }
        };
    }]);
    
    /**
     * Use directive time-picker on a text input for a time picker
     * 
     * dependencies : 
     * jQuery, jonthornton jquery time picker, moment.js
     */
    app.directive('timePicker', ["$localStorageService",function($localStorageService) {
        return  {
            restrict : 'EA',
            require : 'ngModel',
            link : function (scope, element, attrs, ngModelCtrl) {
                jQuery(function() {
                    var time_format = 'h:i A';
                    var pref_hour_format = $localStorageService.get('hour_format');
                    if(pref_hour_format !== '12')
                        time_format = 'H:i';
                    element.timepicker({
                        'scrollDefault': 'now',
                        'timeFormat': time_format
                    });
                    element.on("change", function() {
                        var dateObj = element.timepicker('getTime', new Date(1970, 0, 1));
                        var formattedTime = moment(dateObj).format("HH:mm");
                        ngModelCtrl.$setViewValue(formattedTime);
                        scope.$apply();
                    });
                });
            }
        };
    }]);
    
    /**
     * Directive to toggle feed content in timeline view
     */
    app.directive('toggleFeedContent', function() {
        return {
            restrict : 'A',
            compile : function() {
                return function (scope, element, attrs) {
                    element.on('click',function() {
                        jQuery(this).closest('.timelinepost').find('.timeline-body').toggle();
                    });
                }
            }
        };
    });
    
    /**
     * Directive to toggle email content in Emails list view
     */
    app.directive('toggleEmailContent',function() {
        return {
            restrict : 'A',
            compile : function() {
                return function (scope, element, attrs) {
                    element.on('click',function() {
                        jQuery(this).closest('.wgt-list').find('.emailcontent').toggle();
                        jQuery(this).closest('.wgt-list').find('.openEmail').toggle();
                        jQuery(this).closest('.wgt-list').find('.closeEmail').toggle();
                    });
                }
            }
        };
    });
    
    /**
     * Directive to apply slimscroll for an element
     * 
     * dependencies : 
     * jquery, Piotr Rochala slimscroll plugin
     */
    app.directive('scrollMe', function() {
        return{
            restrict: 'A',
            replace: true,
            controller: function($scope, $element, $attrs) {
            },
            link: function(scope, element, attrs) {
            },
            compile: function() {
                return function(scope, elem, attrs) {
                    var option = scope.$eval(attrs.scrollMe);
                    var options = {
                        height: option.height,
                        alwaysVisible: false
                    };
                    if(option.hasOwnProperty('start')) options.start = option.start;
                    if(option.hasOwnProperty('alwaysVisible')) options.start = option.alwaysVisible;
                    jQuery(elem).slimScroll(options);
                }
            }
        }
    });
    
    /**
    * A generic confirmation for risky actions.
    * Usage: Add attributes: ng-really-message="Are you sure"? ng-really-click="takeAction()" function
    */
   app.directive('ngReallyClick', [function() {
       return {
           restrict: 'A',
           link: function(scope, element, attrs) {
               element.on('click', function() {
                   var message = attrs.ngReallyMessage;
                   if(message) {
                       var info = {
                            title : 'Confirm',
                            content : message
                        };
                        vtigerHelper.showConfirmation(info,function() {
                            scope.$apply(attrs.ngReallyClick);
                        },function() {
                            
                        });
                   }
               });
           }
       }
   }]);
   
   app.directive('eventStartDate', ["$localStorageService",function ($localStorageService) {
        return {
            restrict : 'EA',
            require : 'ngModel',
            link : function (scope, element, attrs, ngModelCtrl) {
                jQuery(function() {
                    
                    var date_format = 'dd-mm-yyyy';
                    var pref_date_format = $localStorageService.get('date_format');
                    if(pref_date_format)
                        date_format = pref_date_format;
                    
                    element.datepick({
                        onSelect: function(date) {
                            var dateObj = new Date(date);
                            var formattedDate = moment(dateObj).format("YYYY-MM-DD");
                            ngModelCtrl.$setViewValue(formattedDate);
                            scope.$apply();
                            
                            //auto update date time
                            var time_start_element = element.closest('form').find('input[name="time_start"]');
                            var due_date_element = element.closest('form').find('input[name="due_date"]');
                            var time_end_element = element.closest('form').find('input[name="time_end"]');
                            
                            var currentMoment = moment();
                            var startDate = moment(dateObj);
                            
                            var startTime = currentMoment.format('HH:mm');
                            if(element.attr('data-start-time')) {
                                startTime = element.attr('data-start-time');
                            }
                            var startDateTimeString = startDate.format('YYYY-MM-DD') + ' ' + startTime;
                            var startDateTime = moment(startDateTimeString,'YYYY-MM-DD HH:mm');
                            var defaultDuration = 5;
                            
                            if(element.attr('data-activitytype') === 'Call' && $localStorageService.get("callduration") !== 'undefined') {
                                defaultDuration = parseInt($localStorageService.get("callduration"));
                            } else if($localStorageService.get("othereventduration") !== 'undefined') {
                                defaultDuration = parseInt($localStorageService.get("othereventduration"));
                            }
                            
                            var endDateTime = startDateTime;
                            var unixTimeStamp = endDateTime.unix();
                            var updatedUnixTimeStamp = unixTimeStamp + (defaultDuration * 60);
                            var endDateTimeString = moment.unix(updatedUnixTimeStamp).format('YYYY-MM-DD HH:mm');
                            endDateTime = moment(endDateTimeString,'YYYY-MM-DD HH:mm');
                            
                            var date_format = 'dd-mm-yyyy';
                            var pref_date_format = $localStorageService.get('date_format');
                            if(pref_date_format)
                                date_format = pref_date_format;
                            
                            var time_format = 'HH:mm';
                            var pref_hour_format = $localStorageService.get('hour_format');
                            if(pref_hour_format !== '12')
                                time_format = 'hh:mm A';
                            
                            time_start_element.timepicker('setTime',startDateTime.format(time_format)).trigger('change');
                            due_date_element.datepick('setDate',endDateTime.format(date_format.toUpperCase()));
                            time_end_element.timepicker('setTime',endDateTime.format(time_format)).trigger('change');
                        },
                        dateFormat: date_format,
                    });
                });
            }
        };
    }]);

    app.directive('eventStartTime', ["$localStorageService",function($localStorageService) {
        return  {
            restrict : 'EA',
            require : 'ngModel',
            link : function (scope, element, attrs, ngModelCtrl) {
                jQuery(function() {
                    var time_format = 'h:i A';
                    var pref_hour_format = $localStorageService.get('hour_format');
                    if(pref_hour_format !== '12')
                        time_format = 'H:i';
                    element.timepicker({
                        'scrollDefault': 'now',
                        'timeFormat': time_format
                    });
                    element.on("change", function() {
                        var dateObj = element.timepicker('getTime', new Date(1970, 0, 1));
                        var formattedTime = moment(dateObj).format("HH:mm");
                        ngModelCtrl.$setViewValue(formattedTime);
                        scope.$apply();

                        //update end date time
                        var due_date_element = element.closest('form').find('input[name="due_date"]');
                        var time_end_element = element.closest('form').find('input[name="time_end"]');

                        var date_start = element.attr('data-start-date');

                        if(date_start) {

                            var startDateTimeString = date_start + ' ' + formattedTime;
                            var startDateTime = moment(startDateTimeString,'YYYY-MM-DD HH:mm');
                            var defaultDuration = 5;

                            if(element.attr('data-activitytype') === 'Call' && $localStorageService.get("callduration") !== 'undefined') {
                                defaultDuration = parseInt($localStorageService.get("callduration"));
                            } else if($localStorageService.get("othereventduration") !== 'undefined') {
                                defaultDuration = parseInt($localStorageService.get("othereventduration"));
                            }

                            var endDateTime = startDateTime;
                            var unixTimeStamp = endDateTime.unix();
                            var updatedUnixTimeStamp = unixTimeStamp + (defaultDuration * 60);
                            var endDateTimeString = moment.unix(updatedUnixTimeStamp).format('YYYY-MM-DD HH:mm');
                            endDateTime = moment(endDateTimeString,'YYYY-MM-DD HH:mm');

                            var date_format = 'dd-mm-yyyy';
                            var pref_date_format = $localStorageService.get('date_format');
                            if(pref_date_format)
                                date_format = pref_date_format;

                            var time_format = 'HH:mm';
                            var pref_hour_format = $localStorageService.get('hour_format');
                            if(pref_hour_format !== '12')
                                time_format = 'hh:mm A';

                            due_date_element.datepick('setDate',endDateTime.format(date_format.toUpperCase()));
                            time_end_element.timepicker('setTime',endDateTime.format(time_format)).trigger('change');

                        }

                    });
                });
            }
        };
    }]);

    app.directive('changeEventDuration',[function() {
        return {
            restrict : 'EA',
            require : 'ngModel',
            link : function (scope, element, attrs, ngModelCtrl) {
                element.on('change',function() {
                    element.closest('form').find('input[name="time_start"]').trigger('change');
                });
            }
        };
    }]);

    app.directive('uiSelectRequired', function() {
        return {
          require: 'ngModel',
          link: function(scope, elm, attrs, ctrl) {
            ctrl.$validators.uiSelectRequired = function(modelValue) {
                if(typeof modelValue === 'object') {
                    if(modelValue.length === 0 && attrs.required) {
                        return false;
                    } else {
                        return true;
                    }
                };
                if(attrs.required) {
                    return false;
                }
                return true;
            };
          }
        };
    });
    
    app.directive('birthdayDatePicker', ["$localStorageService",function ($localStorageService) {
        return {
            restrict : 'EA',
            require : 'ngModel',
            link : function (scope, element, attrs, ngModelCtrl) {
                jQuery(function() {
                    var date_format = 'dd-mm-yyyy';
                    var pref_date_format = $localStorageService.get('date_format');
                    if(pref_date_format)
                        date_format = pref_date_format;
                    
                    element.datepick({
                        onSelect: function(date) {
                            var dateObj = new Date(date);
                            var formattedDate = moment(dateObj).format("YYYY-MM-DD");
                            ngModelCtrl.$setViewValue(formattedDate);
                            scope.$apply();
                        },
                        dateFormat: date_format,
                        maxDate: moment().subtract(1, 'days').format(pref_date_format.toUpperCase())
                    });
                });
            }
        };
    }]);
      
}