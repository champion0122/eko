import React, { useRef, useEffect } from "react";

export interface Message {
    role: "user" | "assistant";
    content: string;
}

// const getLogStyle = (level: string) => {
//     switch (level) {
//       case "error":
//         return { color: "#ff4d4f" };
//       case "success":
//         return { color: "#52c41a" };
//       default:
//         return { color: "#1890ff" };
//     }
//   };

interface MessageListProps {
    messages: Message[];
    running?: boolean;
    streamLog?: string;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, running, streamLog }) => {
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="flex-1 w-full px-4 py-2 overflow-y-auto bg-transparent">
            {messages.map((msg, idx) => (
                <div
                    key={idx}
                    className={`flex mb-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                    {
                        <div
                            className={`max-w-[80%] rounded-2xl px-4 py-3 text-base whitespace-pre-line
              ${msg.role === "user"
                                    ? "bg-[#E6E8FA] text-[#222] rounded-br-md"
                                    : "bg-transparent text-[#222] rounded-bl-md border border-[#ececec]"}`
                            }
                        >
                            {msg.content}
                        </div>}
                </div>
            ))}
            {running && <div className="mb-4 text-gray-500">
                <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-base whitespace-pre-line bg-white text-[#222] rounded-bl-md border border-[#ececec]`}
                >
                    {streamLog}
                </div>
            </div>}
            <div ref={endRef} />
        </div>
    );
};