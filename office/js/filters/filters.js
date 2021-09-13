/*!
 * Copyright (C) www.vtiger.com. All rights reserved.
 * Vtiger Commercial License. Reverse engineering restricted.
 */

function registerAppFilters() {
    
    var app = angular.module("VtigerOutlookAddon");
    
    /**
     * filter to remove spaces and convert to lowercase
     */
    app.filter('removeSpacesThenLowercase', function () {
        return function (text) {
            var str = text.replace(/\s+/g, '');
            return str.toLowerCase();
        };
    });
    
    app.filter('formatDateTimeToLocalTimeZone', ["$localStorageService",function($localStorageService) {
        return function(input) {
            var user_preferred_date_format = 'YYYY-MM-DD';
            var user_preferred_time_format = 'HH:mm';
            var date_format = $localStorageService.get('date_format');
            var hour_format = $localStorageService.get('hour_format');

            if(date_format) user_preferred_date_format = date_format.toUpperCase();
            if(hour_format === '12') user_preferred_time_format = user_preferred_time_format.toLowerCase() + ' A';
            
            var date = new Date(input + ' UTC');
            var m = moment(date);
            var res = m.format(user_preferred_date_format+ ' ' +user_preferred_time_format);
            if(res == 'Invalid date') {
                res = input;
            }
            return res;
        };
    }]);
    
    app.filter('reverse', function() {
        return function(items) {
            if(typeof items === 'object') {
               return items.slice().reverse(); 
            }
        };
    });
    
    app.filter('date_format', ["$localStorageService",function($localStorageService) {
        return function(input,date_format) {
            if(!input) return '';
            if(typeof date_format === 'undefined')
                date_format = $localStorageService.get('date_format');
            var m = moment(input);
            return m.format(date_format.toUpperCase());
        };
    }]);
    
    app.filter('time_format', ["$localStorageService",function($localStorageService) {
        return function(input,hour_format) {
            if(!input) return '';

            var current_input_format = 'HH:mm:ss';
            if(input.indexOf('AM') !== -1 || input.indexOf('PM') !== -1)
                current_input_format = 'hh:mm A';
            
            var time_format = 'hh:mm A';
            
            if(typeof hour_format === 'undefined') {
                hour_format = $localStorageService.get('hour_format');
            }
            
            if(hour_format !== '12') {
                time_format = 'HH:mm';
            }

            var m = moment(input,current_input_format);
            return m.format(time_format);
        };
    }]);

    /**
    * AngularJS default filter with the following expression:
    * "person in people | filter: {name: $select.search, age: $select.search}"
    * performs a AND between 'name: $select.search' and 'age: $select.search'.
    * We want to perform a OR.
    */
   app.filter('propsFilter', function() {
     return function(items, props) {
       var out = [];

       if (angular.isArray(items)) {
         items.forEach(function(item) {
           var itemMatches = false;

           var keys = Object.keys(props);
           for (var i = 0; i < keys.length; i++) {
             var prop = keys[i];
             var text = props[prop].toLowerCase();
             if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
               itemMatches = true;
               break;
             }
           }

           if (itemMatches) {
             out.push(item);
           }
         });
       } else {
         // Let the output be the input untouched
         out = items;
       }

       return out;
     };
   });
   
   /**
    * Filter to cut text
    */
   app.filter('cut', function () {
        return function (value, wordwise, max, tail) {
            if (!value) return '';

            max = parseInt(max, 10);
            if (!max) return value;
            if (value.length <= max) return value;

            value = value.substr(0, max);
            if (wordwise) {
                var lastspace = value.lastIndexOf(' ');
                if (lastspace != -1) {
                    value = value.substr(0, lastspace);
                }
            }

            return value + (tail || ' â€¦');
        };
    });
    
    /**
     * Filter to create anchor tags
     */
    app.filter('linkify', function () {
        return function (text, href, target) {
            if(typeof text === 'undefined') {
                text = 'link';
            }
            if(typeof href === 'undefined') {
                href = 'javascript:void(0)';
            }
            if(typeof target === 'undefined') {
                target = '_blank';
            }
            var a =  jQuery('<a></a>',{
                text: text,
                href: href,
                target: target
            });
            return a[0];
        };
    });
    
    app.filter('htmldecode',function(){
        return function(value){
            if (value) {
              return $('<div />').html(value).text();
            } else {
              return '';
            }
        };   
    });
    
}