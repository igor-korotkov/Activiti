var jsonString = angular.element(document.getElementById('textarea')).scope().getPropertyValue();
var jsonObject;
if (jsonString) {
  jsonObject = JSON.parse(jsonString);
} else {
  jsonObject = null;
}

var typeList = ["Integer", "Double", "String", "Boolean", "Money", "Date", "Time", "DateTime", "Map", "Set", "List"]

ace.require("ace/ext/language_tools");
var editor = ace.edit("editor");


var nodes = CubaStencilUtils.getAvailableVariablesForSelectedShape()
var inputParams = angular.element(document.getElementById('textarea')).scope().inputParameters;
var wordlListForAutoComplete = [];
var availableVariablesMap = [];
fillWordList();

function fillWordList() {
  for (var i = 0; i < inputParams.length; i++) {
    wordlListForAutoComplete.push(inputParams[i].name);

    var variable = {};
    variable.name = inputParams[i].name;
    variable.type = inputParams[i].type;
    availableVariablesMap.push(variable);

  }
  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i]
    var vars = node.vars
    for (var y = 0; y < vars.length; y++) {
      wordlListForAutoComplete.push(nodes[i].vars[y].name);

      var variable = {};
      variable.name = nodes[i].vars[y].name;
      variable.type = nodes[i].vars[y].type;
      availableVariablesMap.push(variable);
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
    if (!inputParams[i].valueStr) {
      inputParams[i].valueStr = ''
    }
    jQuery("#inTable").append('<tr><td>' + inputParams[i].name + '</td><td>' + inputParams[i].parameterType + '<td>' + '</td></tr>')
  }

  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i]
    var vars = node.vars
    for (var y = 0; y < vars.length; y++) {
      jQuery("#inTable").append('<tr><td>' + nodes[i].vars[y].name + '</td><td>' + nodes[i].vars[y].type + '</td>' + '<td>' + nodes[i].vars[y].description + '</td></tr>')
    }
  }
}

var variablesWordCompleter = {
  getCompletions: function (editor, session, pos, prefix, callback) {
    var row = pos.row;
    var column = pos.column;
    var lineText = session.doc.$lines[row]
    var extendedCallback = false;
    for (var i = 0; i < availableVariablesMap.length; i++) {
      var name = availableVariablesMap[i].name
      if (lineText.indexOf(name) >= 0) {
        var type = availableVariablesMap[i].type;
        extendedCallback = true;
        httpGetAsync("http://localhost:8080/scorecard/dispatch/getCodeAutocomplete?type=" + type + "&prefix=", function (responseText) {
          var extendedAutocomplete = JSON.parse(responseText);
          callback(null, extendedAutocomplete.map(function (word) {
            return {
              caption: word,
              value: word,
              score: 1000,
              meta: "by type"
            };
          }));
        });
      }
    }
    var extendedExpression = '';
    console.log(availableVariablesMap)
    if (!extendedCallback) {
      callback(null, wordlListForAutoComplete.map(function (word) {
        return {
          caption: word,
          value: word,
          meta: "static"
        };
      }));
    }
  }
}

var langTools = ace.require("ace/ext/language_tools");
editor.getSession().on('change', function () {
  changeJson();
  jQuery("textarea").change();
});
editor.getSession().setMode("ace/mode/groovy");

editor.setOptions({
  theme: 'ace/theme/crimson_editor',
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
      scriptValue = scriptValue + scriptRows[i];
      if (i + 1 != scriptRows.length) {
        scriptValue = scriptValue + '\n';
      }
    }
    editor.setValue(utility.unescapeQuotes(scriptValue), 1);
    jsonObject.vars.forEach(function (item, i, arr) {
      jQuery("#outTable").append('<tr><td><input onchange="textChanged();" oninput="this.onchange();" type="text" value = \"' + utility.unescapeQuotesToQuotChr(item.name) + '\"></td><td><input class="inType" onchange="textChanged();" oninput="this.onchange();" type="text" value = \"' + utility.unescapeQuotesToQuotChr(item.type) + '\"><div class="dropdown-btn"><span class="caret"></span></div></td><td><input onchange="textChanged();" oninput="this.onchange();" type="text" value = \"' + utility.unescapeQuotesToQuotChr(item.description) + '\"></td></tr>')
    })
    changeJson();
    jQuery("#outTable tr").not(':first').click(function () {
      jQuery(this).addClass('selected').siblings().removeClass('selected');
    })
    initAutoComplete();
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
  var selected = jQuery('.selected')
  var next = selected.next();
  selected.remove();
  next.addClass('selected');
  changeJson();
})

jQuery("#addBtn").click(function () {
  jQuery("#outTable").append('<tr><td><input onchange="textChanged();" oninput="this.onchange();" type="text"></td><td><input class="inType" onchange="textChanged();" oninput="this.onchange();" type="text"><div class="dropdown-btn"><span class="caret"></span></div></td><td><input onchange="textChanged();" oninput="this.onchange();" type="text"></td></tr>')
  jQuery("#outTable tr").unbind("click");
  jQuery("#outTable tr").not(':first').click(function () {
    jQuery(this).addClass('selected').siblings().removeClass('selected');
  })
  initAutoComplete();
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

var comboplets = []

function initAutoComplete() {
  var input = document.getElementsByClassName("inType");
  for (var i = 0; i < input.length; i++) {
    if (!input[i].parentElement.classList.contains('awesomplete')) {
      var comboplete = new Awesomplete(input[i], {
        minChars: 1,
        list: ["Integer", "Double", "String", "Boolean", "Money", "Date", "Time", "DateTime", "Map", "Set", "List"]
      });
      var dropdownBtn = input[i].parentElement.parentElement.getElementsByClassName('dropdown-btn')[0];
      var obj = {}
      obj.c = comboplete
      obj.b = dropdownBtn
      comboplets.push(obj);
      initDropDownListeners();
    }
  }
}

function initDropDownListeners() {
  comboplets.each(function (item, i, arr) {
    if (!item.added) {
      item.added = true;
      item.b.addEventListener("click", function () {
        closeAllOtherComboplets(item.c);
        var comboplete = item.c;
        if (comboplete.ul.childNodes.length === 0) {
          comboplete.minChars = 0;
          comboplete.evaluate();
        } else if (comboplete.ul.hasAttribute('hidden')) {
          comboplete.open();
        } else {
          comboplete.close();
        }
      })
    }
  })
}

jQuery("#filterInput").keyup(function () {
  var data = this.value.split(" ");
  var trSelector = jQuery("#inTable").find('tr').not(':first');
  if (this.value == "") {
    trSelector.show();
    return;
  }
  trSelector.hide();
  trSelector.filter(function (i, v) {
      var $t = jQuery(this);

      for (var d = 0; d < data.length; ++d) {
        var inputText = data[d].toUpperCase()
        var tableText = $t.text().toUpperCase()
        if (tableText.indexOf(inputText) >= 0) {
          return true;
        }
      }
      return false;
    })
    .show();
})



function closeAllOtherComboplets(item) {
  comboplets.each(function (obj, i, arr) {
    if (!obj.c.ul.hasAttribute('hidden') && obj.c !== item) {
      obj.c.close();
    }
  })
}

if (!jsonString) {
  changeJson();
}