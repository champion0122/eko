import { AgentContext, Eko, LLMs, StreamCallbackMessage } from "@eko-ai/eko";
import {
  StreamCallback,
  HumanCallback,
  WorkflowTextNode,
  Tool,
  ToolResult,
} from "@eko-ai/eko/types";
import { BrowserAgent } from "@eko-ai/eko-extension";
import { meetingAgent } from "./sql-agent/sql_agent";

export async function getLLMConfig(name: string = "llmConfig"): Promise<any> {
  let result = await chrome.storage.sync.get([name]);
  return result[name];
}

export async function initEko(): Promise<Eko> {
  let config = await getLLMConfig();
  if (!config || !config.apiKey) {
    printLog(
      "Please configure apiKey, configure in the eko extension options of the browser extensions.",
      "error"
    );
    // chrome.runtime.openOptionsPage();
    chrome.storage.local.set({ running: false });
    chrome.runtime.sendMessage({ type: "stop" });
    return;
  }

  const llms: LLMs = {
    default: {
      provider: config.llm as any,
      model: config.modelName,
      apiKey: config.apiKey,
      config: {
        baseURL: config.options.baseURL,
      },
    },
  };

  let callback: StreamCallback & HumanCallback = {
    onMessage: async (message: StreamCallbackMessage) => {
      try {
      // if ((message as any)?.toolName === "meeting_room_query") return;
      if (message.type == "workflow") {
        sendMessage({
          thought: message.workflow.thought,
          content: (message.workflow.agents?.[0]?.nodes as WorkflowTextNode[])?.map((node, _i) => {
            return {
              index: _i + 1,
              title: node.text,
              content: node.output
            }
          })
        }, !message.streamDone);
      } else if (message.type == "text") {
        sendMessage({
          result: message.text,
        }, !message.streamDone);
      }
      // else if (message.type == "tool_streaming") {
      //   printLog(
      //     `${message.agentName} > ${message.toolName}\n${message.paramsText}`,
      //     "info",
      //     true
      //   );
      // } 
      // else if (message.type == "tool_use") {
      //   printLog(
      //     `${message.agentName} > ${message.toolName}\n${JSON.stringify(
      //       message.params
      //     )}`
      //   );
      // }
      console.log("message: ", JSON.stringify(message, null, 2));
      }catch(error) {
        console.log("error: ", error);
      }
    },
    onHumanConfirm: async (context, prompt) => {
      return confirm(prompt);
    },
  };

  let agents = [
    new BrowserAgent(),
    meetingAgent,
  ];
  let eko = new Eko({ llms, agents, callback });
  return eko;
}

export async function main(eko, prompt: string) {
  eko
    .run(prompt)
    .then((res) => {
      printLog(res.result, res.success ? "success" : "error");
    })
    .catch((error) => {
      printLog(error, "error");
    })
    .finally(() => {
      chrome.storage.local.set({ running: false });
      chrome.runtime.sendMessage({ type: "stop" });
    });
  // return eko;
}

export async function generateWorkFlow(eko: Eko, prompt: string) {
  eko
    .generate(prompt)
    .then((res) => {
      console.log("res: ", JSON.stringify(res, null, 2));
      // printLog(res.result, res.success ? "success" : "error");
    })
    .catch((error) => {
      printLog(error, "error");
    })
    .finally(() => {
      chrome.storage.local.set({ running: false });
      chrome.runtime.sendMessage({ type: "stop" });
    });
}

function printLog(
  message: string,
  level?: "info" | "success" | "error",
  stream?: boolean
) {
  chrome.runtime.sendMessage({
    type: "log",
    log: message + "",
    level: level || "info",
    stream,
  });
}

function sendMessage(message: any, stream?: boolean) {
  chrome.runtime.sendMessage({
    type: "message",
    message,
    stream
  });
}