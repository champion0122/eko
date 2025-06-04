import { Agent, AgentContext } from "@eko-ai/eko";
import { ToolResult } from "@eko-ai/eko/types";

const FINEBI_BROWSER_AGENT_DESCRIPTION = `You are a specialized browser operation agent for FineBI projects, focusing on precise element location.

* ELEMENT FINDING STRATEGY:
  - When tasks involve clicking on directories, themes, or similar navigation elements, prioritize searching within elements with class name 'bi-virtual-tree-list'
  - This specialized element finding helps overcome limitations of the standard browserAgent

* FINEBI SPECIFIC GUIDELINES:
  - Pay special attention to hierarchical structures in the interface
  - When dealing with tree-like navigation, ensure proper expansion of parent nodes
  - Handle dynamic loading of content in virtual lists`;

class CustomBrowserAgent extends Agent {
  protected async screenshot(
    agentContext: AgentContext
  ): Promise<{ imageBase64: string; imageType: "image/jpeg" | "image/png" }> {
    let windowId = await this.getWindowId(agentContext);
    let dataUrl = await chrome.tabs.captureVisibleTab(windowId, {
      format: "jpeg",
      quality: 60,
    });
    let data = dataUrl.substring(dataUrl.indexOf("base64,") + 7);
    return {
      imageBase64: data,
      imageType: "image/jpeg",
    };
  }

  protected async navigate_to(
    agentContext: AgentContext,
    url: string
  ): Promise<{
    url: string;
    title?: string;
    tabId?: number;
  }> {
    let windowId = await this.getWindowId(agentContext);
    let tab = await chrome.tabs.create({
      url: url,
      windowId: windowId,
    });
    tab = await this.waitForTabComplete(tab.id);
    await this.sleep(200);
    agentContext.variables.set("windowId", tab.windowId);
    let navigateTabIds = agentContext.variables.get("navigateTabIds") || [];
    navigateTabIds.push(tab.id);
    agentContext.variables.set("navigateTabIds", navigateTabIds);
    return {
      url: url,
      title: tab.title,
      tabId: tab.id,
    };
  }

  protected async get_all_tabs(
    agentContext: AgentContext
  ): Promise<Array<{ tabId: number; url: string; title: string }>> {
    let windowId = await this.getWindowId(agentContext);
    let tabs = await chrome.tabs.query({
      windowId: windowId,
    });
    let result: Array<{ tabId: number; url: string; title: string }> = [];
    for (let i = 0; i < tabs.length; i++) {
      let tab = tabs[i];
      result.push({
        tabId: tab.id,
        url: tab.url,
        title: tab.title,
      });
    }
    return result;
  }

  protected async switch_tab(
    agentContext: AgentContext,
    tabId: number
  ): Promise<{ tabId: number; url: string; title: string }> {
    let tab = await chrome.tabs.update(tabId, { active: true });
    if (!tab) {
      throw new Error("tabId does not exist: " + tabId);
    }
    agentContext.variables.set("windowId", tab.windowId);
    return {
      tabId: tab.id,
      url: tab.url,
      title: tab.title,
    };
  }

  protected async go_back(agentContext: AgentContext): Promise<any> {
    try {
      let canGoBack = await this.execute_script(
        agentContext,
        () => {
          return (window as any).navigation.canGoBack;
        },
        []
      );
      if (canGoBack + "" == "true") {
        await this.execute_script(
          agentContext,
          () => {
            (window as any).navigation.back();
          },
          []
        );
        await this.sleep(100);
        return;
      }
      let history_length = await this.execute_script(
        agentContext,
        () => {
          return (window as any).history.length;
        },
        []
      );
      if (history_length > 1) {
        await this.execute_script(
          agentContext,
          () => {
            (window as any).history.back();
          },
          []
        );
      } else {
        let navigateTabIds = agentContext.variables.get("navigateTabIds");
        if (navigateTabIds && navigateTabIds.length > 0) {
          return await this.switch_tab(
            agentContext,
            navigateTabIds[navigateTabIds.length - 1]
          );
        }
      }
      await this.sleep(100);
    } catch (e) {
      console.error("BrowserAgent, go_back, error: ", e);
    }
  }

  protected async execute_script(
    agentContext: AgentContext,
    func: (...args: any[]) => void,
    args: any[]
  ): Promise<any> {
    let tabId = await this.getTabId(agentContext);
    let frameResults = await chrome.scripting.executeScript({
      target: { tabId: tabId as number },
      func: func,
      args: args,
    });
    return frameResults[0].result;
  }

  private async getTabId(agentContext: AgentContext): Promise<number | null> {
    let windowId = await this.getWindowId(agentContext);
    let tabs = (await chrome.tabs.query({
      windowId,
      active: true,
      windowType: "normal",
    })) as any[];
    if (tabs.length == 0) {
      tabs = (await chrome.tabs.query({
        windowId,
        windowType: "normal",
      })) as any[];
    }
    return tabs[tabs.length - 1].id as number;
  }

