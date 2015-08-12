/// <reference path="./github-electron-main.d.ts" />
var app = require('app');
var AutoUpdater = require('auto-updater');
var BrowserWindow = require('browser-window');
var ContentTracing = require('content-tracing');
var Dialog = require('dialog');
var GlobalShortcut = require('global-shortcut');
var ipc = require('ipc');
var Menu = require('menu');
var MenuItem = require('menu-item');
var PowerMonitor = require('power-monitor');
var Protocol = require('protocol');
var Tray = require('tray');
var Clipboard = require('clipboard');
var CrashReporter = require('crash-reporter');
var Screen = require('screen');
var Shell = require('shell');
var path = require('path');
require('crash-reporter').start();
var mainWindow = null;
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin')
        app.quit();
});
app.on('ready', function () {
    mainWindow = new BrowserWindow({ width: 800, height: 600 });
    mainWindow.loadUrl("file://" + __dirname + "/index.html");
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
});
app.addRecentDocument('/Users/USERNAME/Desktop/work.type');
app.clearRecentDocuments();
var dockMenu = Menu.buildFromTemplate([
    {
        label: 'New Window',
        click: function () {
            console.log('New Window');
        }
    },
    {
        label: 'New Window with Settings',
        submenu: [
            { label: 'Basic' },
            { label: 'Pro' }
        ]
    },
    { label: 'New Command...' }
]);
app.dock.setMenu(dockMenu);
app.setUserTasks([
    {
        program: process.execPath,
        arguments: '--new-window',
        iconPath: process.execPath,
        iconIndex: 0,
        title: 'New Window',
        description: 'Create a new window'
    }
]);
app.setUserTasks([]);
var window = new BrowserWindow();
window.setProgressBar(0.5);
window.setRepresentedFilename('/etc/passwd');
window.setDocumentEdited(true);
var onlineStatusWindow;
app.on('ready', function () {
    onlineStatusWindow = new BrowserWindow({ width: 0, height: 0, show: false });
    onlineStatusWindow.loadUrl("file://" + __dirname + "/online-status.html");
});
ipc.on('online-status-changed', function (event, status) {
    console.log(status);
});
app.on('ready', function () {
    window = new BrowserWindow({ width: 800, height: 600 });
    window.loadUrl('https://github.com');
});
app.commandLine.appendSwitch('remote-debugging-port', '8315');
app.commandLine.appendSwitch('host-rules', 'MAP * 127.0.0.1');
app.commandLine.appendSwitch('v', -1);
app.commandLine.appendSwitch('vmodule', 'console=0');
AutoUpdater.setFeedUrl('http://mycompany.com/myapp/latest?version=' + app.getVersion());
var win = new BrowserWindow({ width: 800, height: 600, show: false });
win.on('closed', function () {
    win = null;
});
win.loadUrl('https://github.com');
win.show();
ContentTracing.startRecording('*', ContentTracing.DEFAULT_OPTIONS, function () {
    console.log('Tracing started');
    setTimeout(function () {
        ContentTracing.stopRecording('', function (path) {
            console.log('Tracing data recorded to ' + path);
        });
    }, 5000);
});
console.log(Dialog.showOpenDialog({
    properties: ['openFile', 'openDirectory', 'multiSelections']
}));
var ret = GlobalShortcut.register('ctrl+x', function () {
    console.log('ctrl+x is pressed');
});
if (!ret)
    console.log('registerion fails');
