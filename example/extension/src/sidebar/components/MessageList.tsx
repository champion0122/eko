import { Button } from "antd";
import React, { useRef, useEffect, useState } from "react";
import { IMeetingRoom } from "../../background/main";
export interface IStep {
    index: number;
    title: string;
    content?: string;
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
    streamLog?: string;
    streamingAssistant?: IAssistantMessage | null;
    isMeeting?: boolean;
}

// Figma风格AI头像
const AiAvatar = () => (
    <div className="flex items-center justify-center w-[32px] h-[32px] rounded-full bg-[#626FF6]">
        <img src="/assets/ai_avatar.svg" alt="AI" className="w-full h-full" />
    </div>
);

// Figma风格loading动画
const AILoading = () => (
    <div className="flex items-center justify-center h-full gap-2 pl-2">
        <div className="flex gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#626FF6] opacity-50 animate-bounce" style={{ animationDelay: '0s' }}></span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#626FF6] opacity-50 animate-bounce" style={{ animationDelay: '0.15s' }}></span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#626FF6] opacity-50 animate-bounce" style={{ animationDelay: '0.3s' }}></span>
        </div>
    </div>
);

export const MessageList: React.FC<MessageListProps> = ({ messages, running, streamingAssistant, isMeeting }) => {
    const endRef = useRef<HTMLDivElement>(null);
    // 默认全部展开
    const [expandThought, setExpandThought] = useState<{ [key: number]: boolean }>({});
    const [meetingRooms, setMeetingRooms] = useState<IMeetingRoom[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<string[]>([]);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, streamingAssistant]);

    useEffect(() => {
        const messageListener = (message: any) => {
            if (!message) {
                return;
            }
            console.log("message.type ", message.type);
            if (message.type === "meeting_rooms") {
                setMeetingRooms(message.data);
            }
        };

        chrome.runtime.onMessage.addListener(messageListener);
        return () => {
            chrome.runtime.onMessage.removeListener(messageListener);
        };
    }, []);

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
            <div className="flex items-start gap-3">
                <AiAvatar />
                <div className="text-base">
                    <div className="font-[400] text-[13px] text-[#081633] mb-2 flex items-center gap-2">
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
                        <div className="border-l border-[#0816331F] text-[12px] pl-[12px] py=[4px] text-[#6B6B7B] leading-[1.7] whitespace-break-spaces break-words mb-2">{msg.thought}</div>
                    )}
                    {msg.content?.map((step, idx) => (
                        <div key={idx} className="mb-4 last:mb-0">
                            <div className="flex items-center gap-2 mb-1 leading-[26px]">
                                <span className="inline-block px-2 py-0.5 bg-[#E6E8FF] rounded-[6px] text-[#424BA6] text-[14px] font-bold">Step {step.index}</span>
                                <span className="font-bold text-[#222] text-[14px]">{step.title}</span>
                            </div>
                            {
                                
                            }
                            <div className="text-[15px] text-[#6B6B7B] leading-[1.7] whitespace-break-spaces break-words">{step.content}</div>
                        </div>
                    ))}
                    {meetingRooms.length > 0 && (
                        <div className="bg-white rounded-xl shadow-[0_6px_20px_0_rgba(171,181,206,0.24)] p-6 mt-4 mb-2">
                            <div className="font-bold text-lg text-[#222] mb-3 flex items-center">
                                <span className="mr-2">💡</span>
                                会议室可用列表
                            </div>
                            {meetingRooms.map(room => (
                                <div
                                    key={room.room_id}
                                    className={`cursor-pointer bg-[rgba(171,181,206,0.22)] rounded-lg p-4 mb-3 flex items-center justify-between ${selectedRoom.includes(room.room_name) ? "!bg-white !border-[#9999FF] border" : ""}`}
                                    onClick={() => {
                                        console.log("room.room_name ", room.room_name);
                                        console.log("selectedRoom ", selectedRoom);
                                        if(selectedRoom.includes(room.room_name)){
                                            setSelectedRoom(prev => prev.filter(_room => _room !== room.room_name));
                                        } else {
                                            setSelectedRoom(prev => [...prev, room.room_name]);
                                        }
                                    }}
                                >
                                     <div className="font-semibold text-base text-[#222]">{room.room_name}</div>
                                     <div className="text-sm text-[#6B6B7B] mt-1">可容纳{room.room_maxnum}人</div>
                                </div>
                            ))}
                            <Button
                                type="primary"
                                className="bg-[#626FF6] border-none rounded-[6px] text-white h-8 px-6 font-semibold text-sm shadow-none"
                                style={{ boxShadow: "none" }}
                                onClick={() => {
                                    chrome.runtime.sendMessage({ type: "run", prompt: `预约以下会议室: ${selectedRoom.map(room => `《${room}》`).join(",")}` });
                                }}
                                disabled={selectedRoom.length === 0}
                            >
                                预约
                            </Button>
                        </div>
                    )}
                    {msg.result && (
                        <div className="text-[15px] text-[#6B6B7B] leading-[1.7] whitespace-break-spaces break-words">{msg.result}</div>
                    )}
                </div>
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
            {/* 当没有streamingAssistant但有running状态时显示loading */}
            {!streamingAssistant && running && !isMeeting && (
                <div className="flex justify-start mb-4">
                    <div className="flex items-start gap-3">
                        <AiAvatar />
                        <AILoading />
                    </div>
                </div>
            )}
            <div ref={endRef} />
        </div>
    );
};