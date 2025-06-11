import { Agent, AgentContext } from "@eko-ai/eko";
import { Tool, ToolResult } from "@eko-ai/eko/types";

// Define agent tools
let tools: Tool[] = [
  {
    name: "meeting_room_query",
    description:
      "# 🤖 Role\n- **You are**: An expert SQL generation assistant who understands complex MySQL database schemas and can accurately generate JOIN queries, filters, and aggregations from natural language instructions involving multiple tables.\n- **Skills**: \n  - 📊 Translating natural language into efficient, accurate SQL\n  - 🧠 Interpreting multi-table relationships and field semantics\n  - 🔍 Writing optimized JOIN, WHERE, and GROUP BY clauses\n  - ✍️ Following SQL best practices for clarity and performance\n\n# 💬 Basic Output Requirements:\n- Output only valid MySQL SQL statements unless otherwise specified\n- Use explicit JOINs with table aliases for readability\n- Filter using appropriate WHERE clauses\n- Use indexed columns where possible (`book_uuid`, `book_area`, `book_time`, etc.)\n- Ensure that bit fields (`book_valid`) are handled correctly (e.g. `book_valid = b'1'`)\n- Include comments in SQL if requested, but not by default\n\n# 🗃️ Table 1: `hr_boardroom_new` — Meeting Room Information\nColumns:\n- `room_id` (int, PK): Unique meeting room ID\n- `room_area` (varchar): Area / region\n- `room_name` (varchar): Room name\n- `room_facility` (varchar): Room facilities\n- `room_remark` (varchar): Remarks\n- `room_verified` (varchar): Verification status\n- `room_minnum` (int): Minimum capacity\n- `room_maxnum` (int): Maximum capacity\n- `room_warn` (varchar): Warnings (e.g. broken equipment)\n- `room_upper_num` (int): Limit number\n- `room_picture` (varchar): Picture URL\n\n# 🗃️ Table 2: `hr_boardroom_special_new` — Special Booking Info\nColumns:\n- `book_id` (int, PK): Booking ID\n- `book_area` (char): Area\n- `book_name` (varchar): Room name\n- `book_type` (char): Booking type\n- `book_week` (varchar): Weekdays involved\n- `book_time` (time): Time of booking\n- `book_user` (char): Person who made the booking\n- `book_edit_time` (datetime): Edit timestamp\n- `book_valid` (bit): Whether the booking is valid (`b'1'` for valid)\n- `book_remark` (varchar): Remarks\n- `book_startdate` (date): Start date\n- `book_row` (int): Week index (e.g., first week of the month)\n- `book_operate_user` (varchar): Operator\n- `book_operate_time` (datetime): Operation timestamp\n- `book_uuid` (varchar): UUID for recurring meeting\n\n# 📌 Area Constraint Notes:\nWhen filtering by area (room_area or book_area), the field only supports the following enum values:\n- '南京前门', '南京后门', '帆软9层', '帆软8层', '帆软7层', '帆软6层', '帆软5层', '帆软4层', '帆软3层', '帆软2层', '帆软1层'\n\nFor logic involving city classification:\n- Area = '南京前门' or '南京后门' → classified as Nanjing\n- All other areas (starting with '帆软') → classified as Wuxi\n\nMake sure to map search area keywords like \\\"南京\\\" or \\\"无锡\\\" accordingly when constructing the WHERE clause.\n\n# 📥 How to Use:\nTo generate a SQL query, provide a **natural language query request** at the end of the prompt like this:\n\n**Query Request**: \\\"查询南京所有有效预约的会议室名称及时间\\\"\n\nThe assistant will respond with a valid MySQL SQL query using appropriate JOINs and filters.",
    parameters: {
      type: "object",
      properties: {
        sql: { type: "string", description: "sql语句" },
      },
    },
    execute: async (
      args: Record<string, unknown>,
      agentContext: AgentContext
    ): Promise<ToolResult> => {
      console.log('args', args);

      return {
        content: [{ type: "text", text: "SQL query executed" }],
      };
    },
  },
];

export let meetingAgent: Agent;

// Method one
meetingAgent = new Agent({
  name: "SQL",
  description: `会议室预约相关操作`,
  tools: tools,
});
