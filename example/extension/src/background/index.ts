import { Eko } from "@eko-ai/eko";
import { generateWorkFlow, initEko, main } from "./main";

var eko: Eko;

chrome.storage.local.set({ running: false });

// Listen to messages from the browser extension
chrome.runtime.onMessage.addListener(async function (
  request,
  sender,
  sendResponse
) {
  if(request.type == "init") {
    if(!eko){
      eko = await initEko();
    }
  }
  else if (request.type == "run") {
    try {
      // Click the RUN button to execute the main function (workflow)
      // chrome.runtime.sendMessage({ type: "log", log: "Run..." });
      // Run workflow
      await main(eko, request.prompt);
    } catch (e) {
      console.error(e);
      chrome.runtime.sendMessage({
        type: "log",
        log: e + "",
        level: "error",
      });
    }
  } else if (request.type == "stop") {
    eko && eko.getAllTaskId().forEach(taskId => {
      eko.abortTask(taskId);
      chrome.runtime.sendMessage({ type: "log", log: "Abort taskId: " + taskId });
    });
    chrome.runtime.sendMessage({ type: "log", log: "Stop" });
  } else if (request.type == "step") {
    generateWorkFlow(eko, request.prompt)
  } else if (request.type == "step_stop") {

  }
});

(chrome as any).sidePanel && (chrome as any).sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
