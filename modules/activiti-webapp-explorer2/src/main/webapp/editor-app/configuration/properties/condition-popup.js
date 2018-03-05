var jsonObject = angular.element(document.getElementById('textarea')).scope().getPropertyValue();
if (!jsonObject.script) {
    if (jsonObject) {
        jsonObject = JSON.parse(jsonObject);
    } else {
        jsonObject = null;
    }
}

var typeList = ["Integer", "Double", "String", "Boolean", "BigDecimal", "Date", "Time", "DateTime", "Map", "Set", "List"]

ace.require("ace/ext/language_tools");
var editor = ace.edit("editor");

var nodes = CubaStencilUtils.getAvailableVariablesForSelectedShape();
var inputParams = angular.element(document.getElementById('textarea')).scope().inputParameters;
var wordsListForAutoComplete = [];
fillWordList();

function fillWordList() {
  for (var i = 0; i < inputParams.length; i++) {
    wordsListForAutoComplete.push(inputParams[i].name);
  }
  for (var j = 0; j < nodes.length; j++) {
    var node = nodes[j];
    var vars = node.vars;
    for (var y = 0; y < vars.length; y++) {
        wordsListForAutoComplete.push(nodes[j].vars[y].name);
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

editor.setOptions({
    enableBasicAutocompletion: true,
    autoScrollEditorIntoView: true,
    theme: "ace/theme/monokai",
    showPrintMargin: false,
    mode: "ace/mode/groovy"
});
editor.completers.push(variablesWordCompleter);


function textChanged() {
  changeJson();
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
    editor.setValue(StringUtils.unescapeQuotes(scriptValue), 1);
    initAutoComplete();
    editor.focus();
} else {
    changeJson();
}

function changeJson() {
    var script = editor.getSession().getValue();
    var scriptLines = script.split('\n');
    var scriptLinesString = '';
    for (var i = 0; i < scriptLines.length; i++) {
        var line = StringUtils.escapeQuotes(scriptLines[i]);
        line = StringUtils.replaceLineEndings(line);
        scriptLinesString = scriptLinesString + '"' + line + '"';
        if (i + 1 < scriptLines.length) {
            scriptLinesString = scriptLinesString + ',';
        }
    }
    document.getElementById("textarea").value = "{" + "\"script\":[" + scriptLinesString + "]}";
    jQuery("textarea").change();
}

var comboplets = [];

function initAutoComplete() {
  var input = document.getElementsByClassName("inType");
  for (var i = 0; i < input.length; i++) {
    if (!input[i].parentElement.classList.contains('awesomplete')) {
      var comboplete = new Awesomplete(input[i], {
        minChars: 1,
        list: ["Integer", "Double", "String", "Boolean", "BigDecimal", "Date", "Time", "DateTime", "Map", "Set", "List"]
      });
      var dropDownBtn = input[i].parentElement.parentElement.getElementsByClassName('dropdown-btn')[0];
      var obj = {};
      obj.c = comboplete;
      obj.b = dropDownBtn;
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

function closeAllOtherComboplets(item) {
  comboplets.each(function (obj, i, arr) {
    if (!obj.c.ul.hasAttribute('hidden') && obj.c !== item) {
      obj.c.close();
    }
  })
}