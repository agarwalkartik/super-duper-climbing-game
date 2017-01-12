angular.module('starter.services', [])
  .factory('Connection', function($rootScope, $ionicLoading, $http, $q, $ionicPlatform, $ionicPopup, $state, $timeout) {
    var methods = {
      initialiseNewConnection: initialiseNewConnection,
      connectToPeer: connectToPeer,
      sendMessage: sendMessage,
      saveUserOnFirebase: saveUserOnFirebase,
      newServerConnection: newServerConnection,
      endGame: endGame,
      setStatus: setStatus,
      getStatus: getStatus
    };
    var connection;
    var peer;
    console.log("Making a peer object", $rootScope.uuid)

    function newServerConnection(argument) {
      var def = $q.defer();
      peer = new Peer({
        key: 'lwjd5qra8257b9'
      });
      peer.on('open', function(id) {
        $rootScope.peerId = id;
        console.log('My peer ID is: ' + $rootScope.peerId);
        def.resolve();
      });
      peer.on('error', function(error) {
        $ionicLoading.hide();
        console.log("initialiseNewConnection error", error.type);
        $ionicPopup.alert({
          title: 'Could not connect',
          template: error.type
        })
        def.reject(error);
      })
      peer.on('connection', function(conn) {
        connectionRequest(conn);
      });
      return def.promise;
    }

    function initialiseNewConnection(username) {}

    function connectToPeer(user) {
      var conn = peer.connect(user.peerId);
      connectionMadeSuccess(conn);
    }

    function connectionRequest(conn) {
      console.log("connection", conn);
      connectionMadeSuccess(conn);
      // connection = conn;
      if (getStatus() === 'busy') {
        sendMessage('invitationResponse', "busy");
      } else {
        setStatus('busy')
        var mypopup = $ionicPopup.confirm({
          title: 'New Invite',
          template: 'Accept the invite'
        })
        autoCancelTimeout = $timeout(function() {
          mypopup.close();
        }, 5000)
        mypopup.then(function(res) {
          $timeout.cancel(autoCancelTimeout);
          if (res) {
            sendMessage('invitationResponse', "accept");
            $state.go('dashboard.game');
            console.log("Connection established");
          } else {
            setStatus('available');
            sendMessage('invitationResponse', "decline");
            console.log("You refused 1");
          }
        })
      }
    }

    function connectionMadeSuccess(conn) {
      connection = conn;
      connection.on('open', function() {
        // Receive messages
        console.log("Connection done");
        connection.on('data', function(message) {
          console.log('Received', message);
          if (message.type == 'invitationResponse') {
            if (message.message == 'accept') {
              console.log("Peer accepted the invite");
              $state.go('dashboard.game');
            } else {
              $ionicLoading.hide();
              $ionicPopup.alert({
                title: 'Refused',
                template: 'Client refused to connect'
              }).then(function(){
              setStatus('available')
              })
            }
          } else if (message.type == 'endGame') {
            endGame();
          }
        });
      });
    }

    function sendMessage(type, message) {
      if (connection) {
        console.log("sendMessage", connection, type, message);
        connection.send({
          type: type,
          message: message
        });
      }
    }

    function setStatus(status) {
      localStorage.status = status;
      console.log("setstatus", status, $rootScope.uuid)
      firebase.database().ref('users/' + $rootScope.uuid + '/status').set(status);
    }

    function getStatus() {
      return localStorage.status;
    }

    function saveUserOnFirebase() {
      return firebase.database().ref('users/' + $rootScope.uuid).set({
        peerId: $rootScope.peerId,
        deviceId: $rootScope.uuid,
        username: localStorage.username,
        status: getStatus()
      });
    }

    function endGame() {
      window.destroyGame();
      sendMessage('endGame', 'endGame')
      setStatus('available')
      $state.go('dashboard.connection');
    }
    return methods;
  });