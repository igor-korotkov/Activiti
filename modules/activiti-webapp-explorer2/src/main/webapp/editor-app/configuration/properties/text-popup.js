var jsonString = angular.element(document.getElementById('textarea')).scope().getPropertyValue();
var jsonObject;

if (jsonString) {
    jsonObject = JSON.parse(jsonString);
    var scriptArr = jsonObject.script;
    jsonObject.script = scriptArr.slice(11)
} else {
  jsonObject = null;
}

var typeList = ["Integer", "Double", "String", "Boolean", "BigDecimal", "Date", "Time", "DateTime", "Map", "Set", "List"]

ace.require("ace/ext/language_tools");
var editor = ace.edit("editor");

var variableMethodsDefinition = "def addVariable(String name, Object value){\n" +
    "execution.setVariable(name, value)\n" +
    "} \n" +
    "def addVariables(Map variables) { \n" +
    " variables.each { k, v -> \n" +
    "  execution.setVariable(k,v) \n" +
    " }} \n" +
    "def addVariable(Object value) { //methodStub \n}\n" +
    " String.metaClass.leftShift << {value -> execution.setVariable(delegate, value)} \n" +
    " //replacing \n";

var inputParams = angular.element(document.getElementById('textarea')).scope().inputParameters;
var outputParams = angular.element(document.getElementById('textarea')).scope().outputParameters;
var inputNodes = CubaStencilUtils.getAvailableVariablesForSelectedShape();
var wordsListForAutoComplete = [];
fillWordList();

function fillWordList() {
  for (var i = 0; i < inputParams.length; i++) {
      wordsListForAutoComplete.push(inputParams[i].name);
  }
  for (var j = 0; j < inputNodes.length; j++) {
    var node = inputNodes[j];
    var vars = node.vars;
    for (var y = 0; y < vars.length; y++) {
        wordsListForAutoComplete.push(inputNodes[j].vars[y].name);
    }
  }
}

fillInTable();

function fillInTable() {
  //inputNodes = node id and variables from prev nodes
  //input params = process input params

  jQuery("#inputVariablesWrapper").show();

  for (var i = 0; i < inputParams.length; i++) {
    if (!inputParams[i].valueStr) {
      inputParams[i].valueStr = ''
    }
    jQuery("#inTable").append('<tr><td>' + inputParams[i].name + '</td><td>' + inputParams[i].parameterType + '<td>'+'</td></tr>')
  }

    for (var j = 0; j < outputParams.length; j++) {
        if (!outputParams[j].valueStr) {
            outputParams[j].valueStr = ''
        }
        jQuery("#inTable").append('<tr><td>' + outputParams[j].name + '</td><td>' + outputParams[j].parameterType + '<td>' + '</td></tr>')
    }

    for (var k = 0; k < inputNodes.length; k++) {
        var node = inputNodes[k];
        var vars = node.vars;
    for (var y = 0; y < vars.length; y++) {
        jQuery("#inTable").append('<tr><td>' + inputNodes[k].vars[y].name + '</td><td>' + inputNodes[k].vars[y].type + '</td>' + '<td>' + inputNodes[k].vars[y].description + '</td></tr>')
    }
  }
}

var variablesWordCompleter = {
  getCompletions: function (editor, session, pos, prefix, callback) {
      callback(null, wordsListForAutoComplete.map(function (word) {
      return {
        caption: word,
        value: word,
        meta: "static"
      };
    }));
  }
};

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
});

