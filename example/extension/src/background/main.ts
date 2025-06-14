import { AgentContext, Eko, LLMs, StreamCallbackMessage } from "@eko-ai/eko";
import {
  StreamCallback,
  HumanCallback,
  WorkflowTextNode,
  Tool,
  ToolResult,
} from "@eko-ai/eko/types";
import { BrowserAgent } from "@eko-ai/eko-extension";
import { meetingAgent } from "./meeting-agent/meeting_agent";
import { request } from "../utils/request";

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
    // meetingAgent,
  ];
  let eko = new Eko({ llms, agents, callback });
  return eko;
}

export interface IMeetingRoom {
  room_name: string;
  roome_area: string;
  room_id: number;
  room_maxnum: number;
}

export async function main(eko, prompt: string) {
  
  if(!eko){
    eko = await initEko();
  }

  if(prompt.includes("会议室")) {
    // generateWorkFlow(eko, prompt);

    request<{message: string;
      data: IMeetingRoom[];
      result: string;
    }>('https://intlrd.fineres.com/bookroom/chat', { method: 'POST', data: {
      "chatQuery":prompt,
      "username": "Obo"
    }}).then(({
      data,
      result,
      message
    }) => {
      if(data?.length > 0){
        sendMessage({
          thought: "好的！我收到了您的请求，需要帮助您预约一下会议室，当前浏览器页面显示CRM....用户可能也需要其他网页...我会上查询明天下午14:00的空会议室，并为您预约一个能容纳6人的会议室，同时需要在无锡和南京都进行预约。我将立即开始处理这个任务。",
          content: [{
            index: 1,
            title: "寻找预约会议室的网页",
            content: "信息管理系统CRM：https://crm.finereporthelp.com/WebReport/decision?#directory?activeTab=bf50447e-5ce2-4c7f-834e-3e1495df033a"
          },{
            index: 2,
            title: "找到会议室预约查询-查询空余会议室",
            content: "【地区】选择南京和无锡 \n【日期】选择明天2025-06-05\n【时间段】选择下午"
          },{
            index: 3,
            title: "列出符合要求的会议室",
            content: "电401、电613、电12"
          }],
          meeting: true
        })
        chrome.runtime.sendMessage({ type: "meeting_rooms", data });
      } else if(result === 'success') {
        sendMessage({
          result: message,
          meeting: true
        })
      } else {
        sendMessage({
          result: message,
          meeting: true
        })
      }
    }).finally(() => {
      chrome.runtime.sendMessage({ type: "stop" });
    });

    return;
  }
  
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

export function sendMessage(message: any, stream?: boolean) {
  chrome.runtime.sendMessage({
    type: "message",
    message,
    stream
  });
}