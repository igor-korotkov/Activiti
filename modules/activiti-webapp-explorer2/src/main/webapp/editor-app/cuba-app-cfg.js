'use strict';

var CUBA = CUBA || {};

var getModelerRoot = function() {
    var href = window.location.href;
    return href.substring(window.location.origin.length, href.indexOf("/modeler/") + "/modeler/".length);
}

CUBA.CONFIG = {
    modelerRoot: getModelerRoot()
}