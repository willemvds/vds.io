<script>
  import { onMount } from "svelte";
  import BlockTerm from "./lib/BlockTerm.svelte";

  import { handleCommand } from "./commands.js";

  let blockTerm;

  function cmdReceived(ev) {
    console.debug(handleCommand(ev.detail, blockTerm));
  }

  function kp(ev) {
    ev.preventDefault();

    // for now we're forwarding all keys to the term
    blockTerm.keyUp(ev);
  }

  function silence(ev) {
    ev.preventDefault();
  }

  onMount(async () => {
    let lines = [
      "Welcome to Very Dodgy Software.",
      "A division of the LEUPG foundation.",
      "",
      "Editing:",
      "&lt;shift&gt; + &lt;backspace&gt; - Erase word",
      "",
      "Commands:",
      "- reload - Reload this browser tab (even inside telnet mode).",
      "- leupg - About LEUPG.",
      "- telnet &lt;host:port&gt; - Telnet to host.",
      "",
    ];

    blockTerm.addBlocks(lines);
  });
</script>

<svelte:window on:keydown={kp} on:keyup="{silence}" />

<main>
  <BlockTerm bind:this={blockTerm} prompt="guest" on:cmdEntered={cmdReceived} />
</main>
