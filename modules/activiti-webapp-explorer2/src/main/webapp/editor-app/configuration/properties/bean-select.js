httpGetAsync(getBeanNames(), function(responseText) {
  fillDropDownList('beanSelect', 'beanName', responseText)
  jQuery("#beanSelect").prop("selectedIndex", -1);

})

jQuery('#beanSelect').change(function() {
  var selectedValue = jQuery('#beanSelect').val();
  if (selectedValue) {
    httpGetAsync(getBeanMethods(selectedValue), function(responseText) {
      clearOptions('#methodSelect');
      fillDropDownList('methodSelect', 'methodName', responseText)
      jQuery("#methodSelect").prop("selectedIndex", -1);
      changeJson();
      clearTable();
    });
  }
})

jQuery('#methodSelect').change(function() {
  var selectedMethod = jQuery('#methodSelect').val();

  if (selectedMethod) {
    httpGetAsync(getMethodArguments(), function(responseText) {
      clearTable();
      changeJson();
      fillTable(responseText);
    });
  }
})

var argNames = [];
var clickedValue;

function fillTable(responseText) {
  var args = JSON.parse(responseText);
  var table = document.getElementById("argTable");
  var i = 1;
  jQuery.each(args, function() {
    var row = table.insertRow(i);
    var name = row.insertCell(0);
    name.id = 'name' + i;
    var type = row.insertCell(1);
    var value = row.insertCell(2);
    value.id = 'val' + i;
    value.addEventListener("click", function(evt) {
      clickedValue = this.id
    });

    value.addEventListener("input", function(evt) {
      changeJson();
    });

    name.innerHTML = this.argName;
    type.innerHTML = this.argType;
    value.innerHTML = "<div id='val'" + i + " contenteditable></div>";
    i++;
  });
  jQuery('div[contenteditable]').keydown(function(e) {
    if (e.keyCode == 13) {
      return false;
    }
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

function changeJson() {
  // var obj = new Object();
  // obj.bean = jQuery("#beanSelect").val();
  // obj.method = jQuery("#methodSelect").val();
  // obj.args = [];


  // var arg = {
  //   args: []
  // };

  var ValuesArray = [{
    "key": "29",
    "value": "Country"
  }, {
    "key": "30",
    "value": "4,3,5"
  }];
ValuesArray  = ValuesArray instanceof Array ? ValuesArray : [ValuesArray];
  var obj = {
    "JSObject": ValuesArray
  };

  // var table = document.getElementById("argTable");
  // var y = 1;
  // for (var i = table.rows.length - 1; i > 0; i--) {
  //
  //   var paramName = table.rows[i].cells[0].innerHTML;
  //   var paramValue = table.rows[i].cells[2].firstChild.innerText;
  //
  //   var tobj = new Object();
  //   tobj.paramName = paramName;
  //   tobj.paramValue = paramValue;
  //   console.log(tobj);
  //   //
  //
  //   //var tObj = JSON.parse('{"' + table.rows[i].cells[0].innerHTML.replace('"', '') + '":"' + table.rows[i].cells[2].firstChild.innerText + '"}')
  //   // var myArray = new Array();
  //   // myArray.push({
  //   //   key: "29",
  //   //   value: "hello"
  //   // });
  //   obj['args'].push({
  //     "teamId": "4",
  //     "status": "pending"
  //   });
  //
  //   obj.args.push(tobj);
  //   // var tobj = new Object();
  //   // tobj.argName = table.rows[i].cells[0].innerHTML;
  //   // tobj.argValue = table.rows[i].cells[2].firstChild.innerText;
  //   // obj.args.push(tobj);
  //   // var tobj = new Array();
  //   // tobj[y].argName = table.rows[i].cells[0].innerHTML;
  //   // tobj[y].argValue = table.rows[i].cells[2].firstChild.innerText;
  //   // args.push(tobj)
  //   y++;
  //   // var ob = new Object();
  //   // ob.argName = table.rows[i].cells[0].innerHTML;
  //   // ob.argValue = table.rows[i].cells[2].firstChild.innerText;
  //   // args.push(ob);
  //   // args.push({
  //   // 'argName': table.rows[i].cells[0].innerHTML,
  //   //   argValue: table.rows[i].cells[2].firstChild.innerText
  //   // });
  //   // console.log(table.rows[i].cells[0].innerHTML + " " + i);
  //   // console.log(table.rows[i].cells[2].firstChild.innerText + " " + i);
  // }

  // obj.args = arg;
  var jsonString = jQuery.toJSON(obj);
  alert(jsonString);
  console.log(jsonString)
  document.getElementById("textarea").value = jsonString;
  jQuery('#textarea').change();
}

function fillDropDownList(selectId, parameterName, jsonString) {
  var jsonValues = JSON.parse(jsonString);
  var selectElement = document.getElementById(selectId);
  jQuery.each(jsonValues, function() {
    var opt = document.createElement('option');
    opt.innerHTML = this[parameterName];
    opt.value = this[parameterName];
    selectElement.appendChild(opt);
  });
}


function getBeanNames() {
  var controller = "/getBeanNames";
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
