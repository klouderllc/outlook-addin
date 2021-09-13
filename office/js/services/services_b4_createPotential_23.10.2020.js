/*!
 * Copyright (C) www.vtiger.com. All rights reserved.
 * Vtiger Commercial License. Reverse engineering restricted.
 */

function registerAppServices() {
    angular.module("VtigerOutlookAddon").factory('$deferred', ["$q",function($q) {
        return {
            create: function() {
                // $q.promise does not provide ("then" callback)
                // we try to implement by pushing error and result to "then" callback.
                var deferred = $q.defer();

                // Backup actual then handler, to provide customized promise methods (then, success, error)
                var dP = deferred.promise;
                var dT = dP.then;

                // Customize handlers
                var thenFn = function() {
                }, successFn = null, errorFn = null;
                deferred.promise.success = function(fn) {
                        successFn = fn;
                }
                deferred.promise.error = function(fn) {
                        errorFn = fn;
                }
                deferred.promise.then = function(fn) {
                        thenFn = fn;
                }

                dT.call(dP, function(result) {
                        successFn ? successFn(result) : thenFn(null, result);
                }, function(err) {
                        errorFn ? errorFn(err) : thenFn(err, null);
                });

                return deferred;
            }
        }
    }]);

    angular.module("VtigerOutlookAddon").factory("$localStorageService",function() {
        return {
            'get' : function(key) {
                key = key+"_"+Office.context.mailbox.userProfile.emailAddress;
                return localStorage.getItem(key);
            },

            'set' : function(key,value) {
                key = key+"_"+Office.context.mailbox.userProfile.emailAddress;
                return localStorage.setItem(key,value);
            },

            'remove' : function(key) {
                key = key+"_"+Office.context.mailbox.userProfile.emailAddress;
                localStorage.removeItem(key);
            },

            'clear' : function() {
                localStorage.clear();
            }
        };
    });

    angular.module("VtigerOutlookAddon").factory('$crmconnector', ["$localStorageService","$deferred","$http",function($localStorageService,$deferred,$http) {
        function _invoke(method, params) {
                if (typeof params === 'undefined')
                        params = {};

                var options = {
                    method: method
                };
                
                if(params.hasOwnProperty('url')) {
                    options.url = params.url;
                } else {
                    //var ENDPOINT = $localStorageService.get('crm-instance-url') + '/modules/Gadget/api.php';
                    //var ENDPOINT = 'http://localhost/micah_latest/modules/OutlookAddIn/api.php';
					var ENDPOINT =  $localStorageService.get('crm-instance-url') + '/modules/OutlookAddIn/api.php';
                    options.url = ENDPOINT;
                }

                if (params && (method === 'GET' || method === 'POST')) {
                    if (method === 'GET')
                        options.params = params;
                    else
                        options.data = params;
                }
                
                var deferred = $deferred.create();
                $http(options).success(function(data, status, headers, config) {
                    data.success ?
                    deferred.resolve(data.result, null) :
                    deferred.reject(data.error ? data.error : "No response");
                }).error(function(data, status, headers, config) {
                    deferred.reject(data ? data : "ERR: " + status);
                });
                return deferred.promise;
        }
        return {
                'get': function(params) {
                        return _invoke.apply(null, ['GET', params]);
                },
                'post': function(params) {
                        return _invoke.apply(null, ['POST', params]);
                },
                'jsonp' : function(params) {
                        return _invoke.apply(null, ['JSONP', params]);
                }
        }
    }]);

    angular.module("VtigerOutlookAddon").factory('$crmapi', ["$deferred","$crmconnector","$localStorageService","$http",function($deferred,$crmconnector,$localStorageService,$http) {
        
        return {
            
            resolveURL : function(username,password) {
                var url = 'https://crmaccounts.od1.vtiger.com/v1/Users/Auth';
                var params = {
                    'url' : url,
                    'username' : username,
                    'password' : password
                };
                var aDeferred = $deferred.create();
                $crmconnector.post(params).then(function(e,res) {
                    res ? aDeferred.resolve(res) : aDeferred.reject(e);
                });
                return aDeferred.promise;
            },
            
            login : function(username,password) {
                var params = {
                    '_operation' : 'login',
                    'username' : username,
                    'password' : password,
                    //'url' : 'http://localhost/micah_latest/modules/OutlookAddIn/login.php'
                };



                var aDeferred = $deferred.create();
                $crmconnector.post(params).then(function(e,res) {
                    res ? aDeferred.resolve(res) : aDeferred.reject(e);
                });
                return aDeferred.promise;
            },

            describe : function(module,fetchOutlookConfigurableFields=false) {
                var params = {
                  '_operation' : 'describe',
                  '_session' : $localStorageService.get('vtigersession'),
                  'module' : module,
                  fetchOutlookConfigurableFields : fetchOutlookConfigurableFields
                };

                var aDeferred = $deferred.create();
                $crmconnector.post(params).then(function(e,res) {
                    res ? aDeferred.resolve(res) : aDeferred.reject(e);
                });
                return aDeferred.promise;
            },
			
            fetchModuleUsers : function(module) {
                var params = {
                    '_operation' : 'fetchModuleOwners',
                    '_session' : $localStorageService.get('vtigersession'),
                    'module' : module
                };

                var aDeferred = $deferred.create();
                $crmconnector.post(params).then(function(e,res) {
                    res ? aDeferred.resolve(res) : aDeferred.reject(e);
                });
                return aDeferred.promise;
            },

            saveRecord : function(module,values,recordId) {
                //adding source for record
                var jsonValues = JSON.parse(values);
                jsonValues['source'] = 'Outlook Addon';
                values = JSON.stringify(jsonValues);
                
                var params = {
                    '_operation' : 'saveRecord',
                    '_session' : $localStorageService.get('vtigersession'),
                    'module' : module,
                    'record' : recordId,
                    'values' : values
                };

                var aDeferred = $deferred.create();
                $crmconnector.post(params).then(function(e,res) {
                    res ? aDeferred.resolve(res) : aDeferred.reject(e);
                });
                return aDeferred.promise;
            },
            
            archiveEmail : function(module,values,recordId, relatedrecordid) {
                var params = {
                    '_operation' : 'archiveEmail',
                    '_session' : $localStorageService.get('vtigersession'),
                    'module' : module,
                    'record' : recordId,
                    'values' : values,
                    'relatedrecordid' : relatedrecordid,
                };
                
                // link record if related record id is present
                if(relatedrecordid) {
                    params['mode'] = 'link';
                    params['relatedrecordid'] = relatedrecordid;
                }

                var aDeferred = $deferred.create();
                $crmconnector.post(params).then(function(e,res) {
                    res ? aDeferred.resolve(res) : aDeferred.reject(e);
                });
                return aDeferred.promise;
            },

            fetchRecord : function(recordId) {
                var params = {
                    '_operation' : 'fetchRecord',
                    '_session' : $localStorageService.get('vtigersession'),
                    'record' : recordId
                };

                var aDeferred = $deferred.create();
                $crmconnector.post(params).then(function(e,res) {
                    res ? aDeferred.resolve(res) : aDeferred.reject(e);
                });
                return aDeferred.promise;
            },

            fetchRecordDetailsFromEmail : function(email) {
                var thisInstance = this;
                var params = {
                    '_operation' : 'fetchRecordDetailsFromEmail',
                    '_session' : $localStorageService.get('vtigersession'),
                    'email' : email
                };

                var aDeferred = $deferred.create();
                $crmconnector.post(params).then(function(e,res) {
                    if(res) thisInstance.addDetailViewUrls(res,res.record.module);
                    res ? aDeferred.resolve(res) : aDeferred.reject(e);
                });
                return aDeferred.promise;
            },

            fetchUpcomingActivities : function(recordId) {
                var thisInstance = this;
                var params = {
                    '_operation' : 'fetchUpcomingActivities',
                    '_session' : $localStorageService.get('vtigersession'),
                    'record' : recordId
                };

                var aDeferred = $deferred.create();
                $crmconnector.post(params).then(function(e,res) {
                    thisInstance.addDetailViewUrls(res,'Calendar');
                    res ? aDeferred.resolve(res) : aDeferred.reject(e);
                });
                return aDeferred.promise;
            },

            relatedRecordsWithGrouping : function(recordId,relatedModule) {
                var params = {
                    '_operation' : 'relatedRecordsWithGrouping',
                    '_session' : $localStorageService.get('vtigersession'),
                    'record' : recordId,
                    'relatedmodule' : relatedModule
                };

                var aDeferred = $deferred.create();
                $crmconnector.post(params).then(function(e,res) {
                    res ? aDeferred.resolve(res) : aDeferred.reject(e);
                });
                return aDeferred.promise;
            },
            
            fetchRelatedRecords : function(recordId,relatedModule,fields) {
                var thisInstance = this;
                var params = {
                    '_operation' : 'fetchRelatedRecords',
                    '_session' : $localStorageService.get('vtigersession'),
                    'parentId' : recordId,
                    'module' : relatedModule
                };
                
                if(typeof fields != 'undefined') {
                    params.fields = fields;
                }

                var aDeferred = $deferred.create();
                $crmconnector.post(params).then(function(e,res) {
                    thisInstance.addDetailViewUrls(res,relatedModule);
                    res ? aDeferred.resolve(res) : aDeferred.reject(e);
                });
                return aDeferred.promise;
            },
            
            history : function(module,record,mode) {
                var params = {
                    '_operation' : 'history',
                    '_session' : $localStorageService.get('vtigersession'),
                    'module' : module,
                    'record' : record,
                    'mode' : mode
                };
                
                var aDeferred = $deferred.create();
                $crmconnector.post(params).then(function(e,res) {
                    res ? aDeferred.resolve(res) : aDeferred.reject(e);
                });
                return aDeferred.promise;
            },
            
            addComment : function(relatedRecord,commentContent, isPrivate) {
                if(typeof isPrivate === 'undefined') {
                    isPrivate = 1;
                }
                var values = {
                    'related_to' : relatedRecord,
                    'commentcontent' : commentContent,
                    'is_private': isPrivate
                };
                var params = {
                    '_operation' : 'addRecordComment',
                    '_session' : $localStorageService.get('vtigersession'),
                    'values' : JSON.stringify(values)
                };
                
                var aDeferred = $deferred.create();
                $crmconnector.post(params).then(function(e,res) {
                    res ? aDeferred.resolve(res) : aDeferred.reject(e);
                });
                return aDeferred.promise;
            },
            
            replyCase : function(caseRecordId, commentContent, to) {
                var values = {
                    'caseRecordId' : caseRecordId,
                    'description' : commentContent,
                    'to' : to,
                    'email_flag' : 'SENT'
                };
                var params = {
                    '_operation' : 'casesEmailQueue',
                    '_session' : $localStorageService.get('vtigersession'),
                    'values' : JSON.stringify(values)
                };
                
                var aDeferred = $deferred.create();
                $crmconnector.post(params).then(function(e,res) {
                    res ? aDeferred.resolve(res) : aDeferred.reject(e);
                });
                return aDeferred.promise;
            },
            
            fetchReferenceRecords : function(referenceModule,searchKey) {
                var params = {
                    '_operation' : 'fetchReferenceRecords',
                    '_session' : $localStorageService.get('vtigersession'),
                    'referenceModule' : referenceModule,
                    'searchKey' : searchKey
                };
                var options = {
                    'method' : 'POST',
                    //'url' : $localStorageService.get('crm-instance-url') + '/modules/Gadget/api.php',
					'url' : $localStorageService.get('crm-instance-url') + '/modules/OutlookAddIn/api.php',
                    'data' : params
                };
                /*
                 * api uses direct http service to support angular-ui typeahead
                 * for reference fields
                 */
                return $http(options).then(function(res) {
                    if(!res.data.error) {
                        return res.data.result;
                    }
                    return [];
                });
            },
            
            fetchModules : function() {
                var aDeferred = $deferred.create();
                if($localStorageService.get('vtigermodules')) {
                    aDeferred.resolve(JSON.parse($localStorageService.get('vtigermodules')))
                    return aDeferred.promise;
                }
                
                var params = {
                    '_operation' : 'fetchModules',
                    '_session' : $localStorageService.get('vtigersession')
                };
                $crmconnector.post(params).then(function(e,res) {
                    if(res) {
                        $localStorageService.set('vtigermodules',JSON.stringify(res));
                    }
                    res ? aDeferred.resolve(res) : aDeferred.reject(e);
                });
                return aDeferred.promise;
            },
            
            isModuleEnabled : function(module) {
                var aDeferred = $deferred.create();
                this.fetchModules().then(function(e,res) {
                    if(res) {
                        var activeModules = [];
                        angular.forEach(res.modules,function(value) {
                            activeModules.push(value.name);
                        },activeModules);
                        var resp = {enabled:false};
                        if(activeModules.indexOf(module) !== -1) {
                            resp.enabled = true;
                        }
                        aDeferred.resolve(resp)
                    } else {
                        aDeferred.reject(e);
                    }
                    
                });
                return aDeferred.promise;
            },
            
            hasEditViewPermission : function(module) {
                var aDeferred = $deferred.create();
                this.fetchModules().then(function(e,res) {
                    if(res) {
                        var activeModules = [];
                        angular.forEach(res.modules,function(value) {
                            activeModules[value.name] = value;
                        },activeModules);
                        var resp = {editPermission:false};
                        if(activeModules[module]) {
                            resp.editPermission = activeModules[module].editPermission;
                        }
                        aDeferred.resolve(resp)
                    } else {
                        aDeferred.reject(e);
                    }
                });
                return aDeferred.promise;
            },
            
            getExtensionModuleSettings : function() {
                var aDeferred = $deferred.create();
                var thisInstance = this;
                
                if($localStorageService.get('vtigerextensionmodulesettings')) {
                    aDeferred.resolve(JSON.parse($localStorageService.get('vtigerextensionmodulesettings')))
                    return aDeferred.promise;
                }
                
                var defaultModuleSettings = [
                {
                    module : {
                        name : 'Events',
                        label : 'Activities',
                    },
                    active : true
                },
                {
                    module : {
                        name : 'Emails',
                        label : 'Emails',
                    },
                    active : true
                },
                {
                    module : {
                        name : 'Quotes',
                        label : 'Quotes',
                    },
                    active : true
                },{
                    module : {
                        name : 'Invoice',
                        label : 'Invoice',
                    },
                    active : true
                },{
                    module : {
                        name : 'Potentials',
                        label : 'Opportunities',
                    },
                    active : true
                },{
                    module : {
                        name : 'HelpDesk',
                        label : 'Tickets',
                    },
                    active : true
                },{
                    module : {
                        name : 'Cases',
                        label : 'Cases',
                    },
                    active : true
                },{
                    module : {
                        name : 'ModComments',
                        label : 'Comments',
                    },
                    active : true
                }];
            
                this.fetchModules().then(function(e,res) {
                    if(!e && res) {
                        var moduleSettings = [];
                        
                        var activeCrmModules = [];
                        
                        angular.forEach(res.modules,function(value) {
                            var moduleName = value.name;
                            if(moduleName === 'Calendar') moduleName = 'Events';
                            this.push(moduleName);
                        },activeCrmModules);
                        
                        angular.forEach(defaultModuleSettings,function(value) {
                            if(activeCrmModules.indexOf(value.module.name) !== -1) {
                                this.push(value);
                            }
                        },moduleSettings);
                        
                        thisInstance.storeExtensionModuleSettings(moduleSettings);
                        aDeferred.resolve(moduleSettings);
                    } else if(e) {
                        aDeferred.reject(e);
                    }
                });
                
                return aDeferred.promise;
            },
            
            storeExtensionModuleSettings : function(moduleSettings) {
                $localStorageService.set('vtigerextensionmodulesettings',JSON.stringify(moduleSettings));
            },
            
            getEntityIdFromWSId : function(wsId) {
                var parts = wsId.split('x');
                return parts[1];
            },
            
            addDetailViewUrls : function(list,module) {
                var thisInstance = this;
                angular.forEach(list,function(record) {
                    record.detailViewUrl = thisInstance.getDetailViewUrl(module,record.id);
                },list);
            },
            
            getDetailViewUrl : function(module,recordId, parentModule) {
               var url = $localStorageService.get('crm-instance-url');
               if(url) {
                   if(typeof module === 'undefined') {
                       return url;
                   } else if(typeof recordId === 'undefined') {
                       return url + '?module=' + module + '&view=List';
                   }
                   var parts = recordId.split('x');
                   var record = parts[1];
                   if(module === 'Emails') {
                       return url + '/index.php?module=' + module + '&view=PreviewEmail&record=' + record;
                   }
                   url += '/index.php?module=' + module + '&view=Detail&record=' + record;
                   if(typeof parentModule !== 'undefined') {
                       url += '&parent=' + parentModule;
                   }
                   return url;
               }
               return 'javascript:void(0)';
           },
            
            escapeHtml : function(string) {
                var entityMap = {
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': '&quot;',
                    "'": '&#39;',
                    "/": '&#x2F;'
                };
                return String(string).replace(/[&<>"'\/]/g, function (s) {
                  return entityMap[s];
                });
            }
                        
        };
    }]);
    
    angular.module("VtigerOutlookAddon").factory('$outlookconnector',["$deferred", function($deferred){
        return {
            getEmailContent : function() {
                var body = Office.context.mailbox.item.body;
                var deferred = $deferred.create();
                body.getAsync(Office.CoercionType.Text, function (asyncResult) {
                    if (asyncResult.status !== Office.AsyncResultStatus.Succeeded) {
                        deferred.reject("Unable to fetch mail content");
                    } else {
                        var content = asyncResult.value;
                        deferred.resolve(content, null);
                    }
                });
                return deferred.promise;
            }
        };
    }]);
}