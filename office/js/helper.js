/*!
 * Copyright (C) www.vtiger.com. All rights reserved.
 * Vtiger Commercial License. Reverse engineering restricted.
 */

var vtigerHelper = {
    
    getExtensionResourceURL : function(path) {
        var baseURL = '../';
        if(path) {
            baseURL += path;
        }
        return baseURL;
    },

    addSlashes : function(str){
        return str.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
    },
    
    getHtml : function(templateName,templateData) {
        if(typeof templateData === "undefined") templateData = {};
        var templatePath = 'templates/' + templateName + '.ejs';
        var html = new EJS({url: this.getExtensionResourceURL(templatePath)}).render(templateData);
        return html;
    },
    
    registerController : function(moduleName, controllerName) {
        //api to register controller for dynamically added dom after angular bootstrap
        // Here I cannot get the controller function directly so I
        // need to loop through the module's _invokeQueue to get it
        var queue = angular.module(moduleName)._invokeQueue;
        for(var i=0;i<queue.length;i++) {
            var call = queue[i];
            if(call[0] == "$controllerProvider" &&
               call[1] == "register" &&
               call[2][0] == controllerName) {
                controllerProvider.register(controllerName, call[2][1]);
            }
        }
        //ref : http://stackoverflow.com/questions/15250644/angularjs-loading-a-controller-dynamically
    },
    
    showDialog : function(info,type) {
        var useNoty = true;
        if(useNoty) {
            this.showNoty(info.content,type);
        } else {
            var dialogHtml = this.getHtml('dialog',info);
            jQuery(dialogHtml).dialog({
                buttons: [{
                   text: "Ok", 
                   click: function() {
                      jQuery(this).dialog("close");
                   }
                }]
            });
        }
    },
    
    showConfirmation : function(info,confirmCallback,cancelCallback) {
        var useNoty = true;
        if(useNoty) {
            this.showNotyConfirmation(info.content,'alert','topRight',confirmCallback,cancelCallback);
        } else {
            var confirmationHtml = this.getHtml('dialog',info);
            jQuery(confirmationHtml).dialog({
                buttons: [{
                   text: "Yes", 
                   click: function() {
                      confirmCallback();
                      jQuery(this).dialog("close");
                   }
                },
                {
                   text: "No", 
                   click: function() {
                      cancelCallback();
                      jQuery(this).dialog("close");
                   } 
                }]
            });
        }
    },
    
    showNoty : function(text,type) {
        if(typeof type === 'undefined') {
            type = 'alert';
        }
        var n = noty({
            text        : text,
            type        : type,
            dismissQueue: true,
            layout      : 'topRight',
            theme       : 'relax',
            closeWith   : ['click'],
            timeout : 5000,
            maxVisible  : 5
        });
        return n;
    },
    
    /**
     * types - alert,information,error,warning,notification,success
     * layouts - centerRight
     */
    showNotyConfirmation : function(text,type,layout,successCallback,failCallback) {
        if(typeof type === 'undefined') {
            type = 'alert';
        }
        if(typeof layout === 'undefined') {
            layout = 'center';
        }
        var n = noty({
            text        : text,
            type        : type,
            dismissQueue: false,
            layout      : layout,
            theme       : 'relax',
            buttons     : [
                {addClass: 'apply-bootstrap btn btn-primary noty-confirm-yes', text: 'Yes', onClick: function ($noty) {
                    successCallback();
                    $noty.close();
                }
                },
                {addClass: 'apply-bootstrap btn btn-danger noty-confirm-no', text: 'No', onClick: function ($noty) {
                    failCallback();
                    $noty.close();
                }
                }
            ]
        });
        return n;
    }
    
};