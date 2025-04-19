// main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');
const server = require('./server'); // Import your Express server instance

let mainWindow;

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'), // Optional: script to run before page loads
            nodeIntegration: false, // Security best practice: Disable nodeIntegration
            contextIsolation: true // Security best practice: Enable contextIsolation
        }
    });

    // Load the index.html of the app.
    // Since our server is running locally within the same process,
    // we load index.html from the server's address.
    // Ensure this matches the port your server is listening on (port 3000 in server.js)
    const serverUrl = `http://localhost:${server.address().port}`; // Get the actual port from the running server
    mainWindow.loadURL(serverUrl);
    console.log(`Electron window loading URL: ${serverUrl}`);


    // Optional: Open the DevTools.
    // mainWindow.webContents.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;

        // Optional: Close the server when the main window is closed
        // Be cautious with this if you might add background tasks later
        server.close(() => {
             console.log('Express server closed.');
        });
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    // Start the Express server first
    // The server.js file exports the app, but doesn't start listening yet.
    // We call listen() here to start it.
    // Make sure server.js exports the app instance correctly (it does in our previous code)
    // We need to ensure server.js returns the server instance from listen()
    // Let's modify server.js slightly to return the server instance.

    // --- Temporary Note: Let's go back and modify server.js ---
    // We need server.js to return the server instance after calling listen().
    // For now, let's assume server.js has been modified to `module.exports = app.listen(port, ...)`
    // or `const server = app.listen(...); module.exports = server;`

    // For the existing server.js code, it already calls listen.
    // A simpler approach for Electron is to require the server module
    // and rely on its internal listen call. The main process will keep running
    // because of Electron itself.
    console.log('Electron app ready.');
    createWindow();

    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    app.on('activate', function () {
        if (mainWindow === null) createWindow();
    });
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') app.quit();
});

// In this file you can include the rest of your app's specific main process code.
// You can also put them in separate files and require them here.