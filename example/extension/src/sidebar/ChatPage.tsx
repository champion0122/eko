import React, { useEffect, useRef, useState } from "react";
import { Welcome } from "./Welcome";
import { ChatInput } from "./components/ChatInput";
import { IAssistantMessage, Message, MessageList } from "./components/MessageList";
import { llmConfig } from "../constants/llmconfig.constant";

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
                if(data.meeting){
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

    const handleSend = (prompt: string) => {
        if (!prompt.trim()) return;
        setMessages([...messages, { role: "user", content: prompt }]);
        setPrompt("");
        setRunning(true);
        chrome.storage.local.set({ running: true, prompt });
        chrome.runtime.sendMessage({ type: "run", prompt: prompt.trim() });
    };

    return (
        <div className="flex h-full min-h-[1024px] w-full">
            <div className="relative flex-1 h-full min-h-[1024px] bg-gradient-to-b from-[#EEEDFE] to-[#E7F0FE] rounded-[20px] shadow-lg overflow-hidden flex flex-col items-center">
                {messages.length === 0 && <Welcome onSend={handleSend} />}
                {/* 消息列表 */}
                <MessageList messages={messages} running={running} streamingAssistant={streamingAssistant} isMeeting={isMeeting} />
                {/* 输入框 */}
                <ChatInput
                    value={prompt}
                    onChange={setPrompt}
                    onSend={() => handleSend(prompt)}
                    disabled={running}
                />
            </div>
            {/* <HistorySidebar /> */}
        </div>
    );
};