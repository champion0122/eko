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
    error?: string;
    meetingRooms?: IMeetingRoom[];
    html?: {
        show: boolean;
        url: string;
    }
}

export type Message = IUserMessage | IAssistantMessage;

interface MessageListProps {
    messages: Message[];
    running?: boolean;
    streamLog?: string;
    streamingAssistant?: IAssistantMessage | null;
    isMeeting?: boolean;
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
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

export const MessageList: React.FC<MessageListProps> = ({ messages, running, streamingAssistant, isMeeting, setMessages }) => {
    const endRef = useRef<HTMLDivElement>(null);
    // 默认全部展开
    const [expandThought, setExpandThought] = useState<{ [key: number]: boolean }>({});
    const [selectedRoom, setSelectedRoom] = useState<string[]>([]);
    const [showAllRooms, setShowAllRooms] = useState(false);
    const [showMeetingPane, setShowMeetingPane] = useState(false);
    const [showMeetingPaneTimeout, setShowMeetingPaneTimeout] = useState<boolean>(false);
    const [booking, setBooking] = useState<boolean>(false);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, streamingAssistant]);

    const setMeetingRooms = (meetingRooms: IMeetingRoom[]) => {
        setMessages((prev) => {
            const newMessages = [...prev];
            (newMessages[newMessages.length - 1] as IAssistantMessage).meetingRooms = meetingRooms;
            return newMessages;
        });
    }

    const setError = (error: string) => {
        setMessages((prev) => {
            const newMessages = [...prev];
            (newMessages[newMessages.length - 1] as IAssistantMessage).error = error;
            return newMessages;
        });
    }

    const setMessageHtml = ({ show, url }: { show?: boolean; url?: string }) => {
        setMessages((prev) => {
            const newMessages = [...prev];
            (newMessages[newMessages.length - 1] as IAssistantMessage).html = {
                ...(newMessages[newMessages.length - 1] as IAssistantMessage).html,
                show,
                url
            };
            return newMessages;
        });
    }

    useEffect(() => {
        const messageListener = (message: any) => {
            if (!message) {
                return;
            }
            console.log("message.type ", message.type);
            if (message.type === "meeting_rooms") {
                setMeetingRooms(message.data);
            } else if (message.type === "clean_meeting_rooms") {
                setMeetingRooms([]);
                setBooking(false);
            } else if (message.type === "error") {
                console.log("error", message);
                setError(message.data);
            } else if (message.type === "html_generating") {
                chrome.storage.local.get(["report_html"], (result) => {
                    setMessageHtml({ show: true, url: result.report_html });
                });
            } else if (message.type === "report_html") {
                // console.log("report_html ", message.data);
                setMessageHtml({ url: message.data })
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

    const renderMessage = (msg: Message, msgIdx: number, isStream = false) => {
        if (msg.role === "user") {
            return <div className="max-w-[80%] rounded-2xl px-4 py-3 text-base whitespace-break-spaces break-words bg-white text-[#222] rounded-bl-md border border-[#ececec]">{msg.content}</div>
        }
        // assistant消息卡片
        const isExpanded = expandThought[msgIdx] || false;
        return (
            <div className="flex gap-3">
                <AiAvatar />
                <div className="flex-1 text-base">
                    <div className="font-[400] text-[13px] text-[#081633] mb-2 flex items-center gap-2">
                        {msg.thought && (
                            <>
                                思考完成
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
                            </>
                        )}
                    </div>
                    {msg.thought && isExpanded && (
                        <div className="border-l border-[#0816331F] text-[12px] pl-[12px] py=[4px] text-[#6B6B7B] leading-[1.7] whitespace-break-spaces break-words mb-2">{msg.thought}</div>
                    )}
                    {msg.content?.length > 1 && msg.content?.map((step, idx) => (
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
                    {msg?.meetingRooms?.length > 0 && <div>
                        <div className="flex items-center justify-between">
                            <div className="text-[12px] font-[400] text-[#081633]">若需要对步骤修改，请直接输入</div>
                            <Button className="bg-[#626FF6]" onClick={() => {
                                setShowMeetingPaneTimeout(true);
                                setTimeout(() => {
                                    setShowMeetingPane(true);
                                    setShowMeetingPaneTimeout(false);
                                }, 5000)
                            }} loading={showMeetingPaneTimeout} disabled={showMeetingPane}>执行接管</Button>
                        </div>
                        {showMeetingPane && (
                            <div className="bg-white rounded-xl shadow-[0_6px_20px_0_rgba(171,181,206,0.24)] p-6 mt-4 mb-2">
                                <div className="font-bold text-lg text-[#222] mb-3 flex items-center">
                                    <span className="mr-2">💡</span>
                                    会议室可用列表
                                </div>
                                {(showAllRooms ? msg?.meetingRooms : msg?.meetingRooms.slice(0, 4)).map(room => (
                                    <div
                                        key={room.room_id}
                                        className={`cursor-pointer bg-white/60 rounded-lg px-[12px] h-[34px] py-[7px] mb-3 flex items-center justify-between border ${selectedRoom.includes(room.room_name) ? "!bg-white !border-[#9999FF] border" : "border-[#08163326]"} ${!isMeeting ? "opacity-50" : ""}`}
                                        onClick={() => {
                                            if (!isMeeting) return;
                                            if (selectedRoom.includes(room.room_name)) {
                                                setSelectedRoom(prev => prev.filter(_room => _room !== room.room_name));
                                            } else {
                                                setSelectedRoom(prev => [...prev, room.room_name]);
                                            }
                                        }}
                                    >
                                        <div className="font-semibold text-[13px] leading-[34px] text-[#222]">{room.room_name}</div>
                                        <div className="text-sm text-[#6B6B7B] mt-1">可容纳{room.room_maxnum}人</div>
                                    </div>
                                ))}
                                {msg?.meetingRooms?.length > 4 && (
                                    <button
                                        className="text-[#626FF6] text-xs mt-1 mb-2 px-2 py-1 rounded hover:bg-[#ececff] transition"
                                        onClick={() => setShowAllRooms(v => !v)}
                                    >
                                        {showAllRooms ? '收起' : `展开全部（${msg?.meetingRooms.length}）`}
                                    </button>
                                )}
                                <Button
                                    type="primary"
                                    className="bg-[#626FF6] border-none rounded-[6px] text-white h-8 px-6 font-semibold text-sm shadow-none"
                                    style={{ boxShadow: "none" }}
                                    onClick={() => {
                                        chrome.runtime.sendMessage({ type: "run", prompt: `预约${msg?.meetingRooms[0]?.date_range}的以下会议室: ${selectedRoom.map(room => `《${room}》`).join(",")}` });
                                        setBooking(true);
                                        // chrome.storage.local.get(["bookTime"], (result) => {
                                        //     chrome.runtime.sendMessage({ type: "run", prompt: `预约${result.bookTime}的以下会议室: ${selectedRoom.map(room => `《${room}》`).join(",")}` });
                                        //     setBooking(true);
                                        // });
                                    }}
                                    loading={booking}
                                    disabled={selectedRoom.length === 0 || !isMeeting}
                                >
                                    预约
                                </Button>
                            </div>
                        )}
                    </div>}
                    {msg.result && (
                        <div className="text-[15px] text-[#6B6B7B] leading-[1.7] whitespace-break-spaces break-words">{msg.result}</div>
                    )}
                    {msg.error && (
                        <div className="text-[15px] text-[#6B6B7B] leading-[1.7] whitespace-break-spaces break-words">{msg.error}</div>
                    )}
                    {
                        msg?.html?.show && (
                            <div className="mt-[8px]">
                                {!msg?.html?.url && <span>报告生成中<AILoading/></span>}
                                {msg?.html?.url && (
                                    <div className="mb-3">
                                        <iframe 
                                            src={`data:text/html;charset=utf-8,${encodeURIComponent(msg.html.url)}`}
                                            className="w-full border border-[#ececec] rounded-lg"
                                            style={{ height: '300px' }}
                                            title="报告预览"
                                            sandbox="allow-same-origin allow-scripts"
                                        ></iframe>
                                    </div>
                                )}
                                <Button
                                    disabled={!msg?.html?.url}
                                    onClick={() => {
                                        const htmlContent = msg?.html?.url; // 你的html字符串
                                        const blob = new Blob([htmlContent], { type: "text/html" });
                                        const url = URL.createObjectURL(blob);

                                        const a = document.createElement("a");
                                        a.href = url;
                                        a.download = "report.html"; // 下载的文件名
                                        document.body.appendChild(a);
                                        a.click();
                                        document.body.removeChild(a);
                                        URL.revokeObjectURL(url);
                                    }}
                                >
                                    下载HTML
                                </Button>
                            </div>
                        )
                    }
                    {/* {isStream && <AILoading />} */}
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
                    {renderMessage(streamingAssistant, messages.length, true)}
                </div>
            )}
            {/* 当没有streamingAssistant但有running状态时显示loading */}
            {!streamingAssistant && running && (
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