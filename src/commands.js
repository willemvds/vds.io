let socket;

import { TelnetParser } from './telnet.js'

let p = new TelnetParser();

export function handleCommand(cmd, blockTerm) {
    let term = blockTerm;

    if (cmd == "reload") {
        location.reload();

        return;
    }

    if (cmd == "leupg") {
        term.addBlocks([`<img src="/leupg.png" width="100%">`]);

        return;
    }

    if (socket != null) {
        socket.send(cmd + "\r\n");

        return;
    }

    if (cmd.startsWith("telnet")) {
        cmd = cmd.replace("telnet", "").trim();
        console.log("HELLO CMD", cmd, cmd.length);
        if (cmd.length == 0) {
            term.addBlocks([
                "Usage: telnet <host>:<port>",
                "- Example #1: telnet aardmud.org:4000",
                "- Example #2: telnet cloudflare.com:80",
            ]);

            return;
        }
        term.addBlocks(["Connecting..."]);

        let l = location.hostname;
        let proto = "ws";
        if (location.protocol == "https:") {
            proto = "wss";
        }
        let [host, port] = cmd.split(":", 2);
        let where = `${proto}://${l}:13000?addr=${host}:${port}`;
        console.log("where to", where);
        try {
            socket = new WebSocket(where, cmd);

            socket.addEventListener("open", function (event) {
                term.setPrompt(cmd);
                term.addBlocks(["Connected."]);
            });

            socket.addEventListener("close", function (event) {
                term.addBlocks([`<span class="c31">Connection closed: ${event.reason}</span>`]);
                console.log("server is gone", event);
                socket = null;
                term.setPrompt("guest");
            });

            // Listen for messages
            socket.addEventListener("message", function (event) {
                console.log(event);

                const reader = new FileReader();

                // This fires after the blob has been read/loaded.
                reader.addEventListener("loadend", function (ev) {
                    let [lines, partial] = p.parse(reader.result);
                    if (lines.length > 0) {
                        term.addBlocks(lines);
                    }

                    term.setPartial(partial);
                });
                reader.readAsBinaryString(event.data);
            });

        } catch(err) {
            console.log("Socket Err =", err);
        }

        return;
    }

    term.addBlocks([`<span class="c31">Eh, wha?</span>`]);
}