
angular.module('sessions')


.controller('sessionsCtrl', function($scope, $routeParams, $http, $route, $location, $anchorScroll, $timeout ,$window,$rootScope, appServicem,appMUserService) {
	appMUserService.activeMUser().then(function(user){
    $scope.activeUser = user;
});
		  $scope.visittitles = 'No active visit';
	$scope.pusharray = [];
	$scope.allSessions = [];
	$scope.push = [];
		appServicem.activeVisit($routeParams.id).then(function(avisit){
			console.log(avisit);
	 $scope.activevists = true;
  if(avisit == 'Not active visit'){
    $scope.activevists =false;
    $scope.message == "No active visits available in the database Please contact the Visit Portal Admin"
  };
	

	// $scope.group=$rootScope.user.groups;
	if($rootScope.user.groups.includes("vManager") === true){
		$scope.group = "vManager";
	}
	else if($rootScope.user.groups.includes("admin") === true){
		$scope.group = "admin";
	}
	else if($rootScope.user.groups.includes("exec") === true){
		$scope.group = "exec";
	}else if($rootScope.user.groups.includes("user") === true){
		$scope.group = "user";
	}

	$scope.current = new Date();

	$scope.mix=[];
	$scope.invitee=[];
	$scope.finalData=[[]];
	var refresh = function() {
		$http.get('/api/v1/secure/visits/' + avisit._id + '/sessions',{
		}).success(function(response) {
            
			$scope.scheduleList = response;
			console.log($scope.scheduleList);
			for (var i = 0; i < $scope.scheduleList.length; i++) {
				for (var l = 0; l < $scope.scheduleList[i].sessions.length; l++) {
		
					if ($scope.scheduleList[i].sessions[l]!=undefined && $scope.scheduleList[i].sessions[l].invitees!=undefined) {
						var str= String($scope.scheduleList[i].sessions[l].feedbackElg);
						$scope.feedbackElg = str.split(/[ ,]+/);
						for (var j = 0; j < $scope.scheduleList[i].sessions[l].invitees.length; j++) {
							$scope.invitee.push($scope.scheduleList[i].sessions[l].invitees[j]);
						}
						for (var k = 0; k < $scope.invitee.length; k++) {
							if ($scope.feedbackElg[k]==""|| $scope.feedbackElg[k]== undefined || $scope.feedbackElg[k]== null) {
								$scope.feedbackElg[k]= false;
							}
							$scope.mix.push({
								invite: $scope.invitee[k],
								feedbackElg:$scope.feedbackElg[k]
							})
						}
					}
					for (var m = 0; m < $scope.mix.length; m++) {
						if ($scope.activeUser._id === $scope.mix[m].invite) {
							if ($scope.mix[m].feedbackElg==""|| $scope.mix[m].feedbackElg== undefined || $scope.mix[m].feedbackElg== null) {
								$scope.finalData[[i,l]] =false;
							}
							else
								$scope.finalData[[i,l]] =$scope.mix[m].feedbackElg;
						}
					}
					$scope.mix=[];
					$scope.invitee=[];
					// console.log($scope.finalData)
				}
			}
		});
		$http.get('/api/v1/secure/visits/' + avisit._id ,{
		//cache: true
	}).success(function(response) {
		$scope.visittitle = response;
		$scope.visittitles = $scope.visittitle.client.name + ' Visit to CSC India';
	})

};

refresh();
	DateAddTime = function(dt1, mins){
	var parsedDate = new Date(Date.parse(dt1))
	var newDate = new Date(parsedDate.getTime() + (1000 * mins * 60));
	return newDate;
}
	$scope.calculation = function(rtime) {

		if(rtime < 0 || rtime > 0)
		{
			$scope.isEnable = true;
		}
		else {
			$scope.isEnable = false;
		}
	}




$scope.none = function()
{

	for (var i = 0; i < $scope.scheduleList.length; i++) {
		console.log($scope.scheduleList[i]);
for (var l = 0; l < $scope.scheduleList[i].sessions.length; l++) { 
console.log($scope.scheduleList[i].sessions[l].flag);
$scope.scheduleList[i].sessions[l].flag = "none";
console.log($scope.scheduleList[i].sessions[l].flag);
}}

}

	$scope.submit = function(){


	//for (var m = 0; m < $scope.allSessions.length; m++) {
         var x= $scope.allSessions.length-1;
        
       $scope.allSessions[x].forEach(function(sess){
					sess.currentsession = "updated ";
                       if(sess.status == "cancelled"){
                       	sess.currentsession = "cancelled&updated";
                       }
					})

              console.log($scope.allSessions[x]);
        $http({   
            url: "/api/v1/secure/visits/xyz/updatesessions",   
            dataType: 'json',   
            method: 'GET',
	        params: {
        'allSessions[]' : $scope.allSessions[x]
          }   
         }).success(function (response) {   
            
        
    refresh();


         })   
           .error(function (error) {   
               
           }); 
             

      

         $scope.allSessions = [];
        

  }

 
console.log($scope.scheduleList);
$scope.pushSession = function(sessionId,rtime,sesnstatus,scheduleDate,sessionstarttime,ssnpushtype){


/*$scope.pushobject = {};

$scope.pushobject.id = sessionId;
$scope.pushobject.rtime = rtime;
$scope.pushobject.sesnstatus = sesnstatus;
$scope.pushobject.ssnpushtype = ssnpushtype;
$scope.pusharray.push($scope.pushobject)*/

console.log($scope.scheduleList);
console.log(scheduleDate);

	for (var i = 0; i < $scope.scheduleList.length; i++) {
		console.log($scope.scheduleList[i].date);
		if($scope.scheduleList[i].date === scheduleDate){
               console.log($scope.scheduleList[i].sessions);
				for (var l = 0; l < $scope.scheduleList[i].sessions.length; l++) {
			      
                   if(ssnpushtype === "push"){
				     if($scope.scheduleList[i].sessions[l]._id == sessionId){
						$scope.scheduleList[i].sessions[l].currentsession = "changed";
					
			/*
				angular.element('#changedsession').addClass('changed');*/
				    }
				   
				     if($scope.scheduleList[i].sessions[l].session.startTime >= sessionstarttime){
					if($scope.scheduleList[i].sessions[l].status == "cancelled"){
				       $scope.scheduleList[i].sessions[l].flag = "none";
				    $scope.scheduleList[i].sessions[l].session.startTime = $scope.scheduleList[i].sessions[l].session.startTime;
					$scope.scheduleList[i].sessions[l].session.endTime =  $scope.scheduleList[i].sessions[l].session.endTime;		
				    }
                    else{
                     $scope.scheduleList[i].sessions[l].flag = "updated";
					$scope.scheduleList[i].sessions[l].session.startTime =  DateAddTime($scope.scheduleList[i].sessions[l].session.startTime, rtime);
					$scope.scheduleList[i].sessions[l].session.endTime =  DateAddTime($scope.scheduleList[i].sessions[l].session.endTime, rtime);	
					}
					}
			

				}
                 if(ssnpushtype === "duration"){
				     if($scope.scheduleList[i].sessions[l]._id == sessionId){
						$scope.scheduleList[i].sessions[l].currentsession = "changed";
					
			/*
				angular.element('#changedsession').addClass('changed');*/
				    }
                     

				    	if($scope.scheduleList[i].sessions[l].session.startTime === sessionstarttime){
				    		    $scope.scheduleList[i].sessions[l].flag = "updated";
					$scope.scheduleList[i].sessions[l].session.startTime = $scope.scheduleList[i].sessions[l].session.startTime;
					$scope.scheduleList[i].sessions[l].session.endTime =  DateAddTime($scope.scheduleList[i].sessions[l].session.endTime, rtime);	
					}
						if($scope.scheduleList[i].sessions[l].session.startTime > sessionstarttime){
					if($scope.scheduleList[i].sessions[l].status == "cancelled"){
				    $scope.scheduleList[i].sessions[l].flag = "none";
				    $scope.scheduleList[i].sessions[l].session.startTime = $scope.scheduleList[i].sessions[l].session.startTime;
					$scope.scheduleList[i].sessions[l].session.endTime =  $scope.scheduleList[i].sessions[l].session.endTime;		
				    }
				    else{
	                    $scope.scheduleList[i].sessions[l].flag = "updated";
					$scope.scheduleList[i].sessions[l].session.startTime =  DateAddTime($scope.scheduleList[i].sessions[l].session.startTime, rtime);
					$scope.scheduleList[i].sessions[l].session.endTime =  DateAddTime($scope.scheduleList[i].sessions[l].session.endTime, rtime);	
					}}
				

				}
				if(ssnpushtype === 'cancel'){
					    if($scope.scheduleList[i].sessions[l]._id == sessionId){
						$scope.scheduleList[i].sessions[l].currentsession = "cancelled";
						$scope.scheduleList[i].sessions[l].status = "cancelled";
					
					    $scope.st = moment($scope.scheduleList[i].sessions[l].session.startTime);
						$scope.et = moment($scope.scheduleList[i].sessions[l].session.endTime);

						var difference = moment.duration($scope.st.diff($scope.et));
						var diffInMin = difference.asMinutes();
		
	                     
				    }
				        if($scope.scheduleList[i].sessions[l].session.startTime === sessionstarttime){
				
                        $scope.scheduleList[i].sessions[l].flag = "cancelled";	 
					 $scope.scheduleList[i].sessions[l].session.startTime = $scope.scheduleList[i].sessions[l].session.startTime;
					$scope.scheduleList[i].sessions[l].session.endTime =  $scope.scheduleList[i].sessions[l].session.endTime;
					}

                     if($scope.scheduleList[i].sessions[l].session.startTime > sessionstarttime){
					if($scope.scheduleList[i].sessions[l].status == "cancelled"){
						  $scope.scheduleList[i].sessions[l].flag = "none";	
				    $scope.scheduleList[i].sessions[l].session.startTime = $scope.scheduleList[i].sessions[l].session.startTime;
					$scope.scheduleList[i].sessions[l].session.endTime =  $scope.scheduleList[i].sessions[l].session.endTime;		
				    }
                    else{
                        $scope.scheduleList[i].sessions[l].flag = "updated";	 
					$scope.scheduleList[i].sessions[l].session.startTime =  DateAddTime($scope.scheduleList[i].sessions[l].session.startTime, diffInMin);
					$scope.scheduleList[i].sessions[l].session.endTime =  DateAddTime($scope.scheduleList[i].sessions[l].session.endTime, diffInMin);	
					}
					}

				}

			}
			console.log($scope.scheduleList[i].sessions);
			       $scope.allSessions.push($scope.scheduleList[i].sessions);
			/*for (var m = 0; m < $scope.scheduleList[i].sessions.length; m++) {
                $scope.allsessions.push($scope.scheduleList[i].sessions[m]); 
			}*/
            console.log($scope.allSessions);
		  }
		 }


       console.log($scope.scheduleList);


	


	}

/*
	$scope.drop = function(sessionId){
		$http.get('/api/v1/secure/visitSchedules/'+ sessionId).success(function(response)
		{
			$scope.response = response;
			$scope.response.status = "cancelled";

			$scope.st = moment($scope.response.session.startTime);
			$scope.et = moment($scope.response.session.endTime);

			var difference = moment.duration($scope.st.diff($scope.et));
			var diffInMin = difference.asMinutes();

			$scope.pushSession(sessionId,diffInMin,$scope.response.status);

			$http.put('/api/v1/secure/visitSchedules/' + sessionId,  $scope.response).success(function(response) {

				if ($scope.response.status === "cancelled"){
					angular.element('#cancel-session').addClass('agenda-cancel-session');
				}	
				refresh();
			});


		});
	}*/


	$scope.getClass = function (strValue) {
		if (strValue == ("cancelled&updated"))
			return "agenda-block-sub-div-cancel";
		else{
			return "agenda-block-sub-div";}
		}

		$scope.getdiv = function (strValue) {
			if (strValue == ("cancelled&updated"))
				return "feed";
			else{
				return "feedback-link";}
			}

  $scope.vmtab = $location.search()["day"];
  if($scope.vmtab === undefined)
  {
  	$scope.selectedIndex = 0;

  	$scope.itemClicked = function ($index) {
  		$scope.selectedIndex = $index;
  	}
  }
  else{
  	$scope.selectedIndex = $scope.vmtab-1;

  	$scope.itemClicked = function ($index) {
  		$scope.selectedIndex = $index;
  	}
  }




  $scope.setTab = function(){
  	if($location.search()["day"] === undefined)
  		return 1;
  	else
  		return $location.search()["day"]-0;
  }

		$scope.hideFeeedbackDiv = true;
		$scope.toggleFeedbackDialog = function(index, $event){
			$scope.hideFeeedbackDiv = !$scope.hideFeeedbackDiv;
			$event.stopPropagation();
		};

		$scope.giveFeedback = function(fTmpl,sId,vId)
		{
			var path = "/sessionFeedback/" + (fTmpl || "") + "/" + (sId || "") + "/" + (vId || "");
			$window.location.reload();
			$location.path(path);
		}
		})
	})
	


