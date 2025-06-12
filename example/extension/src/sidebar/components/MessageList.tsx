import { Button } from "antd";
import React, { useRef, useEffect, useState } from "react";
export interface IStep {
    index: number;
    title: string;
    content?: string[];
}

export interface IUserMessage {
    role: "user";
    content: string;
}

export interface IAssistantMessage {
    role: "assistant";
    content: IStep[];
    thought?: string;
    result?: string;
}

export type Message = IUserMessage | IAssistantMessage;

interface MessageListProps {
    messages: Message[];
    running?: boolean;
    streamingAssistant?: IAssistantMessage | null;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, running, streamingAssistant }) => {
    const endRef = useRef<HTMLDivElement>(null);
    // 默认全部展开
    const [expandThought, setExpandThought] = useState<{ [key: number]: boolean }>({});

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, streamingAssistant]);

    // 新消息默认展开
    useEffect(() => {
        setExpandThought(prev => {
            const next = { ...prev };
            messages.forEach((msg, idx) => {
                if (msg.role === "assistant" && msg.thought !== undefined && next[idx] === undefined) {
                    next[idx] = true;
                }
            });
            // streamingAssistant默认展开
            if (streamingAssistant && streamingAssistant.thought !== undefined) {
                next[messages.length] = true;
            }
            return next;
        });
    }, [messages, streamingAssistant]);

    const renderMessage = (msg: Message, msgIdx: number) => {
        if (msg.role === "user") {
            return <div className="max-w-[80%] rounded-2xl px-4 py-3 text-base whitespace-break-spaces break-words bg-white text-[#222] rounded-bl-md border border-[#ececec]">{msg.content}</div>
        }
        // assistant消息卡片
        const isExpanded = expandThought[msgIdx] || false;
        return (
            <div className="max-w-[80%] bg-[#F7F8FF] border border-[#D6D9F7] rounded-[16px] px-6 py-5 text-base text-[#222] shadow-sm">
                <div className="font-bold text-[18px] text-[#222] mb-2 flex items-center gap-2">
                    思考完成
                    {msg.thought && (
                        <button
                            className="ml-2 text-xs text-[#6D6AFF] bg-transparent border-none outline-none cursor-pointer px-2 py-1 rounded hover:bg-[#ececff] transition flex items-center"
                            onClick={() => setExpandThought(prev => ({ ...prev, [msgIdx]: !isExpanded }))}
                        >
                            {isExpanded ? (
                                // 向上箭头
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path d="M19 15l-7-7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            ) : (
                                // 向下箭头
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                        </button>
                    )}
                </div>
                {msg.thought && isExpanded && (
                    <div className="text-[15px] text-[#6B6B7B] leading-[1.7] whitespace-break-spaces break-words mb-2">{msg.thought}</div>
                )}
                {msg.content?.map((step, idx) => (
                    <div key={idx} className="mb-4 last:mb-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="inline-block px-2 py-0.5 rounded-[6px] text-[14px] font-bold bg-gradient-to-r from-[#B6BFFF] to-[#A18AFF] text-transparent bg-clip-text">Step {step.index}</span>
                            <span className="font-bold text-[#222] text-[16px]">{step.title}</span>
                        </div>
                        <div className="text-[15px] text-[#6B6B7B] leading-[1.7] whitespace-break-spaces break-words">{step.content?.join("\n")}</div>
                    </div>
                ))}
                {msg.result && (
                    <div className="text-[15px] text-[#6B6B7B] leading-[1.7] whitespace-break-spaces break-words">{msg.result}</div>
                )}
            </div>
        );
    }

    return (
        <div className="flex-1 w-full px-4 py-2 overflow-y-auto bg-transparent">
            {messages.map((msg, idx) => (
                <div
                    key={idx}
                    className={`flex mb-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                    {renderMessage(msg, idx)}
                </div>
            ))}
            {/* 流式assistant消息 */}
            {streamingAssistant && (
                <div className="flex justify-start mb-4 break-words">
                    {renderMessage(streamingAssistant, messages.length)}
                </div>
            )}
            <div ref={endRef} />
        </div>
    );
};