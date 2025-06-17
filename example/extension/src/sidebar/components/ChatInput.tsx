import { Input } from "antd";
import React, { useState } from "react";

interface ChatInputProps {
  value: string;
  onChange: (v: string) => void;
  onSend: (prompt: string, condition?: string) => void;
  disabled?: boolean;
  currentSubject: string;
  setCurrentSubject: (v: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ value, onChange, onSend, disabled, currentSubject, setCurrentSubject }) => {

  const [currentTab, setCurrentTab] = useState<chrome.tabs.Tab | null>(null);
  // 处理快捷按钮点击
  const handleQuickAction = (prompt: string) => {
    // onChange(prompt);
  };

  const quickActions = [
    {
      icon: "/assets/input_icon1.svg",
      label: "截图",
      prompt: "截图",
      action: () => {
        // chrome.runtime.sendMessage({ type: "screenshot" });
      }
    },
    {
      icon: "/assets/input_icon2.svg",
      label: "连接",
      prompt: "连接",
      action: () => {
        // chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        //   const url = tabs[0].url;
        //   console.log(url);
        // });    
      }
    },
    {
      icon: "/assets/input_icon3.svg",
      label: "阅读",
      prompt: "阅读",
      action: () => {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
          const currentTab = tabs[0];
          setCurrentTab(currentTab);
        });
      }
    }
  ];

  const sendPrompt = () => {
    onSend(value, currentTab?.url ? `在${currentTab?.url}页面上，如果是当前页面就不要跳转` : "");
    setCurrentTab(null);
  }

  return (
    <>
      <div className="transition-all bg-white rounded-[12px] border-[1px] border-[#DCE4FA] focus:border-[#8C8CFF] shadow-[0_6px_20px_0_rgba(171,181,206,0.2)] p-[8px] my-[16px] mx-[20px] w-[calc(100%-40px)]">
        {currentTab && <>
          <div className="relative border border-[#08163326] text-[12px] leading-[20px] rounded-[8px] py-[8px] px-[12px] p-[8px]">
            <div className="text-[#081633] text-ellipsis overflow-hidden text-nowrap">{currentTab?.title}</div>
            <div className="text-[#08163373] text-ellipsis overflow-hidden text-nowrap">{currentTab?.url}</div>
            <div className="absolute top-0 right-0 cursor-point" onClick={() => { setCurrentTab(null) }}>
              <img src="/assets/close.svg" alt="AI" className="w-full h-full" />
            </div>
          </div>
          <div className="border h-[1px] p-x-[8px] my-[4px]"></div></>
        }
        {/* 输入区 */}
        <div className="relative w-full">
          {currentSubject && (
            <div className="absolute top-0 left-0 z-10 bg-[#ABB5CE38] rounded-[6px] px-2 py-1 text-xs pointer-events-none">
              {currentSubject}
            </div>
          )}
          <textarea
            className={`w-full resize-none text-base outline-none bg-transparent text-[#0A1833] placeholder:text-[#A0AEC0] min-h-[44px] max-h-[120px] font-['PingFang SC','Inter','sans-serif'] whitespace-break-spaces break-words ${currentSubject ? "pl-[100px]" : ""}`}
            rows={1}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="能帮你做什么"
            disabled={disabled}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendPrompt();
              } else if (e.key === "Backspace" && value.length === 0) {
                e.preventDefault();
                setCurrentSubject('');
              }
            }}
          />
        </div>
        {/* 快捷操作按钮区（输入框下方） */}
        <div className="flex justify-between w-full pt-3">
          <div className="flex gap-[2px]">
            {quickActions.map((item, idx) => (
              <button
                key={item.label}
                className="flex flex-col items-center justify-center bg-transparent rounded-[20px] w-[32px] h-[32px] transition focus:outline-none p-0 border-none"
                onClick={item.action}
                disabled={disabled}
                type="button"
              >
                <img src={item.icon} alt={item.label} className="w-[32px] h-[32px] mb-0.5 opacity-85" />
              </button>
            ))}
          </div>
          <button
            className="flex items-center justify-center w-[32px] h-[32px] ml-[12px] bg-gradient-to-r from-[#4482F7] to-[#735EFF] rounded-[20px] shadow hover:from-[#5a8fff] hover:to-[#8a7bff] transition-all disabled:opacity-60 disabled:cursor-not-allowed border-none p-0"
            onClick={sendPrompt}
            disabled={disabled || !value.trim()}
            aria-label="发送"
            type="button"
          >
            <img src="/assets/input_send.svg" alt="发送" className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>
    </>
  );
};