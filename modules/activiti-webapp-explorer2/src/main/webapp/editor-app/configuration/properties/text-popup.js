
  ace.require("ace/ext/language_tools");
  var editor = ace.edit("editor");
  editor.setOptions({
    enableBasicAutocompletion: true
  });
  editor.getSession().on('change', function() {
    var value = editor.getSession().getValue();
    document.getElementById("textarea").value = value;
    jQuery("textarea").change();
  });
  editor.setTheme("ace/theme/monokai");
  editor.getSession().setMode("ace/mode/groovy");

  var val = angular.element(document.getElementById('textarea')).scope().getPropertyValue();
  editor.setValue(val, 1);
  editor.focus();

  var templateSelect = jQuery('#templateSelect');

  templateSelect.change(function() {
    var selectedValue = templateSelect.val();
    if (selectedValue) {
      httpGetAsync(getScriptTemplateControllerPath(selectedValue), function(responseText) {
        var script = JSON.parse(responseText);
        var code = script.code;
        editor.setValue(code, 1);
        editor.focus();
      });
    }

  })

  httpGetAsync(getScriptTemplateListControllerPath(), function(responseText) {
    var names = JSON.parse(responseText);
    var sel = document.getElementById('templateSelect');

    var opt = document.createElement('option');
    opt.innerHTML = '';
    opt.value = '';
    sel.appendChild(opt);

    for (var i = 0; i < names.length; i++) {
      var opt = document.createElement('option');
      opt.innerHTML = names[i].name;
      opt.value = names[i].name;
      sel.appendChild(opt);
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
    xmlHttp.onreadystatechange = function() {
      if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
        callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true);
    xmlHttp.send(null);
  }