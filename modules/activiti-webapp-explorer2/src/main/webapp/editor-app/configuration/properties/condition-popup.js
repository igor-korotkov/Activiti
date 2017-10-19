var jsonString = angular.element(document.getElementById('textarea')).scope().getPropertyValue();

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
      worlListForAutoComplete.push(nodes[j].vars[y].name);
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
  enableBasicAutocompletion: true
});
editor.completers.push(variablesWordCompleter);


function textChanged() {
  changeJson();
}

function changeJson() {
  var script = editor.getSession().getValue();

  var scriptLines = script.split('\n');
  var scriptLinesString = '';
  for (var i = 0; i < scriptLines.length; i++) {
    var line = utility.escapeQuotes(scriptLines[i]);
    scriptLinesString = scriptLinesString +  line ;
    if (i + 1 < scriptLines.length) {
      scriptLinesString = scriptLinesString + ',';
    }
  }
  document.getElementById("textarea").value = scriptLinesString;
  jQuery("textarea").change();
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
 if (jsonString) {
     console.log(jsonString);
    editor.setValue(utility.unescapeQuotes(jsonString), 1);
	editor.focus();
 }
if (!jsonString) {
  changeJson();
}