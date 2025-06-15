export const llmConfig = {
    llm: "azure",
    apiKey: "8e5a121e0de44a1bb7ad362820887135",
    modelName: "frgpt4o",
    options: {
        baseURL: "https://frwestusgpt.openai.azure.com/openai/deployments",
        maxTokens: 60000,
    },
}

export const claudeConfig = {
    llm: "anthropic",
    apiKey: "",
    modelName: "claude-sonnet-4-20250514",
    options: {
        baseURL: "https://api.anthropic.com/v1",
        headers: {
            "anthropic-dangerous-direct-browser-access": "true",
        }
    },
}
