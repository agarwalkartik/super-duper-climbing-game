angular.module('starter.controllers', [])
  .controller('DashCtrl', function($scope, $rootScope, Connection, $ionicSlideBoxDelegate, $ionicLoading, $timeout, $ionicPlatform, $state) {
    $scope.connection = Connection;
    $scope.peerId;
    $scope.localStorageObject = localStorage
    $scope.usernames = [
      'nigeriancomputer',
      'panamanianspecific',
      'braziliangeocaching',
      'andorrantree',
      'turkishblessing',
      'egyptiansunglasses',
      'slovenianpristine',
      'tanzaniantherapy',
      'armenianpiano',
      'hungarianwrite',
      'ethiopianhoney',
      'canadianigloo',
      'congolesefosset',
      'iranianpattack',
      'chileanpreacher',
      'latvianbumble'
    ];
    $scope.users = [];
    $scope.dissableSwipe = function() {
      $ionicSlideBoxDelegate.enableSlide(false);
    };
    $scope.randomizeUsername = function(currentUsername) {
      $scope.username = $scope.usernames[Math.floor((Math.random() * $scope.usernames.length))];
    };
    $scope.randomizeUsername();
    $scope.submitUsername = function() {
      $ionicLoading.show({
        hideOnStateChange: true
      });
      firebase.database().ref('users/' + $rootScope.uuid).set({
        peerId: $rootScope.peerId,
        username: $scope.username,
        deviceId: $rootScope.uuid,
      }).then(function() {
        localStorage.username = $scope.username;
        $state.go('dashboard.connection');
        Connection.setStatus('available');
      });
    };
    var userDataRef = firebase.database().ref('users/');
    $ionicLoading.show();
    userDataRef.on('value', function(snapshot) {
      $scope.users = snapshot.val();
      $timeout(function() {
        $ionicLoading.hide();
        $scope.$apply();
      });
    });
    $scope.invite = function(user) {
      console.log("Invite")
      Connection.setStatus('busy')
      $ionicLoading.show();
      Connection.connectToPeer(user)
    };
  });