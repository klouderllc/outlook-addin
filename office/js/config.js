/*!
 * Copyright (C) www.vtiger.com. All rights reserved.
 * Vtiger Commercial License. Reverse engineering restricted.
 */

function setupConfig() {
    
    var app = angular.module('VtigerOutlookAddon');
    app.config(function($routeProvider){
            $routeProvider
            .when("/summary", {
                template    :   "",
                controller  :   "ngRouteController",
                tab         :   'none'
            })
            .when("/detail", {
                template    :   "",
                controller  :   "ngRouteController",
                tab         :   "detail"
            })
            .when("/timeline", {
                template    :   "",
                controller  :   "ngRouteController",
                tab         :   "timeline"
            })
            .when("/events", {
                template    :   "",
                controller  :   "ngRouteController",
                tab         :   "activities",
                module      :   "Events"
            })
            .when("/emails", {
                template    :   "",
                controller  :   "ngRouteController",
                tab         :   "emails",
                module      :   "Emails"
            })
            .when("/quotes", {
                template    :   "",
                controller  :   "ngRouteController",
                tab         :   "quotes",
                module      :   "Quotes"
            })
            .when("/invoices", {
                template    :   "",
                controller  :   "ngRouteController",
                tab         :   "invoices",
                module      :   "Invoice"
            })
            .when("/potentials", {
                template    :   "",
                controller  :   "ngRouteController",
                tab         :   "opportunities",
                module      :   "Potentials"
            })
            .when("/cases", {
                template    :   "",
                controller  :   "ngRouteController",
                tab         :   "cases",
                module      :   "Cases"
            })
            .when("/helpdesk", {
                template    :   "",
                controller  :   "ngRouteController",
                tab         :   "helpdesk",
                module      :   "HelpDesk"
            })
            .when("/comments", {
                template    :   "",
                controller  :   "ngRouteController",
                tab         :   "comments",
                module      :   "ModComments"
            })
            .when("/settings", {
                template    :   "",
                controller  :   "ngRouteController",
                tab         :   "settings",
                module      :   "Settings"
            })
            .when("/edit", {
                template    :   "",
                controller  :   "ngRouteController",
                view      :     "edit"
            })
            .when("/createview", {
                template    :   "",
                controller  :   "CreateController"
            })
            .when("/", {
                template    :   "",
                controller  :   "ngRouteController",
            })
        });
    
}