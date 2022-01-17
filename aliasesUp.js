export async function main(ns) {
    const aliases = [
		'betterscan="run betterScan.js"',
		'scantargets="run scanTargets.js"',
		'spider="run spiderHackBuy.js fullauto"',
		'litespider="run lite_spider.js fullauto"'
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
