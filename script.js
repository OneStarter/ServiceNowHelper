$(document).ready(function () {
    "use strict";
    var spFound = false;

    chrome.tabs.query({
        "active": true,
        "lastFocusedWindow": true
    }, function (tabs) {
        if (tabs.length) {
            var startURL = tabs[0].url;
            if (startURL.indexOf(".service-now.com/") !== -1) {
                var currentInstance = startURL.split(".service-now.com/")[0];
                currentInstance = currentInstance.replace(/^https?\:\/\//i, "");

                var currentSP = startURL.split(".service-now.com/")[1];

                chrome.storage.local.get("groupsObj", function (data) {
                    var buttonCount = 0;
                    var groupsObj = data.groupsObj;
                    for (var group in groupsObj) {
                        groupsObj[group].forEach(function (instance) {
                            if (instance.url === currentInstance && buttonCount == 0) {
                                createButtons(groupsObj[group], currentInstance, currentSP);
                                buttonCount = buttonCount + 1;
                            }
                        });
                    }

                    if (spFound == false && currentSP && !currentSP.startsWith("nav_to.do?uri=%2F") && !currentSP.startsWith("login.do")) {
                        $("#buttons").prepend('<a id="addMenu" class="button blue">Add menu</a>');
                    }

                    if (buttonCount === 0) {
                        $("#buttons").append('<a id="addNewInstance" class="' + currentInstance + ' button green">Add ' + currentInstance + '</a>');
                    } else if (!document.getElementById(currentInstance) && spFound == false) {
                        $("#buttons").prepend('<div id="currentInstanceDiv">Current instance: ' + currentInstance + '</div>');
                    }

                    $("#buttons").append('<div id="optionsdiv"><a href id="go-to-options">Go to options</a></div>');
                });

                $("#buttons").fadeIn().css("display", "inline-block");
            } else if (startURL.indexOf("chrome-extension") !== -1) {
                $("#buttons").append('<div id="optionsdiv"><a href id="go-to-options">Go to options</a></div>');
                $("#buttons").fadeIn().css("display", "inline-block");
            } else {
                chrome.storage.local.get("groupsObj", function (data) {
                    var groupsObj = data.groupsObj;
                    for (var group in groupsObj) {
                        $("#buttons").append('<div class="groupHeader">' + group + '</div>');
                        createAllButtons(groupsObj[group]);
                    }

                    $("#buttons").append('<div id="optionsdiv"><a href id="go-to-options">Go to options</a></div>');
                });

                $("#buttons").fadeIn().css("display", "inline-block");
            }
        }
    });

    function createButtons(data, currentInstance, currentSP) {
        spFound = false;

        data.forEach(function (element) {
            if (element.url == currentInstance && element.spCheck == true && element.spSuffix == currentSP) {
                spFound = true;
                $("#buttons").html("");
                $("#buttons").append('<a id="WidgetCode" class="button green">Copy widget code</a>');
                $("#buttons").append('<div id="DevToolsText">You now copied the code on your clipboard.<br><br>Close this window and open the Developer tools in your browser (F12) and paste the code in the console.</div>');

                $("#buttons").fadeIn().css("display", "inline-block");
            } else if (element.url !== currentInstance && element.spCheck == false && spFound == false) {
                $("#buttons").append('<a id="' + element.url + '" class="button clickbutton ' + element.color + '">' + element.name + '</a>');
            }
        });
    }

    function createAllButtons(data) {
        data.forEach(function (element) {
            if (element.spCheck == true) {
                $("#buttons").append('<a id="' + element.url + '" suffix="' + element.spSuffix + '" class="button allbutton ' + element.color + '">' + element.name + '</a>');
            } else {
                $("#buttons").append('<a id="' + element.url + '" suffix="" class="button allbutton ' + element.color + '">' + element.name + '</a>');
            }
        });
    }

    $("body").on("click", "#addNewInstance", function () {
        var curInstance = $("#" + this.id).attr("class").split(" ")[0];

        chrome.storage.local.set({
            "addNewInstanceObj": curInstance
        });

        if (chrome.runtime.openOptionsPage) {
            window.open(chrome.runtime.getURL("options.html"));
        } else {
            chrome.runtime.openOptionsPage();
        }
    });

    $("body").on("click", "#addMenu", function () {
        chrome.tabs.query({ "active": true, "lastFocusedWindow": true }, function (tabs) {
            if (tabs.length) {
                var url = tabs[0].url;
                var instance = url.split(".service-now.com/")[0];
                var link = url.split(".service-now.com/")[1];

                chrome.tabs.update({
                    url: instance + ".service-now.com/nav_to.do?uri=%2F" + link
                });
            }

            window.close();
        });
    });

    $("body").on("click", "#go-to-options", function () {
        chrome.storage.local.set({
            "addNewInstanceObj": ""
        });

        if (chrome.runtime.openOptionsPage) {
            window.open(chrome.runtime.getURL("options.html"));
        } else {
            chrome.runtime.openOptionsPage();
        }
    });

    $("body").on("click", ".clickbutton", function (event) {
        var instance = this.id;
        chrome.tabs.query({ "active": true, "lastFocusedWindow": true }, function (tabs) {
            if (tabs.length) {
                var url = tabs[0].url;
                var link = url.split(".service-now.com/")[1];

                if (event.ctrlKey) {
                    chrome.tabs.create({
                        url: "https://" + instance + ".service-now.com/" + link
                    });
                } else if (event.shiftKey) {
                    chrome.windows.create({
                        url: "https://" + instance + ".service-now.com/" + link
                    });
                } else {
                    chrome.tabs.update({
                        url: "https://" + instance + ".service-now.com/" + link
                    });
                }
            }

            window.close();
        });
    });

    $("body").on("click", ".allbutton", function (event) {
        var instance = this.id;
        var suffix = $("#" + instance).attr("suffix");
        chrome.tabs.query({ "active": true, "lastFocusedWindow": true }, function (tabs) {
            if (tabs.length) {
                if (event.ctrlKey) {
                    chrome.tabs.create({
                        url: "https://" + instance + ".service-now.com/" + suffix
                    });
                } else if (event.shiftKey) {
                    chrome.windows.create({
                        url: "https://" + instance + ".service-now.com/" + suffix
                    });
                } else {
                    chrome.tabs.update({
                        url: "https://" + instance + ".service-now.com/" + suffix
                    });
                }
            }

            window.close();
        });
    });

    $("body").on("contextmenu", ".clickbutton", function (event) {
        var instance = this.id;
        chrome.tabs.query({ "active": true, "lastFocusedWindow": true }, function (tabs) {
            if (tabs.length) {
                var url = tabs[0].url;
                var link = url.split(".service-now.com/")[1];

                if (event.shiftKey) {
                    chrome.windows.create({
                        url: "https://" + instance + ".service-now.com/" + link
                    });
                } else {
                    chrome.tabs.create({
                        url: "https://" + instance + ".service-now.com/" + link
                    });
                }
            }

            window.close();
        });
    });

    $("html").on("contextmenu", function (event) {
        if (!event.ctrlKey) {
            event.preventDefault();
        }
    });

    $("body").on("contextmenu", ".button", function (event) {
        event.preventDefault();
    });

    $("body").on("click", "#WidgetCode", function () {
        document.execCommand("copy");

        $("#WidgetCode").fadeOut();

        setTimeout(function () {
            $("#DevToolsText").fadeIn();
        }, 400);
    });

    document.addEventListener("copy", function (e) {
        // Credits: https://hi.service-now.com/kb_view.do?sysparm_article=KB0744521
        var copyWidgetCode = `(async () => {
            var wa = $("div [widget='widget']");
            if (wa){
                wa = $("div [widget='widget']")
                .css("border", "1px solid red")
                .css("padding-top", "20px")
                .css("position", "relative");

                for (var i = 0; i < wa.length; i++) {
                    let widgetEntry = {};
                    $0 = wa[i];
                    let scope = $($0).scope();
                    try {
                        var widget = scope.widget;
                    } catch (e) {
                        console.error(e);
                        continue;
                    }
                    var timing = 0;
                    let elem = $(
                        "<div style='position:absolute;top:4px;'>&nbsp;&nbsp;</div>"
                    );

                    widgetEntry.name = widget.name;
                    widgetEntry.rectangle = widget.rectangle_id || "undefined";
                    widgetEntry.sys_id = widget.sys_id;
                    let id = scope.widget.rectangle_id + "_" + scope.$id;

                    // if this is not a nested widget, go ahead and refresh it.
                    if (!scope.$parent || !scope.$parent.widget) {
                        var widget_name = widget.name;
                        var t0 = performance.now();
                        await scope.server.refresh();
                        var t1 = performance.now();
                        timing = "<div style='float:right;margin-left:5px;' id='" + id +
                                "'> Load Time: " + parseInt(t1 - t0) + " ms.</div>";
                        widgetEntry.load_time_ms = parseInt(t1 - t0) || 0;
                        elem.append(timing);
                    }

                    // add a button to refresh manually.
                    var loadTime = $("<button style='border-radius: 50%;'> R </button>").on("click", function () {
                            let id = scope.widget.rectangle_id + "_" + scope.$id;
                            var t0 = performance.now();
                            scope.server.refresh().then(() => {
                                var t1 = performance.now();
                                timing = "<div style='float:right;margin-left:5px;' id='" + id +
                                        "'>  Load Time: " + parseInt(t1 - t0) + " ms.</div>";
                                widgetEntry.load_time_ms = parseInt(t1 - t0) || 0;

                                if ($("#" + id)) {
                                    $("#" + id).remove();
                                }

                                elem.append(timing);
                            });
                        }
                    );

                    elem.append(loadTime);
                    $($0).append(elem);
                }
            }
        })();
        `;

        e.clipboardData.setData("text/plain", copyWidgetCode);
        e.preventDefault();
    });
});