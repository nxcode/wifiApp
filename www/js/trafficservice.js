angular.module('TrafficServices', [])
	.factory('TrafficService', function(){

    var traffic_status = {};//angular.fromJson('[]');

		function successCallback(e){
	    alert("Success");
      alert(JSON.stringify(e));
		}

		function failureCallback(e){
	    alert("Failled to get traffic status..");
		}

		function getTrafficStatus(){
      //alert("Traffic..");
		  Traffic.showStats(beautifyTrafficStatus, failureCallback);
		}

    function beautifyTrafficStatus(a){
      var total = 0;
      var download = 0;
      var upload = 0;

      for(var i=0; i<a.length; i++){
        upload = upload + a[i].send;
        download = download + a[i].received;
        total = total + a[i].total;
      }

      traffic_status.total = total;
      traffic_status.download = download;
      traffic_status.upload =  upload;

    }

		return {

		  getTrafficUsesStatus: function(){
		  	getTrafficStatus();
        return traffic_status;
		  }

		};
	});
