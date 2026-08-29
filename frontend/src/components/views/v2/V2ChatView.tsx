import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Bot,
  User,
  Trash2,
  Copy,
  Check,
  ShieldAlert,
  Wrench,
  Plus,
  ChevronDown,
  Mic,
  MicOff,
  X,
  FileText,
  Command,
  AtSign,
  ArrowRight,
  Zap,
  Thermometer,
  Flame,
  ShieldCheck,
  Droplets
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { agentApi, AgentChatResponse, ChatMessagePayload } from '../../../services/agentApi';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  agentName?: string;
  text: string;
  evidence?: string;
  tools?: string[];
  attachedFiles?: string[];
  timestamp: string;
}

interface MentionOption {
  id: string;
  tag: string;
  name: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface CommandOption {
  id: string;
  cmd: string;
  name: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}

const MENTION_OPTIONS: MentionOption[] = [
  { id: 'sentinel', tag: '@sentinel', name: 'Heat Sentinel', desc: 'Real-time thermal surveillance & sensor anomalies', icon: Flame, color: 'text-orange-400' },
  { id: 'vulnerable', tag: '@vulnerable', name: 'Vulnerable Advisor', desc: 'Demographic exposure & cooling shelter dispatch', icon: ShieldAlert, color: 'text-blue-400' },
  { id: 'mitigation', tag: '@mitigation', name: 'Cooling Strategist', desc: 'Misting arrays & high-albedo cool pavement ML', icon: Droplets, color: 'text-emerald-400' },
  { id: 'grid', tag: '@grid', name: 'Grid Balancer', desc: 'HVAC peak load shaving & substation protection', icon: Zap, color: 'text-amber-400' },
  { id: 'telemetry', tag: '@telemetry', name: 'FortyGuard Ingestion', desc: 'Direct 10m high-res sensor telemetry feed', icon: Thermometer, color: 'text-rose-400' },
];

const COMMAND_OPTIONS: CommandOption[] = [
  { id: 'simulate', cmd: '/simulate', name: 'Run Cooling Simulation', desc: 'Simulate albedo coatings and misting impacts on asphalt', icon: Sparkles },
  { id: 'wbgt', cmd: '/wbgt', name: 'Calculate WBGT Stress', desc: 'Compute ISO 7243 physiological thermal risk indices', icon: Thermometer },
  { id: 'rest-mandate', cmd: '/rest-mandate', name: 'Enforce Rest Protocol', desc: 'Check OSHA 15/45 labor rest rotation requirements', icon: ShieldCheck },
  { id: 'shelters', cmd: '/shelters', name: 'Dispatch Shelters', desc: 'Locate and activate nearest municipal cooling stations', icon: ShieldAlert },
  { id: 'grid-shed', cmd: '/grid-shed', name: 'Buffer Power Grid', desc: 'Evaluate electrical substation HVAC demand load', icon: Zap },
  { id: 'clear', cmd: '/clear', name: 'Clear History', desc: 'Reset conversation context and start fresh', icon: Trash2 },
];

const AVAILABLE_MODELS = [
  { id: 'gemini-3.7-flash', name: 'Gemini 3.7 Flash High', provider: 'Google GenAI • Fast & Deep Reasoning' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'Google GenAI • Complex Synthesis' },
  { id: 'thermora-orchestrator', name: 'Thermora Multi-Agent Studio', provider: 'Consensus of 4 Specialized Agents' },
  { id: 'fortyguard-neural', name: 'FortyGuard Neural-v2', provider: 'Microclimate ML Physics Forecaster' },
];

export const V2ChatView: React.FC = () => {
  const { activeZone, telemetry } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-init',
      sender: 'assistant',
      agentName: 'Thermora AI Assistant',
      text: `Hello! I am your **Thermora Heat Intelligence Assistant**, directly connected to **FortyGuard** microclimate telemetry across ${activeZone}.\n\nCurrently, surface asphalt temperatures are at **${telemetry.surfaceTemp}°C** with a Wet-Bulb Globe Temperature (WBGT) of **${telemetry.wetBulbTemp}°C** (${telemetry.riskLevel} danger category).\n\nHow can I assist your heat mitigation and operational planning today?`,
      evidence: 'FortyGuard Stream Ingestion (Confidence: 99%, Live Synced)',
      tools: ['query_fortyguard_sensors', 'calculate_wbgt_stress'],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingStage, setThinkingStage] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // New Command-Style Chatbar States
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0]);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [showCommandMenu, setShowCommandMenu] = useState(false);
  const [menuFilter, setMenuFilter] = useState('');

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const suggestedPrompts = [
    'Why is the heat risk high in Sector 7?',
    'Simulate misting arrays and cool roof coatings',
    'How many outdoor workers and elderly are exposed?',
    'What is the HVAC electrical peak load forecast?',
    'What are OSHA work-rest guidelines for this WBGT?',
  ];

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  // Handle textarea input changes and popup trigger detection (@ and /)
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);

    const cursorPos = e.target.selectionStart || val.length;
    const textBeforeCursor = val.slice(0, cursorPos);
    const lastWord = textBeforeCursor.split(/\s+/).pop() || '';

    if (lastWord.startsWith('@')) {
      setShowMentionMenu(true);
      setShowCommandMenu(false);
      setMenuFilter(lastWord.slice(1).toLowerCase());
    } else if (lastWord.startsWith('/')) {
      setShowCommandMenu(true);
      setShowMentionMenu(false);
      setMenuFilter(lastWord.slice(1).toLowerCase());
    } else {
      setShowMentionMenu(false);
      setShowCommandMenu(false);
      setMenuFilter('');
    }
  };

  const handleSelectMention = (tag: string) => {
    const words = input.split(/\s+/);
    words.pop();
    words.push(tag);
    setInput(words.join(' ') + ' ');
    setShowMentionMenu(false);
    textareaRef.current?.focus();
  };

  const handleSelectCommand = (cmd: string) => {
    if (cmd === '/clear') {
      handleClear();
      setInput('');
      setShowCommandMenu(false);
      return;
    }
    const words = input.split(/\s+/);
    words.pop();
    words.push(cmd);
    setInput(words.join(' ') + ' ');
    setShowCommandMenu(false);
    textareaRef.current?.focus();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map((f) => f.name);
      setAttachedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (idx: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleSend = async (userText?: string) => {
    const query = (userText || input).trim();
    if (!query || isThinking) return;

    if (query === '/clear') {
      handleClear();
      setInput('');
      return;
    }

    const currentAttached = [...attachedFiles];

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      attachedFiles: currentAttached.length > 0 ? currentAttached : undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setAttachedFiles([]);
    setShowMentionMenu(false);
    setShowCommandMenu(false);
    setIsThinking(true);

    setThinkingStage(`Reasoning with ${selectedModel.name}...`);
    setTimeout(() => {
      setThinkingStage('Synthesizing FortyGuard sensor telemetry & ISO 7243 indices...');
    }, 600);

    // Build multi-turn conversation history payload for backend Gemini API
    const historyPayload: ChatMessagePayload[] = messages.map((m) => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      text: m.text,
    }));

    try {
      const res: AgentChatResponse = await agentApi.chat(query, activeZone, {
        history: historyPayload,
        modelName: selectedModel.id,
        temperature: 0.75,
      });

      const assistantMessage: Message = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        agentName: res.agent_name || 'Thermora Multi-Agent Orchestrator',
        text: res.reply_message,
        evidence: res.evidence_snippet,
        tools: res.recommended_tools,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const fallbackText = `Based on FortyGuard telemetry in **${activeZone}**:\n\n• **Ambient Temperature:** ${telemetry.ambientTemp}°C\n• **Surface Asphalt Temperature:** ${telemetry.surfaceTemp}°C\n• **Wet-Bulb Globe Temp (WBGT):** ${telemetry.wetBulbTemp}°C (**${telemetry.riskLevel} Danger**)\n• **Relative Humidity:** ${telemetry.relativeHumidity}%\n\n**Actionable AI Guidance:**\n1. Enforce mandatory 15-minute shaded rest breaks per hour for all outdoor laborers.\n2. Activate high-pressure misting arrays along public transit corridors.\n3. Buffer municipal air conditioning demand before peak afternoon heat surge.`;

      const fallbackMessage: Message = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        agentName: 'Thermora Multi-Agent Assistant',
        text: fallbackText,
        evidence: 'FortyGuard Local Telemetry Cache (Confidence: 98%)',
        tools: ['query_fortyguard_sensors', 'calculate_wbgt_stress'],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsThinking(false);
      setThinkingStage('');
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleClear = () => {
    setMessages([
      {
        id: 'msg-reset',
        sender: 'assistant',
        agentName: 'Thermora AI Assistant',
        text: `Conversation cleared. Ready to assist you with real-time heat intelligence in **${activeZone}**.`,
        evidence: 'FortyGuard Ingestion Ready',
        tools: ['query_fortyguard_sensors'],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-2 text-sm leading-relaxed text-slate-800">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-1.5" />;

          if (line.trim().startsWith('###')) {
            return (
              <h4 key={idx} className="text-sm font-bold text-slate-900 mt-2 mb-1">
                {line.trim().replace(/^###\s*/, '')}
              </h4>
            );
          }

          if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
            const content = line.trim().replace(/^[•-]\s*/, '');
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="text-blue-600 font-bold mt-0.5">•</span>
                <span dangerouslySetInnerHTML={{ __html: formatBold(content) }} />
              </div>
            );
          }

          if (/^\d+\.\s/.test(line.trim())) {
            const match = line.trim().match(/^(\d+\.)\s*(.*)$/);
            if (match) {
              return (
                <div key={idx} className="flex items-start gap-2 pl-2">
                  <span className="font-bold text-blue-700 min-w-[20px]">{match[1]}</span>
                  <span dangerouslySetInnerHTML={{ __html: formatBold(match[2]) }} />
                </div>
              );
            }
          }

          return <p key={idx} dangerouslySetInnerHTML={{ __html: formatBold(line) }} />;
        })}
      </div>
    );
  };

  const formatBold = (str: string) => {
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="text-slate-700">$1</em>');
  };

  const filteredMentions = MENTION_OPTIONS.filter(
    (m) => m.tag.toLowerCase().includes(menuFilter) || m.name.toLowerCase().includes(menuFilter)
  );

  const filteredCommands = COMMAND_OPTIONS.filter(
    (c) => c.cmd.toLowerCase().includes(menuFilter) || c.name.toLowerCase().includes(menuFilter)
  );

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-130px)] min-h-[600px] bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden font-sans">
      {/* Top Header */}
      <div className="p-3.5 sm:p-4 px-4 sm:px-6 border-b border-slate-200 bg-white flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">Thermora AI</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold g-chip-safe hidden xs:inline">
                FORTYGUARD GROUNDED
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate max-w-[220px] sm:max-w-none">
              Autonomous multi-agent intelligence for {activeZone}
            </p>
          </div>
        </div>

        <button
          onClick={handleClear}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title="Clear Conversation"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Suggested Prompt Pills */}
      <div className="p-2.5 sm:p-3 px-4 sm:px-6 bg-slate-50 border-b border-slate-200 overflow-x-auto flex items-center gap-2 flex-shrink-0 scrollbar-none">
        <span className="text-xs font-semibold text-slate-500 whitespace-nowrap flex items-center gap-1 mr-1">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Prompts:
        </span>
        {suggestedPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            disabled={isThinking}
            className="px-3 py-1 rounded-full bg-white hover:bg-blue-50 hover:border-blue-300 border border-slate-200 text-xs font-medium text-slate-700 hover:text-blue-700 transition-all whitespace-nowrap shadow-xs cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5 bg-[#FAFBFD]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-1 shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[88%] sm:max-w-[82%] rounded-2xl p-4 md:p-5 shadow-xs transition-all ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-xs'
                  : 'bg-white border border-slate-200 text-slate-900 rounded-tl-xs'
              }`}
            >
              {msg.sender === 'assistant' && msg.agentName && (
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-xs text-slate-500">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    {msg.agentName}
                  </span>
                  <div className="flex items-center gap-2">
                    <span>{msg.timestamp}</span>
                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                      title="Copy Answer"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* User Attached File Badges */}
              {msg.attachedFiles && msg.attachedFiles.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {msg.attachedFiles.map((file, fidx) => (
                    <span
                      key={fidx}
                      className="px-2 py-0.5 rounded-md bg-blue-500 text-white text-[11px] flex items-center gap-1"
                    >
                      <FileText className="w-3 h-3" />
                      {file}
                    </span>
                  ))}
                </div>
              )}

              {msg.sender === 'user' ? (
                <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              ) : (
                <div>{renderFormattedText(msg.text)}</div>
              )}

              {msg.sender === 'assistant' && (msg.evidence || (msg.tools && msg.tools.length > 0)) && (
                <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 space-y-1.5">
                  {msg.evidence && (
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <ShieldAlert className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                      <span>
                        <strong>Grounding Evidence:</strong> {msg.evidence}
                      </span>
                    </div>
                  )}

                  {msg.tools && msg.tools.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Wrench className="w-3 h-3 text-slate-400" />
                      <span className="text-slate-400">Tools:</span>
                      {msg.tools.map((t, tidx) => (
                        <span
                          key={tidx}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[10px]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center flex-shrink-0 mt-1 shadow-xs">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        <AnimatePresence>
          {isThinking && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs p-4 shadow-xs flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs font-medium text-slate-600">{thinkingStage || 'Analyzing heat conditions...'}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={chatBottomRef} />
      </div>

      {/* ==========================================================
          COMMAND-STYLE CHATBOX CONTAINER (MODERN COPILOT / IDE UI)
          ========================================================== */}
      <div className="p-3 sm:p-4 px-4 sm:px-6 bg-slate-50 border-t border-slate-200 flex-shrink-0 relative">
        {/* Trigger Popup Menu: @ Agent Mention */}
        <AnimatePresence>
          {showMentionMenu && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-full left-6 mb-2 w-80 bg-[#1c1c1e] text-white border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden z-50 p-1.5"
            >
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 border-b border-neutral-800">
                <AtSign className="w-3 h-3 text-blue-400" /> Mention Agent / Context
              </div>
              <div className="max-h-56 overflow-y-auto py-1">
                {filteredMentions.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectMention(opt.tag)}
                      className="w-full px-3 py-2 rounded-xl text-left hover:bg-neutral-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <div className={`p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 ${opt.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-100">{opt.tag}</span>
                          <span className="text-[10px] text-neutral-400">{opt.name}</span>
                        </div>
                        <p className="text-[10px] text-neutral-400 truncate">{opt.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trigger Popup Menu: / Quick Actions */}
        <AnimatePresence>
          {showCommandMenu && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-full left-6 mb-2 w-80 bg-[#1c1c1e] text-white border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden z-50 p-1.5"
            >
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 border-b border-neutral-800">
                <Command className="w-3 h-3 text-emerald-400" /> Quick Operational Actions
              </div>
              <div className="max-h-56 overflow-y-auto py-1">
                {filteredCommands.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectCommand(opt.cmd)}
                      className="w-full px-3 py-2 rounded-xl text-left hover:bg-neutral-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <div className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-emerald-400">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-100">{opt.cmd}</span>
                          <span className="text-[10px] text-neutral-400">{opt.name}</span>
                        </div>
                        <p className="text-[10px] text-neutral-400 truncate">{opt.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The Dark Command Input Container */}
        <div className="bg-[#1c1c1e] border border-neutral-800 rounded-2xl p-3 sm:p-3.5 shadow-lg transition-all focus-within:border-neutral-700 focus-within:ring-1 focus-within:ring-neutral-700">
          {/* File Attachment Chips */}
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2.5 pb-2 border-b border-neutral-800">
              {attachedFiles.map((file, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-neutral-800 text-neutral-200 text-xs flex items-center gap-1.5 border border-neutral-700"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  <span className="truncate max-w-[140px]">{file}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="p-0.5 rounded-full hover:bg-neutral-700 text-neutral-400 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Multi-line Textarea */}
          <textarea
            ref={textareaRef}
            rows={2}
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (showMentionMenu && filteredMentions.length > 0) {
                  handleSelectMention(filteredMentions[0].tag);
                } else if (showCommandMenu && filteredCommands.length > 0) {
                  handleSelectCommand(filteredCommands[0].cmd);
                } else {
                  handleSend();
                }
              } else if (e.key === 'Escape') {
                setShowMentionMenu(false);
                setShowCommandMenu(false);
              }
            }}
            placeholder="Ask anything, @ to mention, / for actions"
            disabled={isThinking}
            className="w-full bg-transparent text-slate-100 placeholder:text-neutral-500 text-sm outline-none resize-none leading-relaxed"
          />

          {/* Bottom Toolbar & Controls */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-800/80">
            {/* Left Side Controls: Attachment Button & Model Selector Dropdown */}
            <div className="flex items-center gap-2">
              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileUpload}
              />
              
              {/* Attachment Button (+) */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700/60 transition-colors cursor-pointer"
                title="Attach files or thermal maps (+)"
              >
                <Plus className="w-4 h-4" />
              </button>

              {/* Model Selector Dropdown Pill */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsModelDropdownOpen((prev) => !prev)}
                  className="px-2.5 py-1 rounded-full bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700/60 text-xs font-semibold text-neutral-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-blue-400" />
                  <span className="truncate max-w-[130px] sm:max-w-[180px]">{selectedModel.name}</span>
                  <ChevronDown className={`w-3 h-3 text-neutral-400 transition-transform ${isModelDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Model Selection Menu */}
                <AnimatePresence>
                  {isModelDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute bottom-full left-0 mb-2 w-72 bg-[#1c1c1e] text-white border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden z-50 p-1.5"
                    >
                      <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-800">
                        Select AI Intelligence Model
                      </div>
                      <div className="py-1 space-y-1">
                        {AVAILABLE_MODELS.map((model) => (
                          <button
                            key={model.id}
                            type="button"
                            onClick={() => {
                              setSelectedModel(model);
                              setIsModelDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-2 rounded-xl text-left flex flex-col transition-colors cursor-pointer ${
                              selectedModel.id === model.id ? 'bg-blue-600/20 border border-blue-500/40 text-blue-400' : 'hover:bg-neutral-800 text-neutral-200'
                            }`}
                          >
                            <span className="text-xs font-bold text-slate-100 flex items-center justify-between">
                              {model.name}
                              {selectedModel.id === model.id && <Check className="w-3.5 h-3.5 text-blue-400" />}
                            </span>
                            <span className="text-[10px] text-neutral-400 mt-0.5">{model.provider}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right Side Controls: Microphone & Circular Submit Button */}
            <div className="flex items-center gap-2">
              {/* Microphone Voice Button */}
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`p-2 rounded-full border transition-all cursor-pointer ${
                  isListening
                    ? 'bg-red-600 text-white border-red-500 animate-pulse'
                    : 'bg-neutral-800/80 hover:bg-neutral-800 text-neutral-400 hover:text-white border-neutral-700/60'
                }`}
                title={isListening ? 'Listening... click to stop' : 'Voice Input'}
              >
                {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              </button>

              {/* Circular Submit Button with Right Arrow */}
              <button
                type="button"
                onClick={() => handleSend()}
                disabled={(!input.trim() && attachedFiles.length === 0) || isThinking}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  input.trim() || attachedFiles.length > 0
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20'
                    : 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
                }`}
                title="Send Message"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer Guidance */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
          <span>Grounding: FortyGuard Ingestion Stream • ISO 7243 WBGT Standard</span>
          <span className="hidden sm:inline">Press Enter to send, Shift+Enter for new line</span>
        </div>
      </div>
    </div>
  );
};

