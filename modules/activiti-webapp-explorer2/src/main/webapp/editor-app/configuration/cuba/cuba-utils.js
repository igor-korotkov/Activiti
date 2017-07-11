var childShapes;

var angScope;

CubaStencilUtils = {
    fillMainAndAdvancedProperties: function (selectedItem, stencil) {
        selectedItem.mainProperties = [];
        selectedItem.advancedProperties = [];

        // if no mainPropertiesPackages section defined for the stencil in stencilset.json then all
        // properties should be in main group
        // otherwise fill two collections: mainProperties (defined in mainPropertiesPackages) and
        // advancedProperties (the others)
        if (stencil._mainPropertiesIds == undefined || stencil._mainPropertiesIds.length == 0) {
            selectedItem.mainProperties = selectedItem.properties;
        } else {
            selectedItem.properties.each(function (prop) {
                if (stencil._mainPropertiesIds.indexOf(prop.key) > -1) {
                    selectedItem.mainProperties.push(prop);
                } else {
                    selectedItem.advancedProperties.push(prop);
                }
            });
            selectedItem.properties = selectedItem.mainProperties.concat(selectedItem.advancedProperties);
        }
    },
    getAvailableVariablesForSelectedShape: function () {
        angScope = angular.element(document.getElementsByClassName('modal-dialog')).scope();
        return getAffectedNodesForSelectedShape();
    }
}

function getAffectedNodesForSelectedShape() {
    var result = [];
    var selectedShapeId = angScope.selectedShape.resourceId
    var jsonModel = angScope.editor.getJSON();
    childShapes = jsonModel.childShapes
    var queue = [selectedShapeId];
    while (queue.length) {
        var nodeId = queue.shift()
        for (var i = 0; i < childShapes.length; i++) {
            var currentShape = childShapes[i];
            var outgoingShapes = currentShape.outgoing
            for (var y = 0; y < outgoingShapes.length; y++) {
                if (outgoingShapes[y].resourceId == nodeId) {
                    if (!result.includes(currentShape.resourceId)) {
                        var nodeVariblesWrapper = {}
                        nodeVariblesWrapper.id = currentShape.resourceId
                        nodeVariblesWrapper.vars = getVariables(currentShape)
                        result.push(nodeVariblesWrapper)
                    }
                    queue.push(currentShape.resourceId)
                }
            }
        }
    }
    return result;
}

function getVariables(shape) {
    var vars = [];
    var type = shape.stencil.id
    switch (type) {
        case 'ScriptTask':
            var text = shape.properties.scripttext;
            var scriptJson = JSON.parse(text);
            vars = scriptJson.vars;
            break;
        case 'IntegrationNode':
            var text = shape.properties.beanselect;
            var beanJson = JSON.parse(text);
            var variable = {}
            variable.name = beanJson.outputName
            variable.type = beanJson.outputType
            vars.push(variable)
            break;
    }
    return vars;
}