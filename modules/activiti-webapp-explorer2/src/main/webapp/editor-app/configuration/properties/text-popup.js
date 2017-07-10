var jsonString = angular.element(document.getElementById('textarea')).scope().getPropertyValue();
if (jsonString) {
  var jsonObject = JSON.parse(jsonString);
}



ace.require("ace/ext/language_tools");
var editor = ace.edit("editor");




var variablesWordCompleter = {
  getCompletions : function (editor, session, pos, prefix, callback) {
    var wordList = [];
    var inputParams = angular.element(document.getElementById('textarea')).scope().inputParameters;
    for (var i = 0; i < inputParams.length; i++) {
      wordList.push(inputParams[i].name);
    }
    callback(null, wordList.map(function (word) {
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
console.log(editor.completers)
editor.completers.push(variablesWordCompleter);

console.log(editor.completers)



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
    123
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