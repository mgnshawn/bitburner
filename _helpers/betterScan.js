import {getServers} from '/helpers.js';
export async function main(ns) {
    const servers = getServers(ns);
    var output = "";
    const ourServers = ns.getPurchasedServers();
    servers.forEach(server => {        
        // Check that the server it's checking isn't "home"
        if (!(ns.args[0] != undefined && server.depth > ns.args[0]) && server.depth != 0 && !ourServers.includes(server.name)) {
            const host = server.name;

            var contracts = "";
            var contractPostfix = ""; // Just equals "S" when there are multiple servers
            var color = "rgb(0 204 0)"; // Terminal green

            ns.ls(host, ".cct").forEach(cct => {
                if (cct.includes('-', 10)) {
                    color = "red"; // Faction contract
                } else {
                    color = "blue"; // Normal contract
                }

                // Checks for multiple contracts
                if (contracts != "") contractPostfix = "S";
                contracts += cct;
            });

            // Put at the start of most lines
            const baseDashes = "<br>" + "----".repeat((server.depth - 1));
            
            // Command sequence to travel to this server
            let path = server.path.toString(); 

            //Removing all commas
            const regex = new RegExp(',', "g");
            path = path.replace(regex, "")

            // Clickable server name
            output += baseDashes + `> <a style="cursor:pointer; color:${color}; text-decoration: underline;" onclick='
            const terminalInput = document.getElementById("terminal-input");
            terminalInput.value = "home;${path}";
            
            const handler = Object.keys(terminalInput)[1];
            terminalInput[handler].onChange({target:terminalInput});
            terminalInput[handler].onKeyDown({keyCode:13,preventDefault:()=>null});
            '>${host}</a>`;

            output += baseDashes + "--Root Access: " + (ns.hasRootAccess(host) ?
                "YES" : "NO") + ", Required hacking skill: " + ns.getServerRequiredHackingLevel(host);
            output += baseDashes + "--Number of open ports required to NUKE: "
                + ns.getServerNumPortsRequired(host);
            output += baseDashes + "--RAM: " + ns.getServerMaxRam(host) + ".00GB";

            if (ns.args.includes("--detail-contract") && contracts != "") {
                output += baseDashes + "--CONTRACT" + contractPostfix + ": " + contracts;
            }

            output += "<br>";
        }
    });

    // Append "output" to terminal in the same way other elements in it are formatted
    document.getElementById("terminal").insertAdjacentHTML("beforeend",
        `<li class="jss44 MuiListItem-root MuiListItem-gutters MuiListItem-padding css-1578zj2">
        <p class="jss92 MuiTypography-root MuiTypography-body1 css-cxl1tz">${output}</p></li>`);
}

let svObj = (name = 'home', depth = 0, path = "") => ({ name: name, depth: depth, path: path });