angular.module('WifiServices', [])
	.factory('WifiService', function(){
		var unique_array = angular.fromJson('[]');

		function win_wifi(e){
	    //alert("Success"+e);
		}

		function fail_wifi(e){
	    alert("Error");
		}

		function connectWifi(wifi_ssid){
		  WifiWizard.connectNetwork(wifi_ssid, win_wifi, fail_wifi);
		}

    function enableWifi(){
      WifiWizard.setWifiEnabled(true, win_wifi, fail_wifi);
    }

    function addNewWifi(){
      var config = WifiWizard.formatWPAConfig("Saksham", "BANO12345");
      WifiWizard.addNetwork(config, function() {
        WifiWizard.connectNetwork("Saksham");
      });
    }

    function addNewWifiProfile(ssid,password){
      var config = WifiWizard.formatWPAConfig(ssid, password);
      WifiWizard.addNetwork(config, function() {
        connectWifi(ssid);
      });
    }

		function listHandler(a){

      var network_array = [];
      for(var i=0; i<a.length; i++){
        var wfObj = {};
        wfObj.ssid = a[i].SSID;
        wfObj.bssid = a[i].BSSID;
        network_array.push(wfObj);
      }

      unique_array = network_array;

      // unique_array = network_array.filter(function(elem, pos) {
      //   return network_array.indexOf(elem) == pos;
      // });

    }

    function getScanResult(){
      WifiWizard.getScanResults(listHandler, failNetwork);
    }

    function successNetwork(e){
      window.setTimeout(function(){
        getScanResult();
      }, 3000);
    }

    function failNetwork(e){
      alert("Network Failure: " + e);
    }

    function scanNetwork(){
      WifiWizard.startScan(successNetwork, failNetwork);
    }

    window.setTimeout(function(){
      scanNetwork();
    }, 1000);

		return {
		  list: function(){
        scanNetwork();
		    return unique_array;
		  },
		  connectionToWifi: function(name){
		  	connectWifi(name);
		  },
      enableWifi: function(){
        enableWifi();
      },
      addNewWifi: function(){
        addNewWifi();
      },
      addNewWifiProfile: function(ssid, password){
        addNewWifiProfile(ssid, password);
      }

		};
	});
