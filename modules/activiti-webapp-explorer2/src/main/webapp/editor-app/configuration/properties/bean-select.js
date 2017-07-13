var jsonString = angular.element(document.getElementById('textarea')).scope().getPropertyValue();
var jsonObject;
if (jsonString) {
  try {
    jsonObject = JSON.parse(jsonString);
  } catch (e) {
    jsonObject = null;
  }
} else {
  jsonObject = null;
}

var nodes = CubaStencilUtils.getAvailableVariablesForSelectedShape()
var inputParams = angular.element(document.getElementById('textarea')).scope().inputParameters;

fillInTable();

function fillInTable() {
  //nodes = node id and variables from prev nodes
  //input params = process input params

  if (!nodes.length && !inputParams.length) {
    jQuery("#inputVariablesWrapper").hide();
  } else {
    jQuery("#inputVariablesWrapper").show();
  }
  for (var i = 0; i < inputParams.length; i++) {
    jQuery("#inTable").append('<tr><td>' + inputParams[i].name + '</td><td>' + inputParams[i].parameterType + '</td><td>' + inputParams[i].constant + '</td><td>' + inputParams[i].valueStr + '</td></tr>')
  }

  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i]
    var vars = node.vars
    for (var y = 0; y < vars.length; y++) {
      jQuery("#inTable").append('<tr><td>' + nodes[i].vars[y].name + '</td><td>' + nodes[i].vars[y].type + '</td><td>' + '</td><td>' + '</td></tr>')
    }
  }
}


jQuery('#methodSelect').change(function () {
  var selectedMethod = jQuery('#methodSelect').val();
  var sv = document.getElementById('methodSelect').value;
  httpGetAsync(getMethodArguments(), function (responseText) {
    clearTable();
    fillTable(responseText);
    changeJson();
    jsonObject = null;
  });

  httpGetAsync(getMethodReturnType(), function (responseText) {
    var ob = JSON.parse(responseText);
    jQuery('#outputType').text(ob.returnType);
    changeJson();
  });

})

jQuery('#beanSelect').change(function () {
  var selectedValue = jQuery('#beanSelect').val();
  if (selectedValue) {
    httpGetAsync(getBeanMethods(selectedValue), function (responseText) {
      clearOptions('#methodSelect');
      fillDropDownList('methodSelect', 'methodName', responseText)
      clearTable();
      changeJson();
      if (jsonObject) {
        jQuery('#methodSelect').val(jsonObject.methodName);
        jQuery('#methodSelect').change();
      } else {
        jQuery("#methodSelect").prop("selectedIndex", -1);
      }
    });
  }
})

document.getElementById('outputVariableName').addEventListener("input", function (evt) {
  changeJson();
});

httpGetAsync(getBeanNames(), function (responseText) {
  fillDropDownList('beanSelect', 'beanName', responseText)
  if (jsonObject) {
    jQuery('#beanSelect').val(jsonObject.beanName);
    jQuery('#outputVariableName').val(jsonObject.outputName);
    jQuery('#beanSelect').change();
  } else {
    jQuery("#beanSelect").prop("selectedIndex", -1);
  }
})

function fillTable(responseText) {
  var args = JSON.parse(responseText);
  var table = document.getElementById("argTable");
  var i = 1;
  jQuery.each(args, function () {
    var row = table.insertRow(i);
    var name = row.insertCell(0);
    name.id = 'name' + i;
    var type = row.insertCell(1);
    var descr = row.insertCell(2);
    var value = row.insertCell(3);
    value.id = 'val' + i;
    name.innerHTML = this.argName;
    var currentArgName = this.argName;
    type.innerHTML = this.argType;
    descr.innerHTML = this.description;
    value.innerHTML = "<input type=\"text\" id='val'" + i + ">";
    if (jsonObject && jsonObject.args) {
      jsonObject.args.forEach(function (item, i, arr) {
        if (item.paramName == currentArgName) {
          value.innerHTML = '<input type=\"text\" id="val' + i + '" value=\"' + utility.unescapeQuotesToQuotChr(item.paramValue) + '\">'
        }
      });
    }
    value.addEventListener("input", function (evt) {
      changeJson();
    });
    i++;
  });
}

