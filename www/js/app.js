// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'

(function(){

  var unique_array = [];
  var backgroundService;
  var db = null;

  app = angular.module('starter', ['ionic', 'ngCordova','WifiServices', 'TrafficServices'])
  .run(function($ionicPlatform, $rootScope, $cordovaToast, $cordovaSQLite) {

  // this is to keep track of the status of wifi connection.
  $rootScope.notificationState = 1

  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    $cordovaSQLite.deleteDB({ name: "wifiApp.db" ,location: 'default'});
    db = $cordovaSQLite.openDB({ name: "wifiApp.db" ,location: 'default'});
    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS wifiProfiles (id integer primary key, ssid text, bssid text, password text)");
    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS wifiDataUses (id integer primary key, total text, upload text, download text,timestamp text)");

     var query = "INSERT INTO wifiProfiles (ssid, bssid, password) VALUES (?,?,?)";
      $cordovaSQLite.execute(db, query, ['Saksham', '0c:d2:b6:40:93:9f', 'BANO12345']).then(function(res) {
      }, function (err) {
          console.error(err);
      });
      $cordovaSQLite.execute(db, query, ['test', 'd4:68:4d:2c:2e:08', 'test@123']).then(function(res) {
      }, function (err) {
          console.error(err);
      });

    
   function handleSuccess(data) {
      console.log(JSON.stringify(data));
    }

    function handleError(data) {
      console.log("Error: " + data.ErrorMessage);
      console.log(JSON.stringify(data));
    }

      backgroundService = cordova.plugins.backgroundMode;

      //   backgroundService.on('activate', app.onModeActivated);
      //   backgroundService.on('deactivate', app.onModeDeactivated);
      //   backgroundService.on('enable', app.onModeEnabled);
      //   backgroundService.on('disable', app.onModeDisabled);


      //starting the foreground service.
      //backgroundService.enable();

      backgroundService.on('activate', function () {
        //backgroundService.disableWebViewOptimizations();
          // app.timer = setInterval(function () {
          //   var tt = backgroundService.isActive();
          // }, 2000);
      });

      backgroundService.on('deactivate', function () {
        //backgroundService.moveToBackground();
        //clearInterval(app.timer);
      });

      backgroundService.on('enable', function () {
      });

      backgroundService.on('disable', function () {
      });

      // $ionicPlatform.registerBackButtonAction(function (event) {
      //   backgroundService.overrideBackButton();

      //   //toast msg
      //   $cordovaToast.show('press again to exit', 'short', 'bottom')
      //   .then(function(success) {

      //   }, function (error) {

      //   });

      //     // event.preventDefault();
      // }, 100);

     
  });

})
.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'MenuController'
  })

  .state('app.playlists', {
      url: '/playlists',
      views: {
        'menuContent': {
          templateUrl: 'templates/playlists.html',
          controller: 'TrafficController'
        }
      }
    })
  .state('app.wifilists', {
      url: '/wifilists',
      views: {
        'menuContent': {
          templateUrl: 'templates/wifilists.html',
          controller: 'WifiController'
        }
      }
    });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/playlists');
});



  app.controller('TrafficController', ['$scope', '$timeout', '$cordovaSQLite','WifiService', 'TrafficService', function($scope, $timeout, $cordovaSQLite, WifiService, TrafficService){

    $scope.wifiList = [];
    $scope.freeWifiList = [];
    
    $scope.trafficStatusData = {};
    $scope.trafficStatusData.total = 0;
    $scope.trafficStatusData.upload = 0;
    $scope.trafficStatusData.download = 0;
    $scope.showTrafficStatus = false;

    $scope.insertIntoWifiProfiles = function(ssid, bssid, password) {
        var query = "INSERT INTO wifiProfiles (ssid, bssid, password) VALUES (?,?,?)";
        $cordovaSQLite.execute(db, query, [ssid, bssid, password]).then(function(res) {
        }, function (err) {
            console.error(err);
        });
    }
 
    $scope.selectFromWifiProfiles = function(bssid,successCall, failureCall) {
        var query = "SELECT ssid, bssid, password FROM wifiProfiles WHERE bssid = ?";
        $cordovaSQLite.execute(db, query, [bssid]).then(successCall,failureCall);
    }

    $scope.insertIntoWifiDataUses = function(total, upload, download,timestamp) {
        var query = "INSERT INTO WifiDataUses (total, upload, download,timestamp) VALUES (?,?,?,?)";
        $cordovaSQLite.execute(db, query, [total, upload, download,timestamp]).then(function(res) {
        }, function (err) {
            console.error(err);
        });
    }
 
    $scope.selectFromWifiDataUses = function() {
        var query = "SELECT total, upload, download,timestamp FROM WifiDataUses ";
        $cordovaSQLite.execute(db, query, []).then(function(res) {
          if(res.rows.length > 0) {
                console.log(" DATA USES SELECTED -> " + res.rows.item(0).total + " " + res.rows.item(0).upload);
              }
        }, function (err) {
            console.error(err);
        });
    }

    $scope.getList = function(){
      $scope.wifiList = WifiService.list();
      
      if($scope.wifiList.length > 0){

        for(var i=0; i<$scope.wifiList.length; i++){
          var value = $scope.wifiList[i];
          $scope.wifiList[i].isAvailable = false;
          $scope.wifiList[i].isConnected = false;

          $scope.selectFromWifiProfiles(value.bssid,function(res) {
              if(res.rows.length > 0) {
                  var frwifi ={};
                  frwifi.ssid = res.rows.item(0).ssid;
                  frwifi.bssid = res.rows.item(0).bssid;
                  frwifi.isAvailable = true;
                  frwifi.isConnected = true;
                  frwifi.status = 'Connected';
                  $scope.freeWifiList.push(frwifi);
                  $scope.addNewWifiProfile(res.rows.item(0).ssid, res.rows.item(0).password);
              } else {
                  console.log("No results found");
                  return [];
              }
          }, function (err) {
              console.error(err);
          });
        }
    }
  }

    $scope.addNewWifiProfile = function(ssid, password){
      WifiService.addNewWifiProfile(ssid, password);
    }


    $scope.trafficStatus = function(){
      $scope.trafficStatusData = TrafficService.getTrafficUsesStatus();
      $scope.showTrafficStatus = true;

      var timestamp = +new Date;
      $scope.insertIntoWifiDataUses($scope.trafficStatusData.total,$scope.trafficStatusData.upload,$scope.trafficStatusData.download,timestamp);
      $scope.selectFromWifiDataUses();
    }

    $timeout(function () {
      $scope.trafficStatus();
      //$scope.enableWifi();
      $scope.getList();
    }, 5000);

  }]);


app.controller('WifiController', ['$scope', '$timeout', 'WifiService', 'TrafficService', function($scope, $timeout, WifiService, TrafficService){

    $scope.wifiList = [];
    
    $scope.getList = function(){
      $scope.wifiList = WifiService.list();
    }

    $scope.connectWifi = function(name){
      WifiService.connectionToWifi(name);
    }

    $scope.enableWifi = function(){
      WifiService.enableWifi();
    }

    $scope.addNewWifi = function(){
      WifiService.addNewWifi();
    }

    $timeout(function () {
      $scope.wifiList = WifiService.list();
    }, 3000);

  }]);

app.controller('MenuController', ['$scope', '$timeout', 'WifiService', 'TrafficService', function($scope, $timeout, WifiService, TrafficService){
$scope.list = [];

}]);




}());