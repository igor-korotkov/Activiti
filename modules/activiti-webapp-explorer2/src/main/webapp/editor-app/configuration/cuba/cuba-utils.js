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

        getBoundedList()


    }
}
var result = new Tree();

var childShapes;

function getBoundedList() {

    var jsonModel = angular.element(document.getElementsByClassName('ng-scope')).scope().editor.getJSON();
    childShapes = jsonModel.childShapes;

    for (var i = 0; i < childShapes.length; i++) {
        if (childShapes[i].stencil.id == 'StartNoneEvent') {
            addTreeNode(childShapes[i])

            console.log('found start none event node')
        }
    }
    console.log(result)
}

function addTreeNode(data, toNodeData) {
    result.add(data.resourceId, toNodeData)
    for (var i = 0; i < data.outgoing.length; i++) {
        addTreeNode(getShapeById(data.outgoing[i].resourceId), data.resourceId)
    }
}

function getShapeById(id) {

    for (var i = 0; i < childShapes.length; i++) {
        if (childShapes[i].resourceId == id) {
            return childShapes[i];
        }
    }
    return null;
}

function Node(data) {
    this.data = data;
    this.children = [];
    this.parent = [];
}

function Tree() {
    this.root = null;
}

Tree.prototype.add = function (data, toNodeData) {
    var node = new Node(data);
    var parent = toNodeData ? this.findBFS(toNodeData) : null;
    if (parent) {
        parent.children.push(node);
        node.parent.push(parent);
    } else {
        if (!this.root) {
            this.root = node;
        } else {
            return 'Root node is already assigned';
        }
    }
};

Tree.prototype.findBFS = function (data) {
    var queue = [this.root];
    while (queue.length) {
        var node = queue.shift();
        if (node.data === data) {
            return node;
        }
        for (var i = 0; i < node.children.length; i++) {
            queue.push(node.children[i]);
        }
    }
    return null;
};

// var currentShape = childShapes[i];
//      var shape = {}
//      shape.id = currentShape.resourceId
//      shape.in = [];
//      shape.out = [];
//      for (var y = 0; y < currentShape.outgoing.length; y++) {
//          shape.out.push(currentShape.outgoing[y].resourceId)
//      }
//      for (var y = 0; y < childShapes.length; y++) {
//          for (z = 0; z < childShapes[y].outgoing.length; z++) {
//              if (childShapes[y].outgoing[z].resourceId == shape.id) {
//                  shape.in.push(childShapes[y].resourceId);
//              }
//          }
//      }
//      result.push(shape)


function createShape(currentShape, callFromShape) {

    for (var i = 0; i < result.length; i++) {
        if (result[i].id == currentShape.resourceId && callFromShape) {
            var shape = result[i];
            shape.in.push(callFromShape.id);
            return shape;
        }
    }
    var shape = {};
    shape.id = currentShape.resourceId;
    shape.in = [];
    if (callFromShape) {
        shape.in.push(callFromShape.id);
    }
    shape.out = [];
    var outgoingShapes = currentShape.outgoing;
    if (outgoingShapes) {
        for (var i = 0; i < outgoingShapes.length; i++) {
            shape.out.push(createShape(outgoingShapes[i], shape));
        }
    }
    return shape;
}