.controller('sessionCtrl', function($scope, $routeParams, $http, $rootScope,$interval,$window,toaster,$timeout,appMUserService) {
	appMUserService.activeMUser().then(function(user){

    $scope.activeUser = user;
    console.log($scope.activeUser);
	$scope.arrayData=[];
	$scope.comment = [];
	$scope.comment11 = [];
	$scope.myData = [];
	// $scope.groupBelong = user.groups;
	if(user.groups.includes("vManager") === true){
		$scope.groupBelong = "vManager";
	}
	else if(user.groups.includes("admin") === true){
		$scope.groupBelong = "admin";
	}
	else if(user.groups.includes("exec") === true){
		$scope.groupBelong = "exec";
	}else if(user.groups.includes("user") === true){
		$scope.groupBelong = "user";
	}

	$scope.refresh1 = function()
	{ 
    $scope.myData = [];
    $http.get('/api/v1/secure/visitSchedules/'+$routeParams.id).success(function(response)
    {
      $scope.comment = response.comments;
      for(var i=0;i<$scope.comment.length;i++)
      {
      	$scope.myData.push($scope.comment[i]._id);
      }
  });
}

var refresh2 = function()
{ 
	$http.get('/api/v1/secure/visitSchedules/'+$routeParams.id).success(function(response)
	{
		$scope.comment = response.comments;
	});
}

	$http.get('/api/v1/secure/visitSchedules/' + $routeParams.id,{
		cache: true
	}).success(function(response) {
		$scope.session = response;
		$scope.owner= $scope.session.session.owner;
		$scope.supporter =$scope.session.session.supporter;
		if($scope.owner!=null)
		{
		$scope.arrayData.push($scope.owner);
		}
	});

	$scope.collapseDiv = function(index, text) {
		var ele = angular.element(document.getElementById(text + index));
		ele.toggle();
		var status = window.getComputedStyle(ele[0], null).getPropertyValue("display");
		if (status === "block") {
			ele.prev().addClass('chevron-down-arrow');
			ele.addClass('active');
		} else if (status === "none") {
			ele.prev().removeClass('chevron-down-arrow');
			ele.removeClass('active');
		}
	};


	$scope.hideFeeedbackDiv = true;
	$scope.toggleFeedbackDialog = function(index, $event){
		$scope.hideFeeedbackDiv = !$scope.hideFeeedbackDiv;
		$event.stopPropagation();
	};


$scope.btn_add = function(comment1) {

	$scope.myData = [];
	$scope.comment = [];
	$http.get('/api/v1/secure/visitSchedules/'+$routeParams.id).success(function(response)
	{
		$scope.comment = response.comments;

      for(var i=0;i<$scope.comment.length;i++)
      {
      	$scope.myData.push($scope.comment[i]._id);
      }
  }).then(function() {	
  if(comment1 !=''){
    $scope.comment11.push({
      comment: comment1,
      givenBy: $rootScope.user._id
    });

    $http.post('/api/v1/secure/comments/',$scope.comment11).success(function(response) {
      $scope.commentid = response._id;
      $scope.myData.push($scope.commentid);
    });

    $http.get('/api/v1/secure/visitSchedules/' + $routeParams.id).success(function(response)
    {
      $scope.visitSchedule = response;
      var inData = $scope.visitSchedule;
      inData.comments = $scope.myData;
      $scope.commentsData = [];
      $http.put('/api/v1/secure/visitSchedules/'+$routeParams.id,inData).success(function(response) {

        $http.get('/api/v1/secure/visitSchedules/'+$routeParams.id).success(function(response)
        {
          $scope.comment = response.comments;
          $scope.oneData = [];
          for(var i=0;i<$scope.comment.length;i++)
          {
            $scope.oneData.push($scope.comment[i]._id);
            $scope.commentsData = $scope.oneData;
          }
        }).then(function() {
          toaster.pop({body:"Note received."});
        });

      });

    })

$scope.txtcomment = "";
$scope.comment11 = [];
}
});
}

$scope.deleteComment = function(index){
	$scope.commentData = [];
	$scope.myData = [];
	$scope.comment.splice(index, 1);

	for(var i=0;i<$scope.comment.length;i++)
	{	
		$scope.commentData.push($scope.comment[i]._id);
		$scope.myData.push($scope.comment[i]._id);
	}

	$http.get('/api/v1/secure/visitSchedules/' + $routeParams.id).success(function(response)
	{	
		var inData = response;
		inData.comments = $scope.commentData;
		$http.put('/api/v1/secure/visitSchedules/'+$routeParams.id,inData).success(function(response) {
		});
	});
};

});
})

