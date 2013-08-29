'use strict';

var app = angular.module('iicms', []);

app.controller('feCntrl', function ($scope, $http) {
});

app.controller('iicmsCntrl', function ($scope, $http) {
  $scope.activeEditor = null;

  var lastPost = {
    then: function (f) {
      return f.apply();
    }
  };

  $scope.showEditor = function (editor) {
    if ($scope.activeEditor) {
      $scope.activeEditor.hide();
    }
    $scope.activeEditor = editor;
    editor.show();
    editor.find('textarea').focus();
  };

  $scope.saveFragment = function (fragment) {
    lastPost = lastPost.then(function () {
      return $http.post('/cms', JSON.stringify(fragment), {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    });
  };
});

app.directive('iicmsfragment', ['$compile',
  function ($compile) {
    return {
      restrict: 'E',
      scope: true,
      link: function (scope, elm, attrs) {

        var origContent = elm.html();
        scope.content = origContent;
        scope.fragmentPath = attrs.path;

        var edit = angular.element('<div class="cms-edit"><span>edit</span></div>');
        var editor = $compile(angular.element(' \
              <div class="cms-editor"> \
                <a href="#" class="close">close</a> \
                <h4>Fragment Editor</h4> \
                <h5>{{fragmentPath}}</h5> \
                <textarea type=text ng-model="content"></textarea> \
              </div> \
              '))(scope);

        angular.element('body').append(editor);

        elm.after(edit);

        editor.keyup(function (e) {
          if (e.keyCode === 27) {
            editor.hide();
          }
        });

        editor.find('.close').bind('click', function (e) {
          e.preventDefault();
          editor.hide();
        });

        edit.find('span').bind('click', function () {
          scope.showEditor(editor);
        });

        elm.after($compile(angular.element('<span ng-bind-html-unsafe="content" />'))(scope));
        elm.remove();

        scope.$watch('content', function (newVal, oldVal) {
          if (newVal !== oldVal) {
            var sanitizedFragment =
              angular.element.parseHTML(newVal).map(function (el) {
                return el.outerHTML || el.textContent;
              }).join('');
            scope.saveFragment({
              fragment: attrs.path,
              content: sanitizedFragment
            });
          }
        });

      }
    };
  }
]);
