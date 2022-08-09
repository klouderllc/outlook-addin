/*!
 * Copyright (C) www.vtiger.com. All rights reserved.
 * Vtiger Commercial License. Reverse engineering restricted.
 */

window.addEventListener("load", function () {
  var angularify = function () {
    angular.module(
      "VtigerOutlookAddon",
      ["ngSanitize", "ui.bootstrap.typeahead", "ui.bootstrap.tpls", "toggle-switch", "ui.select", "ngRoute"],
      [
        "$controllerProvider",
        "$compileProvider",
        function ($controllerProvider, $compileProvider) {
          controllerProvider = $controllerProvider;
          $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|outlook-addon):/);
        },
      ]
    );

    var html = document.querySelector("html");
    //define controllers,services before bootstrapping
    registerAppServices();
    registerAppDirectives();
    registerAppControllers();
    registerAppFilters();
    setupConfig();

    angular.bootstrap(html, ["VtigerOutlookAddon"], []);
  };

  var refresh = function (f) {
    if (/in/.test(document.readyState)) {
      setTimeout("refresh(" + f + ")", 10);
    } else {
      f();
    }
  };

  var main = function () {
    var vtigerUtils = {
      storage: {
        store: function (key, value) {
          localStorage.setItem(key, value);
        },

        get: function (key) {
          return localStorage.getItem(key);
        },

        remove: function (key) {
          localStorage.removeItem(key);
        },
      },
    };

    Office.onReady(function () {
      // Office is ready
      // Checks for the DOM to load.
      $(document).ready(function () {
        var mailbox = Office.context.mailbox;
        var _Item = mailbox.item;

        var mailbox = Office.context.mailbox;
        var _Item = mailbox.item;
        var email = _Item.from.emailAddress;
        var name = _Item.from.displayName;
        var userEmailAddress = mailbox.userProfile.emailAddress;
        if (email === userEmailAddress) {
          email = _Item.to[0].emailAddress;
          name = _Item.to[0].displayName;
        }
        var emailIdentifier = _Item.itemId;

        var d = new Date();
        var year = d.getFullYear();
        var templateData = {
          baseresourceurl: vtigerHelper.getExtensionResourceURL(),
          email: email,
          name: vtigerHelper.addSlashes(name),
          year: year,
          emailIdentifier: emailIdentifier,
        };
        var parentElement = jQuery("#vtigerwidget");
        var widgetWrapper = vtigerHelper.getHtml("main", templateData);
        parentElement.append(widgetWrapper);

        angularify();
      });
    });
  };

  refresh(main);
});

var ssoLogin = function (res) {
  var storage = angular.injector(["ng", "VtigerOutlookAddon"]).get("$localStorageService");
  storage.set("crm-instance-url", res.instanceurl);
  storage.set("vtigersession", res.session);

  var userdetails = JSON.parse(res.userdetails);
  storage.set("user_tz", userdetails.user_tz);
  storage.set("date_format", userdetails.date_format);
  storage.set("hour_format", userdetails.hour_format);
  storage.set("currency_symbol", userdetails.currency_symbol);
  storage.set("defaulteventstatus", userdetails.defaulteventstatus);
  storage.set("defaultactivitytype", userdetails.defaultactivitytype);
  storage.set("othereventduration", userdetails.othereventduration);
  storage.set("callduration", userdetails.callduration);
  storage.set("first_name", userdetails.first_name);
  storage.set("last_name", userdetails.last_name);
  storage.set("user_primary_group", userdetails.user_primary_group);
  storage.set("user_id", userdetails.id);
  storage.set("user_name", userdetails.user_name);

  var maincontroller = document.querySelector("body");
  var mainControllerScope = angular.element(maincontroller).scope();
  mainControllerScope.$emit("MainController:changeUserId", { userId: "19x" + userdetails.id });
  mainControllerScope.$emit("MainController:changeView", { view: "" });
  window.location.reload();
};
