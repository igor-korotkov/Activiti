var KisBpmTaskOutcomesCtrl = [ '$scope', '$modal', '$timeout', '$translate', function($scope, $modal) {

    // Config for the modal window
    var opts = {
        template:  'editor-app/configuration/properties/cuba/task-outcomes-popup.html?version=' + Date.now(),
        scope: $scope
    };

    // Open the dialog
    $modal(opts);
}];

var KisBpmTaskOutcomesPopupCtrl = ['$scope', '$q', '$translate', function($scope, $q, $translate) {

    // Put json representing task outcomes on scope
    if ($scope.property.value !== undefined && $scope.property.value !== null && $scope.property.value.length > 0) {

        if ($scope.property.value.constructor == String) {
            $scope.taskOutcomes = JSON.parse($scope.property.value);
        } else {
            // Note that we clone the json object rather then setting it directly,
            // this to cope with the fact that the user can click the cancel button and no changes should have happended
            $scope.taskOutcomes = angular.copy($scope.property.value);
        }
    } else {
        $scope.taskOutcomes = [];
    }

    // Array to contain selected properties (yes - we only can select one, but ng-grid isn't smart enough)
    $scope.selectedOutcomes = [];
    $scope.selectedFormParams = [];

    $scope.translationsRetrieved = false;

    $scope.labels = {};

    var codePromise = $translate('PROPERTY.TASKOUTCOMES.CODE');
    var namePromise = $translate('PROPERTY.TASKOUTCOMES.NAME');

    //todo gorbunkov localization
    //$q.all([codePromise, namePromise]).then(function(results) {
    //	$scope.labels.codeLabel = results[0];
    //    $scope.labels.nameLabel = results[1];
    //    $scope.translationsRetrieved = true;
    //
    //	// Config for grid
    //    $scope.gridOptions = {
    //        data: 'procRoles',
    //        enableRowReordering: true,
    //        headerRowHeight: 28,
    //        multiSelect: false,
    //        keepLastSelected : false,
    //        selectedItems: $scope.selectedOutcomes,
    //        columnDefs: [{ field: 'code', displayName: $scope.labels.codeLabel },
    //            { field: 'name', displayName: $scope.labels.nameLabel}]
    //    };
    //}).catch(function(result) {
    //    console.print('Error');
    //});

    $scope.translationsRetrieved = true;
    $scope.gridOptions = {
        data: 'taskOutcomes',
        enableRowReordering: true,
        headerRowHeight: 28,
        multiSelect: false,
        keepLastSelected: false,
        selectedItems: $scope.selectedOutcomes,
        columnDefs: [{field: 'name', displayName: 'Name'}, {field: 'form.name', displayName: 'Form'}]
    }

    $scope.propertiesGridOptions = {
        data: 'selectedOutcomes[0].form.params',
        enableRowReordering: true,
        headerRowHeight: 28,
        multiSelect: false,
        keepLastSelected: false,
        selectedItems: $scope.selectedFormParams,
        columnDefs: [{field: 'name', displayName: 'Name'}, {field: 'value', displayName: 'Value'}]
    }

        // Click handler for add button
    var propertyIndex = 1;
    var defaultFormName = 'standardProcForm';
    $scope.addNewOutcome = function() {
        $scope.taskOutcomes.push({
            name : '',
            form: {name: defaultFormName, params: []}});
    };

    // Click handler for remove button
    $scope.removeOutcome = function() {
        if ($scope.selectedOutcomes.length > 0) {
            var index = $scope.taskOutcomes.indexOf($scope.selectedOutcomes[0]);
            $scope.gridOptions.selectItem(index, false);
            $scope.taskOutcomes.splice(index, 1);

            $scope.selectedOutcomes.length = 0;
            if (index < $scope.taskOutcomes.length) {
                $scope.gridOptions.selectItem(index + 1, true);
            } else if ($scope.taskOutcomes.length > 0) {
                $scope.gridOptions.selectItem(index - 1, true);
            }
        }
    };

    $scope.addNewFormProperty = function() {
        $scope.selectedOutcomes[0].form.params.push({ name : '', value: ''});
    };

    // Click handler for remove button
    $scope.removeFormProperty = function() {
        if ($scope.selectedFormParams.length > 0) {
            var index = $scope.selectedOutcomes[0].form.params.indexOf($scope.selectedFormParams[0]);
            $scope.propertiesGridOptions.selectItem(index, false);
            $scope.selectedOutcomes[0].form.params.splice(index, 1);

            $scope.selectedFormParams.length = 0;
            //if (index < $scope.taskOutcomes.length) {
            //    $scope.gridOptions.selectItem(index + 1, true);
            //} else if ($scope.taskOutcomes.length > 0) {
            //    $scope.gridOptions.selectItem(index - 1, true);
            //}
        }
    };

    //// Click handler for up button
    //$scope.movePropertyUp = function() {
    //    if ($scope.selectedOutcomes.length > 0) {
    //        var index = $scope.formProperties.indexOf($scope.selectedOutcomes[0]);
    //        if (index != 0) { // If it's the first, no moving up of course
    //            // Reason for funny way of swapping, see https://github.com/angular-ui/ng-grid/issues/272
    //            var temp = $scope.formProperties[index];
    //            $scope.formProperties.splice(index, 1);
    //            $timeout(function(){
    //                $scope.formProperties.splice(index + -1, 0, temp);
    //            }, 100);
    //
    //        }
    //    }
    //};
    //
    //// Click handler for down button
    //$scope.movePropertyDown = function() {
    //    if ($scope.selectedOutcomes.length > 0) {
    //        var index = $scope.formProperties.indexOf($scope.selectedOutcomes[0]);
    //        if (index != $scope.formProperties.length - 1) { // If it's the last element, no moving down of course
    //            // Reason for funny way of swapping, see https://github.com/angular-ui/ng-grid/issues/272
    //            var temp = $scope.formProperties[index];
    //            $scope.formProperties.splice(index, 1);
    //            $timeout(function(){
    //                $scope.formProperties.splice(index + 1, 0, temp);
    //            }, 100);
    //
    //        }
    //    }
    //};

    // Click handler for save button
    $scope.save = function() {

        if ($scope.taskOutcomes.length > 0) {
            $scope.property.value = {};
            $scope.property.value = $scope.taskOutcomes;
        } else {
            $scope.property.value = null;
        }

        $scope.updatePropertyInModel($scope.property);
        $scope.close();
    };

    $scope.cancel = function() {
    	$scope.$hide();
    	$scope.property.mode = 'read';
    };

    // Close button handler
    $scope.close = function() {
    	$scope.$hide();
    	$scope.property.mode = 'read';
    };

}];