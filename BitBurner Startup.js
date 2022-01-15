// Acquire a reference to the terminal text field
const terminalInput = document.getElementById("terminal-input");

// Set the value to the command you want to run.
terminalInput.value="home;connect darkweb;buy BruteSSH.exe;buy FTPCrack.exe;buy relaySMTP.exe;buy HTTPWorm.exe;buy SQLInject.exe;buy DeepscanV1.exe;buy DeepscanV2.exe;buy AutoLink.exe";

// Get a reference to the React event handler.
const handler = Object.keys(terminalInput)[1];

// Perform an onChange event to set some internal values.
terminalInput[handler].onChange({target:terminalInput});

// Simulate an enter press
terminalInput[handler].onKeyDown({keyCode:13,preventDefault:()=>null});