httpGetAsync(getScriptTemplateListControllerPath(), function (responseText) {
  var names = JSON.parse(responseText);
  var sel = document.getElementById('templateSelect');
  var opt = document.createElement('option');
  opt.innerHTML = '';
  opt.value = '';
  sel.appendChild(opt);
    if (names.length === 0) {
    jQuery("#templateSelectDiv").hide();
  } else {
    jQuery("#templateSelectDiv").show();
    for (var i = 0; i < names.length; i++) {
        var option = document.createElement('option');
        option.innerHTML = names[i].name;
        option.value = names[i].name;
        sel.appendChild(option);
    }
  }
  if (jsonObject) {
    var scriptRows = jsonObject.script;
      var scriptValue = '';
      for (var j = 0; j < scriptRows.length; j++) {
          scriptValue = scriptValue + scriptRows[j];
          if (j + 1 !== scriptRows.length) {
        scriptValue = scriptValue + '\n';
      }
    }
    editor.setValue(utility.unescapeQuotes(scriptValue), 1);
    jsonObject.vars.forEach(function (item, i, arr) {
      jQuery("#outTable").append('<tr><td><input onchange="textChanged();" oninput="this.onchange();" type="text" value = \"' + utility.unescapeQuotesToQuotChr(item.name) + '\"></td><td><input class="inType" onchange="textChanged();" oninput="this.onchange();" type="text" value = \"' + utility.unescapeQuotesToQuotChr(item.type) + '\"><div class="dropdown-btn"><span class="caret"></span></div></td><td><input onchange="textChanged();" oninput="this.onchange();" type="text" value = \"' + utility.unescapeQuotesToQuotChr(item.description) + '\"></td></tr>')
    });
    changeJson();
      jQuery("#outTable").find("tr").not(':first').click(function () {
      jQuery(this).addClass('selected').siblings().removeClass('selected');
      });
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
      if (xmlHttp.readyState === 4 && xmlHttp.status === 200)
      callback(xmlHttp.responseText);
  };
  xmlHttp.open("GET", theUrl, true);
  xmlHttp.send(null);
}

jQuery("#removeBtn").click(function () {
    var selected = jQuery('.selected');
  var next = selected.next();
  selected.remove();
  next.addClass('selected');
  changeJson();
});

jQuery("#addBtn").click(function () {
    var outTable = jQuery("#outTable");
    outTable.append('<tr><td><input onchange="textChanged();" oninput="this.onchange();" type="text"></td><td><input class="inType" onchange="textChanged();" oninput="this.onchange();" type="text"><div class="dropdown-btn"><span class="caret"></span></div></td><td><input onchange="textChanged();" oninput="this.onchange();" type="text"></td></tr>')
    outTable.find("tr").unbind("click");
    outTable.find("tr").not(':first').click(function () {
    jQuery(this).addClass('selected').siblings().removeClass('selected');
    });
  initAutoComplete();
});

function textChanged() {
  changeJson();
}

function changeJson() {
    var script = variableMethodsDefinition + editor.getSession().getValue();

  var scriptLines = script.split('\n');
  var scriptLinesString = '';
  for (var i = 0; i < scriptLines.length; i++) {
    var line = utility.escapeQuotes(scriptLines[i]);
    scriptLinesString = scriptLinesString + '"' + line + '"';
    if (i + 1 < scriptLines.length) {
      scriptLinesString = scriptLinesString + ',';
    }
  }
    var JSONString = "{" + "\"script\":[" +  scriptLinesString + "], " +
    "\"vars\":[" +
    getOutVariablesTableJson() +
    "]" + "}";
  document.getElementById("textarea").value = JSONString;
  jQuery("textarea").change();
}

function getOutVariablesTableJson() {
    var result = "";
    var outTable = jQuery('#outTable');
    var total = outTable.find('tbody tr').not(':first').length;
    outTable.find('tbody tr').not(':first').each(function (index) {
    var name = jQuery(this).find("td:eq(0) input[type='text']").val();
    var type = jQuery(this).find("td:eq(1) input[type='text']").val();
    var descrpition = jQuery(this).find("td:eq(2) input[type='text']").val();
    result = result + "{\"name\": \"" + utility.escapeQuotes(name) + "\", \"type\": \"" + utility.escapeQuotes(type) + "\", \"description\": \"" + utility.escapeQuotes(descrpition) + "\"}";
    if (index !== total - 1) {
      result = result + ',';
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
  },
  unescapeQuotes: function (string) {
    return string.replace(/"/g, '\"');
  }


};

jQuery("#outTable").find("tr").not(':first').click(function () {
  jQuery(this).addClass('selected').siblings().removeClass('selected');
});

var comboplets = [];

function initAutoComplete() {
  var input = document.getElementsByClassName("inType");
  for (var i = 0; i < input.length; i++) {
    if (!input[i].parentElement.classList.contains('awesomplete')) {
      var comboplete = new Awesomplete(input[i], {
          minChars: 1,
          list: ["Integer", "Double", "String", "Boolean", "BigDecimal", "Date", "Time", "DateTime", "Map", "Set", "List"]
      });
      var dropdownBtn = input[i].parentElement.parentElement.getElementsByClassName('dropdown-btn')[0];
      var obj = {};
      obj.c = comboplete;
      obj.b = dropdownBtn;
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
  if (this.value === "") {
    trSelector.show();
    return;
  }
  trSelector.hide();
  trSelector.filter(function (i, v) {
      var $t = jQuery(this);

      for (var d = 0; d < data.length; ++d) {
        var inputText = data[d].toUpperCase();
        var tableText = $t.text().toUpperCase();
        if (tableText.indexOf(inputText) >= 0) {
          return true;
        }
      }
      return false;
    })
    .show();
});



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