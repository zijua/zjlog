/**
 * ZJ Log Class
 * @author ZiJuà
 * @copyright Toppi Giovanni Manuel - gtoppi@gmail.com
 * @version 1.0 (dec 2, 2012)
 * 
 * JSLINT
 * JSLINT validated with ECMA5 Script, Tolerate unused parameters
 * 
 * OPTIONS
 * production: {true, false} - in production mode console.log and print method are disabled
 * logErrors: {true, false} - if true event window.error is managed
 * sendRemote: {true, false} - if true log messages are sent to remoteURL using GET
 * remoteURL: the URL of the remote script that manage log data
 * logLevel: {1,2} 1: only message, line number and URL; 2: log level 1 + userAgent
 * errorCallback: a custom callback when an error occurs. receive error event object (example: function callbackHandler(errorEvent) { document.write(error.message); document.write(error.lineno); document.write(error.filename); })
 * 
 * compatibility table with window.onerror
 * http://www.quirksmode.org/dom/events/error.html
 */

/* JSLint global vars */
/*global window, console, document, navigator, XDomainRequest, XMLHttpRequest, escape */

/* Browser support: Chrome 13+, Firefox 6.0+, Internet Explorer 5.5+, Opera 11.60+, Safari 5.1+ */


var ZJ = ZJ || {};

/**
 * Event object
 */
ZJ.Event = (function () {
	"use strict";
	var evnt = {};
	evnt.addEventListener = {};
	evnt.removeEventListener = {};
	/**
	 * init-time branching
	 */
	(function () {
		if (typeof window.addEventListener === "function") {
			evnt.addEventListener = function (el, type, fn) {
				el.addEventListener(type, fn, false);
			};
		} else if (typeof document.attachEvent === "function") {
			evnt.addEventListener = function (el, type, fn) {
				el.attachEvent("on" + type, fn, false);
			};
		} else {
			evnt.addEventListener = function (el, type, fn) {
				el['on' + type] = fn;
			};
		}
		if (typeof window.removeEventListener === "function") {
			evnt.removeEventListener = function (el, type, fn) {
				el.removeEventListener(type, fn, false);
			};
		} else if (typeof document.attachEvent === "function") {
			evnt.removeEventListener = function (el, type, fn) {
				el.detachEvent("on" + type, fn);
			};
		} else {
			evnt.removeEventListener = function (el, type, fn) {
				el["on" + type] = null;
			};
		}
	}());
	return evnt;
}());

ZJ.log = function (options) {
	"use strict";
	var log = {},
		request = null,
		opts = {
			production: (options.production === false) ? false : true,
			logErrors: (options.logErrors === true) ? true : false,
			sendRemote: (options.sendRemote === true) ? true : false,
			remoteURL: options.remoteURL || "",
			logLevel: options.logLevel || 1,
			errorCallback: (typeof options.errorCallback === "function") ? options.errorCallback : undefined
		},
		createCORSRequest = function (method, url) {
			var xhr = new XMLHttpRequest();
			if (xhr.withCredentials !== undefined) {
				xhr.open(method, url, false);
			} else if (XDomainRequest !== undefined) {
				xhr = new XDomainRequest();
				xhr.open(method, url);
			} else {
				xhr = null;
			}
			return xhr;
		};
	log.print = function (message, callback) {
		if (opts.production === false) {
			console.log(message);
		}
		if (typeof callback === "function" && opts.production === false) {
			callback(message);
		}
	};
	(function () {
		// make secure using console.log
		if (console === undefined || console.log === undefined) {
			window.console = {};
			console.log = function (message, callback) {
				if (typeof callback === "function") {
					callback(message);
				}
			};
		}
		// disable console.log behaviour in productio mode
		if (opts.production === true) {
			console.log = function (message) { };
		}
		// automates log behaviour on window.onerror event
		if (opts.logErrors === true) {
			window.onerror = function (err, url, line) {
				if (opts.sendRemote === true && opts.remoteURL.length > 0) {
					var paramString = "";
					paramString += "?message=" + escape(err) + "&url=" + escape(url) + "&line=" + escape(line);
					switch (opts.logLevel) {
					case 2:
						paramString += "&userAgent=" + navigator.userAgent;
						break;
					default:
						break;
					}
					request = createCORSRequest("get", opts.remoteURL + paramString);
					if (request) {
						request.onreadystatechange = function () {
							if (request.readyState !== 4) {
								return false;
							}
							if (request.status !== 200) {
								throw "Request status different then 200";
							}
						};
						request.send("");
					}
				}
				if (typeof opts.errorCallback === "function") {
					opts.errorCallback(err, url, line);
				}
			};
		}
	}());
	return log;
};