console.log(GlobalShortcut.isRegistered('ctrl+x'));
GlobalShortcut.unregister('ctrl+x');
GlobalShortcut.unregisterAll();
ipc.on('asynchronous-message', function (event, arg) {
    console.log(arg);
    event.sender.send('asynchronous-reply', 'pong');
});
ipc.on('synchronous-message', function (event, arg) {
    console.log(arg);
    event.returnValue = 'pong';
});
var menu = new Menu();
menu.append(new MenuItem({ label: 'MenuItem1', click: function () { console.log('item 1 clicked'); } }));
menu.append(new MenuItem({ type: 'separator' }));
menu.append(new MenuItem({ label: 'MenuItem2', type: 'checkbox', checked: true }));
var template = [
    {
        label: 'Electron',
        submenu: [
            {
                label: 'About Electron',
                selector: 'orderFrontStandardAboutPanel:'
            },
            {
                type: 'separator'
            },
            {
                label: 'Services',
                submenu: []
            },
            {
                type: 'separator'
            },
            {
                label: 'Hide Electron',
                accelerator: 'Command+H',
                selector: 'hide:'
            },
            {
                label: 'Hide Others',
                accelerator: 'Command+Shift+H',
                selector: 'hideOtherApplications:'
            },
            {
                label: 'Show All',
                selector: 'unhideAllApplications:'
            },
            {
                type: 'separator'
            },
            {
                label: 'Quit',
                accelerator: 'Command+Q',
                click: function () { app.quit(); }
            }
        ]
    },
    {
        label: 'Edit',
        submenu: [
            {
                label: 'Undo',
                accelerator: 'Command+Z',
                selector: 'undo:'
            },
            {
                label: 'Redo',
                accelerator: 'Shift+Command+Z',
                selector: 'redo:'
            },
            {
                type: 'separator'
            },
            {
                label: 'Cut',
                accelerator: 'Command+X',
                selector: 'cut:'
            },
            {
                label: 'Copy',
                accelerator: 'Command+C',
                selector: 'copy:'
            },
            {
                label: 'Paste',
                accelerator: 'Command+V',
                selector: 'paste:'
            },
            {
                label: 'Select All',
                accelerator: 'Command+A',
                selector: 'selectAll:'
            }
        ]
    },
    {
        label: 'View',
        submenu: [
            {
                label: 'Reload',
                accelerator: 'Command+R',
                click: function () { BrowserWindow.getFocusedWindow().reloadIgnoringCache(); }
            },
            {
                label: 'Toggle DevTools',
                accelerator: 'Alt+Command+I',
                click: function () { BrowserWindow.getFocusedWindow().toggleDevTools(); }
            }
        ]
    },
    {
        label: 'Window',
        submenu: [
            {
                label: 'Minimize',
                accelerator: 'Command+M',
                selector: 'performMiniaturize:'
            },
            {
                label: 'Close',
                accelerator: 'Command+W',
                selector: 'performClose:'
            },
            {
                type: 'separator'
            },
            {
                label: 'Bring All to Front',
                selector: 'arrangeInFront:'
            }
        ]
    },
    {
        label: 'Help',
        submenu: []
    }
];
menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
Menu.buildFromTemplate([
    { label: '4', id: '4' },
    { label: '5', id: '5' },
    { label: '1', id: '1', position: 'before=4' },
    { label: '2', id: '2' },
    { label: '3', id: '3' }
]);
Menu.buildFromTemplate([
    { label: 'a', position: 'endof=letters' },
    { label: '1', position: 'endof=numbers' },
    { label: 'b', position: 'endof=letters' },
    { label: '2', position: 'endof=numbers' },
    { label: 'c', position: 'endof=letters' },
    { label: '3', position: 'endof=numbers' }
]);
app.on('ready', function () {
    PowerMonitor.on('suspend', function () {
        console.log('The system is going to sleep');
    });
});
app.on('ready', function () {
    Protocol.registerProtocol('atom', function (request) {
        var url = request.url.substr(7);
        return new Protocol.RequestFileJob(path.normalize(__dirname + "/" + url));
    });
});
var appIcon = null;
app.on('ready', function () {
    appIcon = new Tray('/path/to/my/icon');
    var contextMenu = Menu.buildFromTemplate([
        { label: 'Item1', type: 'radio' },
        { label: 'Item2', type: 'radio' },
        { label: 'Item3', type: 'radio', checked: true },
        { label: 'Item4', type: 'radio' },
    ]);
    appIcon.setToolTip('This is my application.');
    appIcon.setContextMenu(contextMenu);
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
var appIcon2 = new Tray('/Users/somebody/images/icon.png');
var window2 = new BrowserWindow({ icon: '/Users/somebody/images/window.png' });
var image = Clipboard.readImage();
var appIcon3 = new Tray(image);
var appIcon4 = new Tray('/Users/somebody/images/icon.png');
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
