import { API_BASE_URL } from './apiConfig';

export interface AgentToolCall {
  tool_name: string;
  arguments: Record<string, unknown>;
  output: Record<string, unknown>;
  execution_time_ms: number;
  timestamp: string;
}

export interface AgentStepTrace {
  step_number: number;
  thought: string;
  action?: string;
  tool_call?: AgentToolCall;
  observation: string;
}

export interface AgentExecutionResult {
  agent_id: string;
  agent_name: string;
  agent_role: string;
  status: 'COMPLETED' | 'ALERT' | 'EXECUTING' | 'FAILED';
  primary_action: string;
  target_zone: string;
  reasoning_steps: AgentStepTrace[];
  evidence_data: Record<string, unknown>;
  timestamp: string;
}

export interface OrchestrationResponse {
  orchestration_id: string;
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  active_threat_level: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME' | 'CRITICAL';
  primary_synthesized_strategy: string;
  dispatched_actions_count: number;
  agent_results: AgentExecutionResult[];
  orchestrated_at: string;
}

export interface AgentChatResponse {
  agent_id: string;
  agent_name: string;
  reply_message: string;
  recommended_tools: string[];
  evidence_snippet: string;
  timestamp: string;
}

export interface AgentRosterItem {
  id: string;
  name: string;
  role: string;
  status: 'ACTIVE' | 'MONITORING' | 'IDLE' | 'STANDBY';
  color: string;
  description: string;
  tools: string[];
}

export interface RegisteredTool {
  name: string;
  description: string;
}

export interface ChatMessagePayload {
  role: 'user' | 'assistant' | 'model' | 'system';
  text: string;
}

export interface ChatOptions {
  history?: ChatMessagePayload[];
  targetAgent?: string;
  modelName?: string;
  temperature?: number;
}

export const agentApi = {
  async getRoster(): Promise<AgentRosterItem[]> {
    const res = await fetch(`${API_BASE_URL}/api/v1/agents/roster`);
    if (!res.ok) {
      throw new Error(`Roster API error: ${res.status}`);
    }
    return res.json();
  },

  async runOrchestration(zoneName: string): Promise<OrchestrationResponse> {
    const res = await fetch(`${API_BASE_URL}/api/v1/agents/orchestrate?zone_name=${encodeURIComponent(zoneName)}`, {
      method: 'POST',
    });
    if (!res.ok) {
      throw new Error(`Orchestration API error: ${res.status}`);
    }
    return res.json();
  },

  async chat(
    userMessage: string, 
    activeZone: string, 
    options?: string | ChatOptions
  ): Promise<AgentChatResponse> {
    const opts: ChatOptions = typeof options === 'string' ? { targetAgent: options } : (options || {});
    const res = await fetch(`${API_BASE_URL}/api/v1/agents/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_message: userMessage,
        active_zone: activeZone,
        target_agent: opts.targetAgent || 'orchestrator',
        history: opts.history || [],
        model_name: opts.modelName || 'gemini-1.5-flash',
        temperature: opts.temperature ?? 0.75,
      }),
    });
    if (!res.ok) {
      throw new Error(`Agent chat API error: ${res.status}`);
    }
    return res.json();
  },

  async getTools(): Promise<RegisteredTool[]> {
    const res = await fetch(`${API_BASE_URL}/api/v1/agents/tools`);
    if (!res.ok) {
      throw new Error(`Tools API error: ${res.status}`);
    }
    return res.json();
  },
};

