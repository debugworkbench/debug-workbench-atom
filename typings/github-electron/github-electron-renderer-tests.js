/// <reference path="./github-electron-renderer.d.ts" />
var ipc = require('ipc');
var remote = require('remote');
var WebFrame = require('web-frame');
var Clipboard = require('clipboard');
var CrashReporter = require('crash-reporter');
var Screen = require('screen');
var Shell = require('shell');
var fs = require('fs');
console.log(ipc.sendSync('synchronous-message', 'ping'));
ipc.on('asynchronous-reply', function (arg) {
    console.log(arg);
});
ipc.send('asynchronous-message', 'ping');
var BrowserWindow = remote.require('browser-window');
var win = new BrowserWindow({ width: 800, height: 600 });
win.loadUrl('https://github.com');
remote.getCurrentWindow().on('close', function () {
});
remote.getCurrentWindow().capturePage(function (buf) {
    fs.writeFile('/tmp/screenshot.png', buf, function (err) {
        console.log(err);
    });
});
remote.getCurrentWindow().capturePage(function (buf) {
    remote.require('fs').writeFile('/tmp/screenshot.png', buf, function (err) {
        console.log(err);
    });
});
WebFrame.setZoomFactor(2);
WebFrame.setSpellCheckProvider('en-US', true, {
    spellCheck: function (text) {
        return !(require('spellchecker').isMisspelled(text));
    }
});
Clipboard.writeText('Example String');
Clipboard.writeText('Example String', 'selection');
console.log(Clipboard.readText('selection'));
CrashReporter.start({
    productName: 'YourName',
    companyName: 'YourCompany',
    submitUrl: 'https://your-domain.com/url-to-submit',
    autoSubmit: true
});
var Tray = remote.require('Tray');
var appIcon2 = new Tray('/Users/somebody/images/icon.png');
var window2 = new BrowserWindow({ icon: '/Users/somebody/images/window.png' });
var image = Clipboard.readImage();
var appIcon3 = new Tray(image);
var appIcon4 = new Tray('/Users/somebody/images/icon.png');
var app = remote.require('app');
var mainWindow = null;
app.on('ready', function () {
    var size = Screen.getPrimaryDisplay().workAreaSize;
    mainWindow = new BrowserWindow({ width: size.width, height: size.height });
});
app.on('ready', function () {
    var displays = Screen.getAllDisplays();
    var externalDisplay = null;
    for (var i in displays) {
        if (displays[i].bounds.x > 0 || displays[i].bounds.y > 0) {
            externalDisplay = displays[i];
            break;
        }
    }
    if (externalDisplay) {
        mainWindow = new BrowserWindow({
            x: externalDisplay.bounds.x + 50,
            y: externalDisplay.bounds.y + 50,
        });
    }
});
Shell.openExternal('https://github.com');
