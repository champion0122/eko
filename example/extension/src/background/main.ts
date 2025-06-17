import { AgentContext, Eko, LLMs, StreamCallbackMessage } from "@eko-ai/eko";
import {
  StreamCallback,
  HumanCallback,
  WorkflowTextNode,
  Tool,
  ToolResult,
} from "@eko-ai/eko/types";
import { BrowserAgent } from "@eko-ai/eko-extension";
import { meetingAgent } from "./agents/meeting_agent";
import { request } from "../utils/request";
import { webReportAgent } from "./agents/web_report_agent";

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
        if ((message as any)?.toolName === "generate_visualization") {
          // if((message as any).streamDone) {
          //   window.open((message as any).text, '_blank');
          // }
          return;
        }
        if (message.type == "workflow") {
          let index = 1;
          const content = message.workflow.agents?.reduce((acc, agent) => {
            return acc.concat(
              (agent.nodes as WorkflowTextNode[]).map((node) => {
                return {
                  index: index++,
                  title: node.text,
                  // content: node.output
                };
              })
            );
          }, []);

          sendMessage(
            {
              thought: message.workflow.thought,
              content: content,
            },
            !message.streamDone
          );
        } else if (message.type == "text") {
          sendMessage(
            {
              result: message.text,
            },
            !message.streamDone
          );
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
      } catch (error) {
        console.log("error: ", error);
      }
    },
    onHumanConfirm: async (context, prompt) => {
      return confirm(prompt);
    },
  };

  let agents = [
    new BrowserAgent(),
    webReportAgent,
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
  date_range: string;
}

export async function main(eko, prompt: string) {
  if (!eko) {
    eko = await initEko();
  }

  chrome.storage.local.set({ report_html: "" });

  if (prompt.includes("大区") || prompt.includes("线索")) {
    prompt =
      "导航到CRM-BI LTC页面（https://bi.finereporthelp.com/webroot/decision?#/directory?activeTab=d6108b96-08bf-4f56-b280-b3429e7eb48f），告诉我这个页面上的" +
      prompt;
  }

  if (prompt.includes("会议室")) {
    // generateWorkFlow(eko, prompt);
    // https://intlrd.fineres.com/bookroom/chat
    request<{ message: string; data: IMeetingRoom[]; result: string; date_range: string }>(
      "http://10.233.6.155:8880/bookroom/chat",
      {
        method: "POST",
        data: {
          chatQuery: prompt,
          username: "Obo",
        },
      }
    )
      .then(({ data, result, message, date_range }) => {
        // const timePattern =
        //   /(今天|明天|后天)?(早上|上午|中午|下午|晚上)?([0-24]点)?/g;

        // const matches = ["明天下午14点-15点"];
        // let match;
        // while ((match = timePattern.exec(message)) !== null) {
        //   // 过滤掉全为空的匹配
        //   if (match[0].trim()) {
        //     matches[0] = (match[0]);
        //   }
        // }

        // chrome.storage.local.set({ bookTime: matches[0] });
        if (data?.length > 0 && !message.includes("预约")) {
          sendMessage({
            thought:
              `好的！我收到了您的请求，需要帮助您预约一下会议室，当前浏览器页面显示CRM....用户可能也需要其他网页...我会查询明天下午14点的空会议室，并为您预约一个能容纳6人的会议室，同时需要在无锡和南京都进行预约。我将立即开始处理这个任务。`,
            content: [
              {
                index: 1,
                title: "寻找预约会议室的网页",
                content:
                  "信息管理系统CRM：https://crm.finereporthelp.com/WebReport/decision?#directory?activeTab=bf50447e-5ce2-4c7f-834e-3e1495df033a",
              },
              {
                index: 2,
                title: "找到会议室预约查询-查询空余会议室",
                content:
                  `【地区】选择无锡 \n【时间】选择明天下午14点`,
              },
              {
                index: 3,
                title: "列出符合要求的会议室",
                content: "",
              },
            ],
            meeting: true,
          });
          chrome.runtime.sendMessage({ type: "meeting_rooms", data});
        } else if (result === "success") {
          sendMessage({
            result: "已经为您预约成功以上会议室",
            meeting: true,
          });
          chrome.runtime.sendMessage({ type: "clean_meeting_rooms", data });
        } else {
          sendMessage({
            result: message,
            meeting: true,
          });
          chrome.runtime.sendMessage({ type: "error", data: data.map(item => item.date_range = date_range) });
        }
      })
      .finally(() => {
        chrome.runtime.sendMessage({ type: "stop" });
      });

    return;
  }

  if (prompt.includes("报告")) {
    chrome.storage.local.set({ html_generating: true });
    request<{ html: string }>("http://10.233.6.155:8880/analysis/report", {
      method: "POST",
      data: {
        chatQuery: prompt,
        username: "Obo",
      },
    }).then((result) => {
      chrome.storage.local.set({ html_generating: false });
      chrome.runtime.sendMessage({ type: "report_html", data: result.html });
      chrome.storage.local.set({ report_html: result.html });
    });
  }

  eko
    .run(prompt)
    .then((res) => {
      printLog(res.result, res.success ? "success" : "error");
    })
    .catch((error) => {
      chrome.runtime.sendMessage({ type: "error", data: error });
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
      // printLog(error, "error");
      chrome.runtime.sendMessage({ type: "error", data: error });
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
    stream,
  });
}
