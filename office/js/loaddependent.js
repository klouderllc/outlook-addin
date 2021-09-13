/*!
 * Copyright (C) www.vtiger.com. All rights reserved.
 * Vtiger Commercial License. Reverse engineering restricted.
 */
;"use strict";(function(){var b=function(d){for(var g=0;g<d.length;g++){var e=d[g];var f=document.createElement("script");f.src=vtigerHelper.getExtensionResourceURL(e);(document.head||document.documentElement).appendChild(f)}};var a=function(){var d=["js/libs/jquery-ui.min.js","js/libs/datepick/jquery.plugindatepick.js","js/libs/timepicker/jquery.timepicker.min.js","js/libs/slimscroll/jquery.slimscroll.min.js","js/libs/noty/packaged/jquery.noty.packaged.js"];b(d)};var c=setInterval(function(){if(typeof jQuery==="function"){a();clearInterval(c)}else{console.log("waiting for jquery..")}},1)})();