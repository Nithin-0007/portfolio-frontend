import { chatWithOllamaJSON, OllamaMessage } from "@/lib/ollama";
import { tools, ToolName } from "./tools";

export async function runAgentCycle(
  message: string,
  history: OllamaMessage[] = [],
  model: string = "llama3",
  isAdmin: boolean = false
) {
  console.log(`[Agent] Starting cycle for message: "${message}"`);
  
  // 1. Tool Selection Step
  const availableTools = Object.entries(tools).filter(([name]) => {
    if (isAdmin) return true;
    return !["getRecentMessages", "getSiteStats"].includes(name);
  });

  const toolDescriptions = availableTools
    .map(([name, tool]) => `${name}: ${tool.description}`)
    .join("\n");

  const selectionPrompt = `You are an AI Agent with access to the following tools:
${toolDescriptions}

Based on the user's request, decide if you need to use a tool.
If yes, respond with ONLY the tool name.
If no, respond with "NONE".

User Request: ${message}
`;

  console.log(`[Agent] Selecting tool via Ollama (${model})...`);
  const selectionResponse = await chatWithOllamaJSON(
    [{ role: "system", content: selectionPrompt }],
    model
  );

  const rawSelection = selectionResponse.message?.content?.trim() || "NONE";
  console.log(`[Agent] Raw selection response: "${rawSelection}"`);

  // Extract first word that matches an available tool
  const selectedTool = availableTools.map(([name]) => name).find(name => 
    rawSelection.toUpperCase().includes(name.toUpperCase())
  ) as ToolName | undefined || "NONE" as const;

  console.log(`[Agent] Selected tool: ${selectedTool}`);

  // 2. Execution Step (if tool selected)
  let toolResult = null;
  if (selectedTool && selectedTool !== "NONE" && tools[selectedTool]) {
    console.log(`[Agent] Executing tool: ${selectedTool}...`);
    try {
      toolResult = await tools[selectedTool].execute();
      console.log(`[Agent] Tool execution complete.`);
    } catch (e) {
      console.error(`[Agent] Tool error (${selectedTool}):`, e);
      toolResult = "Error executing tool";
    }
  }

  // 3. Final Summarization Step
  console.log(`[Agent] Returning final context to API route.`);
  const finalPrompt = toolResult 
    ? `You have just executed the '${selectedTool}' tool.
Here is the data returned:
${JSON.stringify(toolResult, null, 2)}

Based on this data, answer the user's question: "${message}"`
    : `Answer the user's question: "${message}"`;

  return {
    toolUsed: selectedTool !== "NONE" ? selectedTool : null,
    toolData: toolResult,
    finalPrompt,
  };
}
