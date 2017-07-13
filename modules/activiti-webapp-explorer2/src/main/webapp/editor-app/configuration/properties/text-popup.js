var jsonString = angular.element(document.getElementById('textarea')).scope().getPropertyValue();
var jsonObject;
if (jsonString) {
  jsonObject = JSON.parse(jsonString);
} else {
  jsonObject = null;
}

ace.require("ace/ext/language_tools");
var editor = ace.edit("editor");


var nodes = CubaStencilUtils.getAvailableVariablesForSelectedShape()
var inputParams = angular.element(document.getElementById('textarea')).scope().inputParameters;
var worlListForAutoComplete = [];
fillWordList();

function fillWordList() {
  for (var i = 0; i < inputParams.length; i++) {
    worlListForAutoComplete.push(inputParams[i].name);
  }
  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i]
    var vars = node.vars
    for (var y = 0; y < vars.length; y++) {
      worlListForAutoComplete.push(nodes[i].vars[y].name);
    }
  }
}

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

var variablesWordCompleter = {
  getCompletions: function (editor, session, pos, prefix, callback) {
    callback(null, worlListForAutoComplete.map(function (word) {
      return {
        caption: word,
        value: word,
        meta: "static"
      };
    }));
  }
}

var langTools = ace.require("ace/ext/language_tools");
editor.getSession().on('change', function () {
  changeJson();
  jQuery("textarea").change();
});
editor.getSession().setMode("ace/mode/groovy");

editor.setOptions({
  enableBasicAutocompletion: true
});
editor.completers.push(variablesWordCompleter);

var templateSelect = jQuery('#templateSelect');
templateSelect.change(function () {
  var selectedValue = templateSelect.val();
  if (selectedValue) {
    httpGetAsync(getScriptTemplateControllerPath(selectedValue), function (responseText) {
      var script = JSON.parse(responseText);
      var code = script.code;
      editor.setValue(code, 1);
      editor.focus();
    });
  }
})

httpGetAsync(getScriptTemplateListControllerPath(), function (responseText) {
  var names = JSON.parse(responseText);
  var sel = document.getElementById('templateSelect');
  var opt = document.createElement('option');
  opt.innerHTML = '';
  opt.value = '';
  sel.appendChild(opt);
  if (names.length == 0) {
    jQuery("#templateSelectDiv").hide();
  } else {
    jQuery("#templateSelectDiv").show();
    for (var i = 0; i < names.length; i++) {
      var opt = document.createElement('option');
      opt.innerHTML = names[i].name;
      opt.value = names[i].name;
      sel.appendChild(opt);
    }
  }
  if (jsonObject) {
    var scriptRows = jsonObject.script;
    var scriptValue = ''
    for (var i = 0; i < scriptRows.length; i++) {
      scriptValue = scriptValue + scriptRows[i] + '\n';
    }
    editor.setValue(utility.unescapeQuotes(scriptValue), 1);
    jsonObject.vars.forEach(function (item, i, arr) {
      jQuery("#outTable").append('<tr><td><input onchange="textChanged();" oninput="this.onchange();" type="text" value = "' + item.name + '"></td><td><input onchange="textChanged();" oninput="this.onchange();" type="text" value = "' + item.type + '"></td><td><input onchange="textChanged();" oninput="this.onchange();" type="text" value = "' + item.description + '"></td></tr>')
    })
    changeJson();
    jQuery("#outTable tr").not(':first').click(function () {
      jQuery(this).addClass('selected').siblings().removeClass('selected');
    })
    editor.focus();
  }
});

function getScriptTemplateListControllerPath() {
  var controllerName = 'getScriptTemplateNameListAsJSON';
  return getPath(controllerName);
}

function getScriptTemplateControllerPath(scriptName) {
  var controllerName = 'getScriptTemplateByNameAsJSON?name=' + scriptName;
  return getPath(controllerName);
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



jQuery("#removeBtn").click(function () {
  jQuery('.selected').remove();
  changeJson();
})

jQuery("#addBtn").click(function () {
  jQuery("#outTable").append('<tr><td><input onchange="textChanged();" oninput="this.onchange();" type="text"></td><td><input onchange="textChanged();" oninput="this.onchange();" type="text"></td><td><input onchange="textChanged();" oninput="this.onchange();" type="text"></td></tr>')
  jQuery("#outTable tr").unbind("click");
  jQuery("#outTable tr").not(':first').click(function () {
    jQuery(this).addClass('selected').siblings().removeClass('selected');
  })
})

function textChanged() {
  changeJson();
}

function changeJson() {
  var script = editor.getSession().getValue();

  var scriptLines = script.split('\n');
  var scriptLinesString = '';
  for (var i = 0; i < scriptLines.length; i++) {
    var line = utility.escapeQuotes(scriptLines[i]);
    scriptLinesString = scriptLinesString + '"' + line + '"';
    if (i + 1 < scriptLines.length) {
      scriptLinesString = scriptLinesString + ',';
    }
  }
  var JSONString = "{" + "\"script\":[" + scriptLinesString + "], " +
    "\"vars\":[" +
    getOutVariablesTableJson() +
    "]" + "}";
  document.getElementById("textarea").value = JSONString;
  jQuery("textarea").change();
}

function getOutVariablesTableJson() {
  var result = "";
  var total = jQuery('#outTable').find('tbody tr').not(':first').length;
  jQuery('#outTable').find('tbody tr').not(':first').each(function (index) {
    var name = jQuery(this).find("td:eq(0) input[type='text']").val();
    var type = jQuery(this).find("td:eq(1) input[type='text']").val();
    var descrpition = jQuery(this).find("td:eq(2) input[type='text']").val();
    result = result + "{\"name\": \"" + utility.escapeQuotes(name) + "\", \"type\": \"" + utility.escapeQuotes(type) + "\", \"description\": \"" + utility.escapeQuotes(descrpition) + "\"}";
    if (index !== total - 1) {
      result = result + ',';
    }

  })
  return result;
}


var utility = {
  escapeQuotes: function (string) {
    return string.replace(/"/g, '\\"');
  },
  unescapeQuotesToQuotChr: function (string) {
    return string.replace(/"/g, '&quot;');
  },
  unescapeQuotes: function (string) {
    return string.replace(/"/g, '\"');
  }


};

jQuery("#outTable tr").not(':first').click(function () {
  jQuery(this).addClass('selected').siblings().removeClass('selected');
})

if (!jsonString) {
  changeJson();
}