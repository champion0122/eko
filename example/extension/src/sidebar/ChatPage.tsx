import { PlusOutlined, SendOutlined } from "@ant-design/icons";
import { Avatar, Button, Input } from "antd";
import React, { useEffect, useRef, useState } from "react"
import { Welcome } from "./Welcome";
import { ChatInput } from "./components/ChatInput";
import { Message, MessageList } from "./components/MessageList";
import { llmConfig } from "../constants/llmconfig.constant";

export const ChatPage = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [prompt, setPrompt] = useState("");
    const [running, setRunning] = useState(false);
    const [streamLog, setStreamLog] = useState<any>(null);

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
            // if (result.prompt !== undefined) {
            //   setPrompt(result.prompt);
            // }
        });

        const messageListener = (message: any) => {
            if (!message) {
                return;
            }
            if (message.type === "stop") {
                setRunning(false);
                chrome.storage.local.set({ running: false });
            } else if (message.type === "log") {
                const time = new Date().toLocaleTimeString();
                const log_message = {
                    time,
                    log: message.log,
                    level: message.level || "info",
                };
                // setMessages((prev) => {
                //     const lastMsg = prev[prev.length - 1];
                //     if (lastMsg.role === "assistant") {
                //         lastMsg.content += message.log;
                //     } else {
                //         prev.push({ role: "assistant", content: message.log });
                //     }
                //     return prev;
                // });
                if (message.stream || !message.log) {
                    setStreamLog(message.log);
                } else {
                    setMessages((prev) => {
                        const lastMsg = prev[prev.length - 1];
                        if (lastMsg.role === "assistant") {
                            lastMsg.content += message.log;
                        } else {
                            prev.push({ role: "assistant", content: message.log });
                        }
                        return prev;
                    });
                    setStreamLog('');
                }
            }
        };
        chrome.runtime.onMessage.addListener(messageListener);
        return () => {
            chrome.runtime.onMessage.removeListener(messageListener);
        };
    }, []);

    const handleSend = (prompt: string) => {
        if (!prompt.trim()) return;
        setMessages([...messages, { role: "user", content: prompt }]);
        setPrompt("");
        setRunning(true);
        chrome.storage.local.set({ running: true, prompt });
        chrome.runtime.sendMessage({ type: "run", prompt: prompt.trim() });
    };

    return (
        <div className="flex flex-col h-screen bg-[#f7f8fa]">
            {messages.length === 0 && <Welcome onSend={handleSend} />}
            {/* 消息列表 */}
            <MessageList messages={messages} running={running} streamLog={streamLog} />
            {/* 输入框 */}
            <ChatInput
                value={prompt}
                onChange={setPrompt}
                onSend={() => handleSend(prompt)}
                disabled={running}
            />
        </div>
    );
};