  private async getWindowId(
    agentContext: AgentContext
  ): Promise<number | null> {
    let windowId = agentContext.variables.get("windowId") as number;
    if (windowId) {
      return windowId;
    }
    let window = await chrome.windows.getLastFocused({
      windowTypes: ["normal"],
    });
    if (!window) {
      window = await chrome.windows.getCurrent({
        windowTypes: ["normal"],
      });
    }
    if (window) {
      return window.id;
    }
    let tabs = (await chrome.tabs.query({
      windowType: "normal",
      currentWindow: true,
    })) as any[];
    if (tabs.length == 0) {
      tabs = (await chrome.tabs.query({
        windowType: "normal",
        lastFocusedWindow: true,
      })) as any[];
    }
    return tabs[tabs.length - 1].windowId as number;
  }

  private async waitForTabComplete(
    tabId: number,
    timeout: number = 8000
  ): Promise<chrome.tabs.Tab> {
    return new Promise(async (resolve, reject) => {
      const time = setTimeout(async () => {
        chrome.tabs.onUpdated.removeListener(listener);
        let tab = await chrome.tabs.get(tabId);
        if (tab.status === "complete") {
          resolve(tab);
        } else {
          resolve(tab);
        }
      }, timeout);
      const listener = async (updatedTabId: any, changeInfo: any, tab: any) => {
        if (updatedTabId == tabId && changeInfo.status === "complete") {
          chrome.tabs.onUpdated.removeListener(listener);
          clearTimeout(time);
          resolve(tab);
        }
      };
      let tab = await chrome.tabs.get(tabId);
      if (tab.status === "complete") {
        resolve(tab);
        clearTimeout(time);
        return;
      }
      chrome.tabs.onUpdated.addListener(listener);
    });
  }

  private sleep(time: number): Promise<void> {
    return new Promise((resolve) => setTimeout(() => resolve(), time));
  }
  constructor() {
    super({
      name: "CustomBrowserAgent",
      description: FINEBI_BROWSER_AGENT_DESCRIPTION,
      tools: [
        {
          name: "find_click_finebi_element",
          description:
            "Find an element in FineBI interface by text content, prioritizing elements within bi-virtual-tree-list",
          parameters: {
            type: "object",
            properties: {
              targetText: {
                type: "string",
                description: "The text content to search for in the element",
              },
              searchInTreeOnly: {
                type: "boolean",
                description:
                  "Whether to search only within bi-virtual-tree-list elements",
                default: true,
              },
            },
            required: ["targetText"],
          },
          execute: async (
            args: Record<string, unknown>,
            agentContext: AgentContext
          ): Promise<ToolResult> => {
            return await this.callInnerTool(() =>
              this.find_click_finebi_element(
                agentContext,
                args.targetText as string,
                args.searchInTreeOnly as boolean
              )
            );
          },
        },
      ],
    });
  }

  protected async find_click_finebi_element(
    agentContext: AgentContext,
    targetText: string,
    searchInTreeOnly: boolean = true
  ): Promise<ToolResult> {
    const result = await this.execute_script(
      agentContext,
      async (targetText, searchInTreeOnly) => {
        // 如果指定只在树列表中搜索
        if (searchInTreeOnly) {
          const treeList = document.querySelector(".bi-virtual-tree-list");
          if (treeList) {
            // 第一步：查找并点击目录
            const elements = treeList.querySelectorAll("*");
            const directoryElements = [];
            for (const element of elements) {
              if ((element as any).innerText === targetText) {
                directoryElements.push(element);
              }
            }
  
            // 点击找到的目录元素
            if (directoryElements.length > 0) {
              directoryElements.forEach((element) => {
                (element as any).click();
              });
  
              // 等待目录展开（使用 setTimeout 模拟等待）
              await new Promise(resolve => setTimeout(resolve, 1000));
  
              // 重新获取展开后的元素
              const expandedElements = [...treeList.querySelectorAll("*")].reverse();
              const themeElements = [];
              
              // 在展开后的内容中查找主题
              for (const element of expandedElements) {
                if ((element as any).innerText === targetText) {
                  themeElements.push(element);
                }
              }
  
              // 点击找到的主题元素
              if (themeElements.length > 0) {
                themeElements.forEach((element) => {
                  (element as any).click();
                });
                return {
                  success: true,
                  message: "Found and clicked theme element after directory expansion"
                };
              }
            }
  
            return {
              success: false,
              error: "Theme element not found after directory expansion"
            };
          }
          return {
            success: false,
            error: "Element not found in bi-virtual-tree-list"
          };
        }
  
        // 在整个页面搜索
        const allElements = document.querySelectorAll("*");
        for (const element of allElements) {
          if (element.textContent?.includes(targetText)) {
            (element as any).click();
            return {
              success: true,
              element: {
                tagName: element.tagName,
                textContent: element.textContent,
                className: element.className,
                isVisible: element.getBoundingClientRect().height > 0 && element.getBoundingClientRect().width > 0
              }
            };
          }
        }
  
        return {
          success: false,
          error: "Element not found in page"
        };
      },
      [targetText, searchInTreeOnly]
    );
  
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result)
        }
      ]
    };
  }
}

export { CustomBrowserAgent };
