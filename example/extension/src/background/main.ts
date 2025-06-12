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
import { Message } from "../sidebar/components/MessageList";

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
      // if ((message as any)?.toolName === "meeting_room_query") return;
      if (message.type == "workflow") {
        sendMessage({
          thought: message.workflow.thought,
          content: (message.workflow.agents?.[0]?.nodes as WorkflowTextNode[]).map((node, _i) => {
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
    },
    onHumanConfirm: async (context, prompt) => {
      return confirm(prompt);
    },
  };

//   const ext_tools: Tool[] = [
//     {
//       name: "book_meeting_room",
//       description: "Book a meeting room",
//       parameters: {
//         type: "object",
//         properties: {
//           area: {
//             type: "string",
//             description: "area, default no choose",
//             enum: ["无锡", "南京"],
//           },
//           date: {
//             type: "string",
//             description: "date, default today, format like: 2025-06-08",
//           },
//           time_range: {
//             type: "string",
//             description: "time range, default no choose",
//             enum: [
//               "09:00:00-09:30:00",
//               "09:30:00-10:00:00",
//               "10:00:00-10:30:00",
//               "10:30:00-11:00:00",
//               "11:00:00-11:30:00",
//               "11:30:00-12:00:00",
//               "12:00:00-12:30:00",
//               "12:30:00-13:00:00",
//               "13:00:00-13:30:00",
//               "13:30:00-14:00:00",
//               "14:00:00-14:30:00",
//               "14:30:00-15:00:00",
//               "15:00:00-15:30:00",
//               "15:30:00-16:00:00",
//               "16:00:00-16:30:00",
//               "16:30:00-17:00:00",
//               "17:00:00-17:30:00",
//               "17:30:00-18:00:00",
//               "18:00:00-18:30:00",
//               "18:30:00-19:00:00",
//               "19:00:00-19:30:00",
//               "19:30:00-20:00:00",
//               "20:00:00-20:30:00",
//               "20:30:00-21:00:00",
//             ],
//           },
//           num_people: {
//             type: "number",
//             description: "number of people, default 0",
//           },
//           device: {
//             type: "string",
//             description: "device, default 0",
//             enum: ["小鱼", "大屏", "电视", "投影", "白板"],
//           },
//         },
//         // required: ["area", "date"],
//       },
//       planDescription: `Book a meeting room on https://crm.finereporthelp.com/WebReport/ReportServer?reportlet=attendance/hr_boardroom_adaption.cpt&op=write. The process includes the following steps:
// 如果我没有输入对应的参数，不要填充对应数据，直接跳过
// 1. Navigate to the url and wait for it to load completely
// 2. Fill the query parameters
//    - Fill in the required parameters (date, time, etc.)
// 3. Find and click the '预约会议室' (Book Meeting Room) button
// 4. If search results are found:
//    - Click the checkbox in front of the desired meeting room row to select it
//    - Click the '预约' (Book) button to confirm the booking
// 5. Verify the booking is successful

// Note: Make sure to handle any error messages or notifications that may appear during the process.`,
//       execute: async (
//         args: Record<string, unknown>,
//         agentContext: AgentContext
//       ): Promise<ToolResult> => {
//         // // 2. 选择区域
//         // if (args.area) {
//         //   await this.callInnerTool(() =>
//         //     this.input_text(
//         //       agentContext,
//         //       args.index as number,
//         //       args.area as string,
//         //       true
//         //     )
//         //   );
//         // }

//         // // 3. 输入日期
//         // if (args.date) {
//         //   await this.callInnerTool(() =>
//         //     this.input_text(
//         //       agentContext,
//         //       args.index as number,
//         //       args.date as string,
//         //       true
//         //     )
//         //   );
//         // }

//         // // 4. 选择时间段
//         // if (args.time_range) {
//         //   await this.callInnerTool(() =>
//         //     this.input_text(
//         //       agentContext,
//         //       args.index as number,
//         //       args.time_range as string,
//         //       true
//         //     )
//         //   );
//         // }

//         // // 5. 输入人数
//         // if (args.num_people) {
//         //   await this.callInnerTool(() =>
//         //     this.input_text(
//         //       agentContext,
//         //       args.index as number,
//         //       args.num_people.toString(),
//         //       true
//         //     )
//         //   );
//         // }

//         // // 6. 选择设备
//         // if (args.device) {
//         //   await this.callInnerTool(() =>
//         //     this.input_text(
//         //       agentContext,
//         //       args.index as number,
//         //       args.device as string,
//         //       true
//         //     )
//         //   );
//         // }

//         // // 1. 点击预约会议室按钮
//         // await this.callInnerTool(() =>
//         //   this.click_element(agentContext, args.index as number, 1, "left")
//         // );


//         // // 7. 点击查询
//         // await this.callInnerTool(() =>
//         //   this.click_element(agentContext, args.index as number, 1, "left")
//         // );

//         // await new Promise(resolve => setTimeout(resolve, 6000));

//         // // 8. 选择会议室
//         // await this.callInnerTool(() =>
//         //   this.click_element(agentContext, args.index as number, 1, "left")
//         // );

//         // // 9. 点击预约
//         // await this.callInnerTool(() =>
//         //   this.click_element(agentContext, args.index as number, 1, "left")
//         // );

//         return {
//           content: [{ type: "text", text: "Book a meeting room successfully" }],
//         };
//       },
//     },
//     {
//       name: "select_area",
//       description: "在label为会议地点的input中输入对应参数，按回车",
//       parameters: {
//         type: "object",
//         properties: {
//           area: {
//             type: "string",
//             description: "area, default no choose",
//             enum: ["无锡", "南京"],
//           },
//         },
//         // required: ["area"],
//       },
//       execute: async (
//         args: Record<string, unknown>,
//         agentContext: AgentContext
//       ): Promise<ToolResult> => {
//         return await this.callInnerTool(() =>
//           this.input_text(
//             agentContext,
//             args.index as number,
//             args.area as string,
//             true
//           )
//         );
//       },
//     },
//     {
//       name: "select_date",
//       description: "在label为日期的input中输入对应参数，按回车",
//       parameters: {
//         type: "object",
//         properties: {
//           date: {
//             type: "string",
//             description: "date, default today, format like: 2025-06-08",
//           },
//         },
//         // required: ["date"],
//       },
//       execute: async (
//         args: Record<string, unknown>,
//         agentContext: AgentContext
//       ): Promise<ToolResult> => {
//         return await this.callInnerTool(() =>
//           this.input_text(
//             agentContext,
//             args.index as number,
//             args.date as string,
//             true
//           )
//         );
//       },
//     },
//     {
//       name: "input_time_range",
//       description: "在label为会议时间的input中输入对应参数，按回车",
//       parameters: {
//         type: "object",
//         properties: {
//           time_range: {
//             type: "string",
//             description: "time range, default ''",
//             enum: [
//               "09:00:00-09:30:00",
//               "09:30:00-10:00:00",
//               "10:00:00-10:30:00",
//               "10:30:00-11:00:00",
//               "11:00:00-11:30:00",
//               "11:30:00-12:00:00",
//               "12:00:00-12:30:00",
//               "12:30:00-13:00:00",
//               "13:00:00-13:30:00",
//               "13:30:00-14:00:00",
//               "14:00:00-14:30:00",
//               "14:30:00-15:00:00",
//               "15:00:00-15:30:00",
//               "15:30:00-16:00:00",
//               "16:00:00-16:30:00",
//               "16:30:00-17:00:00",
//               "17:00:00-17:30:00",
//               "17:30:00-18:00:00",
//               "18:00:00-18:30:00",
//               "18:30:00-19:00:00",
//               "19:00:00-19:30:00",
//               "19:30:00-20:00:00",
//               "20:00:00-20:30:00",
//               "20:30:00-21:00:00",
//             ],
//           },
//         },
//         // required: ["time_range"],
//       },
//       execute: async (
//         args: Record<string, unknown>,
//         agentContext: AgentContext
//       ): Promise<ToolResult> => {
//         return await this.callInnerTool(() =>
//           this.input_text(
//             agentContext,
//             args.index as number,
//             args.time_range as string,
//             true
//           )
//         );
//       },
//     },
//     {
//       name: "input_num_people",
//       description: "在label为参会人数的input中输入对应参数，按回车",
//       parameters: {
//         type: "object",
//         properties: {
//           num_people: {
//             type: "number",
//             description: "number of people, default 0",
//           },
//         },
//         // required: ["num_people"],
//       },
//       execute: async (
//         args: Record<string, unknown>,
//         agentContext: AgentContext
//       ): Promise<ToolResult> => {
//         return await this.callInnerTool(() =>
//           this.input_text(
//             agentContext,
//             args.index as number,
//             args.num_people.toString(),
//             true
//           )
//         );
//       },
//     },
//     {
//       name: "input_device",
//       description: "在label为所需设备的input中输入对应参数，按回车",
//       parameters: {
//         type: "object",
//         properties: {
//           device: {
//             type: "string",
//             description: "device, default ''",
//             enum: ["小鱼", "大屏", "电视", "投影", "白板"],
//           },
//         },
//         // required: ["device"],
//       },
//       execute: async (
//         args: Record<string, unknown>,
//         agentContext: AgentContext
//       ): Promise<ToolResult> => {
//         return await this.callInnerTool(() =>
//           this.input_text(
//             agentContext,
//             args.index as number,
//             args.device as string,
//             true
//           )
//         );
//       },
//     },
//     {
//       name: "click_search",
//       description: "点击查询按钮",
//       parameters: {
//         type: "object",
//         properties: {},
//       },
//       execute: async (
//         args: Record<string, unknown>,
//         agentContext: AgentContext
//       ): Promise<ToolResult> => {
//         return await this.callInnerTool(() =>
//           this.click_element(agentContext, args.index as number, 1, "left")
//         );
//       },
//     },
//     {
//       name: "select_room",
//       description: "选中会议室记录",
//       parameters: {
//         type: "object",
//         properties: {
//           index: {
//             type: "number",
//             description: "The index of the room checkbox to select",
//           },
//         },
//         required: ["index"],
//       },
//       execute: async (
//         args: Record<string, unknown>,
//         agentContext: AgentContext
//       ): Promise<ToolResult> => {
//         return await this.callInnerTool(() =>
//           this.click_element(agentContext, args.index as number, 1, "left")
//         );
//       },
//     },
//     {
//       name: "click_book",
//       description: "点击预约按钮",
//       parameters: {
//         type: "object",
//         properties: {},
//       },
//       execute: async (
//         args: Record<string, unknown>,
//         agentContext: AgentContext
//       ): Promise<ToolResult> => {
//         return await this.callInnerTool(() =>
//           this.click_element(agentContext, args.index as number, 1, "left")
//         );
//       },
//     },
//     {
//       name: "navigate_to_book_meeting_room",
//       description: "Navigate to the book meeting room page.",
//       parameters: {
//         type: "object",
//         properties: {
//           area: {
//             type: "string",
//             description: "area, default no choose",
//             // enum: ["无锡", "南京"],
//           },
//           date: {
//             type: "string",
//             description: "date, default today, format like: 2025-06-08",
//           },
//           time_range: {
//             type: "string",
//             description: "time range, default no choose",
//             // enum: [
//             //   "09:00:00-09:30:00",
//             //   "09:30:00-10:00:00",
//             //   "10:00:00-10:30:00",
//             //   "10:30:00-11:00:00",
//             //   "11:00:00-11:30:00",
//             //   "11:30:00-12:00:00",
//             //   "12:00:00-12:30:00",
//             //   "12:30:00-13:00:00",
//             //   "13:00:00-13:30:00",
//             //   "13:30:00-14:00:00",
//             //   "14:00:00-14:30:00",
//             //   "14:30:00-15:00:00",
//             //   "15:00:00-15:30:00",
//             //   "15:30:00-16:00:00",
//             //   "16:00:00-16:30:00",
//             //   "16:30:00-17:00:00",
//             //   "17:00:00-17:30:00",
//             //   "17:30:00-18:00:00",
//             //   "18:00:00-18:30:00",
//             //   "18:30:00-19:00:00",
//             //   "19:00:00-19:30:00",
//             //   "19:30:00-20:00:00",
//             //   "20:00:00-20:30:00",
//             //   "20:30:00-21:00:00",
//             // ],
//           },
//           num_people: {
//             type: "number",
//             description: "number of people, default 0",
//           },
//           device: {
//             type: "string",
//             description: "device, default 0",
//             // enum: ["小鱼", "大屏", "电视", "投影", "白板"],
//           },
//         },
//         // required: ["area", "date"],
//       },
//       execute: async (
//         args: Record<string, unknown>,
//         agentContext: AgentContext
//       ): Promise<ToolResult> => {
//         let paramsUrl = 'https://crm.finereporthelp.com/WebReport/ReportServer?reportlet=attendance/hr_boardroom_adaption.cpt&op=write'
//         // 4. 选择时间段
//         if (args.time_range) {
//           paramsUrl += `&timea=${(args.time_range as string).split(',').map(item => item.split('-')[0]).join("','")}`;
//         }

//         // 2. 选择区域
//         if (args.area) {
//           paramsUrl += `&areasa=${(args.area as string).replace(',', '|')}`
//         }

//         // 3. 输入日期
//         paramsUrl += `&datesa=${args.date ?? getTodayDate()}`;

//         // 5. 输入人数
//         if (args.num_people) {
//           paramsUrl += `&numa=${args.num_people}`;
//         }

//         // 6. 选择设备
//         if (args.device) {
//           paramsUrl += `&faca=${(args.device as string).replace(',', '|')}`;
//         }

//         console.log(paramsUrl);

//         return await this.callInnerTool(() =>
//           this.navigate_to(agentContext, paramsUrl)
//         );

//         await this.callInnerTool(() =>
//           this.click_element(agentContext, args.index as number, 1, "left")
//         );


//         // 7. 点击查询
//         // await this.callInnerTool(() =>
//         //   this.click_element(agentContext, args.index as number, 1, "left")
//         // );

//         await new Promise(resolve => setTimeout(resolve, 6000));

//         // 8. 选择会议室
//         await this.callInnerTool(() =>
//           this.click_element(agentContext, args.index as number, 1, "left")
//         );

//         // 9. 点击预约
//         await this.callInnerTool(() =>
//           this.click_element(agentContext, args.index as number, 1, "left")
//         );

//         return {
//           content: [{ type: "text", text: "Book a meeting room successfully" }],
//         };
//       },
//     },
//   ];

  let agents = [
    new BrowserAgent(),
    // meetingAgent,
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