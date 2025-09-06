let supportedColours = [30, 31, 32, 33, 34, 35, 36, 37, 39];

// Very crude minimal parsing to get a playable MUD experience
export class TelnetParser {
  constructor() {}

  parse(buf) {
    let lines = [];
    let line = buf;
    let html = "";
    let level = 0;

    let code = false;
    let codeSoFar = "";
    let cmdState = 0;
    for (let i = 0; i < line.length; i++) {
      let char = line[i];
      let charCode = char.charCodeAt(0);
      if (char.charCodeAt(0) == 27) {
        code = true;
        codeSoFar = "";
        continue;
      }

      if (charCode == 255) {
        cmdState = 1;
        continue;
      }

      if (cmdState == 1) {
        if (charCode >= 251) {
          cmdState = 2;
          continue;
        }
        cmdState = 0;
        continue;
      }

      if (cmdState == 2) {
        cmdState = 0;
        continue;
      }

      if (code) {
        codeSoFar = codeSoFar + char;
        if (char == "m") {
          code = false;

          console.log(
            "WE HAVE THE FOLLOWING ASCII CONTROL CODE TO IMPLEMENT",
            codeSoFar,
          );

          if (codeSoFar[0] !== "[") {
            continue;
          }

          if (codeSoFar[codeSoFar.length - 1] !== "m") {
            continue;
          }

          // we only understand [..;..;..;..m
          let args = codeSoFar
            .slice(1, codeSoFar.length - 1)
            .split(";");
          console.log("these are my args", args);
          for (let arg of args) {
            let argNum = parseInt(arg);
            if (isNaN(argNum)) {
              continue;
            }
            if (!supportedColours.includes(argNum)) {
              continue;
            }

            if (level > 0) {
              level = level - 1;
              html = html + `</span>`;
            }
            html = html + `<span class="c${arg}">`;
            level = level + 1;
          }
        }
      } else {
        if (char == "\n") {
          html += "<br>";
          lines.push(html);
          html = "";
        } else if (char == " ") {
          html += "&nbsp;";
        } else {
          html = html + char;
        }
      }
    }

    let partial = "";
    if (html != "") {
      partial = html;
    }

    return [lines, partial];
  }
}