function clearTable() {
  var table = document.getElementById("argTable");
  for (var i = table.rows.length - 1; i > 0; i--) {
    table.deleteRow(i);
  }
}

function clearOptions(elementId) {
  jQuery(elementId).empty();
}

function getTableValueMap() {
  var table = document.getElementById("argTable");
  var result = [];
  var y = 1;
  for (var i = table.rows.length - 1; i > 0; i--) {
    var paramName = table.rows[i].cells[0].innerHTML;
    var paramType = table.rows[i].cells[1].innerHTML;
    var paramValue = table.rows[i].cells[3].firstChild.value;
    var obj = new Object();
    obj.paramName = paramName;
    obj.paramValue = paramValue;
    obj.paramType = paramType;
    result.push(obj);
  }
  result = result.reverse();
  return result;
}

function argsMapAsString() {
  var arr = getTableValueMap();
  var result = "";
  arr.forEach(function (item, i, arr) {
    var paramName = item.paramName;
    var paramValue = item.paramValue;
    var paramType = item.paramType;
    result = result + "{\"paramName\": \"" + paramName + "\", \"paramValue\": \"" + utility.escapeQuotes(paramValue) + "\", \"paramType\": \"" + paramType + "\"}";
    if (i < arr.size() - 1) {
      result = result + ",";
    }
  });
  return result;
}

var utility = {
  escapeQuotes: function (string) {
    return string.replace(/"/g, '\\"');
  },
  unescapeQuotesToQuotChr: function (string) {
    return string.replace(/"/g, '&quot;');
  }
};



function changeJson() {
  var beanName = jQuery("#beanSelect").val();
  var methodName = jQuery("#methodSelect").val();
  var outputVariableName = jQuery("#outputVariableName").val();
  var outputVariableType = jQuery("#outputType").text();
  var argsString = argsMapAsString();
  var JSONString = "{" + "\"beanName\":\"" + beanName + "\", " +
    "\"methodName\":\"" + methodName + "\", " +
    "\"outputName\":\"" + outputVariableName + "\", " +
    "\"outputType\":\"" + outputVariableType + "\", " +
    "\"args\":[" +
    argsString +
    "]" + "}";
  document.getElementById("textarea").value = JSONString;
  jQuery('#textarea').change();
}

function fillDropDownList(selectId, parameterName, jsonString) {
  var jsonValues = JSON.parse(jsonString);
  var selectElement = document.getElementById(selectId);
  jQuery.each(jsonValues, function () {
    var opt = document.createElement('option');
    opt.innerHTML = this[parameterName];
    opt.value = this[parameterName];
    selectElement.appendChild(opt);
  });
}


function getBeanNames() {
  var controller = "getBeanNames";
  return getPath(controller);
}

function getBeanMethods(beanName) {
  var controller = "getBeanMethods?beanName=" + beanName;
  return getPath(controller);
}

function getMethodArguments() {
  var selectedBean = jQuery('#beanSelect').val();
  var selectedMethod = jQuery('#methodSelect').val();
  var controller = "getBeanMethodArguments?beanName=" + selectedBean + "&methodName=" + selectedMethod;
  return getPath(controller);
}

function getMethodReturnType() {
  var selectedBean = jQuery('#beanSelect').val();
  var selectedMethod = jQuery('#methodSelect').val();
  var controller = "getBeanMethodReturnType?beanName=" + selectedBean + "&methodName=" + selectedMethod;
  return getPath(controller);
}


function getPath(controllerName) {
  var splittedHref = window.location.href.split('dispatch');
  return splittedHref[0] + 'dispatch/' + controllerName;
}

function httpGetAsync(theUrl, callback) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function () {
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
      callback(xmlHttp.responseText);
  }
  xmlHttp.open("GET", theUrl, true);
  xmlHttp.send(null);
}

if (!jsonString) {
  changeJson();
}