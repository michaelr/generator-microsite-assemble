var app = angular.module("iicms", [] );

app.controller("iicmsCntrl", function($scope, $http, $q) {
    $scope.activeEditor = null;

    var lastPost = { then: function(f) { return f.apply(); } };

    $scope.showEditor = function(editor) {
        if($scope.activeEditor){
            $scope.activeEditor.hide();
        }
        $scope.activeEditor = editor;
        editor.show();
        editor.find('textarea').focus();
    };

    $scope.saveFragment = function(fragment) {
        lastPost = lastPost.then(function() {
            return $http.post('/cms', JSON.stringify(fragment), { headers: { 'Content-Type': 'application/json' }});
        });
    };
});

app.directive("iicmsfragment", ['$compile', function ($compile) {
    return {
        restrict: "E",
        scope: true,
        link: function(scope, elm, attrs) {

            var origContent = elm.html();
            scope.content = origContent;

            var edit = angular.element("<div class='cms-edit'><span>edit</span></div>");
            var editor = $compile(angular.element("<div class='cms-editor'><h4>Fragment Editor</h4><textarea type=text ng-model='content'></textarea></div>"))(scope);

            angular.element('body').append(editor);

            elm.after(edit);

            editor.keyup(function(e){
                if(e.keyCode === 27)
                    editor.hide();
            });

            edit.find('span').bind("click", function() {
              scope.showEditor(editor);
            });

            elm.after($compile(angular.element("<span ng-bind-html-unsafe='content' />"))(scope));
            elm.remove();

            scope.$watch('content', function(newVal, oldVal) {
              if( newVal !== oldVal ) {
                scope.saveFragment({
                    fragment: attrs.path,
                    content: newVal
                });
              }
            });

        }
    };
}]);