.controller('sessionFeedbackCtrl',function($scope, $routeParams, $http, $location, $timeout) {
	$scope.fbackTemp = $routeParams.fTmpl;
	$scope.sessionId = $routeParams.sId;
	$scope.visitId = $routeParams.vId;
	$scope.feedbackId = $routeParams.fId;
	$http.get('/api/v1/secure/visitSchedules/' + $scope.sessionId,{
		cache: true
	}).success(function(response){
		$scope.sessionTitle = response.session.title;
	});
})

.controller('sessionsNotesCtrl', function($scope, $routeParams, $http, $route, $location, $anchorScroll, $timeout ,$window,$rootScope, appServicem) {
	appServicem.activeVisit($routeParams.id).then(function(avisit){
		$scope.activevists = true;
		if(avisit == 'Not active visit'){
			$scope.activevists =false;
			$scope.message == "No active visits available in the database Please contact the Visit Portal Admin"
		};

		var refresh = function() {
			$http.get('/api/v1/secure/visits/' + avisit._id + '/getallsessions',{
			}).success(function(response) {
				$scope.scheduleList = response;
			});
			$http.get('/api/v1/secure/visits/' + avisit._id ,{
		//cache: true
	}).success(function(response) {
		$scope.visittitle = response;
		$scope.visittitles = $scope.visittitle.client.name;
	})
};

refresh();
});
})