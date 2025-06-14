import React, { useEffect, useRef, useState } from "react";
import { Welcome } from "./Welcome";
import { ChatInput } from "./components/ChatInput";
import { IAssistantMessage, Message, MessageList } from "./components/MessageList";
import { llmConfig } from "../constants/llmconfig.constant";

const SUBJECTS = [
    {
        id: 1,
        title: "📖 预约会议室",
        desc: "根据近期纳斯达克的变化，制作报告"
    },
    {
        id: 2,
        title: "💡 生成报告",
        desc: "线索转化和人力资源的人员分布，生成分析报告"
    },
    {
        id: 3,
        title: "🍃 资产检索",
        desc: "线索转化和人力资源的人员分布，生成分析报告"
    }
]


export const ChatPage = () => {
    const DEFAULT_NEW_MESSAGE: IAssistantMessage = {
        role: "assistant",
        content: [],
        thought: "",
        result: "",
    };
    const [messages, setMessages] = useState<Message[]>([]);
    const [prompt, setPrompt] = useState("");
    const [running, setRunning] = useState(false);
    const [streamingAssistant, setStreamingAssistant] = useState<IAssistantMessage | null>(null);
    const [isMeeting, setIsMeeting] = useState(false);
    const [currentSubject, setCurrentSubject] = useState('');

    useEffect(() => {
        chrome.storage.sync.set(
            {
                llmConfig,
            },
            () => {
                chrome.runtime.sendMessage({ type: "init" });
            }
        );
        chrome.storage.local.get(["running", "prompt"], (result) => {
            if (result.running !== undefined) {
                setRunning(result.running);
            }
        });

        const messageListener = (message: any) => {
            if (!message) {
                return;
            }
            if (message.type === "stop") {
                setRunning(false);
                chrome.storage.local.set({ running: false });
            } else if (message.type === "message") {
                const data = message.message;

                // bad
                if (data.meeting) {
                    setIsMeeting(true);
                }
                if (message.stream) {
                    // 流式更新
                    setStreamingAssistant(prev => ({
                        ...prev,
                        ...data,
                        content: data.content || prev?.content || [],
                        thought: data.thought ?? prev?.thought,
                        result: data.result ?? prev?.result,
                        role: "assistant"
                    }));
                    // bad
                    setIsMeeting(false);
                } else if (!message.stream && data.result || data.meeting) {
                    // 流式结束，固化消息
                    setMessages(prev => [...prev, { ...streamingAssistant, ...data, role: "assistant" }]);
                    setStreamingAssistant(null);
                }
            } else if (message.type === "error") {
                setRunning(false);
                chrome.storage.local.set({ running: false });
                setMessages(prev => [...prev, { role: "assistant", content: [{ index: 0, title: "error", content: message.error }] }]);
            }
        };
        chrome.runtime.onMessage.addListener(messageListener);
        return () => {
            chrome.runtime.onMessage.removeListener(messageListener);
        };
    }, [streamingAssistant]);

    const handleSend = () => {
        if (!prompt.trim()) return;
        setMessages([...messages, { role: "user", content: prompt }]);
        setPrompt("");
        setRunning(true);
        setCurrentSubject('');
        chrome.storage.local.set({ running: true, prompt });
        chrome.runtime.sendMessage({ type: "run", prompt: prompt.trim() });
    };

    return (
        <div className="flex w-full h-full">
            <div className="relative flex-1 h-full bg-gradient-to-b from-[#EEEDFE] to-[#E7F0FE] shadow-lg overflow-hidden flex flex-col items-center">
                {messages.length === 0 && <Welcome onSend={handleSend} />}
                {/* 消息列表 */}
                {messages.length > 0 && <MessageList messages={messages} running={running} streamingAssistant={streamingAssistant} isMeeting={isMeeting} />}
                {!running && <div className="flex gap-[8px] self-end justify-start mx-[20px] w-[calc(100%-40px)]">
                    {SUBJECTS.map(item => (
                        <div key={item.id} className="cursor-pointer flex w-[100px] h-[32px] p-[6px] justify-center items-center bg-[#ABB5CE38] rounded-[6px] hover:bg-white" onClick={() => {
                            console.log(item.title)
                            setCurrentSubject(item.title)
                        }}>
                            <div className="text-[#0A1833] text-[13px] leading-[20px] font-[400]">{item.title}</div>
                        </div>
                    ))}
                </div>}
                {/* 输入框 */}
                <ChatInput
                    value={prompt}
                    onChange={setPrompt}
                    onSend={handleSend}
                    disabled={running}
                    currentSubject={currentSubject}
                />
            </div>
            {/* <HistorySidebar /> */}
        </div>
    );
};