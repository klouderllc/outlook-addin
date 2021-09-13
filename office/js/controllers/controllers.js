/*!
 * Copyright (C) www.vtiger.com. All rights reserved.
 * Vtiger Commercial License. Reverse engineering restricted.
 */

function registerAppControllers() {
    
    var app = angular.module('VtigerOutlookAddon');
    
    /**
     * MainController - controls the app
     * 
     * models : 
     * currentUserId - userId of current logged in user
     * name - contact/lead name
     * email - contact/lead email
     * module - setype - contact/lead
     * currentUserFirstName - firstName of current logged in user 
     * currentUserLastName - lastName of current logged in user 
     * userCrmInstanceUrl - CRM instance URL of logged in user
     * userpreferenceUrl  - Preference page URL of current logged in user
     * crmRecordId - vtiger ws recordid
     * view - current app view
     * userpreferences - current user preferences
     */
    app.controller('MainController', ["$scope","$localStorageService","$crmapi", "$rootScope","$timeout",function($scope,$localStorageService,$crmapi, $rootScope,$timeout) {
        $rootScope.$on("changeView", function(e, view){
            if(typeof $scope.changeView == 'function') {
                $scope.changeView(view);
            }
        });
            
        var autoRoute = function() {
            $scope.view = 'busy';
            $scope.$watch('email',function() {
                
                
                $crmapi.fetchRecordDetailsFromEmail($scope.email,$scope.module).then(function(e,res) {
                    if(e && e.code === 1501) {
                        clearAppStorage();
                        $scope.view = 'login';
                    } else if(res) {
                        $scope.view = 'summary';
                        $scope.crmRecordId = res.record.id;
                        var module =  res.record.module;
                        $scope.module = module;
                        
                        $scope.crmRecord = res.record;
                        if(module == 'Accounts') {
							var nameToDisplay = $scope.crmRecord.accountname;
                        }else{
                            var nameToDisplay =  $scope.crmRecord.firstname + ' ' + $scope.crmRecord.lastname;
                          }
                        
                        $scope.name = nameToDisplay;
                        $scope.crmRecordDetailViewUrl = $scope.crmRecord.detailViewUrl;
                        
                    } else {
                        $scope.crmRecordId = null;
                        $scope.view = 'create';
                    }
                    
                    if($scope.view !== 'login') {
                        $scope.userpreferences = {
                            'user_tz' : $localStorageService.get("user_tz"),
                            'date_format' : $localStorageService.get("date_format"),
                            'hour_format' : $localStorageService.get("hour_format"),
                            'currency_symbol' : $localStorageService.get("currency_symbol"),
                            'defaulteventstatus' : $localStorageService.get("defaulteventstatus"),
                            'defaultactivitytype' : $localStorageService.get("defaultactivitytype"),
                            'othereventduration' : $localStorageService.get("othereventduration"),
                            'callduration' : $localStorageService.get("callduration"),
                            'user_primary_group' : $localStorageService.get("user_primary_group")
                        };
                        $scope.currentUserLastName = $localStorageService.get("last_name");
                        $scope.currentUserFirstName = $localStorageService.get("first_name")?
                        $localStorageService.get("first_name"):$scope.currentUserLastName;
                        $scope.userCrmInstanceUrl = $localStorageService.get("crm-instance-url");
                        var crmUserId = $crmapi.getEntityIdFromWSId($scope.currentUserId);
                        var preferenceModuleUrl = $scope.userCrmInstanceUrl + '/index.php?module=Users&view=PreferenceDetail&parent=Settings&record='+crmUserId;
                        $scope.userpreferenceUrl = preferenceModuleUrl;
                        $scope.organizationName =  $localStorageService.get("organizationname");
                    }
                    
                });
            });
        }
        
        if(!$localStorageService.get("showloginpage") && !$localStorageService.get("vtigersession")) {
            // to do km remove getstarted related code
            //$scope.view = 'getstarted';
            $scope.view = 'login';
        } else if(!$localStorageService.get("vtigersession")) {
            $scope.view = 'login';
        } else {
            autoRoute();
        }
        
        $scope.getStarted = function() {
            $localStorageService.set('showloginpage', true);
            $scope.changeView('login');
        }
        
        $scope.changeView = function(view) {
            
            if(view === '') {
                autoRoute();
        
            } else {
                $scope.view = view;
            }
        };
           
        $scope.$on('MainController:changeView', function(event, args) {
         
            $scope.changeView(args.view);
        });
        
        $scope.$on('MainController:changeModule', function(event, args) {
            $scope.module = args.module;
        });
        
        $scope.$on('MainController:changeRecord', function(event, args) {
            $scope.crmRecordId = args.record;
        });
        
        $scope.$on('MainController:changeEntityName', function(event, args) {
            $scope.name = args.name;
        });
        
        $scope.$on('MainController:changeUserId', function(event, args) {
            $scope.currentUserId = args.userId;
            $localStorageService.set('vtiger.current-user-id',$scope.currentUserId);
        });
        
        $scope.$on('MainController:changeCrmRecordDetailUrl',function(event,args) {
            $scope.crmRecordDetailViewUrl = args.url;
        });

        $scope.$on('MainController:changeEmailLabelInHeader',function(event,args) {
            $scope.email = args.email;
        });
        
        if($localStorageService.get("vtiger.current-user-id")) {
            $scope.currentUserId = $localStorageService.get("vtiger.current-user-id");
        }
        
        var clearAppStorage = function() {
            $localStorageService.remove('vtigersession');
            $localStorageService.remove('vtiger.current-user-id');
            $localStorageService.remove('vtigerextensionmodulesettings');
            $localStorageService.remove('date_format');
            $localStorageService.remove('hour_format');
            $localStorageService.remove('currency_symbol');
            $localStorageService.remove('vtigermodules');
            $localStorageService.remove('defaulteventstatus');
            $localStorageService.remove('defaultactivitytype');
            $localStorageService.remove('othereventduration');
            $localStorageService.remove('callduration');
            $localStorageService.remove('first_name');
            $localStorageService.remove('last_name');
            $localStorageService.remove('organizationname');
            $localStorageService.remove('user_primary_group');
        };
        
        $scope.logout = function() {
            clearAppStorage();
            $scope.view = 'login';
        };

       
        
        $scope.getReferenceRecords = function(val) {
            
            return $crmapi.fetchRecordsBySearchKeyword("",val);
        }
        
       
        $scope.onSelect = function ($item, $model, $label) {
          
           

            $scope.view = 'busy';

            $timeout(function() {

               
                var selectedRecordId = $item.value;
                 
                var name = $item.label;
    
                var selectedModule = $item.setype;

                var selectedRecordEmail =  $item.email;

                var detailUrl = $crmapi.getDetailViewUrl(selectedModule,selectedRecordId);

                $scope.searchTextField = null;
            
                $scope.$emit('MainController:changeRecord', {'record' : selectedRecordId});
                $scope.$emit("MainController:changeModule", {'module' : selectedModule});
                $scope.$emit("MainController:changeCrmRecordDetailUrl",{'url':detailUrl});
                $scope.$emit("MainController:changeEntityName",{'name' : name});
                $scope.$emit("MainController:changeEmailLabelInHeader",{'email' : selectedRecordEmail});
               
            },1000);

           
        };

        
    }]);
    
    /**
     * LoginController - controls the login view
     * 
     * Models : 
     * crmInstanceUrl - crm instance url
     * username - crmuser login name
     * password - crmuser password
     * invalidCredentials - true if invalid credentials
     * 
     * Actions : 
     * login() - doLogin
     */
    app.controller('LoginController', ["$scope","$localStorageService","$crmapi","$timeout",function($scope,$localStorageService,$crmapi,$timeout) {
        // to do km remove local testing related code
        //$scope.localTesting = false; //true for local testing NOTE: Always false for live
        $scope.localTesting = true;
        $scope.invalidCredentials = false;
        $scope.connecting = false;
        
        var gadgetLogin = function() {
            $scope.connecting = true;
            $crmapi.login($scope.username,$scope.password).then(function(e,res) {
                $scope.connecting = false;
                if(e) {
                    $scope.invalidCredentials = true;
                } else {
                    $scope.invalidCredentials = false;
                    
                    $localStorageService.set("vtigersession",res.login.session);
                    $localStorageService.set("user_tz",res.login.user_tz);
                    $localStorageService.set("date_format",res.login.date_format);
                    $localStorageService.set("hour_format",res.login.hour_format);
                    $localStorageService.set("currency_symbol",res.login.currency_symbol);
                    $localStorageService.set("defaulteventstatus",res.login.defaulteventstatus);
                    $localStorageService.set("defaultactivitytype",res.login.defaultactivitytype);
                    $localStorageService.set("othereventduration",res.login.othereventduration);
                    $localStorageService.set("callduration",res.login.callduration);
                    $localStorageService.set("first_name",res.login.first_name); 
                    $localStorageService.set("last_name",res.login.last_name); 
                    $localStorageService.set("organizationname",res.login.companydetails.organizationname);
                    $localStorageService.set("user_primary_group",res.login.user_primary_group);
                    
                    //Todo : remove hardcoded users tabid
                    $scope.$emit('MainController:changeUserId', {userId:'19x' + res.login.userid});
                    $scope.$emit('MainController:changeView', {view : ''});
                }
            });
        }
        
        var resolveUrlAndLogin = function() {
            $crmapi.resolveURL($scope.username,$scope.password).then(function(e,res) {
                $scope.connecting = false;
                if(e) {
                    $scope.loginError.message = e.message;
                    if($scope.loginError.message == 'Invalid credentials.') {
                        //be polite with customer!!
                        $scope.loginError.message = 'Please check your credentials';
                    }
                    $scope.loginError.status = true;
                    $timeout(function() {
                        $scope.loginError = {'status' : false, 'message' : ''};
                    }, 10000);
                } else if (res) {
                    $scope.loginError.status = false;
                    if (res.hasOwnProperty('account') && res.hasOwnProperty('user')) {
                        var allowedBillingStatuses = ['OK', 'PAID', 'TRIALING', 'FAILURE', 'FAILED'];
                        var allowedStatuses = ['ACTIVE', 'CLOSURE_REQUESTED'];
                        if (allowedStatuses.indexOf(res.account.status) !== -1 && allowedBillingStatuses.indexOf(res.account.billingstatus) !== -1) {
                            $scope.crmInstanceUrl = res.user.url;
                            $localStorageService.set('crm-instance-url', $scope.crmInstanceUrl);
                            gadgetLogin();
                        } else {
                            if (res.hasOwnProperty('account') && res.account.hasOwnProperty('billingstatus')) {
                                $scope.loginError = {'status': false, 'message': ''};
                                $scope.loginError.message = 'Account billing Status is ' +
                                        res.account.billingstatus.replace('_', ' ').toLowerCase() +
                                        '. Contact support@vtiger.com';
                                $scope.loginError.status = true;
                            }
                        }
                    }
                }
            });
        }
        
        $scope.login = function(valid) {
            $scope.loginError = {'status' : false, 'message' : ''};
            if(valid) {
                if($scope.localTesting) {
                    $localStorageService.set('crm-instance-url',$scope.crmInstanceUrl);
                    gadgetLogin();
                } else {
                    resolveUrlAndLogin();
                }
            } else {
                if($scope.form.username.$invalid)
                    $scope.form.username.$dirty = true;
                else 
                    $scope.form.password.$dirty = true;
            }
        }
        
        $scope.getLoginViewClass = function() {
            var className = '';
            if($scope.connecting) {
                className = 'wait';
            }
            return className;
        }
        
        $scope.outlooksso = function() {
            window.open('../sso/index.php', 'AuthPopup', 'width=500,height=500,centerscreen=1,menubar=0,toolbar=0,location=0,personalbar=0,status=0,titlebar=0,dialog=1');
        }
    }]);
    
    /**
     * CreateController - controls the create contact/lead view
     * 
     * Actions : 
     * showCreateForm() - changes view to show the record create form
     */
    app.controller("CreateController",["$scope","$crmapi", "$location", "$route",function($scope,$crmapi, $location, $route) {
        if($route.current && $route.current.$$route.originalPath == '/createview') {
           $scope.$emit("MainController:changeModule", {'module' : $route.current.params.module});
            $scope.$emit("MainController:changeView", {'view' : 'edit'});
        }
        
        $scope.fetchingModules = false;
        $scope.$watch("view",function() {
            if($scope.view === 'create') {
                $scope.contactsModuleEnable = $scope.leadsModuleEnable = false;
                $scope.fetchingModules = true;
                $crmapi.isModuleEnabled("Contacts").then(function(e,res) {
                    if(e && e.code === 1501) {
                        $scope.$emit("MainController:changeView",{view:'login'});
                    } else if(res) {
                        if(res.enabled) {
                            $crmapi.hasEditViewPermission('Contacts').then(function(e,res) {
                                $scope.contactsModuleEnable = res.editPermission;
                            });
                        }
                        $crmapi.isModuleEnabled("Leads").then(function(e,res) {
                            $scope.fetchingModules = false;
                            if(res.enabled) {
                                $crmapi.hasEditViewPermission('Leads').then(function(e,res) {
                                    $scope.leadsModuleEnable = res.editPermission;
                                });
                            }
                        });

                        $crmapi.isModuleEnabled("Accounts").then(function(e,res) {
                            $scope.fetchingModules = false;
                            if(res.enabled) {
                                $crmapi.hasEditViewPermission('Accounts').then(function(e,res) {
                                    $scope.accountsModuleEnable = res.editPermission;
                                });
                            }
                        });
                    }
                });
                
                $scope.showCreateForm = function(module) {
                    $location.path('createview').search({module : module});
                }
            }
        });
    }]);
    
    /**
     * EditController - controls the edit view
     * 
     * Models : 
     * formField - required fields for module
     * owners - crm modules owners
     * 
     * Actions : 
     * create() - create record
     */
    app.controller("EditController", ["$scope","$crmapi","$filter","$timeout",function($scope,$crmapi,$filter,$timeout) {
        ///////////////////////
        $scope.$watch("view",function() {
            if($scope.view === 'edit') {

                    var mode = 'create';
                    if($scope.crmRecordId) {
                        mode = 'edit';
                    }

                    $scope.formFields = [];
                    $scope.editViewBusy = false;

                    $scope.createForm = {};
                    var idPrefix = '' ;
                    
                    var getFieldValue = function(fieldtype,fieldValue) {
                        switch(fieldtype) {
                            case 'owner' : fieldValue = fieldValue.value;
                                break;
                            case 'integer' : fieldValue = parseInt(fieldValue);
                                break;
                            case 'multipicklist' : 
                                if(fieldValue.indexOf(' |##| ') !== -1) {
                                    fieldValue = fieldValue.split(' |##| ');
                                } else if(fieldValue){
                                    fieldValue = [fieldValue];
                                }
                                break;
                            case 'double' : fieldValue = parseFloat(fieldValue);
                                break;
                            case 'currency' : 
                            case 'multicurrency':    
                                fieldValue = parseFloat(fieldValue);
                                break;
                            case 'date' : fieldValue = $filter('date_format')(fieldValue,$scope.userpreferences.date_format);
                                break;
                            case 'time' : fieldValue = $filter('time_format')(fieldValue,$scope.userpreferences.hour_format);
                                break;
                        }
                        return fieldValue;
                    }
                    
                    var getRecordFieldValue = function(fieldtype,fieldname,record) {
                        var fieldValue = record[fieldname];
                        return getFieldValue(fieldtype,fieldValue);
                    }
                    
                    var _fetchFormFields = function(record) {
                        if($scope.module) {
                            $scope.editViewBusy = true;
                            var fetchOutlookConfigurableFields = true;

                            if($scope.module=='Potentials' && mode=='create')
                                var fetchSecondaryModuleName = 'Contacts';
                            else
                                var fetchSecondaryModuleName = false;
                            
			    	$crmapi.describe($scope.module,fetchOutlookConfigurableFields,fetchSecondaryModuleName).then(function(e,res) {
                                $scope.editViewBusy = false;
                                if(e && e.code === 1501) {
                                    $scope.$emit("MainController:changeView",{view:'login'});
                                } else if(res) {
                                    idPrefix = res.describe.idPrefix;
                                    var fields = res.describe.fields;
                                    var outlookConfigurableFields = res.outlookConfigurableFields;
                                   
                                    if(fetchSecondaryModuleName) {
                                        
                                        $scope.secondaryModuleFields = [];

                                        var secondaryModuleFields = res.secondaryModuleFields.fields;

                                        angular.forEach(secondaryModuleFields,function(value) {

                                            if(value.type.name === 'string' && value.name === 'firstname') {
                                                var nameParts = $scope.name.split(" ");
                                                nameParts[nameParts.length-1] = '';
                                                value.fieldValue = nameParts.join(' ');
                                            }
                                            if(value.type.name === 'string' && value.name === 'lastname') {
                                                var nameParts = $scope.name.split(" ");
                                                value.fieldValue = nameParts[nameParts.length-1];
                                            }
                                            if(value.type.name === 'email' && value.name === 'email') {
                                                value.fieldValue = $scope.email;
                                            }

                                            $scope.secondaryModuleFields.push(value); 

                                        });
                                        
                                        
                                    }

                                   
                                    var preferredFieldsOrder = { 
                                        'salutationtype' : false,
                                        'firstname' : false,
                                        'lastname' : false,
                                        'email':false,
                                        'secondaryemail':false
                                    };
                                    var fixedFields = ['email'];
                                    var skipFields = ['isconvertedfromlead'];
                                    var unorderedFormFields = [];
                                    $scope.numberOfEmailFields = 0;
                                    angular.forEach(fields,function(value) {
                                        if(value.editable){
                                            if(value.name === 'salutationtype' && value.quickCreate) {
                                                preferredFieldsOrder['salutationtype'] = value;
                                            }
                                            //autofill name and primary email
                                            if(value.type.name === 'string' && value.name === 'firstname') {
                                                var nameParts = $scope.name.split(" ");
                                                nameParts[nameParts.length-1] = '';
                                                value.fieldValue = nameParts.join(' ');
                                                preferredFieldsOrder['firstname'] = value;
                                            }
                                            if(value.type.name === 'string' && value.name === 'lastname') {
                                                var nameParts = $scope.name.split(" ");
                                                value.fieldValue = nameParts[nameParts.length-1];
                                                preferredFieldsOrder['lastname'] = value;
                                            }
                                            if(value.type.name === 'email' && value.name === 'email') {
                                                $scope.numberOfEmailFields++;
                                                value.fieldValue = $scope.email;
                                                preferredFieldsOrder['email'] = value;
                                            }
                                            if(value.type.name === 'email' && value.name === 'secondaryemail' && value.quickCreate) {
                                                $scope.numberOfEmailFields++;
                                                if(!preferredFieldsOrder['email']) value.fieldValue = $scope.email;
                                                preferredFieldsOrder['secondaryemail'] = value;
                                            }

                                            if(value.name === 'assigned_user_id') {
                                                value.fieldValue = $scope.currentUserId;
                                                preferredFieldsOrder['assigned_user_id'] = value;
                                            }
                                            
                                            var toShowThisField = false;
                                            
                                            if(outlookConfigurableFields.length) {
                                                
                                                if(outlookConfigurableFields.indexOf(value.name) !== -1 || value.mandatory)
                                                    toShowThisField = true;

                                            }else if(value.quickCreate  || value.mandatory) {
                                                    toShowThisField = true;
                                            }

                                            

                                            if((toShowThisField || (value.type.name == 'multicurrency' && value.mandatory) || fixedFields.indexOf(value.name) !== -1) && skipFields.indexOf(value.name) === -1) {
                                                var defaultValue = value['default'];
                                                if(typeof defaultValue === 'string')
                                                    defaultValue = defaultValue.trim();
												//if field value is autofilled, it shouldn't be overwritten by default value
                                                if(defaultValue !== '' && defaultValue !== null && !value.fieldValue) {
                                                    value.fieldValue = getFieldValue(value.type.name,value['default']);
                                                }
												if(value.type.name === 'picklist' && value.mandatory && !value.fieldValue) {
                                                    value.fieldValue = value.type.picklistValues[0].value;
                                                }
                                                if(typeof record !== 'undefined') { //for record edit
                                                    value.fieldValue = getRecordFieldValue(value.type.name,value.name,record);
                                                }
                                                this.push(value);
                                            }
                                        }
                                },unorderedFormFields);
                                             
                                
                                
                                    angular.forEach(preferredFieldsOrder,function(value,key) {
                                        if(value) {
                                            $scope.formFields.push(value);
                                        }
                                    });
                                    
                                    angular.forEach(unorderedFormFields,function(value){
                                        if(!preferredFieldsOrder.hasOwnProperty(value.name)) {
                                            if(value.type.name === 'email')  {
                                                //auto fill custom email fields only if primary email is inactive
                                                if(!preferredFieldsOrder.email &&
                                                !preferredFieldsOrder.secondaryemail &&
                                                !$scope.numberOfEmailFields) {
                                                    value.fieldValue = $scope.email;
                                                }
                                                $scope.numberOfEmailFields++;
                                            }
                                            
                                            this.push(value);
                                        }
                                    },$scope.formFields);
                                    
                                    
                                                
                                }
                            });

                            $crmapi.fetchModuleUsers($scope.module).then(function(e,res) {
                                $scope.owners = res.users.concat(res.groups);
                            });
                        }
                    }
                    
                    if(mode === 'edit') {
                        $scope.editViewBusy = true;
                        $crmapi.fetchRecord($scope.crmRecordId).then(function(e, res) {
                            $scope.editViewBusy = false;
                            if(e && e.code === 1501) {
                                $scope.$emit("MainController:changeView",{view:'login'});
                            } else if(res) {
                                _fetchFormFields(res.record);
                            } else {
                                var msg = e.message;
                                if(e.code === 'ACCESS_DENIED')
                                    msg = 'Access denied';

                                vtigerHelper.showDialog({
                                    title : 'Error',
                                    content : msg
                                },'error');
                            }
                        });
                    } else {
                        _fetchFormFields();
                    }
                    
                    $scope.create = function(valid) {
                       
                        if(valid) {
                            
                            $scope.savingRecord = true;
                            var formValues = {};
                            angular.forEach($scope.formFields,function(value) {
                                if(value.type.name === 'reference') {
                                    if(value.hasOwnProperty('fieldValue')) {
                                        formValues[value.name] = value.fieldValue.hasOwnProperty('value') ? 
                                        value.fieldValue.value : (value.fieldValue ? '#str#'+value.fieldValue : '');
                                    }
                                } else if(value.type.name === 'date') {
                                    formValues[value.name] = $filter('date_format')(value.fieldValue,'yyyy-mm-dd');
                                } else if(value.type.name === 'time') {
                                    formValues[value.name] = $filter('time_format')(value.fieldValue,'24');
                                } else {
                                    formValues[value.name] = value.fieldValue;
                                }
                            });               
                            
                            
                            var flagForCreateJointRecord = false;
                            var saveJointRecord = false;
                            if(typeof $scope.secondaryModuleFields != 'undefined' && mode === 'create' && $scope.module=='Potentials') {
                                
                                
                                flagForCreateJointRecord  = true;

                                var secondaryModuleName = "Contacts";

                                formValues['secondaryModuleName'] = secondaryModuleName;
                                var secondaryModuleformValues = {};

                                angular.forEach($scope.secondaryModuleFields,function(value) {
                                    
                                    if(value.type.name === 'reference') {
                                        if(value.hasOwnProperty('fieldValue')) {
                                            secondaryModuleformValues[value.name] = value.fieldValue.hasOwnProperty('value') ? 
                                            value.fieldValue.value : (value.fieldValue ? '#str#'+value.fieldValue : '');
                                        }
                                    } else if(value.type.name === 'date') {
                                        secondaryModuleformValues[value.name] = $filter('date_format')(value.fieldValue,'yyyy-mm-dd');
                                    } else if(value.type.name === 'time') {
                                        secondaryModuleformValues[value.name] = $filter('time_format')(value.fieldValue,'24');
                                    } else {
                                        secondaryModuleformValues[value.name] = value.fieldValue;
                                    }
                                   
                                });    

                                
                                formValues['secondaryModuleformValues'] = secondaryModuleformValues;

                                saveJointRecord = true;
                            }


                            formValues = JSON.stringify(formValues);

                            
                            var recordId = idPrefix + 'x0';
                            if(mode === 'edit') recordId = $scope.crmRecordId;
                            $crmapi.saveRecord($scope.module,formValues,recordId,saveJointRecord).then(function(e,res) {
                                $scope.savingRecord = false;
                                if(!e) {

                                    if(flagForCreateJointRecord){
                                    
                                        $scope.$emit("MainController:changeModule", {'module' : secondaryModuleName});
                                    }

                                    $scope.$emit('MainController:changeRecord', {'record' : res.record.id});
                                    var firstname = '',lastname = '';
                                    angular.forEach(res.record.blocks,function(block) {
                                        angular.forEach(block.fields,function(field) {
                                            if(field.name === 'firstname') {
                                                firstname = field.value;
                                            }
                                            if(field.name === 'lastname') {
                                                lastname = field.value;
                                            }

                                            if(field.name === 'accountname') {
                                                label = field.value;
                                            }
                                        });
                                    });
                                    
                                    if($scope.module == 'Accounts')
                                        var name = label;
                                    else
                                        var name = firstname + ' ' + lastname; 
                                    
                                    var detailUrl = $crmapi.getDetailViewUrl($scope.module,res.record.id);

                                    $scope.$emit("MainController:changeCrmRecordDetailUrl",{'url':detailUrl})
                                    $scope.$emit("MainController:changeEntityName",{'name' : name});
                                    $scope.$emit("MainController:changeView", {'view' : 'summary'});
                                    
                                } else {
                                    vtigerHelper.showDialog({
                                        title : 'Error',
                                        content : e.message
                                    },'error');
                                }
                            });
                        } else {
                            if(!$scope.showValidationMsg) {
                                $scope.showValidationMsg = true;
                                $timeout(function() {
                                    $scope.showValidationMsg = false;
                                }, 4000);
                            }
                        }
                    }
                    
                    var currentReferenceModuleName = '';
                    $scope.setCurrentReferenceModuleName = function(module) {
                        currentReferenceModuleName = module;
                    }
                    $scope.getReferenceRecords = function(val) {
                        return $crmapi.fetchReferenceRecords(currentReferenceModuleName,val);
                    }
                    $scope.moduleLabel = function() {
                        return $scope.module.replace(/s$/, '');
                    }
                }
        });
    }]);
    
    /**
     * RecordSummaryController - main controller for the record summary view
     * 
     * Models : 
     * tab - current tab to be shown
     * relatedModule - related module assoiciated with the current tab
     * 
     * Actions : 
     * changeTab(tab) - change the current tab
     */
    app.controller("RecordSummaryController", ["$scope","$crmapi", "$rootScope",function($scope,$crmapi, $rootScope) {
        
        
       
        $scope.modulesStatus = [];
        
        $scope.$watch('view',function() {
            $rootScope.$on("changeTab", function(e, tab){
                tab = (tab === 'none') ? false : tab;
                if(typeof $scope.changeTab == 'function') {
                    $scope.changeTab(tab);
                }
            });
        
            $rootScope.$on("changeModule", function(e, module){
                if(typeof $scope.changeModule == 'function') {
                    $scope.changeModule(module);
                }
            });

            if($scope.view === 'summary') {
                
                var setModuleStatues = function(moduleSettings) {
                    $scope.modulesStatus = [];
                    angular.forEach(moduleSettings,function(value) {
                        this[value.module.name] = value.active;
                    },$scope.modulesStatus);
                };

                $crmapi.getExtensionModuleSettings().then(function(e,res) {
                    if(!e && res) {
                        setModuleStatues(res);
                    } else if(e && e.code === 1501) {
                        $scope.$emit("MainController:changeView",{view:'login'});
                    }
                });
                    
                $scope.tab = $scope.tab ? $scope.tab : false;
                $scope.relatedModule = '';

                $scope.$on("RecordSummaryController:changeTab",function(event, args) {
                    $scope.tab = args.tab;
                });
                
                $scope.unsetTab = function() {
                    $scope.tab = false;
                }

                $scope.changeTab = function(tab) {
                    $scope.tab = tab;
                }
                
                $scope.changeModule = function(module) {
                   $scope.relatedModule = module;
                }
                
                $scope.getTabMenuClass = function(tabName) {
                    var tabMenuClass = "list-group-item text-center";
                    if(tabName === $scope.tab) {
                        tabMenuClass += ' active-tab-menu';
                    }
                    return tabMenuClass;
                }
                
                $scope.isModuleActive = function(moduleName) {
                    //List of modules not related to leads
                    var restrictedModulesForLeads = ['Invoice','Potentials','HelpDesk','Cases'];
                    if(restrictedModulesForLeads.indexOf(moduleName) !== -1 && $scope.module === 'Leads') {
                        return false;
                    }
                    return $scope.modulesStatus[moduleName];
                }
                
                $scope.$on('RecordSummaryController:changeModuleSettings',function(event,args) {
                    setModuleStatues(args.moduleSettings);
                });
                
            }
        });
        
    }]);
    
    /**
     * TimelineController - controls the limeline tab view
     * 
     * Models : 
     * feed - timeline feed for the contact/lead
     */
    app.controller("TimelineController", ["$scope","$crmapi","$localStorageService",function($scope,$crmapi,$localStorageService) {
        
        $scope.$watch("tab",function() {
            if($scope.tab === 'timeline') {
                $scope.loading = true;
                $crmapi.history($scope.module,$scope.crmRecordId).then(function(e,res) {
                    $scope.loading = false;
                    if(e && e.code === 1501) {
                        $scope.$emit("MainController:changeView",{view:'login'});
                    } else if(res) {
                        
                        var history = res.history;
                        var timelineFeed = [];
                        //timeline picks up only link updates
                        var modTrackerLinkStatusCode = "4";
                        
                        var getTimelineLabel = function(historyEntry) {
                            var label = ' ';
                            switch(historyEntry.values.record.module) {
                                case 'Calendar' :  label += 'added event';
                                    break;
                                case 'ModComments' : label += 'added comment';
                                    break;
                                case 'Cases' : label += 'created case';
                                    break;
                                case 'HelpDesk' : label += 'created ticket';
                                    break;
                                case 'Potentials' : label += 'created an opportunity';
                                    break;
                                case 'Documents' : label += 'added a document';
                                    break;
                                case 'Vendors' : label += 'added vendor';
                                    break;
                                case 'Assets' : label += 'added asset';
                                    break;
                                case 'Project' : label += 'created project';
                                    break;
                                case 'Services' : label += 'added service';
                                    break;
                                case 'ServiceContracts' : label += 'added service contract';
                                    break;
                                case 'Products' : label += 'added product';
                                    break;
                                case 'Emails' : label += 'made an email interaction';
                                    break;
                                default : label += ' added ' + historyEntry.values.record.module + ' record ';
                            }
                            return label;
                        }
                        var crmUrl = $localStorageService.get('crm-instance-url');
                        var getDetailViewUrl = function(instanceUrl,module,record) {
                            var detailViewUrl = instanceUrl + '/index.php?module=' + module + '&view=Detail&record=' + record;
                            if(module === 'Emails') {
                                detailViewUrl = instanceUrl + '/index.php?module=Emails&view=PreviewEmail&record=' + record;
                            }
                            if(module === 'Inbox') {
                                detailViewUrl = instanceUrl + '/index.php?module=Inbox&view=List&mode=getThreadEmails&threadId=' + record;
                            }
                            return detailViewUrl;
                        }
                        
                        angular.forEach(history,function(value) {
                            if(value.status === modTrackerLinkStatusCode) {
                                var feedEntry = {};
                                feedEntry.modifieduser = value.modifieduser;
                                feedEntry.modifiedtime = value.modifiedtime;
                                feedEntry.values = {};
                                feedEntry.values.record = value.values.record;
                                feedEntry.label = getTimelineLabel(value);
                                feedEntry.detailViewUrl = getDetailViewUrl(crmUrl,feedEntry.values.record.module,feedEntry.values.record.id);
                                this.push(feedEntry);
                            }
                        },timelineFeed);
                        
                        $scope.feed = timelineFeed;
                        
                    }
                });
                
                $scope.getIconClass = function(module) {
                    var iconClass = 'fa fa-paw';
                    switch(module) {
                        case 'Calendar' : iconClass = 'fa fa-calendar';break;
                        case 'ModComments' : iconClass = 'fa fa-comment';break;
                        case 'HelpDesk' : iconClass = 'vicon-helpdesk';break;
                        case 'Potentials' : iconClass = 'vicon-potentials';break;
                        case 'Emails' : iconClass = 'vicon-emails';break;
                        case 'Cases' : iconClass = 'vicon-cases';break;
                        case 'Documents' : iconClass = 'vicon-documents';break;
                        case 'Vendors' : iconClass = 'vicon-vendors';break;
                        case 'Assets' : iconClass = 'vicon-assets';break;
                        case 'Project' : iconClass = 'fa fa-briefcase';break;
                        case 'Services' : iconClass = 'vicon-services';break;
                        case 'ServiceContracts' : iconClass = 'vicon-servicecontracts';break;
                        case 'Products' : iconClass = 'vicon-products';break;
                    }
                    return iconClass;
                }
                
            }
        });
        
    }]);
    
    /**
     * ActivitiesController - controls the activities tab view
     * 
     * Models : 
     * formFields - required calendar fields for creating the record
     * newActivity - new activity being created
     * upcomingActivities - list of upcoming activites related to contact/lead
     * 
     * Actions : 
     * createActivity() - creates a new activity in the crm
     */
    app.controller("ActivitiesController", ["$scope","$crmapi","$timeout","$filter","$localStorageService",function($scope,$crmapi,$timeout,$filter,$localStorageService) {
        
        $scope.$watch("tab",function() {
            if($scope.tab === 'activities') {
                $scope.formFields = [];
                
                var idPrefix = '';
                
                var loadUpcomingActivities = function() {
                    $scope.loading = true;
                    $crmapi.fetchUpcomingActivities($scope.crmRecordId).then(function(e,res) {
                        $scope.loading = false;
                        if(e && e.code === 1501) {
                            $scope.$emit("MainController:changeView",{view:'login'});
                        } else if(res) {
                            var upcomingActivities = [];
                            angular.forEach(res,function(value) {
                                value.start_date_time = value.date_start + ' ' + value.time_start;
                                value.end_date_time = value.due_date + ' ' + value.time_end;
                                this.push(value);
                            },upcomingActivities);
                            $scope.upcomingActivities = upcomingActivities;
                        }
                    });
                }
                
                loadUpcomingActivities();
                var fetchOutlookConfigurableFields = true;
                $crmapi.describe($scope.relatedModule,fetchOutlookConfigurableFields).then(function(e,res) {
                    if(e && e.code === 1501) {
                        $scope.$emit("MainController:changeView",{view:'login'});
                    } else if(res) {
                        idPrefix = res.describe.idPrefix;                        
                        var fields = res.describe.fields;
                        var outlookConfigurableFields = res.outlookConfigurableFields;
                        var fixedFields = ['subject','assigned_user_id','date_start','time_start','due_date','time_end','eventstatus','activitytype'];
                        var skipFields = ['duration_hours','contact_id'];
                        angular.forEach(fields,function(value) {
                            if(value.editable){

                                var toShowThisField = false;
                                            
                                if(outlookConfigurableFields.length) {
                                    
                                    if(outlookConfigurableFields.indexOf(value.name) !== -1)
                                        toShowThisField = true;

                                }else if(value.quickCreate) {
                                        toShowThisField = true;
                                }



                                if(value.type.name === 'picklist' && value.mandatory) {
                                    value.fieldValue = value.type.picklistValues[0].value;
                                }
								if (value.type.name === 'reference' && value.name === 'parent_id') {
									if ($scope.module === 'Leads') {
										value.fieldValue = {};
										value.name = 'leadid';
										value.fieldValue.value = $scope.crmRecord.id;
										value.fieldValue.label = $scope.crmRecord.label;
									} else {
                                        value.fieldValue = {};
                                        if(typeof $scope.crmRecord != 'undefined') {
                                            value.fieldValue.value = $scope.crmRecord.account_id.value;
                                            value.fieldValue.label = $scope.crmRecord.account_id.label;
                                        }
									}
								}
                                var defaultValue = value['default'];
                                if(typeof defaultValue === 'string')
                                    defaultValue = defaultValue.trim();
                                if(defaultValue !== '' && defaultValue !== null) {
                                    value.fieldValue = getFieldValue(value.type.name,defaultValue);
                                }



                                if(fixedFields.indexOf(value.name) !== -1) {
                                    //one of the fixed fields
                                    switch(value.name) {
                                        case 'subject' : 
                                            $scope.subject = value;
                                            break;
                                        case 'assigned_user_id' : 
                                            $scope.assigned_user_id = value;
                                            $scope.assigned_user_id.fieldValue = $scope.currentUserId;
                                            break;
                                        case 'date_start' : 
                                            $scope.date_start = value;
                                            break;
                                        case 'time_start' : 
                                            $scope.time_start = value;
                                            break;
                                        case 'due_date' : 
                                            $scope.due_date = value;
                                            break;
                                        case 'time_end' : 
                                            $scope.time_end = value;
                                            break;
                                        case 'eventstatus' : 
                                            if($scope.userpreferences.defaulteventstatus !== 'undefined' && 
                                                   $scope.userpreferences.defaulteventstatus !== 'Select an Option') {
                                                value.fieldValue = $scope.userpreferences.defaulteventstatus;
                                            }
                                            $scope.eventstatus = value;
                                            break;
                                        case 'activitytype' : 
                                            if($scope.userpreferences.defaultactivitytype !== 'undefined' && 
                                                    $scope.userpreferences.defaultactivitytype !== 'Select an Option') {
                                                value.fieldValue = $scope.userpreferences.defaultactivitytype;
                                            } else {
                                                value.fieldValue = value.type.picklistValues[1].value;
                                            }
                                            $scope.activitytype = value;
                                            break;
                                    }
                                } else {
                                    //pick only quickCreate fields for formfields
                                    if((toShowThisField || (value.type.name == 'multicurrency' && value.mandatory)) && skipFields.indexOf(value.name) === -1) {
                                        this.push(value);
                                    }
                                }
                            }
                        },$scope.formFields);
                    }
                });
                
                $crmapi.fetchModuleUsers($scope.module).then(function(e,res) {
                    if(!e) {
                        $scope.owners = res.users.concat(res.groups);
                    }
                });
                
                var clearFormValues = function() {
                    $scope.showForm = false;
                    
                    $scope.subject.fieldValue = getFieldValue($scope.subject.type.name,$scope.subject['default']);
                    $scope.assigned_user_id.fieldValue = $scope.currentUserId;
                    $scope.date_start.fieldValue = getFieldValue($scope.date_start.type.name,$scope.date_start['default']);
                    $scope.time_start.fieldValue = getFieldValue($scope.time_start.type.name,$scope.time_start['default']);
                    $scope.due_date.fieldValue = getFieldValue($scope.due_date.type.name,$scope.due_date['default']);
                    $scope.time_end.fieldValue = getFieldValue($scope.time_end.type.name,$scope.time_end['default']);
                    
                    $scope.eventstatus.fieldValue = $scope.eventstatus.type.picklistValues[0].value;
                    if($scope.userpreferences.defaulteventstatus) {
                        $scope.eventstatus.fieldValue = $scope.userpreferences.defaulteventstatus;
                    }
                    $scope.activitytype.fieldValue = $scope.activitytype.type.picklistValues[1].value;
                    if($scope.userpreferences.defaultactivitytype) {
                        $scope.activitytype.fieldValue = $scope.userpreferences.defaultactivitytype;
                    }
                    
                    angular.forEach($scope.formFields,function(value,index) {
                        value.fieldValue = '';
                        if(value.type.name === 'picklist' && value.mandatory) {
                            value.fieldValue = value.type.picklistValues[0].value;
                        }
                        var defaultValue = value['default'];
                        if(typeof defaultValue === 'string')
                            defaultValue = defaultValue.trim();
                        if(defaultValue !== '' && defaultValue !== null) {
                            value.fieldValue = getFieldValue(value.type.name,defaultValue);
                        }
                        $scope.formFields[index] = value;
                    });
                    
                    $scope.mode = '';
                    $scope.recordId = '';
                    $scope.form.$setPristine();
                }
                
                $scope.create = function(valid) {
                    if(valid && $scope.endDateTimeIsGreater && !$scope.followupValidationError) {
                        
                        var start_date_time = moment($scope.date_start.fieldValue+' '+$scope.time_start.fieldValue,'YYYY-MM-DD HH:mm');
                        var end_date_time = moment($scope.due_date.fieldValue+' '+$scope.time_end.fieldValue,'YYYY-MM-DD HH:mm');

                        var formValues = {
                            subject : $scope.subject.fieldValue,
                            assigned_user_id : $scope.assigned_user_id.fieldValue,
                            date_start : start_date_time.utc().format('YYYY-MM-DD'),
                            time_start : start_date_time.utc().format('HH:mm'),
                            due_date : end_date_time.utc().format('YYYY-MM-DD'),
                            time_end : end_date_time.utc().format('HH:mm'),
                            eventstatus : $scope.eventstatus.fieldValue,
                            activitytype : $scope.activitytype.fieldValue
                        };
                        
                        angular.forEach($scope.formFields,function(value,index) {
                            if(value.type.name === 'reference') {
                                if(value.hasOwnProperty('fieldValue')) {
                                    formValues[value.name] = value.fieldValue.hasOwnProperty('value') ? 
                                    value.fieldValue.value : (value.fieldValue ? '#str#'+value.fieldValue : '');
                                }
                            } else if(value.type.name === 'date') {
                                formValues[value.name] = $filter('date_format')(value.fieldValue,'yyyy-mm-dd');
                            } else if(value.type.name === 'time') {
                                formValues[value.name] = $filter('time_format')(value.fieldValue,'24');
                            } else {
                                formValues[value.name] = value.fieldValue;
                            }
                        });
                        //set relation
                        var relFieldName = ($scope.module === 'Contacts') ? 'contact_id' : 'parent_id';
                        formValues[relFieldName] = $scope.crmRecordId;
                        formValues['duration_hours'] = 0;
                        formValues['visibility'] = 'Private';
                        
                        //follow up details
                        if(formValues['eventstatus'] === 'Held' && $scope.followup === 'on') {
                            if($scope.followup_date_start && $scope.followup_time_start) {
                                var followup_date_time = moment($scope.followup_date_start+' '+$scope.followup_time_start,'YYYY-MM-DD HH:mm');
                                formValues['followup'] = $scope.followup;
                                formValues['followup_date_start'] = followup_date_time.utc().format('YYYY-MM-DD'),
                                formValues['followup_time_start'] = followup_date_time.utc().format('HH:mm');
                            }
                        }

                        formValues = JSON.stringify(formValues);
                        
                        var recordId = idPrefix + 'x0';
                        
                        if($scope.mode === 'edit' && $scope.recordId)
                            recordId = $scope.recordId;
                        
                        clearFormValues();

                        $crmapi.saveRecord($scope.relatedModule,formValues,recordId).then(function(e,res) {
                            if(!e && res) {
                                loadUpcomingActivities();
                            } else {
                                vtigerHelper.showDialog({
                                    title : 'Error',
                                    content : e.message
                                },'error');
                            }
                        });
                    } else {
                        if(!$scope.showValidationMsg) {
                            $scope.showValidationMsg = true;
                            $timeout(function() {
                                $scope.showValidationMsg = false;
                            }, 4000);
                        }
                    }
                }
                
                $scope.closeForm = function() {
                    clearFormValues();
                }
                
                $scope.showForm = false;
                $scope.showCreateForm = function() {
                    $timeout(function() {
                        angular.element('input[name="date_start"]').datepick('setDate',$filter('date_format')(moment().format("YYYY-MM-DD"),$scope.userpreferences.date_format));
                    });
                    $scope.showForm = !$scope.showForm;
                    if ($scope.showForm) {
                        //On showCreateForm, lead and account field should get auto-filled
                        angular.forEach($scope.formFields, function (field, index) {
                            if (field.type.name === 'reference' && field.name === 'leadid') {
                                field.fieldValue = {};
                                field.name = 'leadid';
                                field.fieldValue.value = $scope.crmRecord.id;
                                field.fieldValue.label = $scope.crmRecord.label;
                            } else if (field.type.name === 'reference' && field.name === 'parent_id') {
                                field.fieldValue = {};
                                if(typeof $scope.crmRecord != 'undefined') {
                                    field.fieldValue.value = $scope.crmRecord.account_id.value;
                                    field.fieldValue.label = $scope.crmRecord.account_id.label;
                                }
                            }

                        });
                    }
                };
                
                $scope.getActivityTypeIconClass = function(activitytype) {
                    var className = 'fa-calendar-o';
                    switch(activitytype) {
                        case 'Meeting' : className = 'fa-users';break;
                        case 'Call' : className = 'fa-phone';break;
                        case 'Mobile Call' : className = 'fa-mobile';break;
                    }
                    return className;
                }
                
                var currentReferenceModuleName = '';
                $scope.setCurrentReferenceModuleName = function(module) {
                    currentReferenceModuleName = module;
                }
                $scope.getReferenceRecords = function(val) {
                    return $crmapi.fetchReferenceRecords(currentReferenceModuleName,val);
                }
                
                var getFieldValue = function(fieldtype,fieldValue) {
                    switch(fieldtype) {
                        case 'owner' : fieldValue = fieldValue.value;
                            break;
                        case 'integer' : fieldValue = parseInt(fieldValue);
                            break;
                        case 'multipicklist' : 
                            if(fieldValue.indexOf(' |##| ') !== -1) {
                                fieldValue = fieldValue.split(' |##| ');
                            } else if(fieldValue) {
                                fieldValue = [fieldValue];
                            }
                            break;
                        case 'double' : fieldValue = parseFloat(fieldValue);
                            break;
                        case 'currency' : 
                        case 'multicurrency' :
                            fieldValue = parseFloat(fieldValue);
                            break;
                        case 'date' : fieldValue = $filter('date_format')(fieldValue,$scope.userpreferences.date_format);
                                break;
                        case 'time' : fieldValue = $filter('time_format')(fieldValue,$scope.userpreferences.hour_format);
                            break;
                    }
                    return fieldValue;
                }
                
                var getRecordFieldValue = function(fieldtype,fieldname,record) {
                    var fieldValue = record[fieldname];
                    return getFieldValue(fieldtype,fieldValue);
                }
                
                $scope.editRecord = function(record) {
                    $crmapi.fetchRecord(record.id).then(function(e,res) {
                        if(!e && res) {
                            var recordDetails = res.record;
                            
                            var date = new Date(recordDetails['date_start'] + ' ' + recordDetails['time_start'] + ' UTC');
                            var start_date_time = moment(date);
                            date = new Date(recordDetails['due_date'] + ' ' + recordDetails['time_end'] + ' UTC');
                            var end_date_time = moment(date);

                            $scope.subject.fieldValue = recordDetails['subject'];
                            $scope.assigned_user_id.fieldValue = recordDetails['assigned_user_id'].value;
                            
                            $timeout(function() {
                                angular.element('input[name="date_start"]').datepick('setDate',$filter('date_format')(start_date_time.format("YYYY-MM-DD"),$scope.userpreferences.date_format));
                                angular.element('input[name="due_date"]').datepick('setDate',$filter('date_format')(end_date_time.format("YYYY-MM-DD"),$scope.userpreferences.date_format));
                                angular.element('input[name="time_start"]').timepicker('setTime',$filter('time_format')(start_date_time.format("HH:mm"),$scope.userpreferences.hour_format)).trigger('change');
                                angular.element('input[name="time_end"]').timepicker('setTime',$filter('time_format')(end_date_time.format("HH:mm"),$scope.userpreferences.hour_format)).trigger('change');
                            });
                            
                            $scope.activitytype.fieldValue = recordDetails['activitytype'];
                            $scope.eventstatus.fieldValue = recordDetails['eventstatus'];
                            
                            angular.forEach($scope.formFields,function(value,index) {
                                $scope.formFields[index].fieldValue = getRecordFieldValue(value.type.name,value.name,recordDetails);
                            });
                            
                            $scope.mode = 'edit';
                            $scope.recordId = record.id;
                            $scope.showForm = true;
                            
                        } else if(e.code === 1501) {
                            $scope.$emit("MainController:changeView",{view:'login'});
                        } else {
                            var msg = e.message;
                            if(e.code === 'ACCESS_DENIED')
                                msg = 'Access denied';
                            
                            vtigerHelper.showDialog({
                                title : 'Error',
                                content : msg
                            },'error');
                        }
                    });
                }
                
                //Event end date-time validation
                $scope.endDateTimeIsGreater = true;
                $scope.$watchGroup([
                    'date_start.fieldValue', 
                    'time_start.fieldValue', 
                    'due_date.fieldValue', 
                    'time_end.fieldValue'
                ],function() {
                    if($scope.hasOwnProperty('date_start') && $scope.hasOwnProperty('time_start') && $scope.hasOwnProperty('due_date') && $scope.hasOwnProperty('time_end')) {
                        if($scope.date_start.hasOwnProperty('fieldValue') && $scope.time_start.hasOwnProperty('fieldValue')) {
                            if($scope.date_start.fieldValue && $scope.time_start.fieldValue) {
                                if($scope.due_date.hasOwnProperty('fieldValue') && $scope.time_end.hasOwnProperty('fieldValue')) {
                                    if($scope.due_date.fieldValue && $scope.time_end.fieldValue) {
                                        var start_date_time = moment($scope.date_start.fieldValue+' '+$scope.time_start.fieldValue,'YYYY-MM-DD HH:mm');
                                        var end_date_time = moment($scope.due_date.fieldValue+' '+$scope.time_end.fieldValue,'YYYY-MM-DD HH:mm');
                                        $scope.endDateTimeIsGreater = start_date_time.unix() <= end_date_time.unix();
                                    }
                                }
                            }
                        }
                    }
                });
                
                $scope.followupValidationError = false;
                $scope.$watchGroup([
                    'followup_date_start', 
                    'followup_time_start',
                    'followup',
                    'date_start.fieldValue', 
                    'time_start.fieldValue'
                ],function() {
                    $scope.followupValidationError = false;
                    if($scope.followup === 'off') {
                        return;  
                    } 
                    if($scope.hasOwnProperty('date_start') && $scope.hasOwnProperty('time_start')) {
                        if($scope.date_start.hasOwnProperty('fieldValue') && $scope.time_start.hasOwnProperty('fieldValue')) {
                            if($scope.date_start.fieldValue && $scope.time_start.fieldValue) {
                                if($scope.followup_date_start && $scope.followup_time_start) {
                                    var start_date_time = moment($scope.date_start.fieldValue+' '+$scope.time_start.fieldValue,'YYYY-MM-DD HH:mm');
                                    var followup_date_time = moment($scope.followup_date_start+' '+$scope.followup_time_start,'YYYY-MM-DD HH:mm');
                                    $scope.followupValidationError = followup_date_time.unix() < start_date_time.unix();
                                }
                            }
                        }
                    }
                });
                
                $crmapi.hasEditViewPermission("Calendar").then(function(e,res) {
                    $scope.hasCreatePermission = res.editPermission;
                });
            }
        });
        
    }]);
    
    /**
     * EmailsController - controls the emails tab view
     * 
     * Models : 
     * relatedEmails - emails related to contact/lead
     */
    app.controller("EmailsController", ["$scope","$crmapi",function($scope,$crmapi) {
        
        $scope.$watch("tab",function() {
            if($scope.tab === 'emails') {
                var reqFields = ['subject','description','assigned_user_id','from_email'];
                $scope.loading = true;
                $crmapi.fetchRelatedRecords($scope.crmRecordId,$scope.relatedModule,{fields:reqFields}).then(function(e,res) {
                    $scope.loading = false;
                    if(e && e.code === 1501) {
                        $scope.$emit("MainController:changeView",{view:'login'});
                    } else if(res) {
                        $scope.relatedEmails = res;
                    }
                });
            }
        });
        
    }]);
    
    /**
     * QuotesController - controls the quotes tab view
     * 
     * Models : 
     * relatedQuotes - quotes related to contact/lead
     */
    app.controller("QuotesController", ["$scope","$crmapi",function($scope,$crmapi) {
        
        $scope.$watch('tab',function() {
            if($scope.tab === 'quotes') {
                var reqFields = ['subject','quotestage','hdnGrandTotal'];
                $scope.loading = true;
                $crmapi.fetchRelatedRecords($scope.crmRecordId,$scope.relatedModule,{fields:reqFields}).then(function(e,res) {
                    $scope.loading = false;
                    if(e && e.code === 1501) {
                        $scope.$emit("MainController:changeView",{view:'login'});
                    } else if(res) {
                        $scope.relatedQuotes = res;
                    }
                });
                
                $scope.getLabelClass = function(stage) {
                    var labelClass = 'label-default';
                    switch(stage) {
                        case 'Created' : labelClass = 'label-primary';
                            break;
                        case 'Delivered' : labelClass = 'label-info';
                            break;
                        case 'Reviewed' : labelClass = 'label-warning';
                            break;
                        case 'Accepted' : labelClass = 'label-success';
                            break;
                        case 'Rejected' : labelClass = 'label-danger';
                            break;
                    }
                    return labelClass;
                }
            }
        });
        
    }]);
    
    /**
     * InvoicesController - controls the invoices tab view
     * 
     * Models : 
     * relatedInvoices - invoices related to contact/lead
     */
    app.controller("InvoicesController", ["$scope","$crmapi",function($scope,$crmapi) {
        
        $scope.$watch('tab',function() {
            if($scope.tab === 'invoices') {
                var reqFields = ['subject','invoicedate','duedate','invoicestatus','received','balance','hdnGrandTotal'];
                $scope.loading = true;
                $crmapi.fetchRelatedRecords($scope.crmRecordId,$scope.relatedModule,{fields:reqFields}).then(function(e,res) {
                    $scope.loading = false;
                    if(e && e.code === 1501) {
                        $scope.$emit("MainController:changeView",{view:'login'});
                    } else if(res) {
                        $scope.relatedInvoices = res;
                    }
                });
                
                $scope.getLabelClass = function(stage) {
                    var labelClass = 'label-default';
                    switch(stage) {
                        case 'AutoCreated' : labelClass = 'label-primary';
                            break;
                        case 'Created' : labelClass = 'label-primary';
                            break;
                        case 'Approved' : labelClass = 'label-lightgreen';
                            break;
                        case 'Sent' : labelClass = 'label-warning';
                            break;
                        case 'Credit Invoice' : labelClass = 'label-info';
                            break;
                        case 'Paid' : labelClass = 'label-success';
                            break;
                        case 'Cancel' : labelClass = 'label-danger';
                            break;
                    }
                    return labelClass;
                }
            }
        });
        
    }]);
    
    /**
     * OpportunitiesController - controls the opportunities tab view
     * 
     * Models : 
     * subview - current subview in the app
     * record - current opportunity record
     */
    app.controller("OpportunitiesController", ["$scope","$timeout",function($scope,$timeout) {
        
        $scope.$watch("tab",function() {
            if($scope.tab === 'opportunities') {
                
                if(!$scope.subview) {
                    $scope.subview = 'list';
                } else {
                    $scope.subview = '';
                    $timeout(function() {
                        $scope.subview = 'list';
                    },5);
                }
                
                $scope.$on("OpportunitiesController:changeView",function(event,args) {
                    $scope.subview = args.view;
                });
                
                $scope.$on("OpportunitiesController:changeRecord",function(event,args) {
                    $scope.record = args.record;
                });
                
                $scope.changeSubView = function(subview) {
                    $scope.subview = subview;
                }
                
                $scope.getLabelClass = function(stage) {
                    var labelClass = 'label-default';
                    switch(stage) {
                        case 'Prospecting' : labelClass = 'label-primary';
                            break;
                        case 'Qualification' : labelClass = 'label-warning';
                            break;
                        case 'Needs Analysis' : labelClass = 'label-pink';
                            break;
                        case 'Value Proposition' : labelClass = 'label-default';
                            break;
                        case 'Id. Decision Makers' : labelClass = 'label-info';
                            break;
                        case 'Perception Analysis' : labelClass = 'label-purple';
                            break;
                        case 'Negotiation or Review' : labelClass = 'label-brownyellow';
                            break;
                        case 'Closed Won' : labelClass = 'label-success';
                            break;
                        case 'Closed Lost' : labelClass = 'label-danger';
                            break;
                    }
                    return labelClass;
                }
            }
        });
        
    }]);
    
    /**
     * OpportunitiesListViewController - controls the opportunities list view
     * 
     * Models : 
     * relatedOpportunities - opportunities(potentials) related to contact/lead
     * formFields - required form fields for opportunities module
     */
    app.controller("OpportunitiesListViewController", ["$scope","$crmapi","$timeout","$filter",function($scope,$crmapi,$timeout,$filter) {
        
        $scope.$watch('subview',function() {
            if($scope.tab === 'opportunities' && $scope.subview === 'list') {
                $scope.formFields = [];
                var idPrefix = '';
                var fetchOutlookConfigurableFields = true;
                $crmapi.describe($scope.relatedModule,fetchOutlookConfigurableFields).then(function(e,res) {
                    if(e && e.code === 1501) {
                        $scope.$emit("MainController:changeView",{view:'login'});
                    } else if(res) {
                        idPrefix = res.describe.idPrefix;
                        var fields = res.describe.fields;
                        var outlookConfigurableFields = res.outlookConfigurableFields;

                        var fixedFields = ['potentialname','amount','closingdate','sales_stage','assigned_user_id','leadsource','opportunity_type'];
                        var skipFields = ['adjusted_amount','isconvertedfromlead','contact_id'];                        
                        angular.forEach(fields,function(value) {
                            if(value.editable){

                                var toShowThisField = false;
                                            
                                if(outlookConfigurableFields.length) {
                                    
                                    if(outlookConfigurableFields.indexOf(value.name) !== -1)
                                        toShowThisField = true;

                                }else if(value.quickCreate) {
                                        toShowThisField = true;
                                }


                                if(value.type.name === 'picklist' && value.mandatory) {
                                    value.fieldValue = value.type.picklistValues[0].value;
                                }                                      
                                if(value.type.name === 'reference' && value.name === 'related_to'){
                                   
                                    value.fieldValue= {};

                                    if(typeof $scope.crmRecord != 'undefined') {
                                        value.fieldValue.value = $scope.crmRecord.account_id.value;
                                        value.fieldValue.label = $scope.crmRecord.account_id.label;
                                    }
                                   
                                }
                                var defaultValue = value['default'];
                                if(typeof defaultValue === 'string')
                                    defaultValue = defaultValue.trim();
                                if(defaultValue !== '' && defaultValue !== null) {
                                    value.fieldValue = getFieldValue(value.type.name,defaultValue);
                                }

                                if(fixedFields.indexOf(value.name) !== -1) {
                                    switch(value.name) {
                                        case 'potentialname' : 
                                            $scope.potentialname = value;
                                            break;
                                        case 'amount' : 
                                            $scope.amount = value;
                                            break;
                                        case 'closingdate' : 
                                            $scope.closingdate = value;
                                            break;
                                        case 'sales_stage' : 
                                            $scope.sales_stage = value;
                                            break;
                                        case 'assigned_user_id' : 
                                            $scope.assigned_user_id = value;
                                            $scope.assigned_user_id.fieldValue = $scope.currentUserId;
                                            break;
                                        case 'leadsource' :
                                            $scope.leadsource = value;
                                            break;
                                        case 'opportunity_type' :
                                            $scope.opportunity_type = value;
                                            break;
                                    }
                                } else {
                                    if((toShowThisField || (value.type.name == 'multicurrency' && value.mandatory)) && skipFields.indexOf(value.name) === -1) {
                                        this.push(value);
                                    }
                                }
                            }
                        },$scope.formFields);
            
                        $scope.mode = '';
                        $scope.recordId = '';
                    }
                });
                
                $crmapi.fetchModuleUsers($scope.module).then(function(e,res) {
                    if(!e) {
                        $scope.owners = res.users.concat(res.groups);
                    }
                });

                var loadRelatedOpportunities = function() {
                    var reqFields = ['potentialname','amount','closingdate','sales_stage','forecast_amount','contact_id','related_to'];
                    $scope.loading = true;
                    $crmapi.fetchRelatedRecords($scope.crmRecordId,$scope.relatedModule,{fields:reqFields}).then(function(e,res) {
                        $scope.loading = false;
                        if(e && e.code === 1501) {
                            $scope.$emit("MainController:changeView",{view:'login'});
                        } else if(res) {
                            $scope.relatedOpportunities = res;
                        }
                    });
                }
                
                loadRelatedOpportunities();
                
                var clearFormValues = function() {
                    $scope.showForm = false;
                    
                    $scope.potentialname.fieldValue = getFieldValue($scope.potentialname.type.name,$scope.potentialname['default']);
                    if($scope.hasOwnProperty('closingdate')) {
                        $scope.closingdate.fieldValue = getFieldValue($scope.closingdate.type.name,$scope.closingdate['default']);
                    }
                    $scope.assigned_user_id.fieldValue = $scope.currentUserId;
                    if($scope.hasOwnProperty('sales_stage')) {
                        $scope.sales_stage.fieldValue = $scope.sales_stage.type.picklistValues[0].value;
                        if($scope.sales_stage['default']) {
                            $scope.sales_stage.fieldValue = getFieldValue($scope.sales_stage.type.name,$scope.sales_stage['default']);
                        }
                    }
                    if($scope.hasOwnProperty('amount')) {
                        $scope.amount.fieldValue = getFieldValue($scope.amount.type.name,$scope.amount['default']);
                    }
                    if($scope.hasOwnProperty('leadsource')) {
                        $scope.leadsource.fieldValue = $scope.leadsource.type.picklistValues[0].value;
                        if($scope.leadsource['default']) {
                            $scope.leadsource.fieldValue = getFieldValue($scope.leadsource.type.name,$scope.leadsource['default']);
                        }
                    }
                    if($scope.hasOwnProperty('opportunity_type')) {
                        $scope.opportunity_type.fieldValue = $scope.opportunity_type.type.picklistValues[0].value;
                        if($scope.opportunity_type['default']) {
                            $scope.opportunity_type.fieldValue = getFieldValue($scope.opportunity_type.type.name,$scope.opportunity_type['default']);
                        }
                    }
                    
                    angular.forEach($scope.formFields,function(value,index) {
                        value.fieldValue = '';
                        if(value.type.name === 'picklist' && value.mandatory) {
                            value.fieldValue = value.type.picklistValues[0].value;
                        }
                        var defaultValue = value['default'];
                        if(typeof defaultValue === 'string')
                            defaultValue = defaultValue.trim();
                        if(defaultValue !== '' && defaultValue !== null) {
                            value.fieldValue = getFieldValue(value.type.name,defaultValue);
                        }
                        $scope.formFields[index] = value;
                    });
                    
                    $scope.mode = '';
                    $scope.recordId = '';
                    $scope.form.$setPristine();
                }
                
                $scope.create = function(valid) {
                    if(valid) {
                        var formValues = {
                            potentialname : $scope.potentialname.fieldValue,
                            assigned_user_id : $scope.assigned_user_id.fieldValue
                        };
                        if($scope.hasOwnProperty('closingdate')) {
                            formValues.closingdate = $filter('date_format')($scope.closingdate.fieldValue,'yyyy-mm-dd');
                        }
                        if($scope.hasOwnProperty('sales_stage')) {
                            formValues.sales_stage = $scope.sales_stage.fieldValue;
                        }
                        if($scope.hasOwnProperty('amount')) {
                            formValues.amount = $scope.amount.fieldValue;
                        }
                        if($scope.hasOwnProperty('leadsource')) {
                            formValues.leadsource = $scope.leadsource.fieldValue;
                        }
                        if($scope.hasOwnProperty('opportunity_type')) {
                            formValues.opportunity_type = $scope.opportunity_type.fieldValue;
                        }
                        
                        angular.forEach($scope.formFields,function(value,index) {
                            if(value.type.name === 'reference') {
                                if(value.hasOwnProperty('fieldValue')) {
                                    formValues[value.name] = value.fieldValue.hasOwnProperty('value') ? 
                                    value.fieldValue.value : (value.fieldValue ? '#str#'+value.fieldValue : '');
                                }
                            } else if(value.type.name === 'date') {
                                formValues[value.name] = $filter('date_format')(value.fieldValue,'yyyy-mm-dd');
                            } else if(value.type.name === 'time') {
                                formValues[value.name] = $filter('time_format')(value.fieldValue,'24');
                            } else {
                                formValues[value.name] = value.fieldValue;
                            }
                        });
                        var relatedFieldName = 'contact_id';
                        if($scope.module=='Accounts')
                            relatedFieldName = 'related_to';
                        
                        //set relation
                        formValues[relatedFieldName] = $scope.crmRecordId;
                        formValues = JSON.stringify(formValues);                    
                        var recordId = idPrefix + 'x0';
                        if($scope.mode === 'edit' && $scope.recordId) 
                            recordId = $scope.recordId;
                        
                        clearFormValues();
                        
                        $crmapi.saveRecord($scope.relatedModule,formValues,recordId).then(function(e,res) {
                            if(!e && res) {
                                loadRelatedOpportunities();
                            } else {
                                vtigerHelper.showDialog({
                                    title : 'Error',
                                    content : e.message
                                },'error');
                            }
                        });
                    } else {
                        if(!$scope.showValidationMsg) {
                            $scope.showValidationMsg = true;
                            $timeout(function() {
                                $scope.showValidationMsg = false;
                            }, 4000);
                        }
                    }
                }
                
                $scope.closeForm = function() {
                    clearFormValues();
                }
                
                var getFieldValue = function(fieldtype,fieldValue) {
                    switch(fieldtype) {
                        case 'owner' : fieldValue = fieldValue.value;
                            break;
                        case 'integer' : fieldValue = parseInt(fieldValue);
                            break;
                        case 'multipicklist' : 
                            if(fieldValue.indexOf(' |##| ') !== -1) {
                                fieldValue = fieldValue.split(' |##| ');
                            } else if(fieldValue){
                                fieldValue = [fieldValue];
                            }
                            break;
                        case 'double' : fieldValue = parseFloat(fieldValue);
                            break;
                        case 'currency' :
                        case 'multicurrency' :
                            fieldValue = parseFloat(fieldValue);
                            break;
                        case 'date' : fieldValue = $filter('date_format')(fieldValue,$scope.userpreferences.date_format);
                                break;
                        case 'time' : fieldValue = $filter('time_format')(fieldValue,$scope.userpreferences.hour_format);
                            break;
                    }
                    return fieldValue;
                }
                
                var getRecordFieldValue = function(fieldtype,fieldname,record) {
                    var fieldValue = record[fieldname];
                    return getFieldValue(fieldtype,fieldValue);
                }
                
                $scope.showDetails = function(record) {
                    $scope.$emit("OpportunitiesController:changeRecord",{record:record});
                    $scope.$emit("OpportunitiesController:changeView",{view:'detail'});
                }
                
                $scope.showForm = false;
                $scope.showCreateForm = function() {
                        $scope.showForm = !$scope.showForm;
                        if ($scope.showForm) {
                            //On showCreateForm, account field should get auto-filled
                            angular.forEach($scope.formFields, function (field, index) {
                                if (field.type.name === 'reference' && field.name === 'related_to') {
                                    field.fieldValue = {};
                                    if(typeof $scope.crmRecord != 'undefined') {
                                        field.fieldValue.value = $scope.crmRecord.account_id.value;
                                        field.fieldValue.label = $scope.crmRecord.account_id.label;
                                    }
                                }
                            });
                        }
                    };
                
                var currentReferenceModuleName = '';
                $scope.setCurrentReferenceModuleName = function(module) {
                    currentReferenceModuleName = module;
                }
                $scope.getReferenceRecords = function(val) {
                    return $crmapi.fetchReferenceRecords(currentReferenceModuleName,val);
                }
                
                $scope.editRecord = function(record) {
                    $crmapi.fetchRecord(record.id).then(function(e,res) {
                        if(!e && res) {
                            var recordDetails = res.record;
                            
                            $scope.potentialname.fieldValue = recordDetails['potentialname'];
                            $scope.assigned_user_id.fieldValue = recordDetails['assigned_user_id'].value;
                            if($scope.hasOwnProperty('closingdate')) {
                                $scope.closingdate.fieldValue = $filter('date_format')(recordDetails['closingdate'],$scope.userpreferences.date_format);
                            }
                            if($scope.hasOwnProperty('sales_stage')) {
                                $scope.sales_stage.fieldValue = recordDetails['sales_stage'];
                            }
                            if($scope.hasOwnProperty('amount')) {
                                $scope.amount.fieldValue = parseFloat(recordDetails['amount']);
                            }
                            if($scope.hasOwnProperty('leadsource')) {
                                $scope.leadsource.fieldValue = recordDetails['leadsource'];
                            }
                            if($scope.hasOwnProperty('opportunity_type')) {
                                $scope.opportunity_type.fieldValue = recordDetails['opportunity_type'];
                            }
                            
                            angular.forEach($scope.formFields,function(value,index) {
                                $scope.formFields[index].fieldValue = getRecordFieldValue(value.type.name,value.name,recordDetails);
                            });
                            
                            $scope.mode = 'edit';
                            $scope.recordId = record.id;
                            $scope.showForm = true;
                            
                        } else if(e.code === 1501) {
                            $scope.$emit("MainController:changeView",{view:'login'});
                        } else {
                            var msg = e.message;
                            if(e.code === 'ACCESS_DENIED')
                                msg = 'Access denied';
                            
                            vtigerHelper.showDialog({
                                title : 'Error',
                                content : msg
                            },'error');
                        }
                    });
                }
                
                $crmapi.hasEditViewPermission("Potentials").then(function(e,res) {
                    $scope.hasCreatePermission = res.editPermission;
                });
            }
        });
        
    }]);
    
    /**
     * OpportunitiesDetailViewController - controls the opportunities detail view
     * 
     * Models : 
     * relatedcomments - comments on the potential record
     * newcomment - new comment
     * postComment - 
     */
    app.controller("OpportunitiesDetailViewController", ["$scope","$crmapi",function($scope,$crmapi) {
        
        $scope.$watch("subview",function() {
            if($scope.tab === 'opportunities' && $scope.subview === 'detail') {
                $scope.newcomment = '';
                $scope.relatedcomments = [];
                
                var loadRelatedComments = function() {
                    var reqFields = ['commentcontent','assigned_user_id','modifiedtime'];
                    $crmapi.fetchRelatedRecords($scope.record.id,'ModComments',{fields:reqFields}).then(function(e,res) {
                        if(e && e.code === 1501) {
                            $scope.$emit("MainController:changeView",{view:'login'});
                        } else if(res) {
                            $scope.relatedcomments = res;
                        }
                    });
                }
                
                loadRelatedComments();
                
                $scope.postComment = function() {
                    if($scope.newcomment === '') return;
                    var commentcontent = $scope.newcomment;
                    $scope.newcomment = '';
                    $crmapi.addComment($scope.record.id,commentcontent).then(function(e,res) {
                        if(e && e.code === 1501) {
                            $scope.$emit("MainController:changeView",{view:'login'});
                        } else if(res) {
                            loadRelatedComments();
                        } else {
                            var message = e.message;
                            if(e.code === 'ACCESS_DENIED')
                                message = 'You are restricted from adding a comment!';
                            vtigerHelper.showDialog({
                                title : 'Error',
                                content : message
                            },'error');
                        }
                    });
                }
                
            }
        });
        
    }]);
    
    /**
     * HelpdeskController - controls the helpdesk tab view
     * 
     * Models : 
     * subview - current subview in the app
     * record - current opportunity record
     */
    app.controller("HelpdeskController", ["$scope","$crmapi","$timeout",function($scope,$crmapi,$timeout) {
        
        $scope.$watch("tab",function() {
            if($scope.tab === 'helpdesk') {
                
                if(!$scope.subview) {
                    $scope.subview = 'list';
                } else {
                    $scope.subview = '';
                    $timeout(function() {
                        $scope.subview = 'list';
                    },5);
                }
                
                $scope.$on("HelpdeskController:changeView",function(event,args) {
                    $scope.subview = args.view;
                });
                
                $scope.$on("HelpdeskController:changeRecord",function(event,args) {
                    $scope.record = args.record;
                });
                
                $scope.changeSubView = function(subview) {
                    $scope.subview = subview;
                }
                
                $scope.getLabelClass = function(stage) {
                    var labelClass = 'label-default';
                    switch(stage) {
                        case 'Open' : labelClass = 'label-warning';
                            break;
                        case 'In Progress' : labelClass = 'label-info';
                            break;
                        case 'Wait For Response' : labelClass = 'label-pink';
                            break;
                        case 'Closed' : labelClass = 'label-success';
                            break;
                    }
                    return labelClass;
                }
                
            }
        });
        
    }]);

    /**
     * CasesController - controls the cases tab view
     * 
     * Models : 
     * subview - current subview in the app
     * record - current record
     */
    app.controller("CasesController", ["$scope","$crmapi","$timeout",function($scope,$crmapi,$timeout) {
        
        $scope.$watch("tab",function() {
            if($scope.tab === 'cases') {
                
                if(!$scope.subview) {
                    $scope.subview = 'list';
                } else {
                    $scope.subview = '';
                    $timeout(function() {
                        $scope.subview = 'list';
                    },5);
                }
                
                $scope.$on("CasesController:changeView",function(event,args) {
                    $scope.subview = args.view;
                });
                
                $scope.$on("CasesController:changeRecord",function(event,args) {
                    $scope.record = args.record;
                });
                
                $scope.changeSubView = function(subview) {
                    $scope.subview = subview;
                };
                
                $scope.getLabelClass = function(stage) {
                    var labelClass = 'label-default';
                    switch(stage) {
                        case 'New' : labelClass = 'label-info';
                            break;
                        case 'Assigned' : labelClass = 'label-primary';
                            break;
                        case 'Open' : labelClass = 'label-warning';
                            break;
                        case 'Wait for 3rd party' : 
                        case 'Wait for customer' : labelClass = 'label-pink';
                            break;
                        case 'Resolved' : labelClass = 'label-success';
                            break;
                        case 'Closed' : labelClass = 'label-lightgreen';
                            break;
                    }
                    return labelClass;
                }
                
            }
        });
        
    }]);

    app.controller("CasesListViewController", ["$scope", "$crmapi", "$filter", "$timeout","$outlookconnector", function($scope,$crmapi,$filter,$timeout,$outlookconnector) {
        $scope.$watch("subview",function() {
            if($scope.tab === 'cases' && $scope.subview === 'list') {
                var idPrefix = '';
                
                var mailbox = Office.context.mailbox;
                var _Item = mailbox.item;
                var email = _Item.from.emailAddress;
                var userEmailAddress = mailbox.userProfile.emailAddress;
                if (email === userEmailAddress) {
                    email = _Item.to[0].emailAddress;
                }
                
                var currentEmailData = _Item;
                $crmapi.hasEditViewPermission("Cases").then(function(e,res) {
                    if(!e) {
                        $scope.hasCreatePermission = res.editPermission;
                    }
                });
                
                $scope.showForm = false;
                $scope.showCreateForm = function() {
                    $scope.showForm = !$scope.showForm;
                    if($scope.showForm) {
                        //select primary group
                        angular.forEach($scope.formFields, function (field, index) {
                            if (field.name === 'group_id' && $scope.userpreferences.hasOwnProperty('user_primary_group') && $scope.userpreferences['user_primary_group']) {
                                $scope.formFields[index].fieldValue = '20x' + $scope.userpreferences.user_primary_group;
                            }
                        });
                        //On showCreateForm, account field if exists should get auto-filled
                        setFormFields();                        
                    }
                };
                
                var getFieldValue = function(fieldtype,fieldValue) {
                    switch(fieldtype) {
                        case 'ownergroup' :
                        case 'owner' : fieldValue = fieldValue.value;
                            break;
                        case 'integer' : fieldValue = parseInt(fieldValue);
                            break;
                        case 'multipicklist' : 
                            if(fieldValue.indexOf(' |##| ') !== -1) {
                                fieldValue = fieldValue.split(' |##| ');
                            } else if(fieldValue){
                                fieldValue = [fieldValue];
                            }
                            break;
                        case 'double' : fieldValue = parseFloat(fieldValue);
                            break;
                        case 'currency' :
                        case 'multicurrency' :
                            fieldValue = parseFloat(fieldValue);
                            break;
                        case 'date' : fieldValue = $filter('date_format')(fieldValue,$scope.userpreferences.date_format);
                                break;
                        case 'time' : fieldValue = $filter('time_format')(fieldValue,$scope.userpreferences.hour_format);
                            break;
                    }
                    return fieldValue;
                }
                
                var setFormFields = function() {
                    $scope.formFields = [];
                    var fixedFields = ['description', 'title', 'casestatus', 'casepriority', 'assigned_user_id'];
                   
                    angular.forEach($scope.descFields,function(value) {
                        if(value.editable){
                            if(value.type.name === 'picklist' && value.mandatory) {
                                value.fieldValue = value.type.picklistValues[0].value;
                            }
							if (value.type.name === 'reference' && value.name === 'parent_id') {
                                value.fieldValue = {};
                                if(typeof $scope.crmRecord != 'undefined') {
                                    value.fieldValue.value = $scope.crmRecord.account_id.value;
                                    value.fieldValue.label = $scope.crmRecord.account_id.label;
                                }
							}
                            var defaultValue = value['default'];
                            if(typeof defaultValue === 'string')
                                defaultValue = defaultValue.trim();
                            if(defaultValue !== '' && defaultValue !== null) {
                                value.fieldValue = getFieldValue(value.type.name,defaultValue);
                            }

                            if(fixedFields.indexOf(value.name) !== -1) {
                                switch(value.name) {
                                    case 'title' : 
                                         $scope.title = value;
                                        if(typeof $scope.title.fieldValue === 'undefined') {
                                            $scope.title.fieldValue = currentEmailData.subject;
                                        }
                                        break;
                                    case 'assigned_user_id' : 
                                        $scope.assigned_user_id = value;
                                        $scope.assigned_user_id.fieldValue = $scope.currentUserId;
                                        break;
                                    case 'casestatus' : 
                                        $scope.casestatus = value;
                                        $scope.casestatuspicklistvalues = value.type.picklistValues;
                                        break;
                                    case 'casepriority' : 
                                        $scope.casepriority = value;
                                        break;
                                    case 'description' : 
                                        $scope.description = value;
                                        $outlookconnector.getEmailContent().then(function(e,res) {
                                            if(res) {
                                                $scope.description.fieldValue = angular.element(res).text().trim();
                                            } else {
                                                vtigerHelper.showDialog({
                                                    title: 'Fail',
                                                    content: 'Unable to fetch mail content.'
                                                }, 'error');
                                                return;
                                            }
                                        });
                                        break;
                                }
                            } else {
                                if((value.quickCreate || (value.type.name == 'multicurrency' && value.mandatory)) && value.name !== 'contact_id') {
                                    this.push(value);
                                }
                            }
                        }
                    },$scope.formFields);
                    $scope.mode = '';
                    $scope.recordId = '';
                };
                
                $crmapi.describe($scope.relatedModule).then(function(e,res) {
                    if(e && e.code === 1501) {
                        $scope.$emit("MainController:changeView",{view:'login'});
                    } else if(res) {
                        idPrefix = res.describe.idPrefix;
                        $scope.descFields = res.describe.fields;
                        setFormFields();
                    }
                });
                
                
                $crmapi.fetchModuleUsers($scope.module).then(function(e,res) {
                    if(!e) {
                        $scope.owners = res.users;
                        $scope.groups = res.groups;
                    }
                });
                
                var clearFormValues = function() {
                    $scope.showForm = false;
                   
                    $scope.title.fieldValue = getFieldValue($scope.title.type.name,$scope.title['default']);
                    if(typeof $scope.title.fieldValue === 'undefined' || $scope.title.fieldValue === '') {
                       $scope.title.fieldValue = currentEmailData.subject;
                    }
                    $scope.assigned_user_id.fieldValue = $scope.currentUserId;
                    $scope.casestatus.type.picklistValues = $scope.casestatuspicklistvalues;
                    $scope.casestatus.fieldValue = $scope.casestatus.type.picklistValues[0].value;
                    if($scope.casestatus['default'])
                        $scope.casestatus.fieldValue = getFieldValue($scope.casestatus.type.name,$scope.casestatus['default']);
                    $scope.casepriority.fieldValue = $scope.casepriority.type.picklistValues[0].value;
                    if($scope.casepriority['default']) 
                        $scope.casepriority.fieldValue = getFieldValue($scope.casepriority.type.name,$scope.casepriority['default']);
                    if($scope.hasOwnProperty('description')) {
                        $scope.description.fieldValue = getFieldValue($scope.description.type.name,$scope.description['default']);
                        if(typeof $scope.description.fieldValue === 'undefined' || $scope.description.fieldValue === '') {
                            $outlookconnector.getEmailContent().then(function(e,res) {
                                if(res) {
                                    $scope.description.fieldValue = angular.element(res).text();
                                } else {
                                    vtigerHelper.showDialog({
                                        title: 'Fail',
                                        content: 'Unable to fetch mail content.'
                                    }, 'error');
                                    return;
                                }
                            });
                        }
                    }
                    
                    angular.forEach($scope.formFields,function(value,index) {
                        value.fieldValue = '';
                        if(value.type.name === 'picklist' && value.mandatory) {
                            value.fieldValue = value.type.picklistValues[0].value;
                        }
                        var defaultValue = value['default'];
                        if(typeof defaultValue === 'string')
                            defaultValue = defaultValue.trim();
                        if(defaultValue !== '' && defaultValue !== null) {
                            value.fieldValue = getFieldValue(value.type.name,defaultValue);
                        }
                        $scope.formFields[index] = value;
                    });
                    
                    $scope.mode = '';
                    $scope.recordId = '';
                    $scope.form.$setPristine();
                };
                
                $scope.create = function(valid) {
                    if(valid) {
                        var formValues = {
                            title : $scope.title.fieldValue,
                            assigned_user_id : $scope.assigned_user_id.fieldValue,
                            casestatus : $scope.casestatus.fieldValue,
                            casepriority : $scope.casepriority.fieldValue
                        };
                        if($scope.hasOwnProperty('description')) {
                            formValues.description = $scope.description.fieldValue;
                        }
                        
                        angular.forEach($scope.formFields,function(value,index) {
                            if(value.type.name === 'reference') {
                                if(value.hasOwnProperty('fieldValue')) {
                                    formValues[value.name] = value.fieldValue.hasOwnProperty('value') ? 
                                    value.fieldValue.value : (value.fieldValue ? '#str#'+value.fieldValue : '');
                                }
                            } else if(value.type.name === 'date') {
                                formValues[value.name] = $filter('date_format')(value.fieldValue,'yyyy-mm-dd');
                            } else if(value.type.name === 'time') {
                                formValues[value.name] = $filter('time_format')(value.fieldValue,'24');
                            } else {
                                formValues[value.name] = value.fieldValue;
                            }
                        });               
                        //set relation
                        formValues['contact_id'] = $scope.crmRecordId;

                        formValues = JSON.stringify(formValues);
                        var recordId = idPrefix + 'x0';
                        if($scope.mode === 'edit' && $scope.recordId) 
                            recordId = $scope.recordId;
                        
                        clearFormValues();
                        
                        $crmapi.saveRecord($scope.relatedModule,formValues,recordId).then(function(e,res) {
                            if(!e && res) {
                                loadRelatedCases();
                            } else {
                                vtigerHelper.showDialog({
                                    title : 'Error',
                                    content : e.message
                                },'error');
                            }
                        });
                    } else {
                        if(!$scope.showValidationMsg) {
                            $scope.showValidationMsg = true;
                            $timeout(function() {
                                $scope.showValidationMsg = false;
                            }, 4000);
                        }
                    }
                };
                
                $scope.closeForm = function() {
                    clearFormValues();
                };
                
                var currentReferenceModuleName = '';
                $scope.setCurrentReferenceModuleName = function(module) {
                    currentReferenceModuleName = module;
                }
                $scope.getReferenceRecords = function(val) {
                    return $crmapi.fetchReferenceRecords(currentReferenceModuleName,val);
                }
                
                var loadRelatedCases = function() {
                    var reqFields = ['title','casestatus','casepriority','age'];
                    $scope.loading = true;
                    $crmapi.fetchRelatedRecords($scope.crmRecordId,$scope.relatedModule,{fields:reqFields}).then(function(e,res) {
                        $scope.loading = false;
                        if(e && e.code === 1501) {
                            $scope.$emit("MainController:changeView",{view:'login'});
                        } else if(res) {
                            $scope.relatedCases = res;
                        }
                    });
                };
                
                loadRelatedCases();
                
                
                var getRecordFieldValue = function(fieldtype,fieldname,record) {
                    var fieldValue = record[fieldname];
                    return getFieldValue(fieldtype,fieldValue);
                };
                
                $scope.handleCasePicklistTransitions = function(currentStatusValue) {
                    var CASE_STATUS_TRANSITION_DATA = {
                        "New": {"New":1,"Assigned":1,"Open":1,"Wait for customer":1,"Resolved":1,"Closed":1,"Wait for 3rd party":1},
                        "Assigned": {"New":0,"Assigned":1,"Open":1,"Wait for customer":0,"Resolved":0,"Closed":0,"Wait for 3rd party":0},
                        "Open": {"New":0,"Assigned":0,"Open":1,"Wait for customer":1,"Resolved":1,"Closed":0,"Wait for 3rd party":1},
                        "Wait for customer": {"New":0,"Assigned":0,"Open":1,"Wait for customer":1,"Resolved":0,"Closed":0,"Wait for 3rd party":0},
                        "Resolved": {"New":0,"Assigned":0,"Open":1,"Wait for customer":0,"Resolved":1,"Closed":0,"Wait for 3rd party":0},
                        "Closed": {"New":0,"Assigned":0,"Open":0,"Wait for customer":0,"Resolved":0,"Closed":1,"Wait for 3rd party":0},
                        "Wait for 3rd party": {"New":0,"Assigned":0,"Open":1,"Wait for customer":1,"Resolved":0,"Closed":0,"Wait for 3rd party":1}
                    };
                    
                    var transitionRules = false;
                    if(CASE_STATUS_TRANSITION_DATA.hasOwnProperty(currentStatusValue)) {
                        transitionRules = CASE_STATUS_TRANSITION_DATA[currentStatusValue];
                    }
                    
                    if(transitionRules !== false) {
                        var newPicklistValues = [];
                        angular.forEach($scope.casestatuspicklistvalues, function(picklistValue) {
                            if(transitionRules.hasOwnProperty(picklistValue.value)) {
                                if(transitionRules[picklistValue.value] === 1) {
                                    this.push(picklistValue);
                                }
                            } else {
                                this.push(picklistValue);
                            }
                        }, newPicklistValues);
                        $scope.casestatus.type.picklistValues = newPicklistValues;
                    } else {
                        $scope.casestatus.type.picklistValues = $scope.casestatuspicklistvalues;
                    }
                };
                
                $scope.editRecord = function(record) {
                    $crmapi.fetchRecord(record.id).then(function(e,res) {
                        if(!e && res) {
                            var recordDetails = res.record;
                            $scope.handleCasePicklistTransitions(recordDetails['casestatus']);
                            $scope.title.fieldValue = recordDetails['title'];
                            $scope.assigned_user_id.fieldValue = recordDetails['assigned_user_id'].value;
                            $scope.casestatus.fieldValue = recordDetails['casestatus'];
                            $scope.casepriority.fieldValue = recordDetails['casepriority'];
                            if($scope.hasOwnProperty('description')) {
                                $scope.description.fieldValue = recordDetails['description'];
                            }
                            
                            angular.forEach($scope.formFields,function(value,index) {
                                $scope.formFields[index].fieldValue = getRecordFieldValue(value.type.name,value.name,recordDetails);
                            });
                            
                            $scope.mode = 'edit';
                            $scope.recordId = record.id;
                            $scope.showForm = true;
                            
                        } else if(e.code === 1501) {
                            $scope.$emit("MainController:changeView",{view:'login'});
                        } else {
                            var msg = e.message;
                            if(e.code === 'ACCESS_DENIED')
                                msg = 'Access denied';
                            
                            vtigerHelper.showDialog({
                                title : 'Error',
                                content : msg
                            },'error');
                        }
                    });
                };
                
                $scope.showDetails = function(record) {
                    $scope.$emit("CasesController:changeRecord",{record:record});
                    $scope.$emit("CasesController:changeView",{view:'detail'});
                };
            }
        });
    }]);

    /**
     * CasesDetailViewController - controls the cases detial view
     * 
     * Models : 
     * relatedcomments
     * newcomment - new comment
     */
    app.controller("CasesDetailViewController", ["$scope","$crmapi",function($scope,$crmapi) {
        $scope.$watch("subview",function() {
            if($scope.tab === 'cases' && $scope.subview === 'detail') {

                $scope.newcomment = '';
                $scope.relatedcomments = [];
                
                var loadRelatedComments = function() {
                    var reqFields = ['commentcontent','assigned_user_id','modifiedtime','is_private'];
                    $crmapi.fetchRelatedRecords($scope.record.id,'ModComments',{fields:reqFields}).then(function(e,res) {
                        if(e && e.code === 1501) {
                            $scope.$emit("MainController:changeView",{view:'login'});
                        } else if(res) {
                            var getCommentOwnerLabel = function(comment) {
                                var ownerLabel = comment.assigned_user_id.label;
                                if(comment.is_private === '0') {
                                    ownerLabel = $scope.name;
                                }
                                return ownerLabel;
                            };
                            var relatedCommentsData = [];
                            angular.forEach(res, function(val) {
                                val.ownerlabel = getCommentOwnerLabel(val);
                                this.push(val);
                            },relatedCommentsData);
                            $scope.relatedcomments = relatedCommentsData;
                        }
                    });
                };
                
                loadRelatedComments();
                
                $scope.postComment = function() {
                    if($scope.newcomment === '') return;
                    var commentcontent = $scope.newcomment;
                    $scope.newcomment = '';
                    $crmapi.addComment($scope.record.id,commentcontent).then(function(e,res) {
                        if(e && e.code === 1501) {
                            $scope.$emit("MainController:changeView",{view:'login'});
                        } else if(res) {
                            loadRelatedComments();
                        } else {
                            var message = e.message;
                            if(e.code === 'ACCESS_DENIED')
                                message = 'You are restricted from adding a comment!';
                            vtigerHelper.showDialog({
                                title : 'Error',
                                content : message
                            },'error');
                        }
                    });
                };
                
                $scope.reply = function() {
                    if($scope.newcomment === '') return;
                    var commentcontent = $scope.newcomment;
                    $scope.newcomment = '';
                    $crmapi.replyCase($scope.record.id,commentcontent, $scope.email).then(function(e,res) {
                        if(e && e.code === 1501) {
                            $scope.$emit("MainController:changeView",{view:'login'});
                        } else if(res) {
                            loadRelatedComments();
                            $scope.record.casestatus = res.casestatus;
                        } else {
                            var message = e.message;
                            if(e.code === 'ACCESS_DENIED')
                                message = 'You are restricted from adding a comment!';
                            vtigerHelper.showDialog({
                                title : 'Error',
                                content : message
                            },'error');
                        }
                    });
                };
                
            }
        });
    }]);
    
    /**
     * HelpdeskListViewController - Controls helpdesk list view
     * 
     * Models : 
     * relatedTickets - tickets (helpdesk records) related to contact/lead 
     * formFields - required form fields to crate a ticket
     */
    app.controller("HelpdeskListViewController", ["$scope","$crmapi","$filter","$timeout","$outlookconnector",function($scope,$crmapi,$filter,$timeout,$outlookconnector) {
        $scope.$watch("subview",function() {
            if($scope.tab === 'helpdesk' && $scope.subview === 'list') {
                var idPrefix = '';
                
                var mailbox = Office.context.mailbox;
                var _Item = mailbox.item;
                var email = _Item.from.emailAddress;
                var userEmailAddress = mailbox.userProfile.emailAddress;
                if (email === userEmailAddress) {
                    email = _Item.to[0].emailAddress;
                }
                var currentEmailData = _Item;
                var setFormFields = function() {
                    $scope.formFields = [];
                    var fixedFields = ['ticket_title','assigned_user_id','ticketstatus','ticketpriorities','description'];
                   
                    angular.forEach($scope.descFields,function(value) {
                        if(value.editable){
                            if(value.type.name === 'picklist' && value.mandatory) {
                                value.fieldValue = value.type.picklistValues[0].value;
                            }
                            var defaultValue = value['default'];
                            if(typeof defaultValue === 'string')
                                defaultValue = defaultValue.trim();
                            if(defaultValue !== '' && defaultValue !== null) {
                                value.fieldValue = getFieldValue(value.type.name,defaultValue);
                            }

                            if(fixedFields.indexOf(value.name) !== -1) {
                                switch(value.name) {
                                    case 'ticket_title' : 
                                         $scope.ticket_title = value;
                                        if(typeof $scope.ticket_title.fieldValue === 'undefined') {
                                            $scope.ticket_title.fieldValue = currentEmailData.subject;
                                        }
                                        break;
                                    case 'assigned_user_id' : 
                                        $scope.assigned_user_id = value;
                                        $scope.assigned_user_id.fieldValue = $scope.currentUserId;
                                        break;
                                    case 'ticketstatus' : 
                                        $scope.ticketstatus = value;
                                        break;
                                    case 'ticketpriorities' : 
                                        $scope.ticketpriorities = value;
                                        break;
                                    case 'description' : 
                                        $scope.description = value;
                                        if(typeof $scope.description.fieldValue === 'undefined') {
                                            $outlookconnector.getEmailContent().then(function(e,res) {
                                                if(res) {
                                                    $scope.description.fieldValue = angular.element(res).text();
                                                } else {
                                                    vtigerHelper.showDialog({
                                                        title: 'Fail',
                                                        content: 'Unable to fetch mail content.'
                                                    }, 'error');
                                                    return;
                                                }
                                            });
                                        }
                                        break;
                                }
                            } else {
                                if((value.quickCreate || (value.type.name == 'multicurrency' && value.mandatory)) && value.name !== 'contact_id') {
                                    this.push(value);
                                }
                            }
                        }
                    },$scope.formFields);
                    $scope.mode = '';
                    $scope.recordId = '';
                }
                
                $crmapi.describe($scope.relatedModule).then(function(e,res) {
                    if(e && e.code === 1501) {
                        $scope.$emit("MainController:changeView",{view:'login'});
                    } else if(res) {
                        idPrefix = res.describe.idPrefix;
                        $scope.descFields = res.describe.fields;
                        setFormFields();
                    }
                });
                
                
                $crmapi.fetchModuleUsers($scope.module).then(function(e,res) {
                    if(!e) {
                        $scope.owners = res.users.concat(res.groups);
                    }
                });
                
                var clearFormValues = function() {
                    $scope.showForm = false;
                   
                    $scope.ticket_title.fieldValue = getFieldValue($scope.ticket_title.type.name,$scope.ticket_title['default']);
                    if(typeof $scope.ticket_title.fieldValue === 'undefined' || $scope.ticket_title.fieldValue === '') {
                       $scope.ticket_title.fieldValue = currentEmailData.subject;
                    }
                    $scope.assigned_user_id.fieldValue = $scope.currentUserId;
                    $scope.ticketstatus.fieldValue = $scope.ticketstatus.type.picklistValues[0].value;
                    if($scope.ticketstatus['default'])
                        $scope.ticketstatus.fieldValue = getFieldValue($scope.ticketstatus.type.name,$scope.ticketstatus['default']);
                    $scope.ticketpriorities.fieldValue = $scope.ticketpriorities.type.picklistValues[0].value;
                    if($scope.ticketpriorities['default']) 
                        $scope.ticketpriorities.fieldValue = getFieldValue($scope.ticketpriorities.type.name,$scope.ticketpriorities['default']);
                    if($scope.hasOwnProperty('description')) {
                         $scope.description.fieldValue = getFieldValue($scope.description.type.name,$scope.description['default']);
                        if(typeof $scope.description.fieldValue === 'undefined' || $scope.description.fieldValue === '') {
                            $outlookconnector.getEmailContent().then(function(e,res) {
                                if(res) {
                                    $scope.description.fieldValue = angular.element(res).text();
                                } else {
                                    vtigerHelper.showDialog({
                                        title: 'Fail',
                                        content: 'Unable to fetch mail content.'
                                    }, 'error');
                                    return;
                                }
                            });
                        }
                    }
                    
                    angular.forEach($scope.formFields,function(value,index) {
                        value.fieldValue = '';
                        if(value.type.name === 'picklist' && value.mandatory) {
                            value.fieldValue = value.type.picklistValues[0].value;
                        }
                        var defaultValue = value['default'];
                        if(typeof defaultValue === 'string')
                            defaultValue = defaultValue.trim();
                        if(defaultValue !== '' && defaultValue !== null) {
                            value.fieldValue = getFieldValue(value.type.name,defaultValue);
                        }
                        $scope.formFields[index] = value;
                    });
                    
                    $scope.mode = '';
                    $scope.recordId = '';
                    $scope.form.$setPristine();
                }
                
                $scope.create = function(valid) {
                    if(valid) {
                        var formValues = {
                            ticket_title : $scope.ticket_title.fieldValue,
                            assigned_user_id : $scope.assigned_user_id.fieldValue,
                            ticketstatus : $scope.ticketstatus.fieldValue,
                            ticketpriorities : $scope.ticketpriorities.fieldValue
                        };
                        if($scope.hasOwnProperty('description')) {
                            formValues.description = $scope.description.fieldValue;
                        }
                        
                        angular.forEach($scope.formFields,function(value,index) {
                            if(value.type.name === 'reference') {
                                if(value.hasOwnProperty('fieldValue')) {
                                    formValues[value.name] = value.fieldValue.hasOwnProperty('value') ? 
                                    value.fieldValue.value : (value.fieldValue ? '#str#'+value.fieldValue : '');
                                }
                            } else if(value.type.name === 'date') {
                                formValues[value.name] = $filter('date_format')(value.fieldValue,'yyyy-mm-dd');
                            } else if(value.type.name === 'time') {
                                formValues[value.name] = $filter('time_format')(value.fieldValue,'24');
                            } else {
                                formValues[value.name] = value.fieldValue;
                            }
                        });               
                        //set relation
                        formValues['contact_id'] = $scope.crmRecordId;

                        formValues = JSON.stringify(formValues);
                        var recordId = idPrefix + 'x0';
                        if($scope.mode === 'edit' && $scope.recordId) 
                            recordId = $scope.recordId;
                        
                        clearFormValues();
                        
                        $crmapi.saveRecord($scope.relatedModule,formValues,recordId).then(function(e,res) {
                            if(!e && res) {
                                loadRelatedTickets();
                            } else {
                                vtigerHelper.showDialog({
                                    title : 'Error',
                                    content : e.message
                                },'error');
                            }
                        });
                    } else {
                        if(!$scope.showValidationMsg) {
                            $scope.showValidationMsg = true;
                            $timeout(function() {
                                $scope.showValidationMsg = false;
                            }, 4000);
                        }
                    }
                }
                
                $scope.closeForm = function() {
                    clearFormValues();
                }
                
                var loadRelatedTickets = function() {
                    var reqFields = ['ticket_title','ticketstatus','ticketseverities','ticketpriorities','contact_id','parent_id'];
                    $scope.loading = true;
                    $crmapi.fetchRelatedRecords($scope.crmRecordId,$scope.relatedModule,{fields:reqFields}).then(function(e,res) {
                        $scope.loading = false;
                        if(e && e.code === 1501) {
                            $scope.$emit("MainController:changeView",{view:'login'});
                        } else if(res) {
                            $scope.relatedTickets = res;
                        }
                    });
                };
                
                loadRelatedTickets();
                
                $scope.showForm = false;
                $scope.showCreateForm = function() {
                    $scope.showForm = !$scope.showForm;
                }
                
                $scope.showDetails = function(record) {
                    $scope.$emit("HelpdeskController:changeRecord",{record:record});
                    $scope.$emit("HelpdeskController:changeView",{view:'detail'});
                }
                
                var currentReferenceModuleName = '';
                $scope.setCurrentReferenceModuleName = function(module) {
                    currentReferenceModuleName = module;
                }
                $scope.getReferenceRecords = function(val) {
                    return $crmapi.fetchReferenceRecords(currentReferenceModuleName,val);
                }
                
                var getFieldValue = function(fieldtype,fieldValue) {
                    switch(fieldtype) {
                        case 'owner' : fieldValue = fieldValue.value;
                            break;
                        case 'integer' : fieldValue = parseInt(fieldValue);
                            break;
                        case 'multipicklist' : 
                            if(fieldValue.indexOf(' |##| ') !== -1) {
                                fieldValue = fieldValue.split(' |##| ');
                            } else if(fieldValue){
                                fieldValue = [fieldValue];
                            }
                            break;
                        case 'double' : fieldValue = parseFloat(fieldValue);
                            break;
                        case 'currency' :
                        case 'multicurrency' :
                            fieldValue = parseFloat(fieldValue);
                            break;
                        case 'date' : fieldValue = $filter('date_format')(fieldValue,$scope.userpreferences.date_format);
                                break;
                        case 'time' : fieldValue = $filter('time_format')(fieldValue,$scope.userpreferences.hour_format);
                            break;
                    }
                    return fieldValue;
                }
                
                var getRecordFieldValue = function(fieldtype,fieldname,record) {
                    var fieldValue = record[fieldname];
                    return getFieldValue(fieldtype,fieldValue);
                }
                
                $scope.editRecord = function(record) {
                    $crmapi.fetchRecord(record.id).then(function(e,res) {
                        if(!e && res) {
                            var recordDetails = res.record;
                            
                            $scope.ticket_title.fieldValue = recordDetails['ticket_title'];
                            $scope.assigned_user_id.fieldValue = recordDetails['assigned_user_id'].value;
                            $scope.ticketstatus.fieldValue = recordDetails['ticketstatus'];
                            $scope.ticketpriorities.fieldValue = recordDetails['ticketpriorities'];
                            if($scope.hasOwnProperty('description')) {
                                $scope.description.fieldValue = recordDetails['description'];
                            }
                            
                            angular.forEach($scope.formFields,function(value,index) {
                                $scope.formFields[index].fieldValue = getRecordFieldValue(value.type.name,value.name,recordDetails);
                            });
                            
                            $scope.mode = 'edit';
                            $scope.recordId = record.id;
                            $scope.showForm = true;
                            
                        } else if(e.code === 1501) {
                            $scope.$emit("MainController:changeView",{view:'login'});
                        } else {
                            var msg = e.message;
                            if(e.code === 'ACCESS_DENIED')
                                msg = 'Access denied';
                            
                            vtigerHelper.showDialog({
                                title : 'Error',
                                content : msg
                            },'error');
                        }
                    });
                }
                
                $crmapi.hasEditViewPermission("HelpDesk").then(function(e,res) {
                    $scope.hasCreatePermission = res.editPermission;
                });
            }
        });
    }]);
    
    /**
     * HelpdeskDetailViewController - controls the helpdesk detial view
     * 
     * Models : 
     * relatedcomments - comments on the potential record
     * newcomment - new comment
     */
    app.controller("HelpdeskDetailViewController", ["$scope","$crmapi",function($scope,$crmapi) {
        $scope.$watch("subview",function() {
            if($scope.tab === 'helpdesk' && $scope.subview === 'detail') {

                $scope.newcomment = '';
                $scope.relatedcomments = [];
                
                var loadRelatedComments = function() {
                    var reqFields = ['commentcontent','assigned_user_id','modifiedtime'];
                    $crmapi.fetchRelatedRecords($scope.record.id,'ModComments',{fields:reqFields}).then(function(e,res) {
                        if(e && e.code === 1501) {
                            $scope.$emit("MainController:changeView",{view:'login'});
                        } else if(res) {
                            $scope.relatedcomments = res;
                        }
                    });
                }
                
                loadRelatedComments();
                
                $scope.postComment = function() {
                    if($scope.newcomment === '') return;
                    var commentcontent = $scope.newcomment;
                    $scope.newcomment = '';
                    $crmapi.addComment($scope.record.id,commentcontent).then(function(e,res) {
                        if(e && e.code === 1501) {
                            $scope.$emit("MainController:changeView",{view:'login'});
                        } else if(res) {
                            loadRelatedComments();
                        } else {
                            var message = e.message;
                            if(e.code === 'ACCESS_DENIED')
                                message = 'You are restricted from adding a comment!';
                            vtigerHelper.showDialog({
                                title : 'Error',
                                content : message
                            },'error');
                        }
                    });
                }
                
            }
        });
    }]);
    
    /**
     * CommentsController - controls the comments tab view
     */
    app.controller("CommentsController", ["$scope","$crmapi",function($scope,$crmapi) {
        $scope.relatedcomments = [];
        $scope.$watch('tab',function() {
            if($scope.tab === 'comments') {
                
                $scope.newcomment = '';
                
                var loadRelatedComments = function() {
                    var reqFields = ['commentcontent','assigned_user_id','modifiedtime'];
                    $crmapi.fetchRelatedRecords($scope.crmRecordId,'ModComments',{fields:reqFields}).then(function(e,res) {
                        if(e && e.code === 1501) {
                            $scope.$emit("MainController:changeView",{view:'login'});
                        } else if(res) {
                            $scope.relatedcomments = res;
                        }
                    });
                }
                
                loadRelatedComments();
                
                $scope.postComment = function() {
                    if($scope.newcomment === '') return;
                    var commentcontent = $scope.newcomment;
                    $scope.newcomment = '';
                    $crmapi.addComment($scope.crmRecordId,commentcontent).then(function(e,res) {
                        if(res) {
                            loadRelatedComments();
                        } else {
                            var message = e.message;
                            if(e.code === 'ACCESS_DENIED')
                                message = 'You are restricted from adding a comment!';
                            vtigerHelper.showDialog({
                                title : 'Error',
                                content : message
                            },'error');
                        }
                    });
                }
                
            }
        });
    }]);
    
    /**
     * SettingsController - controls the settings tab view
     */
    app.controller("SettingsController", ["$scope","$crmapi","$timeout",function($scope,$crmapi,$timeout) {

            $scope.$watch("tab",function() {
                if($scope.tab === 'settings') {
                    
                    $crmapi.getExtensionModuleSettings().then(function(e,res) {
                        if(!e && res)
                            $scope.moduleSettings = res;
                        else if(e && e.code === 1501)
                            $scope.$emit("MainController:changeView",{view:'login'});
                    });
                    
                    $scope.getIconClass = function(modulename) {
                        var iconClassName = 'fa-paw';
                        switch(modulename) {
                            case 'Events' : iconClassName = 'fa fa-calendar';break;
                            case 'Emails' : iconClassName = 'vicon-emails';break;
                            case 'Quotes' : iconClassName = 'vicon-quotes';break;
                            case 'Invoice' : iconClassName = 'vicon-invoice';break;
                            case 'Potentials' : iconClassName = 'vicon-potentials';break;
                            case 'Cases' : iconClassName = 'vicon-cases';break;
                            case 'HelpDesk' : iconClassName = 'vicon-helpdesk';break;
                            case 'ModComments' : iconClassName = 'fa fa-comment';
                        }
                        return iconClassName;
                    }
                    
                    $scope.saveSettings = function() {
                        $timeout(function() {
                            $crmapi.storeExtensionModuleSettings($scope.moduleSettings);
                            $scope.$emit('RecordSummaryController:changeModuleSettings',{moduleSettings : $scope.moduleSettings});
                        }, 1000);
                    }
                    
                }
            });
            
    }]);


    app.controller('EditIconClickedController', ["$scope","$location","$route",function($scope,$location,$route) {

        $scope.editIconClicked = function() {
            
            if($route.current && $route.current.$$route.originalPath == '/edit') {
              
                $route.reload();
            }
            
            $location.path('edit').search({module : $scope.module});
            

        }

     }]);
    /**
     * AttachEmailController - to control the attach email button operations
     * 
     * Models : 
     * emailFields - mandatory email fields
     * fromemail - from email
     * fromname - sender name
     * emaildata - email data of the thread
     * 
     */
    app.controller('AttachEmailController', ["$scope","$crmapi",function($scope,$crmapi) {
        var _attachEmail = function(emaildata,res,useremail,emailIdentifier,record) {
            var relatedRecord = res.record;
            var relatedRecordId = relatedRecord.id;
            //TODO : remove hardcodings
            var module = 'Emails';
            var recordId = '8x0';
            var relatedRecordAssignedUserId = relatedRecord.assigned_user_id.value;
            if(!emailIdentifier) {
                vtigerHelper.showDialog({
                    title: 'Fail',
                    content: 'Failed to archive email! (Unable to find email id)'
                }, 'error');
                return;
            }
            
            if(record && record.id) {
                var relatedrecordid = record.id;
            }
           
            $scope.emailFields = [];
            $crmapi.describe(module).then(function(e,res) {
                if(e && e.code === 1501) {
                    vtigerHelper.showDialog({
                        title : "Info",
                        content : "Session expired. Please login again to attach email."
                    });
                } else if(res) {
                    angular.forEach(res.describe.fields,function(value) {
                        if(value.mandatory) this.push(value);
                    },$scope.emailFields);
                }
            });
            
            var emailDateTime = moment(emaildata.dateTimeCreated).utc();
            var emailsData = {};
            
            var _item = Office.context.mailbox.item;
            var body = _item.body;
            body.getAsync(Office.CoercionType.Html, function (asyncResult) {
                if (asyncResult.status !== Office.AsyncResultStatus.Succeeded) {
                    vtigerHelper.showDialog({
                        title: 'Fail',
                        content: 'Failed to archive email! (Unable to fetch mail content)'
                    }, 'error');
                return;
                } else {

                    
                    Office.context.mailbox.getCallbackTokenAsync(function (result) {
                    
                        if (result.status == "succeeded") {
                            var callbackTokenForAttachments = result.value ;
			    var emailBody = asyncResult.value.trim();
                            var email = {
                                activitytype: 'Emails',
                                date_start: emailDateTime.format("YYYY-MM-DD"),
                                time_start: emailDateTime.format("HH:mm:ss"),
                                assigned_user_id: relatedRecordAssignedUserId,
                                subject: emaildata.subject,
                                from_email: emaildata.from.emailAddress,
                                saved_toid: useremail,
                                description: emailBody,
                                parent_id: relatedRecordId,
                                messageid: emaildata.itemId,
                                source: 'Outlook Addon',
                                callbackTokenForAttachments:callbackTokenForAttachments,
                                ewsUrl : Office.context.mailbox.ewsUrl
                             }
                            emailsData[emaildata.itemId] = email;
                            var values = JSON.stringify(emailsData);

                            $crmapi.archiveEmail(module,values,recordId,relatedrecordid).then(function(e,res) {
                                if(res) {
                                    vtigerHelper.showDialog({
                                        title : 'Success',
                                        content : 'Email archived!'
                                    },'success');
                                } else {
                                    vtigerHelper.showDialog({
                                        title : 'Fail',
                                        content : 'Failed to archive email!'
                                    },'error');
                                }
                            });

                        }else{
                            
                            vtigerHelper.showDialog({
                                title : 'Fail',
                                content : 'Failed to archive email!'
                            },'error');
                        }
                    });

                }
            });
        }
        
        $scope.attachEmail = function(emailIdentifier, record) {
            var mailbox = Office.context.mailbox;
            var _Item = mailbox.item;
            var emailIdentifier = _Item.itemId;
            var email = _Item.from.emailAddress;
            var userEmailAddress = mailbox.userProfile.emailAddress;
            if (email === userEmailAddress) {
                email = _Item.to[0].emailAddress;
            }
                
            if(record) {
                $crmapi.fetchRecord(record.id).then(function(e,res) {
                    var recordDetails = res;
                    if(e && e.code === 1501) {
                        vtigerHelper.showDialog({
                            title : "Info",
                            content : "Login required!"
                        },'information');
                    } else if(res) {
                        $crmapi.isModuleEnabled("Emails").then(function(e,res) {
                            if(res && !res.enabled) {
                                vtigerHelper.showDialog({
                                    title : "Note",
                                    content : "Emails moduled disabled in CRM. \n\
                                               Please enable Emails module to archive this email."
                                },'information');
                            } else if(res && res.enabled) {
                                _attachEmail(_Item,recordDetails,userEmailAddress,emailIdentifier,record);
                            }
                        });
                    } else {
                        vtigerHelper.showDialog({
                            title : "Note",
                            content : "Email not found!"
                        },'error');
                    }
                });
            } else {
                $crmapi.fetchRecordDetailsFromEmail(email).then(function(e,res) {
                    
                    var recordDetails = res;
                    if(e && e.code === 1501) {
                        vtigerHelper.showDialog({
                            title : "Info",
                            content : "Login required!"
                        },'information');
                    } else if(res) {
                        $crmapi.isModuleEnabled("Emails").then(function(e,res) {
                            if(res && !res.enabled) {
                                vtigerHelper.showDialog({
                                    title : "Note",
                                    content : "Emails moduled disabled in CRM. \n\
                                               Please enable Emails module to archive this email."
                                },'information');
                            } else if(res && res.enabled) {
                                _attachEmail(_Item,recordDetails,userEmailAddress,emailIdentifier);
                            }
                        });
                    } else {
                        vtigerHelper.showDialog({
                            title : "Note",
                            content : "Email not found!"
                        },'error');
                    }
                });
            }
        }
    }]);

    /**
     * DetailviewController - Controls the detail view
     * recordDetails - Record details
     */
    app.controller("DetailViewController",["$scope","$crmapi","$filter",function($scope,$crmapi,$filter) { 
        $scope.$watch("tab",function() {
            if($scope.tab === 'detail') {
                 $scope.detailViewBusy = true;
                 var fetchOutlookConfigurableFields = true;
                 $crmapi.describe($scope.module,fetchOutlookConfigurableFields).then(function(e,res)  {
                    if(e && e.code === 1501) {
                        $scope.$emit("MainController:changeView",{view:'login'});
                    } else if(res) {
                        var fields = res.describe.fields;
                        var outlookConfigurableFields = res.outlookConfigurableFields;
                        $crmapi.fetchRecord($scope.crmRecordId).then(function(e, res) {
                            $scope.detailViewBusy = false;
                                if(e && e.code === 1501) {
                                    $scope.$emit("MainController:changeView",{view:'login'});
                                } else if(res) {
                                    var getDisplayValue = function(fieldValue,type) {
                                        switch(type){
                                           case 'owner': 
                                                    var detailviewUrl = $crmapi.getDetailViewUrl('Users',fieldValue.value,'Settings');
                                                    fieldValue.detailViewUrl = detailviewUrl;
                                               break;
                                           case 'reference': 
                                                    fieldValue = fieldValue.label;
                                               break;
                                           case 'boolean' : fieldValue = (fieldValue === '1') ? "Yes" : "No";
                                                break;
                                           case 'multipicklist' : 
                                               if(fieldValue.indexOf(' |##| ') !== -1) {
                                                   fieldValue = fieldValue.split(' |##| ');
                                                   fieldValue = fieldValue.join(); 
                                               } else if(fieldValue){
                                                   fieldValue = [fieldValue];
                                               }
                                               break;
                                           case 'url': fieldValue = $filter('linky')(fieldValue);
                                               break;
                                           case 'date' : fieldValue = $filter('date_format')(fieldValue,$scope.userpreferences.date_format);
                                               break;
                                           case 'time' : fieldValue = $filter('time_format')(fieldValue,$scope.userpreferences.hour_format);
                                               break;                              
                                        }
                                       return fieldValue;
                                   };
                                    
                                   var skipFields = ['contact_no','support_end_date','support_start_date','source',
                                         'module','detailViewUrl','createdtime','modifiedtime'] ; 
                                    $scope.recordDetails = [];
                                    angular.forEach(fields,function(value) {
                                        var fieldName = value.name;
                                        var fieldLabel = value.label; 
                                        var fieldValue = res.record[fieldName];

                                        var toShowThisField = false;
                                            
                                        if(outlookConfigurableFields.length) {
                                            
                                            if(outlookConfigurableFields.indexOf(fieldName) !== -1)
                                                toShowThisField = true;

                                        }else if(value.summaryView) {
                                                toShowThisField = true;
                                        }
                                        
                                        if(skipFields.indexOf(fieldName) === -1 && toShowThisField){ 
                                            var recordDetails = {
                                                'fieldLabel':fieldLabel,
                                                'fieldValue':getDisplayValue(fieldValue,value.type.name),
                                                'fieldType':value.type.name
                                            };
                                            $scope.recordDetails.push(recordDetails);  
                                        }
                                    });
                                }
                        });
                    }
                });
            }
        });
    }]);

    app.controller("ngRouteController",["$route", "$rootScope","$timeout", "$localStorageService",function($route, $rootScope, $timeout, $localStorageService) {
        $timeout(function(){
          
            if(!$localStorageService.get("vtigersession")) {
            
                return;
            }
            if($route.current.$$route.originalPath == '/') {
               
                $rootScope.$broadcast('changeTab', 'none');
                $rootScope.$broadcast('changeView', '');
                return;
            }
            
            if($route.current.$$route.tab) {
                $rootScope.$broadcast('changeTab', $route.current.$$route.tab);
            }
            
            if($route.current.$$route.module) {
                $rootScope.$broadcast('changeModule', $route.current.$$route.module);
            }
            
            if($route.current.$$route.view) {
                $rootScope.$broadcast('changeView', $route.current.$$route.view);
            }
        
        }, 300);
    }]);


}