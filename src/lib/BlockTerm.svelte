<script>
    import { RingBuffer } from "../ringbuffer.js";

    import { createEventDispatcher } from "svelte";
    import { fade } from "svelte/transition";

    const scrollToBottom = async (node) => {
        // TODO(@willemvds): Use svelte to apply as soon as component is updated
        // For now 16ms usually happens within 1 frame at 60fps
        setTimeout(function () {
            node.scroll({ top: node.scrollHeight, behavior: "smooth" });
        }, 16);
    };

    let elm;
    export let prompt = "guest";

    let blocks = [];

    let cmdBuffer = "";
    let cmdHistory = new RingBuffer(32);
    let cmdHistoryItems = [];
    let cmdHistoryIndex = 0;

    let partial = "";

    const dispatch = createEventDispatcher();

    function dispatchCommand(cmd) {

        cmdHistory.pushBack(cmd);
        cmdHistoryItems = cmdHistory.items().reverse();
        cmdHistoryIndex = -1;

        if (partial) {
            addBlocks([`<span style="color:cyan">${cmd}</span>`]);
        } else {
            addBlocks([`<span style="color:cyan">&gt; ${cmd}</span>`]);
        }

        dispatch("cmdEntered", cmd);
    }

    export function addBlocks(blocksToAdd) {
        if (partial) {
            blocksToAdd[0] = `${partial}${blocksToAdd[0]}`;
            partial = "";
        }
        blocks = [...blocks, ...blocksToAdd];
        scrollToBottom(elm);
    }

    export function setPartial(p) {
        partial = p;
    }

    export function setPrompt(p) {
        prompt = p;
    }

    export function keyUp(ev) {
        ev.preventDefault();
        console.debug("BlockTerm keyUp = ", ev);

        if (ev.key == "ArrowUp") {
            cmdHistoryIndex++;
            if (cmdHistoryIndex >= cmdHistoryItems.length) {
                cmdHistoryIndex = cmdHistoryItems.length-1;
            }

            let prevCmd = cmdHistoryItems[cmdHistoryIndex];
            if (!prevCmd) {
                return;
            }

            cmdBuffer = prevCmd;
            return;
        }

        if (ev.key == "ArrowDown") {
            cmdHistoryIndex--;
            if (cmdHistoryIndex < 0) {
                cmdHistoryIndex = -1;
            }

            let nextCmd = cmdHistoryItems[cmdHistoryIndex];
            if (!nextCmd) {
                cmdBuffer = "";
                return;
            }

            cmdBuffer = nextCmd;
            return;
        }

        // backspace
        if (ev.keyCode == 8) {
            if (ev.shiftKey) {
                const trimmed = cmdBuffer.trim();
                cmdBuffer =
                    trimmed.substring(0, trimmed.lastIndexOf(" ")) + " ";
                if (cmdBuffer == " ") {
                    cmdBuffer = "";
                }
            } else if (cmdBuffer.length > 0) {
                cmdBuffer = cmdBuffer.substring(0, cmdBuffer.length - 1);
            }

            return true;
        }

        // enter
        if (ev.keyCode == 13) {
            dispatchCommand(cmdBuffer);
            cmdBuffer = "";

            return true;
        }

        if (ev.key.length > 1) {
            return true;
        }

        cmdBuffer = `${cmdBuffer}${ev.key}`;
    }
</script>

<div class="wrapper">
    <div bind:this={elm} class="box out">
        <div class="p10">
            {#each blocks as block}
                <div transition:fade class="block">
                    {#if block}
                        {@html block}
                    {:else}
                        <br />
                    {/if}
                </div>
            {/each}
            {#if partial}
                <div class="block-partial">
                    {@html partial}
                </div>
            {/if}
        </div>
    </div>

    <div class="box in">
        {prompt}&gt; {@html cmdBuffer.replaceAll(" ", "&nbsp;")}<svg
            width="8"
            height="16"
        >
            <rect width="16" height="24" style="fill:rgb(0,255,0);" />
        </svg>
    </div>
</div>

<style>
    .p10 {
        padding: 10px;
    }

    .in {
        grid-area: in;

        text-align: left;
        padding: 10px;
    }

    .out {
        grid-area: out;
        text-align: left;

        padding: 0px;
        width: 100%;

        overflow: auto;
    }

    .wrapper {
        padding: 0;
        height: 100vh;
        width: 100%;

        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: 1fr auto;
        grid-template-areas:
            "out"
            "in";
        background-color: #444;
    }

    .box {
        color: #fff;
        font-size: 150%;
    }

    .block:hover {
        background-color: green;
        cursor: pointer;
    }

    .block-partial:hover {
        background-color: orange;
        cursor: pointer;
    }
</style>
