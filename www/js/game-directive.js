    angular
      .module('starter.directives',[])
      .directive('gameCanvas', gameCanvas)

    function gameCanvas($injector, $state, $timeout, $ionicLoading, Connection) {
      var gameCanvas = {
        restrict: 'A',
        templateUrl: 'templates/game-directive.html',
        // scope: {
        //   lessons : '=mapLessons',
        //   totalstars : '=mapTotalstars',
        //   demo : '=mapDemo',
        //   mediaSyncStatus : '=mediaSync',
        // },
        link: linkFunc,
      };
      return gameCanvas;

      function linkFunc(scope, el, attr, ctrl) {
        console.log("Link function");
        $timeout(
          function() {
            createGame(Connection)
          }
        );
      }
    }