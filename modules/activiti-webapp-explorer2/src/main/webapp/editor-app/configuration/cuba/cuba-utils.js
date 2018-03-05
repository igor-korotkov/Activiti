CubaStencilUtils = {
    fillMainAndAdvancedProperties: function (selectedItem, stencil) {
        selectedItem.mainProperties = [];
        selectedItem.advancedProperties = [];

        // if no mainPropertiesPackages section defined for the stencil in stencilset.json then all
        // properties should be in main group
        // otherwise fill two collections: mainProperties (defined in mainPropertiesPackages) and
        // advancedProperties (the others)
        if (stencil._mainPropertiesIds === undefined || stencil._mainPropertiesIds.length === 0) {
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
        return getAffectedNodesForSelectedShape();
    }
};

StringUtils = {
    escapeQuotes: function (string) {
        return string.replace(/"/g, '\\"');
    },
    unescapeQuotesToQuotChr: function (string) {
        return string.replace(/"/g, '&quot;');
    },
    unescapeQuotes: function (string) {
        return string.replace(/"/g, '\"');
    },
    replaceLineEndings: function (string) {
        return string.replace(/(?:\r\n|\r|\n)/g, '');
    }
};

function getAffectedNodesForSelectedShape() {
    var angScope = angular.element(document.getElementsByClassName('modal-dialog')).scope();
    var result = [];
    var selectedShapeId = angScope.selectedShape.resourceId;

    var selectedShapeValue = angScope.selectedShape;
    if (selectedShapeValue._stencil._jsonStencil.id.includes("IntegrationNode")) {
        var beforeText = selectedShapeValue.properties['oryx-beforeexecutionscripttext'];
        var beforeJson = parseJson(beforeText);
        if (beforeJson && beforeJson.vars) {
            var nodeVariablesWrapper = {};
            nodeVariablesWrapper.id = 'root';
            nodeVariablesWrapper.vars = beforeJson.vars;
            result.push(nodeVariablesWrapper)
        }
    }

    var jsonModel = angScope.editor.getJSON();
    var childShapes = jsonModel.childShapes;
    var processedShapes = [];
    var queue = [selectedShapeId];
    while (queue.length) {
        var nodeId = queue.shift();
        for (var i = 0; i < childShapes.length; i++) {
            var currentShape = childShapes[i];
            var outgoingShapes = currentShape.outgoing;
            for (var y = 0; y < outgoingShapes.length; y++) {
                if (outgoingShapes[y].resourceId === nodeId) {
                    var alreadyContainVarsFromShape = false;
                    for (var z = 0; z < result.length; z++) {
                        if (result[z].id === currentShape.resourceId) {
                            alreadyContainVarsFromShape = true;
                        }
                    }
                    if (!alreadyContainVarsFromShape) {
                        var shapeNodeVariablesWrapper = {};
                        shapeNodeVariablesWrapper.id = currentShape.resourceId;
                        shapeNodeVariablesWrapper.vars = getVariables(currentShape);
                        result.push(shapeNodeVariablesWrapper);
                        processedShapes.push(currentShape.resourceId);
                    }
                    if (processedShapes.indexOf(nodeId) < 0)
                        queue.push(currentShape.resourceId)
                }
            }
        }
    }
    return result;
}

function getVariables(shape) {
    var vars = [];
    var type = shape.stencil.id;
    switch (type) {
        case 'ScriptTask':
            var text = shape.properties.scripttext;
            var scriptJson = parseJson(text);
            if (scriptJson) {
                vars = scriptJson.vars;
            }
            break;
        case 'IntegrationNode':
            var text = shape.properties.beanselect;
            var beanJson = parseJson(text);

            var afterText = shape.properties.afterexecutionscripttext;
            var afterJson = parseJson(afterText);
            if (afterJson && afterJson.vars) {
                vars = vars.concat(afterJson.vars)
            }

            var beforeText = shape.properties.beforeexecutionscripttext;
            var beforeJson = parseJson(beforeText);
            if (beforeJson && beforeJson.vars) {
                vars = vars.concat(beforeJson.vars)
            }

            var variable = {};
            if (beanJson) {
                variable.name = beanJson.outputName;
                variable.type = beanJson.outputType;
                vars.push(variable)
            }
            break;
    }
    return vars;
}

function parseJson(string) {
    var result;
    try {
        if (string) {
            result = JSON.parse(string);
        }
    } catch (e) {
        console.log('Parsing JSON error (IT IS OK, IF WE GOT NEW ELEMENT IN NODE GRAPH): ' + e.name + ":" + e.message + "\n" + e.stack)
    }
    return result;
}