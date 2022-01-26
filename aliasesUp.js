export async function main(ns) {
    const aliases = [
        'betterscan="run /_helpers/betterScan.js"',
        'scantargets="run /_helpers/scanTargets.js"',
        'gt="run /_helpers/goto.js "',
        'goto="run /_helpers/goto.js "',
        'purchaseserver="run /_helpers/purchaseServer.js "',
        'singledownload="run /_helpers/singleDownload.js "',
        'terminal="run /_helpers/terminal.js"',
        'reporefresh="run /_helpers/repoRefresh.js"',
        'tradestocks="run /_helpers/stockTrader.js"',
        'showpositions="run /_helpers/stockTrader.js showpositions"'
        ];
    aliases.forEach(allyText => {
// Acquire a reference to the terminal text field
const terminalInput = document.getElementById("terminal-input");

// Set the value to the command you want to run.
terminalInput.value=`alias ${allyText}";`;

// Get a reference to the React event handler.
const handler = Object.keys(terminalInput)[1];

// Perform an onChange event to set some internal values.
terminalInput[handler].onChange({target:terminalInput});

// Simulate an enter press
terminalInput[handler].onKeyDown({keyCode:13,preventDefault:()=>null});
        });
}