import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, 
  Play, 
  Terminal, 
  Sparkles,
  MessageSquareCode,
  Flame,
  Zap,
  Users,
  Send,
  Clock,
  Wrench
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { agentApi, AgentExecutionResult, AgentChatResponse } from '../../services/agentApi';

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  agentName?: string;
  text: string;
  evidence?: string;
  tools?: string[];
  time: string;
}

export const AgentStudioView: React.FC = () => {
  const { activeZone } = useApp();
  const [selectedAgent, setSelectedAgent] = useState<string>('sentinel');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [orchestrationResults, setOrchestrationResults] = useState<AgentExecutionResult[]>([]);
  
  // Chat state
  const [inputMessage, setInputMessage] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: 'msg-01',
      sender: 'agent',
      agentName: 'Multi-Agent Orchestrator',
      text: `Welcome to the HEATSHIELD Multi-Agent Studio. I am monitoring ${activeZone} with 4 specialized agents. Ask me about thermal stress, cooling simulations, demographic exposure, or dispatch protocols.`,
      evidence: 'FortyGuard Stream Synced (Confidence: 99%)',
      tools: ['query_fortyguard_sensors', 'calculate_wbgt_stress'],
      time: '14:00',
    },
  ]);
  const [isSending, setIsSending] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const agents = [
    {
      id: 'sentinel',
      name: 'Heat Sentinel Agent',
      role: 'Thermal Anomaly & WBGT Spike Radar',
      icon: Flame,
      status: 'MONITORING',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10 border-orange-500/30',
      description: 'Continuously monitors FortyGuard microclimate telemetry stream for thermal threshold breaches.',
      tools: ['query_fortyguard_sensors', 'calculate_wbgt_stress'],
    },
    {
      id: 'vulnerable',
      name: 'Vulnerable Population Advisor',
      role: 'Demographic Risk & Shelter Dispatch',
      icon: Users,
      status: 'ACTIVE',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10 border-blue-500/30',
      description: 'Correlates heat risk polygons with vulnerable demographics (elderly, outdoor laborers, school zones).',
      tools: ['query_demographic_vulnerability', 'dispatch_shelter_routing_alert', 'enforce_labor_rest_mandate'],
    },
    {
      id: 'mitigation',
      name: 'Urban Cooling Strategist',
      role: 'Microclimate Intervention Optimizer',
      icon: Sparkles,
      status: 'ACTIVE',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/30',
      description: 'Optimizes dynamic cooling assets including misting cannons, shade structures, and street wetting.',
      tools: ['simulate_cooling_intervention', 'query_fortyguard_sensors'],
    },
    {
      id: 'grid',
      name: 'Grid & Energy Balancer',
      role: 'HVAC Load & Brownout Prevention',
      icon: Zap,
      status: 'ACTIVE',
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/30',
      description: 'Forecasts cooling energy demand spikes and manages pre-cooling schedules to prevent peak grid collapse.',
      tools: ['query_fortyguard_sensors'],
    },
  ];

  const triggerMultiAgentCycle = async () => {
    setIsSimulating(true);
    try {
      const response = await agentApi.runOrchestration(activeZone);
      setOrchestrationResults(response.agent_results || []);
    } catch (err) {
      console.error('Orchestration error:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    const userText = inputMessage.trim();
    setInputMessage('');
    
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatHistory((prev) => [...prev, userMsg]);
    setIsSending(true);

    try {
      const reply: AgentChatResponse = await agentApi.chat(userText, activeZone, selectedAgent);
      const agentMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        agentName: reply.agent_name,
        text: (reply.reply_message || '').replace(/\*/g, '').trim(),
        evidence: reply.evidence_snippet,
        tools: reply.recommended_tools,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatHistory((prev) => [...prev, agentMsg]);
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const currentAgent = agents.find((a) => a.id === selectedAgent) || agents[0];
  const activeAgentExecution = orchestrationResults.find((r) => r.agent_id === selectedAgent);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Bot className="w-6 h-6 text-orange-400" />
            Agentic AI Studio & Multi-Agent Orchestrator
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Autonomous Heat Intelligence Agents • Tool Execution Registry • Step-by-Step Reasoning
          </p>
        </div>

        <Button 
          variant="primary" 
          size="sm" 
          onClick={triggerMultiAgentCycle}
          disabled={isSimulating}
        >
          <Play className="w-3.5 h-3.5" />
          {isSimulating ? 'Orchestrating Cycle...' : 'Trigger Multi-Agent Cycle'}
        </Button>
      </div>

      {/* Agents Roster Grid (4 Agents) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {agents.map((agent) => {
          const Icon = agent.icon;
          const isSelected = selectedAgent === agent.id;
          return (
            <motion.button
              key={agent.id}
              onClick={() => setSelectedAgent(agent.id)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between h-44 ${
                isSelected
                  ? 'bg-slate-900/90 border-orange-500/50 shadow-lg shadow-orange-500/10 ring-1 ring-orange-500/30'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-xl border ${agent.bgColor} ${agent.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <Badge variant={agent.status === 'ACTIVE' ? 'success' : agent.status === 'MONITORING' ? 'thermal' : 'secondary'}>
                    {agent.status}
                  </Badge>
                </div>
                <div className="text-sm font-bold text-white leading-tight">{agent.name}</div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">{agent.role}</div>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                {agent.tools.length} Registered Tools
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Main Workspace: Reasoning Step-by-Step Graph + Interactive AI Chat Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Step-by-Step Reasoning Canvas & Tool Execution Trace */}
        <div className="lg:col-span-7 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                    <Terminal className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{currentAgent.name} — Reasoning Canvas</CardTitle>
                    <CardDescription>{currentAgent.role}</CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="font-mono text-[10px]">
                  Zone: {activeZone}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                {currentAgent.description}
              </p>

              {/* Registered Agent Tools */}
              <div>
                <div className="text-xs font-bold text-slate-200 mb-2 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-orange-400" />
                  Authorized Tool Registry:
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentAgent.tools.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-orange-300"
                    >
                      {t}()
                    </span>
                  ))}
                </div>
              </div>

              {/* Step-by-Step Reasoning Trace */}
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center justify-between">
                  <span>Step-by-Step Reasoning Chain</span>
                  <span className="text-emerald-400 text-[10px]">
                    {activeAgentExecution ? '✓ Live Executed' : 'Awaiting Cycle Trigger'}
                  </span>
                </div>

                {activeAgentExecution ? (
                  <div className="space-y-2.5">
                    {activeAgentExecution.reasoning_steps.map((step) => (
                      <div
                        key={step.step_number}
                        className="p-3.5 rounded-xl bg-[#070b14] border border-slate-800 space-y-1.5 font-mono text-xs"
                      >
                        <div className="flex items-center justify-between text-[11px] text-orange-400 font-bold">
                          <span>STEP {step.step_number}: THOUGHT</span>
                          {step.tool_call && (
                            <span className="text-slate-400 text-[10px] flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {step.tool_call.execution_time_ms}ms
                            </span>
                          )}
                        </div>
                        <p className="text-slate-200 text-[11px]">{step.thought}</p>
                        {step.action && (
                          <div className="text-[11px] text-blue-400 bg-slate-900/80 p-1.5 rounded border border-slate-800">
                            <strong>ACTION: </strong>{step.action}
                          </div>
                        )}
                        <div className="text-[11px] text-emerald-300 bg-emerald-950/20 p-2 rounded border border-emerald-900/30">
                          <strong>OBSERVATION: </strong>{step.observation}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 rounded-xl bg-slate-950/60 border border-slate-800 text-center space-y-2">
                    <p className="text-xs text-slate-400">
                      Click <strong className="text-orange-400">"Trigger Multi-Agent Cycle"</strong> above to orchestrate autonomous reasoning across all 4 agents.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 5 cols: Interactive Agentic AI Chat Console */}
        <div className="lg:col-span-5 space-y-4 flex flex-col">
          <Card className="flex-1 flex flex-col h-[580px]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquareCode className="w-4 h-4 text-orange-400" />
                  <CardTitle className="text-base">Agentic AI Chat Console</CardTitle>
                </div>
                <Badge variant="success">Online</Badge>
              </div>
              <CardDescription>Direct conversational access to multi-agent intelligence</CardDescription>
            </CardHeader>

            {/* Chat Messages Log */}
            <CardContent className="flex-1 overflow-y-auto space-y-3 p-4">
              {chatHistory.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[90%] p-3.5 rounded-2xl text-xs ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-br-none shadow-md'
                        : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-bl-none'
                    }`}
                  >
                    {msg.sender === 'agent' && (
                      <div className="flex items-center justify-between gap-2 pb-1.5 mb-1.5 border-b border-slate-800 text-[10px] font-mono text-orange-400 font-bold">
                        <span>{msg.agentName}</span>
                        <span className="text-slate-400">{msg.time}</span>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    
                    {msg.evidence && (
                      <div className="mt-2 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
                        <strong className="text-orange-300">Evidence: </strong>{msg.evidence}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </CardContent>

            {/* Quick Prompt Suggestions */}
            <div className="px-4 py-2 border-t border-slate-800/60 flex items-center gap-1.5 overflow-x-auto text-[10px] font-mono">
              <button
                type="button"
                onClick={() => setInputMessage('What is the current WBGT stress and labor risk?')}
                className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 whitespace-nowrap"
              >
                📊 WBGT Stress
              </button>
              <button
                type="button"
                onClick={() => setInputMessage('Simulate cooling misting and cool roof intervention')}
                className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 whitespace-nowrap"
              >
                ❄️ Cooling Simulation
              </button>
              <button
                type="button"
                onClick={() => setInputMessage('How many outdoor workers are exposed?')}
                className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 whitespace-nowrap"
              >
                👷 Worker Safety
              </button>
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-950/60 flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={`Ask ${currentAgent.name}...`}
                className="flex-1 h-9 px-3.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
              <Button variant="primary" size="icon" type="submit" disabled={isSending}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};
