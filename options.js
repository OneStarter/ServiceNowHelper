$(document).ready(function() {
    "use strict";
    var curGroup;
    var curInstance;
    var groupsData;
    var groupsObj;
    var clicks = 0;
    var groupButtonTimer;

    chrome.storage.local.get("groupsObj", function (data) {
        groupsData = data;
        groupsObj = groupsData.groupsObj;

        for (var group in groupsObj) {
            if (groupsObj.hasOwnProperty(group)) {
                var groupName = group;
                var group = groupName.replace(/\s/g, "__");
                $("#options-groups").append('<a id="' + group + '" class="button groupsButton clickbutton blue">' + groupName + '</a>');

                var instancesObj = groupsObj[groupName];
                for (var instance in instancesObj) {
                    var instanceName = instancesObj[instance].name;
                    if (instanceName) {
                        var instanceColor = instancesObj[instance].color;
                        var inst = instanceName.replace(/\s/g, "__");
                        $("#options-instances").append('<a id="' + group + '-' + inst + '" class="' + group + ' button instancesButton clickbutton ' + instanceColor + '">' + instanceName + '</a>');
                    }
                }
            }
        }

        $(".instancesButton").hide();
    });

    chrome.storage.local.get("showHelp", function (data) {
        var showHelp = data.showHelp;

        if (showHelp == 0) {
            $("#showHelp").css("display", "inline-block");
            $("#hideHelp").css("display", "none");
            $("#helpText").css("display", "none");
            $("#addGroup").css("margin-top", "60px");
        } else if (showHelp != 1) {
            chrome.storage.local.set({
                "showHelp": 1
            });
        }
    });

    var manifestData = chrome.runtime.getManifest();
    $("#copyright").html("&copy; ServiceNow Helper - v" + manifestData.version);


    $("body").on("click", "#showHelp", function () {
        $("#showHelp").fadeOut();
        $("#addGroup").css("margin-top", "114px");
        $("#helpText").fadeIn();

        setTimeout(function () {
            $("#hideHelp").fadeIn();
        }, 400);

        chrome.storage.local.set({
            "showHelp": 1
        });
    });

    $("body").on("click", "#hideHelp", function () {
        $("#hideHelp").fadeOut();
        $("#addGroup").css("margin-top", "60px");
        $("#helpText").fadeOut();

        setTimeout(function () {
            $("#showHelp").fadeIn();
        }, 400);

        chrome.storage.local.set({
            "showHelp": 0
        });
    });

    $("body").on("click", "#addGroup", function () {
        var groupName = prompt("Please enter your groups name.");
        groupName = groupName.trim();
        if (groupName) {
            var format = /[!@#$%\^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
            if (!format.test(groupName)) {
                var group = groupName.replace(/\s/g, "__");
                if (document.getElementById(group)) {
                    alert("This group already exist, please choose a different name.");
                } else {
                    groupsObj = Object.assign({[groupName]: []}, groupsObj);
                    groupsData = {groupsObj};

                    chrome.storage.local.set({
                        "groupsObj": groupsObj
                    });

                    $(".groupsButton").css("font-weight", "normal");
                    $(".groupsButton").css("opacity", "1");

					$(".instancesButton").css("font-weight", "normal");
					$(".instancesButton").css("opacity", "1");

                    $(".instancesButton").hide();

                    $("#options-settings").html("");
                    $("#saveInstance").css("display", "none");

                    $("#addInstance").css("display", "none");
                    $("#options-wrapper").css("width", "200px");

                    $("#options-groups").append('<a id="' + group + '" class="button groupsButton clickbutton blue">' + groupName + '</a>');

                    $("#" + group).trigger("click");
                }
            } else {
                alert("Please remove all special characters from the groups name.");
            }
        }
    });

    $("body").on("mouseenter", "#addGroup", function() {
        $("#helpText").html("With this button you can create a group, for example your company.<br>Double-click on a group to change it's name. Right-click on a group to delete it.");
    });

    $("body").on("mouseleave", "#addGroup", function() {
        $("#helpText").html("Hover over an element to see its description.");
    });

    $("body").on("click", ".groupsButton", function () {
        curGroup = this.id;
        clicks++;

        if (clicks === 1) {
            groupButtonTimer = setTimeout(function() {
                $(".groupsButton").css("font-weight", "normal");
                $(".groupsButton").css("opacity", "1");

                $(".instancesButton").css("font-weight", "normal");
                $(".instancesButton").css("opacity", "1");

                $("#" + curGroup).css("font-weight", "bold");
                $("#" + curGroup).css("opacity", "0.85");

                $(".instancesButton").hide();
                $("." + curGroup).show();

                $("#options-settings").html("");
                $("#saveInstance").css("display", "none");

                $("#addInstance").css("display", "inline-block");
                $("#options-wrapper").css("width", "400px");

                clicks = 0;
            }, 200);
        } else {
            clicks = 0;
            clearTimeout(groupButtonTimer);

            var groupName = prompt("Please enter the new group name.", curGroup);
            groupName = groupName.trim();
            if (groupName) {
                var format = /[!@#$%\^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
                if (!format.test(groupName)) {
                    var group = groupName.replace(/\s/g, "__");
                    if (document.getElementById(group)) {
                        alert("This group already exist, please choose a different name.");
                    } else {

                        groupsObj[groupName] = groupsObj[curGroup];
                        delete groupsObj[curGroup];

                        chrome.storage.local.set({
                            "groupsObj": groupsObj
                        });

                        $("#" + curGroup).text(groupName);
                        $("#" + curGroup).attr("id", groupName);

                        curGroup = groupName;
                    }
                } else {
                    alert("Please remove all special characters from the groups name.");
                }
            }

            clicks = 0;
        }
    });

    $("html").on("contextmenu", function (event) {
        if (!event.ctrlKey) {
            event.preventDefault();
        }
    });

    $("body").on("contextmenu", ".groupsButton", function (event) {
        event.preventDefault();
        curGroup = this.id;

        var curGroupName = curGroup.replace(/__/g, " ");

        if (confirm("Do you want to remove group " + curGroupName + " and everything in it?")) {
            var element = document.getElementById(curGroup);
            element.parentNode.removeChild(element);

            delete groupsObj[curGroupName];

            chrome.storage.local.set({
                "groupsObj": groupsObj
            });

            $("." + curGroup).remove();

            $(".groupsButton").css("font-weight", "normal");
            $(".groupsButton").css("opacity", "1");

			$(".instancesButton").css("font-weight", "normal");
			$(".instancesButton").css("opacity", "1");

            $(".instancesButton").hide();

            $("#options-settings").html("");
            $("#saveInstance").css("display", "none");

            $("#addInstance").css("display", "none");
            $("#options-wrapper").css("width", "200px");
        }
    });

    $("body").on("mouseenter", ".groupsButton", function() {
        $("#helpText").html("This button shows the instances within the group.");
    });

    $("body").on("mouseleave", ".groupsButton", function() {
        $("#helpText").html("Hover over an element to see its description.");
    });

    $("body").on("click", "#addInstance", function () {
        chrome.storage.local.get("addNewInstanceObj", function (data) {
            var newInstance = data.addNewInstanceObj;
            var instanceName = prompt("Please enter your instance name.", newInstance);
            instanceName = instanceName.trim();
            if (instanceName) {
                var format = /[!@#$%\^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
                if (!format.test(instanceName)) {
                    var inst = instanceName.replace(/\s/g, "__");
                    if (document.getElementById(curGroup + "-" + inst)) {
                        alert("This instance already exist, please choose a different name.");
                    } else {
                        var curGroupName = curGroup.replace(/__/g, " ");

                        if (!newInstance) {
                            newInstance = instanceName.replace(/\s/g, "").toLowerCase();
                        }

                        var newInst = {"name": instanceName, "url": newInstance, "color": "blue", "notes": "", "spCheck": 0, "spSuffix": "sp"};
                        groupsObj[curGroupName].push(newInst);

                        chrome.storage.local.set({
                            "groupsObj": groupsObj
                        });

                        $(".instancesButton").css("font-weight", "normal");
                        $(".instancesButton").css("opacity", "1");

                        $("#options-settings").html("");
                        $("#saveInstance").css("display", "none");

                        $("#options-wrapper").css("width", "400px");

                        if ($("." + curGroup).length) {
                            $("." + curGroup).last().after('<a id="' + curGroup + '-' + inst + '" class="' + curGroup + ' button instancesButton clickbutton blue">' + instanceName + '</a>');
                        } else {
                            $("#options-instances").append('<a id="' + curGroup + '-' + inst + '" class="' + curGroup + ' button instancesButton clickbutton blue">' + instanceName + '</a>');
                        }

                        chrome.storage.local.set({
                            "addNewInstanceObj": ""
                        });

                        $("#" + curGroup + '-' + inst).trigger("click");
                    }
                } else {
                    alert("Please remove all special characters from the instance name.");
                }
            }
        });
    });

    $("body").on("mouseenter", "#addInstance", function() {
        $("#helpText").html("With this button you can add an instance to the selected group, this can be your Development, Test or Production instance.<br>After setting up you can easily switch to an instance that's in the same group, by clicking on the ServiceNow Helper icon.<br>For example when you are working on your Development instance, you can switch quickly to your Test or Production instance.");
    });

    $("body").on("mouseleave", "#addInstance", function() {
        $("#helpText").html("Hover over an element to see its description.");
    });

    $("body").on("click", ".instancesButton", function () {
        curInstance = this.id;

        var curGroupName = curGroup.replace(/__/g, " ");
        var inst = curInstance.substring(curGroup.length + 1);
        var instanceName = inst.replace(/__/g, " ");

        $(".instancesButton").css("font-weight", "normal");
        $(".instancesButton").css("opacity", "1");

        $("#" + curInstance).css("font-weight", "bold");
        $("#" + curInstance).css("opacity", "0.85");

        $("#options-wrapper").css("width", "600px");
        $("#saveInstance").css("display", "inline-block");


        var instancesObj = groupsObj[curGroupName];
        var upDownLength = instancesObj.length;

        instancesObj = instancesObj.filter(function( instancesObj ) {
            return instancesObj.name == instanceName;
        });

        var name = "" + instancesObj[0].name;
        var url = "" + instancesObj[0].url;
        var color = "" + instancesObj[0].color;
        var notes = "" + instancesObj[0].notes;
        var spCheck = instancesObj[0].spCheck;
        var spSuffix = "" + instancesObj[0].spSuffix;

        if (name == "undefined") {
            name = "";
        }

        if (url == "undefined") {
            url = "";
        }

        if (color == "undefined") {
            color = "";
        }

        if (notes == "undefined") {
            notes = "";
        }

        if (spSuffix == "undefined") {
            spSuffix = "";
        }

        $("#options-settings").html('<div id="upDownDiv"><a id="instanceUp" class="button clickbutton blue">Up</a>' +
                                    '<a id="instanceDown" class="button clickbutton blue">Down</a><br><br></div>' +
                                    '<div id="nameTxt">Name:</div><input id="instanceVal" type="text" value="' + name + '"/><br><br>' +
                                    '<div id="urlTxt">Url (only the instance part):</div><input id="settingsUrl" type="text" value="' + url + '"/><br><br>' +
                                    '<div id="colorTxt">Color:</div><select id="colorPicker"><option value="blue">Blue</option>' +
                                                    '<option value="green">Green</option>' +
                                                    '<option value="orange">Orange</option>' +
                                                    '<option value="purple">Purple</option>' +
                                                    '<option value="red">Red</option>' +
                                                    '<option value="yellow">Yellow</option>' +
                                            '</select><br><br>' +
                                    '<div id="notesTxt">Notes:</div><textarea id="notesVal">' + notes + '</textarea><br><br>' +
                                    '<div id="spTxt">This is a Service Portal:</div><input id="spCheck" type="checkbox"/><br><br>' +
                                    '<div id="spDiv">' +
                                    '<div id="spsTxt">Service Portal suffix:</div><input id="spSuffix" type="text" value="' + spSuffix + '"/></div>');

        if (upDownLength == 1) {
            $("#upDownDiv").css("display", "none");
        } else {
            $("#upDownDiv").css("display", "inline-block");
        }

        if (!url) {
            $("#settingsUrl").focus();
        }

        if (color) {
            $("#colorPicker").val(color);
        } else {
            $("#colorPicker").val("blue");
        }

        if (spCheck == 1) {
            $("#spCheck").prop("checked", true);
        } else {
            $("#spDiv").css("display", "none");
        }
    });

    $("body").on("mouseenter", "#instanceVal", function() {
        $("#helpText").html("Give your instance a name, for example Development, Test or Production.");
    });

    $("body").on("mouseleave", "#instanceVal", function() {
        $("#helpText").html("Hover over an element to see its description.");
    });

    $("body").on("mouseenter", "#nameTxt", function() {
        $("#helpText").html("Give your instance a name, for example Development, Test or Production.");
    });

    $("body").on("mouseleave", "#nameTxt", function() {
        $("#helpText").html("Hover over an element to see its description.");
    });


    $("body").on("mouseenter", "#settingsUrl", function() {
        $("#helpText").html("Set the url of your instance, but only the instance part.<br>For example with https://instance.service-now.com you only write 'instance'.");
    });

    $("body").on("mouseleave", "#settingsUrl", function() {
        $("#helpText").html("Hover over an element to see its description.");
    });

    $("body").on("mouseenter", "#urlTxt", function() {
        $("#helpText").html("Set the url of your instance, but only the instance part.<br>For example with https://instance.service-now.com you only write 'instance'.");
    });

    $("body").on("mouseleave", "#urlTxt", function() {
        $("#helpText").html("Hover over an element to see its description.");
    });


    $("body").on("mouseenter", "#colorPicker", function() {
        $("#helpText").html("Choose a color for your instance.");
    });

    $("body").on("mouseleave", "#colorPicker", function() {
        $("#helpText").html("Hover over an element to see its description.");
    });

    $("body").on("mouseenter", "#colorTxt", function() {
        $("#helpText").html("Choose a color for your instance.");
    });

    $("body").on("mouseleave", "#colorTxt", function() {
        $("#helpText").html("Hover over an element to see its description.");
    });


    $("body").on("mouseenter", "#notes", function() {
        $("#helpText").html("Set notes for your instance.");
    });

    $("body").on("mouseleave", "#notes", function() {
        $("#helpText").html("Hover over an element to see its description.");
    });

    $("body").on("mouseenter", "#notesTxt", function() {
        $("#helpText").html("Set notes for your instance.");
    });

    $("body").on("mouseleave", "#notesTxt", function() {
        $("#helpText").html("Hover over an element to see its description.");
    });


    $("body").on("click", "#saveInstance", function () {
        var format = /[!@#$%\^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;

        var nameVal = $("#instanceVal").val().trim();
        if (!nameVal) {
            alert("Please enter the name.");
            return;
        }

        if (format.test(nameVal)) {
            alert("Please remove all special characters from the instance name.");
            return;
        }


        var inst = nameVal.replace(/\s/g, "__");
        if (document.getElementById(curGroup + "-" + inst) && curGroup + "-" + inst != curInstance) {
            alert("This instance already exist, please choose a different name.");
            return;
        }


        var urlVal = $("#settingsUrl").val().trim();
        if (!urlVal) {
            alert("Please enter the url.");
            return;
        }

        if (/\s/.test(urlVal)) {
            alert("Please remove spaces from the url.");
            return;
        }

        if (format.test(urlVal)) {
            alert("Please remove all special characters from the url.");
            return;
        }


        var notesVal = $("#notesVal").val().trim();

        var spCheckVal = $("#spCheck").prop("checked");
        var spSuffixVal = $("#spSuffix").val().trim();

        if (spCheckVal == 1 && spSuffixVal == "") {
            alert("Please enter a Service Portal suffix.");
            return;
        }

        if (spCheckVal == 1 && /\s/.test(spSuffixVal)) {
            alert("Please remove spaces from the Service Portal suffix.");
            return;
        }

        if (spCheckVal == 1 && format.test(spSuffixVal)) {
            alert("Please remove all special characters from the Service Portal suffix.");
            return;
        }

        var colorVal = $("#colorPicker").val().trim();

        var newInst = {
            "name": nameVal,
            "url": urlVal,
            "color": colorVal,
            "notes": notesVal,
            "spCheck": spCheckVal,
            "spSuffix": spSuffixVal
        };

        var curGroupName = curGroup.replace(/__/g, " ");

        var instLast = curInstance.substring(curGroup.length + 1);
        var instanceName = instLast.replace(/__/g, " ");

        var instancesObj = groupsObj[curGroupName];


        var objPosition = instancesObj.map(function(ins) { return ins.name; }).indexOf(instanceName);

        var firstObjects = instancesObj.filter(function(instancesObj, index) {
            return (index < objPosition);
        });

        var lastObjects = instancesObj.filter(function(instancesObj, index) {
            return index > objPosition;
        });


        firstObjects.push(newInst);
        instancesObj = firstObjects.concat(lastObjects);

        groupsObj[curGroupName] = Object.assign([curGroupName], instancesObj);
        groupsObj = Object.assign({[curGroupName]: []}, groupsObj);

        chrome.storage.local.set({
            "groupsObj": groupsObj
        });


        $("#" + curInstance).text(nameVal);

        var lastClass = $("#" + curInstance).attr("class").split(" ").pop();
        $("#" + curInstance).removeClass(lastClass);

        $("#" + curInstance).addClass(colorVal);

        $("#" + curInstance).attr("id", curGroup + "-" + inst);
        curInstance = curGroup + "-" + inst;

        $("#saveInstance").text("Instance saved");

        setTimeout(function () {
            $("#saveInstance").text("Save");
        }, 1000);
    });

    $("body").on("mouseenter", "#saveInstance", function() {
        $("#helpText").html("With this button you can save all settings below for this instance.<br>Always save the settings after changing them.");
    });

    $("body").on("mouseleave", "#saveInstance", function() {
        $("#helpText").html("Hover over an element to see its description.");
    });

    $("body").on("contextmenu", ".instancesButton", function (event) {
        event.preventDefault();
        var curId = this.id;

        var curInst = curId.substring(curGroup.length + 1);
        var instanceName = curInst.replace(/__/g, " ");

        var curGroupName = curGroup.replace(/__/g, " ");

        if (confirm("Do you want to remove instance " + instanceName + "?")) {
            var element = document.getElementById(curId);
            element.parentNode.removeChild(element);

            var instancesObj = groupsObj[curGroupName];

            instancesObj = instancesObj.filter(function( instancesObj ) {
                return instancesObj.name !== instanceName;
            });

            groupsObj[curGroupName] = Object.assign([curGroupName], instancesObj);
            groupsObj = Object.assign({[curGroupName]: []}, groupsObj);

            chrome.storage.local.set({
                "groupsObj": groupsObj
            });

            $(".instancesButton").css("font-weight", "normal");
            $(".instancesButton").css("opacity", "1");

            $("#options-settings").html("");
            $("#saveInstance").css("display", "none");

            $("#options-wrapper").css("width", "400px");
        }
    });

    $("body").on("mouseenter", ".instancesButton", function() {
        $("#helpText").html("With this button you show the options for this instance.");
    });

    $("body").on("mouseleave", ".instancesButton", function() {
        $("#helpText").html("Hover over an element to see its description.");
    });

    $("body").on("click", "#instanceUp", function () {
        var curGroupName = curGroup.replace(/__/g, " ");

        var instLast = curInstance.substring(curGroup.length + 1);
        var instanceName = instLast.replace(/__/g, " ");

        var instancesObj = groupsObj[curGroupName];
        var objPosition = instancesObj.map(function(ins) { return ins.name; }).indexOf(instanceName);


        if (objPosition > 0) {
            var filteredInstancesObj = instancesObj.filter(function(instancesObj) {
                return instancesObj.name == instanceName;
            });

            var firstObjects = instancesObj.filter(function(instancesObj, index) {
                return index < objPosition - 1;
            });

            var lastObjects = instancesObj.filter(function(instancesObj, index) {
                return index > objPosition - 2;
            });

            lastObjects = lastObjects.filter(function( lastObjects ) {
                return lastObjects.name !== instanceName;
            });


            firstObjects.push(filteredInstancesObj[0]);
            instancesObj = firstObjects.concat(lastObjects);

            groupsObj[curGroupName] = Object.assign([curGroupName], instancesObj);
            groupsObj = Object.assign({[curGroupName]: []}, groupsObj);

            chrome.storage.local.set({
                "groupsObj": groupsObj
            });

            var instElement = $("#" + curInstance);
            instElement.prev().insertAfter(instElement);
        }
    });

    $("body").on("mouseenter", "#instanceUp", function() {
        $("#helpText").html("With this button you can change the position of the instance.");
    });

    $("body").on("mouseleave", "#instanceUp", function() {
        $("#helpText").html("Hover over an element to see its description.");
    });


    $("body").on("click", "#instanceDown", function () {
        var curGroupName = curGroup.replace(/__/g, " ");

        var instLast = curInstance.substring(curGroup.length + 1);
        var instanceName = instLast.replace(/__/g, " ");

        var instancesObj = groupsObj[curGroupName];
        var objPosition = instancesObj.map(function(ins) { return ins.name; }).indexOf(instanceName);

        if (objPosition < instancesObj.length - 1) {
            var filteredInstancesObj = instancesObj.filter(function(instancesObj) {
                return instancesObj.name == instanceName;
            });

            var firstObjects = instancesObj.filter(function(instancesObj, index) {
                return index < objPosition + 2;
            });

            firstObjects = firstObjects.filter(function( firstObjects ) {
                return firstObjects.name !== instanceName;
            });

            var lastObjects = instancesObj.filter(function(instancesObj, index) {
                return index > objPosition + 1;
            });

            firstObjects.push(filteredInstancesObj[0]);
            instancesObj = firstObjects.concat(lastObjects);

            groupsObj[curGroupName] = Object.assign([curGroupName], instancesObj);
            groupsObj = Object.assign({[curGroupName]: []}, groupsObj);

            chrome.storage.local.set({
                "groupsObj": groupsObj
            });

            var instElement = $("#" + curInstance);
            instElement.next().insertBefore(instElement);
        }
    });

    $("body").on("mouseenter", "#instanceDown", function() {
        $("#helpText").html("With this button you can change the position of the instance.");
    });

    $("body").on("mouseleave", "#instanceDown", function() {
        $("#helpText").html("Hover over an element to see its description.");
    });


    $("body").on("mouseenter", "#notesVal", function() {
        $("#helpText").html("Set notes for your instance.");
    });

    $("body").on("mouseleave", "#notesVal", function() {
        $("#helpText").html("Hover over an element to see its description.");
    });


    $("body").on("click", "#spCheck", function () {
        if (this.checked) {
            $("#spDiv").css("display", "inline-block");
        } else {
            $("#spDiv").css("display", "none");
        }
    });

    $("body").on("mouseenter", "#spCheck", function() {
        $("#helpText").html("With this checkbox you can set the options when your instance is used as a Service Portal.<br>For example you can measure how fast a widget is loading.");
    });

    $("body").on("mouseleave", "#spCheck", function() {
        $("#helpText").html("Hover over an element to see its description.");
    });

    $("body").on("mouseenter", "#spTxt", function() {
        $("#helpText").html("With this checkbox you can set the options when your instance is used as a Service Portal.<br>For example you can measure how fast a widget is loading.");
    });

    $("body").on("mouseleave", "#spTxt", function() {
        $("#helpText").html("Hover over an element to see its description.");
    });


    $("body").on("mouseenter", "#spSuffix", function() {
        $("#helpText").html("Set the Service Portal suffix, the default is 'sp'. This way we can identify the Service Portal url.<br>For example with https://instance.service-now.com/sp you only write 'sp'.");
    });

    $("body").on("mouseleave", "#spSuffix", function() {
        $("#helpText").html("Hover over an element to see its description.");
    });

    $("body").on("mouseenter", "#spsTxt", function() {
        $("#helpText").html("Set the Service Portal suffix, the default is 'sp'. This way we can identify the Service Portal url.<br>For example with https://instance.service-now.com/sp you only write 'sp'.");
    });

    $("body").on("mouseleave", "#spsTxt", function() {
        $("#helpText").html("Hover over an element to see its description.");
    });
});