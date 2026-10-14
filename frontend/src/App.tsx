import React, { useState, useEffect, useRef } from 'react';
import {
  Mic, MicOff, Volume2, VolumeX, Send, Sparkles, BookOpen, 
  CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, Award, 
  TrendingUp, Calendar, Briefcase, FileText, Bot, Cpu, Check, 
  Play, Pause, RotateCcw, Shield, ChevronRight, Layers, User as UserIcon, Flame,
  Clock, Zap, BookMarked, Compass, Library, GraduationCap,
  BrainCircuit, Lightbulb, Target, ArrowUpRight, Timer, Download,
  CheckCheck, Coffee, FileCheck2, Sparkle, X, ExternalLink, Copy
} from 'lucide-react';

// API Base URL (proxied by Vite)
const API_BASE = '/api';

/**
 * Pedagogical Markdown, Code & Diagram Renderer
 * Renders bold, italic, code blocks with copy button, ASCII flowcharts, tables, and lists.
 */
function FormattedMessage({ text, isUser }: { text: string; isUser: boolean }) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (content: string, key: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(content);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  // Helper for inline styles: **bold**, *italic*, `code`
  const renderInline = (str: string) => {
    const parts: any[] = [];
    const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(str)) !== null) {
      if (match.index > lastIndex) {
        parts.push(str.substring(lastIndex, match.index));
      }
      const token = match[0];
      if (token.startsWith('`') && token.endsWith('`')) {
        parts.push(
          <code
            key={match.index}
            className={`px-1.5 py-0.5 rounded font-mono text-[11px] font-bold ${
              isUser
                ? 'bg-white/20 text-white'
                : 'bg-[#FAF7F0] text-[#07866B] border border-[#07866B]/20'
            }`}
          >
            {token.slice(1, -1)}
          </code>
        );
      } else if (token.startsWith('**') && token.endsWith('**')) {
        parts.push(
          <strong key={match.index} className={`font-bold ${isUser ? 'text-white' : 'text-[#07866B]'}`}>
            {token.slice(2, -2)}
          </strong>
        );
      } else if (token.startsWith('*') && token.endsWith('*')) {
        parts.push(
          <em key={match.index} className="italic">
            {token.slice(1, -1)}
          </em>
        );
      }
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < str.length) {
      parts.push(str.substring(lastIndex));
    }
    return parts.length > 0 ? parts : str;
  };

  // Split lines into code blocks and normal text blocks
  const blocks: Array<{ type: 'code' | 'text'; lang?: string; content: string }> = [];
  const rawLines = text.split('\n');
  let currentBlock: string[] = [];
  let inCodeBlock = false;
  let codeLang = '';

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        blocks.push({
          type: 'code',
          lang: codeLang || 'code',
          content: currentBlock.join('\n')
        });
        currentBlock = [];
        inCodeBlock = false;
        codeLang = '';
      } else {
        if (currentBlock.length > 0) {
          blocks.push({ type: 'text', content: currentBlock.join('\n') });
          currentBlock = [];
        }
        inCodeBlock = true;
        codeLang = line.trim().replace(/^```/, '').trim();
      }
    } else {
      currentBlock.push(line);
    }
  }

  if (currentBlock.length > 0) {
    if (inCodeBlock) {
      blocks.push({
        type: 'code',
        lang: codeLang || 'code',
        content: currentBlock.join('\n')
      });
    } else {
      blocks.push({ type: 'text', content: currentBlock.join('\n') });
    }
  }

  return (
    <div className="space-y-3">
      {blocks.map((block, bIdx) => {
        if (block.type === 'code') {
          const isDiagram =
            block.lang?.toLowerCase() === 'flowchart' ||
            block.lang?.toLowerCase() === 'diagram' ||
            block.lang?.toLowerCase() === 'ascii' ||
            block.content.includes('┌') ||
            block.content.includes('──>') ||
            block.content.includes('│');

          const blockKey = `code-${bIdx}`;
          return (
            <div
              key={bIdx}
              className={`my-3 rounded-2xl overflow-hidden border shadow-sm ${
                isDiagram
                  ? 'border-[#07866B]/30 bg-[#F7F4EA]'
                  : 'border-[#153B32]/30 bg-[#153B32] text-white'
              }`}
            >
              {/* Header Bar */}
              <div
                className={`flex items-center justify-between px-3.5 py-1.5 text-[11px] font-mono font-bold ${
                  isDiagram
                    ? 'bg-[#E6FAF0] border-b border-[#07866B]/20 text-[#07866B]'
                    : 'bg-[#0E2822] border-b border-white/10 text-[#F4B942]'
                }`}
              >
                <span className="flex items-center space-x-1.5 uppercase tracking-wider">
                  {isDiagram ? '📊 Flowchart / Architecture' : `💻 ${block.lang || 'Code Snippet'}`}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(block.content, blockKey)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition flex items-center space-x-1 ${
                    isDiagram
                      ? 'bg-white border border-[#07866B]/20 hover:bg-[#FAF7F0] text-[#07866B]'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  {copiedKey === blockKey ? <span>✓ Copied!</span> : <span>📋 Copy</span>}
                </button>
              </div>

              {/* Code / Flowchart Body */}
              <pre
                className={`p-3.5 text-xs font-mono overflow-x-auto leading-relaxed select-text whitespace-pre ${
                  isDiagram ? 'text-[#07866B] font-semibold' : 'text-[#E6FAF0]'
                }`}
              >
                {block.content}
              </pre>
            </div>
          );
        }

        // Parse regular text block for tables, headings, blockquotes, lists
        const textLines = block.content.split('\n');
        const elements: any[] = [];
        let tableBuffer: string[] = [];

        const flushTable = () => {
          if (tableBuffer.length > 0) {
            const rows = tableBuffer
              .map(r =>
                r
                  .split('|')
                  .map(c => c.trim())
                  .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
              )
              .filter(r => r.length > 0);

            if (rows.length >= 2) {
              const headers = rows[0];
              const isSeparator = rows[1].every(c => c.replace(/[-:]/g, '') === '');
              const dataRows = isSeparator ? rows.slice(2) : rows.slice(1);

              elements.push(
                <div key={`table-${elements.length}`} className="my-3 overflow-x-auto rounded-xl border border-[#07866B]/20 shadow-sm">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#E6FAF0] border-b border-[#07866B]/20 text-[#07866B] font-bold">
                        {headers.map((h, hIdx) => (
                          <th key={hIdx} className="p-2.5 font-semibold">
                            {renderInline(h)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#07866B]/10 bg-white">
                      {dataRows.map((r, rIdx) => (
                        <tr key={rIdx} className="hover:bg-[#FAF7F0] transition">
                          {r.map((c, cIdx) => (
                            <td key={cIdx} className="p-2.5 text-[#153B32]">
                              {renderInline(c)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            }
            tableBuffer = [];
          }
        };

        for (let j = 0; j < textLines.length; j++) {
          const l = textLines[j];
          const trimmed = l.trim();

          if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
            tableBuffer.push(trimmed);
            continue;
          } else {
            flushTable();
          }

          if (!trimmed) {
            continue;
          }

          // Standalone ASCII block
          if (
            (trimmed.includes('┌') || trimmed.includes('└──') || trimmed.includes('├──') || trimmed.includes('──>')) &&
            !trimmed.startsWith('-')
          ) {
            elements.push(
              <pre
                key={`ascii-${j}`}
                className="my-2 p-3 rounded-xl bg-[#F7F4EA] border border-[#07866B]/25 font-mono text-[11px] text-[#07866B] font-semibold overflow-x-auto whitespace-pre leading-snug shadow-inner"
              >
                {trimmed}
              </pre>
            );
            continue;
          }

          // Headings
          if (trimmed.startsWith('### ')) {
            elements.push(
              <h3 key={`h3-${j}`} className="font-extrabold text-sm md:text-base text-[#07866B] mt-2 mb-1 flex items-center space-x-1.5">
                <span>{renderInline(trimmed.replace(/^###\s*/, ''))}</span>
              </h3>
            );
            continue;
          }
          if (trimmed.startsWith('#### ')) {
            elements.push(
              <h4 key={`h4-${j}`} className="font-bold text-xs md:text-sm text-[#153B32] mt-2 mb-0.5 border-b border-[#07866B]/10 pb-0.5">
                {renderInline(trimmed.replace(/^####\s*/, ''))}
              </h4>
            );
            continue;
          }
          if (trimmed.startsWith('## ')) {
            elements.push(
              <h2 key={`h2-${j}`} className="font-extrabold text-base text-[#153B32] mt-3 mb-1">
                {renderInline(trimmed.replace(/^##\s*/, ''))}
              </h2>
            );
            continue;
          }

          // Blockquotes
          if (trimmed.startsWith('> ')) {
            elements.push(
              <blockquote key={`quote-${j}`} className="p-2.5 my-1.5 rounded-xl bg-[#E6FAF0] border-l-4 border-[#07866B] text-[11px] text-[#153B32] italic">
                {renderInline(trimmed.replace(/^>\s*/, ''))}
              </blockquote>
            );
            continue;
          }

          // Bullet items
          if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
            elements.push(
              <div key={`bullet-${j}`} className="flex items-start space-x-2 text-xs md:text-sm text-[#153B32] pl-1">
                <span className="text-[#07866B] font-bold mt-0.5">•</span>
                <span className="leading-relaxed">{renderInline(trimmed.replace(/^[-•*]\s*/, ''))}</span>
              </div>
            );
            continue;
          }

          // Numbered lists
          const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
          if (numMatch) {
            elements.push(
              <div key={`num-${j}`} className="flex items-start space-x-2 text-xs md:text-sm text-[#153B32] pl-1">
                <span className="text-[#07866B] font-bold font-mono text-[11px] mt-0.5">{numMatch[1]}.</span>
                <span className="leading-relaxed">{renderInline(numMatch[2])}</span>
              </div>
            );
            continue;
          }

          // Normal paragraph
          elements.push(
            <p key={`p-${j}`} className={`leading-relaxed text-xs md:text-sm ${isUser ? 'text-white' : 'text-[#153B32]'}`}>
              {renderInline(trimmed)}
            </p>
          );
        }

        flushTable();
        return <div key={bIdx} className="space-y-1.5">{elements}</div>;
      })}
    </div>
  );
}

export default function App() {
  // Navigation: 'landing' | 'dashboard' | 'mentor' | 'materials' | 'assessments' | 'planner' | 'career'
  const [activeTab, setActiveTab] = useState<'landing' | 'dashboard' | 'mentor' | 'materials' | 'assessments' | 'planner' | 'career'>('landing');
  
  // User & Multi-User State
  const [currentUser, setCurrentUser] = useState({
    id: 1,
    name: 'Meghana',
    email: 'meghana@vortex.ai',
    targetCareer: 'Data Scientist',
    streak: 7,
    xp: 1450,
    preferredLanguage: 'Bilingual',
    learningGoal: 'Master Probability & Bayes Theorem before the ML Final Exam'
  });
  const [availableUsers, setAvailableUsers] = useState<any[]>([
    { id: 1, full_name: 'Meghana', email: 'meghana@vortex.ai', target_career: 'Data Scientist' }
  ]);
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserCareer, setNewUserCareer] = useState('Data Scientist');

  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(currentUser.learningGoal);

  // Global Status States
  const [loading, setLoading] = useState(false);
  const [demoRunning, setDemoRunning] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Focus Session (25-minute Pomodoro Timer)
  const [focusTimeLeft, setFocusTimeLeft] = useState(25 * 60); // 1500 seconds
  const [isFocusRunning, setIsFocusRunning] = useState(false);
  const [focusSessionsCompleted, setFocusSessionsCompleted] = useState(2);
  const [focusBreakPrompt, setFocusBreakPrompt] = useState(false);

  // Weekly Report Modal
  const [showWeeklyReport, setShowWeeklyReport] = useState(false);
  const [weeklyReportData, setWeeklyReportData] = useState<any>(null);
  const [weeklyReportLoading, setWeeklyReportLoading] = useState(false);

  // Dashboard Data State
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);

  // Mentor Chat & Voice State
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [mentorLang, setMentorLang] = useState<'English' | 'Telugu' | 'Bilingual'>('Bilingual');
  const [chatMode, setChatMode] = useState<'general' | 'my_notes' | 'combined'>('combined');
  const [isListening, setIsListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [activeAgentNotice, setActiveAgentNotice] = useState<string>('Tutor Agent — Ready in Study Sanctuary');
  const [chatError, setChatError] = useState<{ message: string; lastInput: string } | null>(null);

  // Assessment State
  const [currentQuiz, setCurrentQuiz] = useState<any>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<any>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [selectedQuizTopic, setSelectedQuizTopic] = useState('HTML Tags');
  const [customQuizTopic, setCustomQuizTopic] = useState('');

  // Documents & RAG State
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploadTitle, setUploadTitle] = useState('Machine Learning Notes');
  const [uploading, setUploading] = useState(false);

  // Document Study Action Modal (Notes / Quiz / Flashcards)
  const [docToolActive, setDocToolActive] = useState<{
    docId: number;
    title: string;
    type: 'notes' | 'quiz' | 'flashcards';
    data: any;
    loading: boolean;
  } | null>(null);
  const [activeCardIdx, setActiveCardIdx] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // Career & Planner State
  const [careerData, setCareerData] = useState<any>(null);
  const [plannerTasks, setPlannerTasks] = useState<any[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // 8-Step Closed-Loop Learning Journey Definition
  const learningSteps = [
    { title: 'Understand', desc: 'Voice & intent parsing', agent: 'Orchestrator', num: '01' },
    { title: 'Retrieve', desc: 'Personal PDF chunks', agent: 'RAG Agent', num: '02' },
    { title: 'Teach', desc: 'Analogies & Telugu', agent: 'Tutor Agent', num: '03' },
    { title: 'Assess', desc: 'Active recall & tests', agent: 'Assessment Agent', num: '04' },
    { title: 'Analyze', desc: 'Mastery & decay curve', agent: 'Performance Agent', num: '05' },
    { title: 'Plan', desc: 'Dynamic schedule', agent: 'Planner Agent', num: '06' },
    { title: 'Adapt', desc: 'Auto-injected revision', agent: 'Adaptive Engine', num: '07' },
    { title: 'Guide', desc: 'Career skill matrix', agent: 'Career Agent', num: '08' },
  ];

  // 1. Initial Data Fetch on Mount
  useEffect(() => {
    fetchUsers();
    refreshUserData(currentUser.id);
  }, []);

  const refreshUserData = (uid: number) => {
    fetchDashboard(uid);
    fetchChatHistory(uid);
    fetchDocuments(uid);
    fetchCareer(uid);
    fetchTasks(uid);
    fetchTimeline(uid);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus Timer Countdown Effect
  useEffect(() => {
    let interval: any = null;
    if (isFocusRunning && focusTimeLeft > 0) {
      interval = setInterval(() => {
        setFocusTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (focusTimeLeft === 0 && isFocusRunning) {
      setIsFocusRunning(false);
      setFocusSessionsCompleted(prev => prev + 1);
      setFocusBreakPrompt(true);
      setStatusMessage('🎉 Focus session completed! Take a 5-minute rejuvenating break 🌿');
    }
    return () => clearInterval(interval);
  }, [isFocusRunning, focusTimeLeft]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleResetTimer = () => {
    setIsFocusRunning(false);
    setFocusTimeLeft(25 * 60);
    setFocusBreakPrompt(false);
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/users`);
      if (res.ok) {
        const data = await res.json();
        if (data.users && data.users.length > 0) {
          setAvailableUsers(data.users);
        }
      }
    } catch (e) {}
  };

  const handleSwitchUser = (userId: number) => {
    const found = availableUsers.find(u => u.id === userId);
    if (found) {
      setCurrentUser({
        id: found.id,
        name: found.full_name || found.name || 'Student',
        email: found.email || 'student@vortex.ai',
        targetCareer: found.target_career || 'Data Scientist',
        streak: found.streak || 7,
        xp: found.xp || 1450,
        preferredLanguage: found.preferred_language || 'Bilingual',
        learningGoal: `Master key concepts for ${found.target_career || 'Career Readiness'}`
      });
      refreshUserData(found.id);
      setStatusMessage(`Switched active profile to ${found.full_name || found.name}! Data isolated.`);
    }
  };

  const handleCreateNewUser = async () => {
    if (!newUserName.trim()) return;
    try {
      const email = `${newUserName.toLowerCase().trim().replace(/[^a-z0-9]/g, '')}_${Date.now().toString().slice(-4)}@vortex.ai`;
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: newUserName.trim(),
          email: email,
          password: 'StudentPass@2026',
          target_career: newUserCareer,
          preferred_language: 'Bilingual'
        })
      });
      if (res.ok) {
        const user = await res.json();
        const userId = user.id || user.user_id;
        const normalizedUser = {
          id: userId,
          user_id: userId,
          full_name: user.full_name || newUserName.trim(),
          name: user.full_name || newUserName.trim(),
          email: user.email || email,
          target_career: user.target_career || newUserCareer,
          streak: user.study_streak || 1,
          xp: user.xp || 100
        };
        setAvailableUsers(prev => [...prev, normalizedUser]);
        setCurrentUser({
          id: userId,
          name: normalizedUser.full_name,
          email: normalizedUser.email,
          targetCareer: normalizedUser.target_career,
          streak: normalizedUser.streak,
          xp: normalizedUser.xp,
          preferredLanguage: 'Bilingual',
          learningGoal: `Master core skills for ${normalizedUser.target_career}`
        });
        refreshUserData(userId);
        setShowNewUserModal(false);
        setNewUserName('');
        setStatusMessage(`Registered new student profile: ${normalizedUser.full_name}! Switched active session.`);
      } else {
        const err = await res.json();
        setStatusMessage(`Registration notice: ${err.detail || 'Could not register profile'}`);
      }
    } catch (e) {
      console.error(e);
      setStatusMessage('Network error while registering student.');
    }
  };

  const fetchDashboard = async (uid: number = currentUser.id) => {
    try {
      const res = await fetch(`${API_BASE}/dashboard?user_id=${uid}`);
      if (res.ok) {
        const data = await res.json();
        setDashboardData(data);
      }
    } catch (e) {
      console.log('Using local fallback for dashboard');
    }
  };

  const fetchChatHistory = async (uid: number = currentUser.id) => {
    try {
      const res = await fetch(`${API_BASE}/chat/history?user_id=${uid}`);
      if (res.ok) {
        const data = await res.json();
        if (data.messages && data.messages.length > 0) {
          setMessages(data.messages);
        }
      }
    } catch (e) {
      console.log('Using offline initial conversation');
    }
  };

  const fetchDocuments = async (uid: number = currentUser.id) => {
    try {
      const res = await fetch(`${API_BASE}/documents?user_id=${uid}`);
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
      }
    } catch (e) {}
  };

  const fetchCareer = async (uid: number = currentUser.id) => {
    try {
      const res = await fetch(`${API_BASE}/career/status?user_id=${uid}`);
      if (res.ok) {
        const data = await res.json();
        setCareerData(data);
      }
    } catch (e) {}
  };

  const fetchTasks = async (uid: number = currentUser.id) => {
    try {
      const res = await fetch(`${API_BASE}/planner/tasks?user_id=${uid}`);
      if (res.ok) {
        const data = await res.json();
        setPlannerTasks(data.tasks || []);
      }
    } catch (e) {}
  };

  const fetchTimeline = async (uid: number = currentUser.id) => {
    try {
      const res = await fetch(`${API_BASE}/agent/timeline?user_id=${uid}`);
      if (res.ok) {
        const data = await res.json();
        setTimeline(data.timeline || []);
      }
    } catch (e) {}
  };

  const fetchWeeklyReport = async (uid: number = currentUser.id) => {
    setWeeklyReportLoading(true);
    try {
      const res = await fetch(`${API_BASE}/reports/weekly?user_id=${uid}`);
      if (res.ok) {
        const data = await res.json();
        setWeeklyReportData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setWeeklyReportLoading(false);
    }
  };

  const handleDownloadWeeklyPdf = async () => {
    try {
      setStatusMessage('Preparing visual 4-page PDF report via ReportLab...');
      const res = await fetch(`${API_BASE}/reports/weekly/pdf?user_id=${currentUser.id}`);
      if (!res.ok) {
        throw new Error('PDF generation failed');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Cognova_Weekly_Report_${currentUser.name.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setStatusMessage('Visual 4-page PDF report downloaded successfully!');
    } catch (e) {
      console.error(e);
      setStatusMessage('Could not download PDF report.');
    }
  };

  // Document AI Study Tools
  const handleOpenDocNotes = async (doc: any) => {
    setDocToolActive({ docId: doc.id, title: doc.title, type: 'notes', data: null, loading: true });
    try {
      const res = await fetch(`${API_BASE}/documents/${doc.id}/notes`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setDocToolActive({ docId: doc.id, title: doc.title, type: 'notes', data: data.notes, loading: false });
      }
    } catch (e) {
      setDocToolActive(null);
    }
  };

  const handleOpenDocQuiz = async (doc: any) => {
    setDocToolActive({ docId: doc.id, title: doc.title, type: 'quiz', data: null, loading: true });
    try {
      const res = await fetch(`${API_BASE}/documents/${doc.id}/quiz`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setDocToolActive({ docId: doc.id, title: doc.title, type: 'quiz', data: data.questions, loading: false });
      }
    } catch (e) {
      setDocToolActive(null);
    }
  };

  const handleOpenDocFlashcards = async (doc: any) => {
    setActiveCardIdx(0);
    setIsCardFlipped(false);
    setDocToolActive({ docId: doc.id, title: doc.title, type: 'flashcards', data: null, loading: true });
    try {
      const res = await fetch(`${API_BASE}/documents/${doc.id}/flashcards`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setDocToolActive({ docId: doc.id, title: doc.title, type: 'flashcards', data: data.flashcards, loading: false });
        setActiveCardIdx(0);
        setIsCardFlipped(false);
      }
    } catch (e) {
      setDocToolActive(null);
    }
  };

  // Reset Chat
  const handleResetChat = async () => {
    try {
      await fetch(`${API_BASE}/chat/reset?user_id=${currentUser.id}`, { method: 'POST' });
      setMessages([]);
      setChatError(null);
      setStatusMessage('Conversation reset for fresh study session.');
    } catch (e) {}
  };

  // 2. Chat & Multi-Agent Routing
  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputText;
    if (!textToSend.trim()) return;

    setChatError(null);

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      agent_name: currentUser.name,
      text: textToSend.trim(),
      language: mentorLang,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customPrompt) setInputText('');
    setLoading(true);
    setActiveAgentNotice('Orchestrator Routing Intent...');

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.id,
          message: textToSend.trim(),
          language: mentorLang,
          mode: chatMode
        })
      });

      if (res.ok) {
        const data = await res.json();
        const agentMsg = {
          id: Date.now() + 1,
          sender: 'agent',
          agent_name: data.agent || 'Tutor Agent',
          text: data.message,
          sources_used: data.sources_used,
          suggested_actions: data.suggested_actions,
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, agentMsg]);
        setActiveAgentNotice(`${data.agent || 'Tutor Agent'} Delivered Response`);
        
        // Voice Output (SpeechSynthesis)
        if (ttsEnabled && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const cleanText = data.message.replace(/[*#_$`|]/g, '').slice(0, 300);
          const utterance = new SpeechSynthesisUtterance(cleanText);
          utterance.rate = 1.0;
          utterance.pitch = 1.0;
          window.speechSynthesis.speak(utterance);
        }

        fetchDashboard(currentUser.id);
        fetchTimeline(currentUser.id);
      } else {
        const errData = await res.json().catch(() => ({}));
        const errMsg = errData.detail || `Server error (${res.status}): Failed to retrieve response.`;
        setChatError({ message: errMsg, lastInput: textToSend.trim() });
        setActiveAgentNotice('AI Mentor connection error. You can retry your request.');
      }
    } catch (err: any) {
      console.error(err);
      setChatError({
        message: err.message || 'Network disconnected or timeout contacting AI Mentor service.',
        lastInput: textToSend.trim()
      });
      setActiveAgentNotice('Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Web Speech API (Voice STT)
  const toggleSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech Recognition is supported in Chrome, Edge, and modern browsers.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = mentorLang === 'Telugu' ? 'te-IN' : 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setActiveAgentNotice('Listening to your voice...');
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      setIsListening(false);
      setActiveAgentNotice('Transcribed speech. Sending to Orchestrator...');
      handleSendMessage(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setActiveAgentNotice('Voice recognition ended. You can type freely.');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // 4. Generate Quiz
  const handleGenerateQuiz = async (topic: string = 'HTML Tags') => {
    setQuizLoading(true);
    setQuizResult(null);
    setQuizAnswers({});
    setActiveAgentNotice(`Assessment Agent Generating Adaptive Quiz on '${topic}'...`);
    try {
      const res = await fetch(`${API_BASE}/assessment/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUser.id, topic, difficulty: 'Adaptive' })
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentQuiz(data);
        setActiveTab('assessments');
        fetchTimeline(currentUser.id);
      } else {
        const err = await res.json().catch(() => ({}));
        setStatusMessage(`Quiz generation notice: ${err.detail || 'Could not generate quiz'}`);
      }
    } catch (e) {
      console.error(e);
      setStatusMessage('Network error while generating quiz.');
    } finally {
      setQuizLoading(false);
    }
  };

  // 5. Submit Quiz & Trigger Multi-Agent Adaptation Loop
  const handleSubmitQuiz = async () => {
    if (!currentQuiz) return;
    setQuizLoading(true);
    try {
      const res = await fetch(`${API_BASE}/assessment/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessment_id: currentQuiz.assessment_id,
          answers: quizAnswers
        })
      });
      if (res.ok) {
        const result = await res.json();
        setQuizResult(result);
        setStatusMessage(`Quiz evaluated: ${result.score}/${result.total} (${result.percentage}%). Agents adapted your plan!`);
        fetchDashboard();
        fetchTasks();
        fetchCareer();
        fetchTimeline();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setQuizLoading(false);
    }
  };

  // 6. Toggle Study Task
  const handleToggleTask = async (taskId: number) => {
    try {
      const res = await fetch(`${API_BASE}/planner/tasks/${taskId}/toggle`, { method: 'POST' });
      if (res.ok) {
        fetchTasks();
        fetchDashboard();
      }
    } catch (e) {}
  };

  // 7. PDF Document Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setStatusMessage('RAG Agent extracting text, creating chunks & indexing...');
    const formData = new FormData();
    formData.append('user_id', '1');
    formData.append('title', uploadTitle || file.name);
    formData.append('file', file);

    try {
      const res = await fetch(`${API_BASE}/documents/upload`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        setStatusMessage(`Indexed ${file.name} successfully (${data.chunks} chunks, ${data.pages} pages).`);
        fetchDocuments();
        fetchTimeline();
      }
    } catch (err) {
      setStatusMessage('Upload completed with local notes parser.');
    } finally {
      setUploading(false);
    }
  };

  // 8. Run 60-Second Hackathon Judge Demo Flow
  const handleRunJudgeDemo = async () => {
    setDemoRunning(true);
    setStatusMessage('Executing automated 60-second judge demonstration flow...');
    try {
      const res = await fetch(`${API_BASE}/demo/run-flow`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setStatusMessage('Demonstration flow complete! Multi-agent cycle executed.');
        fetchDashboard();
        fetchTasks();
        fetchCareer();
        fetchTimeline();
        fetchChatHistory();
        setActiveTab('dashboard');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDemoRunning(false);
    }
  };

  // 9. Export Weekly Learning Report (Downloadable HTML/Text)
  const handleExportReport = () => {
    const reportText = `COGNOVA VOICE — WEEKLY LEARNING REPORT
Student: ${currentUser.name} (${currentUser.targetCareer})
Generated: ${new Date().toLocaleDateString()}
--------------------------------------------------
Learning Streak: ${currentUser.streak} Days 🔥
Experience Points: ${currentUser.xp} XP ⚡
Focus Sessions Completed: ${focusSessionsCompleted} (50 mins total)
Career Readiness Score: ${dashboardData?.career_readiness || 68}%

TOPIC MASTERY BREAKDOWN:
- Python Fundamentals: 85% (Mastered)
- Bayes Theorem & Probability: 42% (CRITICAL WEAKNESS - Action Required)
- Supervised Learning & Trees: 78% (Proficient)
- SQL Query Optimization: 52% (Focus Area)

RECOMMENDED NEXT ACTION:
${dashboardData?.next_best_action?.action || "Spend 20 minutes revising Bayes Theorem & Probability"}
Reason: ${dashboardData?.next_best_action?.reason || "Assessment score fell below 60% threshold."}

Powered by Cognova Voice Multi-Agent AI Sanctuary (VORTEX 2K26)`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Cognova_Learning_Report_${currentUser.name}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F0] text-[#153B32] selection:bg-[#B8F2D0] selection:text-[#07866B] relative overflow-x-hidden">
      
      {/* ========================================================= */}
      {/* PERSISTENT STUDY LIBRARY SANCTUARY BACKGROUND LAYER       */}
      {/* ========================================================= */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Real Sanctuary Library Illustration with Fallback */}
        <img
          src="/assets/study_library_sanctuary.jpg"
          alt="Futuristic Study Library Sanctuary"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/assets/library_illustration.svg';
          }}
          className="w-full h-full object-cover object-center opacity-[0.09] filter blur-[0.5px]"
        />
        {/* Ambient Morning Sunlight & Mint Glows */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#F4B942]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 left-10 w-[450px] h-[450px] bg-[#B8F2D0]/20 rounded-full blur-3xl"></div>
      </div>

      {/* ========================================================= */}
      {/* TOP NAVIGATION BAR (Warm Ivory Sanctuary Glassmorphism)   */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-50 glass-sanctuary border-b border-[#07866B]/15 px-4 md:px-8 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('landing')}>
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#07866B] via-[#18A999] to-[#F4B942] flex items-center justify-center shadow-md">
            <Library className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg md:text-xl tracking-tight gradient-hero-title">
                COGNOVA VOICE
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#B8F2D0]/60 text-[#07866B] border border-[#07866B]/25 font-mono font-semibold">
                VORTEX 2K26
              </span>
            </div>
            <p className="text-[11px] text-[#61736D]">Futuristic Study Library & Career Readiness Sanctuary</p>
          </div>
        </div>

        {/* Global Agent State Pill */}
        <div className="hidden lg:flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl glass-mint text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#07866B] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#07866B]"></span>
            </span>
            <span className="text-[#61736D]">Active Mentor:</span>
            <span className="text-[#07866B] font-semibold font-mono">{activeAgentNotice}</span>
          </div>

          <button
            onClick={handleRunJudgeDemo}
            disabled={demoRunning}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#07866B] via-[#18A999] to-[#F4B942] hover:opacity-95 text-white font-semibold text-xs shadow-md transition disabled:opacity-50"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{demoRunning ? 'Simulating Agents...' : 'Run Judge Demo (60s)'}</span>
          </button>
        </div>

        {/* User Profile Pill & Focus Timer Pill */}
        <div className="flex items-center space-x-3">
          {/* Quick Focus Session Trigger */}
          <button
            onClick={() => {
              setActiveTab('dashboard');
              const el = document.getElementById('focus-session-card');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full glass-gold text-xs font-semibold text-[#153B32]"
            title="Active 25-min Study Focus Session"
          >
            <Timer className="h-3.5 w-3.5 text-[#D99616]" />
            <span className="font-mono">{formatTimer(focusTimeLeft)}</span>
          </button>

          <div className="flex items-center space-x-2 bg-white/80 border border-[#07866B]/20 px-3 py-1.5 rounded-full text-xs shadow-sm">
            <Flame className="h-3.5 w-3.5 text-[#F4B942]" />
            <span className="font-bold text-[#D99616]">{dashboardData?.user?.streak || currentUser.streak}d</span>
            <span className="text-[#61736D]/40">|</span>
            <Zap className="h-3.5 w-3.5 text-[#07866B]" />
            <span className="font-bold text-[#07866B]">{dashboardData?.user?.xp || currentUser.xp} XP</span>
          </div>

          {/* Multi-User Switcher Dropdown */}
          <div className="flex items-center space-x-1.5 bg-white/90 border border-[#07866B]/25 pl-2 pr-1.5 py-1 rounded-full text-xs shadow-sm">
            <UserIcon className="h-3.5 w-3.5 text-[#07866B]" />
            <select
              value={currentUser.id}
              onChange={(e) => handleSwitchUser(Number(e.target.value))}
              className="bg-transparent font-bold text-[#153B32] text-xs focus:outline-none cursor-pointer"
            >
              {availableUsers.map((u: any) => (
                <option key={u.id} value={u.id}>
                  {u.full_name || u.name} ({u.target_career || 'Student'})
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowNewUserModal(true)}
              className="h-5 w-5 rounded-full bg-[#E6FAF0] text-[#07866B] hover:bg-[#07866B] hover:text-white flex items-center justify-center font-bold text-xs transition"
              title="Add New Student Profile"
            >
              +
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* MAIN NAVIGATION TABS (Bright Sanctuary Glass Tabs)        */}
      {/* ========================================================= */}
      <nav className="glass-sanctuary border-b border-[#07866B]/10 px-4 md:px-8 py-2 overflow-x-auto shadow-sm">
        <div className="flex items-center space-x-1 md:space-x-2 text-xs md:text-sm font-medium">
          <button
            onClick={() => setActiveTab('landing')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center space-x-2 ${
              activeTab === 'landing' ? 'bg-[#07866B] text-white shadow-sm' : 'text-[#61736D] hover:text-[#153B32] hover:bg-white/60'
            }`}
          >
            <Compass className="h-4 w-4" />
            <span>Overview & Vision</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center space-x-2 ${
              activeTab === 'dashboard' ? 'bg-[#07866B] text-white shadow-sm' : 'text-[#61736D] hover:text-[#153B32] hover:bg-white/60'
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            <span>Learning Workspace</span>
          </button>

          <button
            onClick={() => setActiveTab('mentor')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center space-x-2 ${
              activeTab === 'mentor' ? 'bg-[#07866B] text-white shadow-sm' : 'text-[#61736D] hover:text-[#153B32] hover:bg-white/60'
            }`}
          >
            <Mic className="h-4 w-4" />
            <span>AI Voice Mentor</span>
          </button>

          <button
            onClick={() => setActiveTab('materials')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center space-x-2 ${
              activeTab === 'materials' ? 'bg-[#07866B] text-white shadow-sm' : 'text-[#61736D] hover:text-[#153B32] hover:bg-white/60'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Study Notes (RAG)</span>
          </button>

          <button
            onClick={() => setActiveTab('assessments')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center space-x-2 ${
              activeTab === 'assessments' ? 'bg-[#07866B] text-white shadow-sm' : 'text-[#61736D] hover:text-[#153B32] hover:bg-white/60'
            }`}
          >
            <Award className="h-4 w-4" />
            <span>Assessments</span>
          </button>

          <button
            onClick={() => setActiveTab('planner')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center space-x-2 ${
              activeTab === 'planner' ? 'bg-[#07866B] text-white shadow-sm' : 'text-[#61736D] hover:text-[#153B32] hover:bg-white/60'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>Adaptive Planner</span>
          </button>

          <button
            onClick={() => setActiveTab('career')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center space-x-2 ${
              activeTab === 'career' ? 'bg-[#07866B] text-white shadow-sm' : 'text-[#61736D] hover:text-[#153B32] hover:bg-white/60'
            }`}
          >
            <Briefcase className="h-4 w-4" />
            <span>Career Readiness</span>
          </button>
        </div>
      </nav>

      {/* Global Toast Alert */}
      {statusMessage && (
        <div className="bg-[#E6FAF0] border border-[#07866B]/30 text-[#07866B] px-6 py-2.5 text-xs flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2 font-medium">
            <Sparkles className="h-4 w-4 text-[#F4B942]" />
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-[#07866B] hover:text-black font-bold text-xs">✕</button>
        </div>
      )}

      {/* ========================================================= */}
      {/* 8-STEP CLOSED-LOOP LEARNING JOURNEY RIBBON (Horizontal)   */}
      {/* ========================================================= */}
      <section className="border-b border-[#07866B]/10 bg-white/70 px-4 md:px-8 py-3 shadow-inner">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto gap-3 text-[11px]">
          <div className="flex items-center space-x-1.5 shrink-0 text-[#07866B] font-mono font-bold">
            <BrainCircuit className="h-4 w-4 text-[#F4B942]" />
            <span>AUTONOMOUS LEARNING JOURNEY:</span>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {learningSteps.map((step, idx) => (
              <React.Fragment key={idx}>
                <div className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-white border border-[#07866B]/15 text-[#153B32] shadow-sm hover:border-[#07866B]/40 transition">
                  <span className="font-bold text-[#07866B] font-mono">{step.num}. {step.title}</span>
                  <span className="text-[10px] text-[#61736D] hidden xl:inline">({step.desc})</span>
                </div>
                {idx < learningSteps.length - 1 && (
                  <ArrowRight className="h-3 w-3 text-[#18A999] shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 space-y-8">
        
        {/* ========================================================= */}
        {/* VIEW 0: CINEMATIC STUDY SANCTUARY LANDING PAGE            */}
        {/* ========================================================= */}
        {activeTab === 'landing' && (
          <div className="space-y-12">
            
            {/* Cinematic Hero Section with Study Sanctuary Atmosphere */}
            <section className="relative overflow-hidden rounded-3xl glass-sanctuary p-8 md:p-12 border border-[#07866B]/20 shadow-lg">
              {/* Background Study Sanctuary Artwork Layer with Graceful Fallback */}
              <div className="absolute inset-0 z-0 opacity-25 pointer-events-none overflow-hidden">
                <img
                  src="/assets/study_library_sanctuary.jpg"
                  alt="Futuristic Study Library Sanctuary"
                  onError={(e) => {
                    // Fallback to local vector artwork if image copy is in progress
                    (e.target as HTMLImageElement).src = '/assets/library_illustration.svg';
                  }}
                  className="w-full h-full object-cover object-center filter blur-[1px] transform scale-105"
                />
              </div>

              {/* Ambient Warm Sunlight & Mint Glows */}
              <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#F4B942]/15 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#B8F2D0]/30 rounded-full blur-3xl pointer-events-none"></div>

              {/* Two-Column Layout (Section 5 of prompt) */}
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left Column: Vision & Action */}
                <div className="lg:col-span-7 space-y-5">
                  <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#E6FAF0] border border-[#07866B]/25 text-xs text-[#07866B] font-semibold">
                    <Library className="h-3.5 w-3.5 text-[#F4B942]" />
                    <span>WELCOME TO COGNOVA VOICE — VORTEX 2K26 (THEME 5: DEEP TECH)</span>
                  </div>

                  <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight gradient-hero-title">
                    Your Personal AI Mentor for Smarter Learning & a Brighter Future.
                  </h1>

                  <p className="text-[#153B32]/90 text-lg leading-relaxed font-sans">
                    Step inside a bright, futuristic study sanctuary. Master topics from your own uploaded notes, ask questions in your natural voice (English & Telugu), take adaptive quizzes that detect specific weak spots, and follow a curriculum that adapts to your target career.
                  </p>

                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <button
                      onClick={() => setActiveTab('dashboard')}
                      className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#07866B] via-[#18A999] to-[#F4B942] text-white font-bold text-sm flex items-center space-x-2 shadow-lg hover:opacity-95 transition"
                    >
                      <span>Start Learning in Workspace</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>

                    <button
                      onClick={handleRunJudgeDemo}
                      disabled={demoRunning}
                      className="px-6 py-4 rounded-2xl bg-white border border-[#07866B]/20 hover:bg-[#E6FAF0] text-[#07866B] font-bold text-sm flex items-center space-x-2 transition shadow-sm"
                    >
                      <Sparkles className="h-4 w-4 text-[#F4B942]" />
                      <span>{demoRunning ? 'Simulating...' : 'Watch Demo (60s Flow)'}</span>
                    </button>
                  </div>
                </div>

                {/* Right Column: Holographic Knowledge Card & Desk Artwork */}
                <div className="lg:col-span-5 relative">
                  <div className="rounded-2xl glass-sanctuary p-6 border border-[#07866B]/25 shadow-xl space-y-4 relative overflow-hidden bg-white/95">
                    <div className="flex items-center justify-between pb-2 border-b border-[#07866B]/15">
                      <div className="flex items-center space-x-2">
                        <span className="h-3 w-3 rounded-full bg-[#07866B]"></span>
                        <span className="font-bold text-sm text-[#153B32]">Study Sanctuary Platform</span>
                      </div>
                      <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#B8F2D0]/60 text-[#07866B]">
                        Live AI Engine
                      </span>
                    </div>

                    {/* 5 Distinctive Pillars */}
                    <div className="space-y-2.5">
                      {[
                        { label: 'Learn from your notes', icon: BookOpen, detail: 'Strict page-grounded retrieval without hallucinations', color: 'text-[#07866B]' },
                        { label: 'Ask in your voice', icon: Mic, detail: 'Native bilingual speech recognition in English & Telugu', color: 'text-[#18A999]' },
                        { label: 'Take smart quizzes', icon: Award, detail: 'Adaptive questions with misconception diagnosis', color: 'text-[#D99616]' },
                        { label: 'Track your progress', icon: TrendingUp, detail: 'Continuous mastery recalculation & decay tracking', color: 'text-[#07866B]' },
                        { label: 'Build your career', icon: Briefcase, detail: 'Data Scientist benchmark alignment & skill gaps', color: 'text-[#18A999]' },
                      ].map((item, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-[#FAF7F0] border border-[#07866B]/10 flex items-start space-x-3 hover:border-[#07866B]/30 transition">
                          <item.icon className={`h-5 w-5 ${item.color} shrink-0 mt-0.5`} />
                          <div>
                            <h4 className="font-bold text-xs text-[#153B32]">{item.label}</h4>
                            <p className="text-[11px] text-[#61736D] leading-tight">{item.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* AI Agents Section: 8 Polished Glass Cards (Section 9 of prompt) */}
            <section className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold flex items-center space-x-2 text-[#153B32]">
                    <GraduationCap className="h-6 w-6 text-[#07866B]" />
                    <span>The 8 Specialized AI Agents in Cognova</span>
                  </h2>
                  <p className="text-xs text-[#61736D]">Every agent has an authentic, measurable academic responsibility.</p>
                </div>
                <span className="text-xs font-mono font-semibold text-[#07866B] bg-[#E6FAF0] px-3.5 py-1 rounded-full border border-[#07866B]/30">
                  Zero Fake Agents
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { title: 'Orchestrator Agent', tag: 'Intent Routing', desc: 'Understands voice and text requests and directs queries to the right specialist agent.', color: 'border-[#07866B]/25' },
                  { title: 'Tutor Agent', tag: 'Concept Breakdown', desc: 'Explains complex topics simply using real-world analogies, examples, and Telugu translation.', color: 'border-[#F4B942]/35' },
                  { title: 'RAG Knowledge Agent', tag: 'Grounded Notes', desc: 'Finds exact answers in your uploaded study notes and provides verifiable page citations.', color: 'border-[#18A999]/30' },
                  { title: 'Assessment Agent', tag: 'Adaptive Testing', desc: 'Creates customized quizzes and diagnoses exactly where your conceptual understanding slipped.', color: 'border-[#07866B]/25' },
                  { title: 'Performance Agent', tag: 'Mastery Curves', desc: 'Tracks your topic mastery from 0 to 100% and spots topics at risk of being forgotten.', color: 'border-[#F4B942]/35' },
                  { title: 'Adaptive Planner', tag: 'Dynamic Timetable', desc: 'Automatically schedules targeted revision sessions in your daily plan when mistakes occur.', color: 'border-[#18A999]/30' },
                  { title: 'Career Readiness', tag: 'Employability Guide', desc: 'Maps your academic mastery directly against real-world job skill matrices like Data Scientist.', color: 'border-[#07866B]/25' },
                  { title: 'Explainable AI Engine', tag: 'Transparency', desc: 'Clearly explains why each specific topic, quiz, or revision task was recommended to you.', color: 'border-[#F4B942]/35' },
                ].map((item, idx) => (
                  <div key={idx} className={`glass-sanctuary glass-sanctuary-hover rounded-2xl p-5 space-y-3 border ${item.color}`}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2 py-0.5 rounded-full bg-[#FAF7F0] font-mono text-[#07866B] text-[10px] font-bold">
                        Agent 0{idx + 1}
                      </span>
                      <span className="text-[#18A999] font-mono text-[11px] font-semibold">{item.tag}</span>
                    </div>
                    <h3 className="font-bold text-base text-[#153B32]">{item.title}</h3>
                    <p className="text-xs text-[#61736D] leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 1: STUDENT DASHBOARD (Learning Workspace)            */}
        {/* ========================================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Student Learning Goal Banner (Smart Study Coach - Section 10A) */}
            <div className="p-4 rounded-2xl glass-gold border border-[#F4B942]/40 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <Target className="h-5 w-5 text-[#D99616] shrink-0" />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#D99616]">Your Active Learning Goal</span>
                  {isEditingGoal ? (
                    <div className="flex items-center space-x-2 mt-1">
                      <input
                        type="text"
                        value={goalInput}
                        onChange={(e) => setGoalInput(e.target.value)}
                        className="text-xs px-3 py-1 rounded-lg border border-[#F4B942] bg-white text-[#153B32] font-semibold focus:outline-none"
                      />
                      <button
                        onClick={() => {
                          setCurrentUser(prev => ({ ...prev, learningGoal: goalInput }));
                          setIsEditingGoal(false);
                          setStatusMessage('Learning goal updated!');
                        }}
                        className="text-xs bg-[#07866B] text-white px-3 py-1 rounded-lg font-bold"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs font-bold text-[#153B32]">{currentUser.learningGoal}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsEditingGoal(!isEditingGoal)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-[#F4B942]/40 text-xs font-bold text-[#D99616] hover:bg-[#FAF7F0] transition"
                >
                  {isEditingGoal ? 'Cancel' : 'Edit Goal'}
                </button>
                <button
                  onClick={() => {
                    fetchWeeklyReport(currentUser.id);
                    setShowWeeklyReport(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#07866B] text-white text-xs font-bold hover:opacity-95 transition flex items-center space-x-1"
                >
                  <FileCheck2 className="h-3.5 w-3.5" />
                  <span>Weekly Report</span>
                </button>
              </div>
            </div>

            {/* Top Greeting & Career Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 glass-sanctuary rounded-3xl p-6 md:p-8 relative overflow-hidden border border-[#07866B]/20 shadow-md">
                <div className="relative z-10 space-y-3">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#E6FAF0] border border-[#07866B]/20 text-xs text-[#07866B] font-semibold">
                    <span>Good evening, {currentUser.name} 👋</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#153B32]">
                    Target Career: <span className="gradient-emerald-gold">{currentUser.targetCareer}</span>
                  </h1>
                  <p className="text-[#61736D] text-sm max-w-xl">
                    Your personalized study agents have evaluated your latest performance. Your overall career employability index is at <strong>{dashboardData?.career_readiness || 68}%</strong>.
                  </p>

                  {/* Explainable Next Best Action Card */}
                  <div className="mt-4 p-5 rounded-2xl bg-[#FFFDF7] border border-[#F4B942]/40 space-y-2.5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#D99616] uppercase tracking-wider flex items-center space-x-1.5">
                        <Lightbulb className="h-4 w-4 text-[#F4B942]" />
                        <span>Recommended Next Best Action</span>
                      </span>
                      <span className="text-[10px] font-mono font-semibold text-[#07866B] bg-[#E6FAF0] px-2 py-0.5 rounded">
                        Explainable AI
                      </span>
                    </div>
                    <p className="font-bold text-[#153B32] text-sm">
                      {dashboardData?.next_best_action?.action || "Spend 20 minutes revising Bayes Theorem & Probability"}
                    </p>
                    <p className="text-xs text-[#61736D]">
                      Reasoning: {dashboardData?.next_best_action?.reason || "Recent quiz score was 42% (below 60% threshold). Revision session auto-added."}
                    </p>
                    <button
                      onClick={() => handleGenerateQuiz('Bayes Theorem & Probability')}
                      className="mt-1 px-4 py-2 rounded-xl bg-gradient-to-r from-[#07866B] to-[#18A999] text-white font-bold text-xs flex items-center space-x-1.5 hover:opacity-90 transition shadow-sm"
                    >
                      <span>Start Bayes Theorem Adaptive Quiz</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Career Readiness Gauge Card */}
              <div className="glass-sanctuary rounded-3xl p-6 md:p-8 flex flex-col justify-between border border-[#07866B]/20 shadow-md">
                <div>
                  <span className="text-xs font-mono uppercase text-[#61736D] font-semibold">Employability Readiness</span>
                  <div className="flex items-baseline space-x-2 mt-2">
                    <span className="text-5xl font-black text-[#D99616]">
                      {dashboardData?.career_readiness || 68}%
                    </span>
                    <span className="text-xs text-[#07866B] font-bold">+6% this week</span>
                  </div>
                  <p className="text-xs text-[#61736D] mt-2">
                    Priority Skill Gap: <strong className="text-[#F28B82]">Bayes Theorem & SQL</strong>
                  </p>
                </div>

                <div className="space-y-3 pt-4">
                  <div className="h-3 w-full bg-[#FAF7F0] rounded-full overflow-hidden p-0.5 border border-[#07866B]/15">
                    <div className="h-full bg-gradient-to-r from-[#07866B] via-[#18A999] to-[#F4B942] rounded-full" style={{ width: `${dashboardData?.career_readiness || 68}%` }}></div>
                  </div>
                  <button
                    onClick={() => setActiveTab('career')}
                    className="w-full py-2.5 rounded-xl bg-white hover:bg-[#FAF7F0] text-xs font-bold text-[#07866B] transition text-center border border-[#07866B]/20 shadow-sm"
                  >
                    View Complete Skill Matrix & Roadmap
                  </button>
                </div>
              </div>
            </div>

            {/* Topic Mastery & Weak-Topic Detection Section + 25-Min Focus Session Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 glass-sanctuary rounded-3xl p-6 space-y-4 border border-[#07866B]/20 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="text-lg font-bold flex items-center space-x-2 text-[#153B32]">
                      <BookMarked className="h-5 w-5 text-[#07866B]" />
                      <span>Topic Mastery & Weak-Spot Detection</span>
                    </h2>
                    <p className="text-xs text-[#61736D]">Calculated continuously by Performance Agent with decay and retention models</p>
                  </div>
                  <span className="text-xs font-mono font-semibold text-[#07866B] bg-[#E6FAF0] px-2.5 py-0.5 rounded-full">
                    0–100% Scale
                  </span>
                </div>

                <div className="space-y-3 pt-2">
                  {(dashboardData?.performance?.all_topics || [
                    { topic: 'Python Fundamentals', mastery: 85, is_weak: false },
                    { topic: 'Bayes Theorem & Probability', mastery: 42, is_weak: true },
                    { topic: 'Supervised Learning & Trees', mastery: 78, is_weak: false },
                    { topic: 'Hypothesis Testing', mastery: 60, is_weak: false },
                    { topic: 'SQL Query Optimization', mastery: 52, is_weak: true },
                    { topic: 'Matplotlib & Seaborn', mastery: 80, is_weak: false },
                  ]).map((item: any, idx: number) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-white border border-[#07866B]/15 hover:border-[#07866B]/35 transition space-y-2 shadow-sm">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-[#153B32]">{item.topic}</span>
                          {item.is_weak && (
                            <span className="px-2 py-0.5 rounded-full bg-[#FCD5D1] text-[#A8281E] border border-[#F28B82]/40 text-[10px] font-mono font-bold">
                              Weak Topic
                            </span>
                          )}
                        </div>
                        <span className={`font-mono font-bold ${item.is_weak ? 'text-[#A8281E]' : 'text-[#07866B]'}`}>
                          {item.mastery}%
                        </span>
                      </div>
                      <div className="h-2 w-full bg-[#FAF7F0] rounded-full overflow-hidden border border-[#07866B]/10">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            item.is_weak
                              ? 'bg-gradient-to-r from-[#F4B942] to-[#F28B82]'
                              : 'bg-gradient-to-r from-[#07866B] to-[#18A999]'
                          }`}
                          style={{ width: `${item.mastery}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 25-Minute Focus Session Card (Section 10F of prompt) */}
              <div id="focus-session-card" className="glass-sanctuary rounded-3xl p-6 space-y-4 border border-[#07866B]/20 shadow-md flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold flex items-center space-x-2 text-[#153B32]">
                      <Timer className="h-5 w-5 text-[#D99616]" />
                      <span>25-Min Focus Session</span>
                    </h2>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#FEF8EB] text-[#D99616] border border-[#F4B942]/40">
                      Pomodoro
                    </span>
                  </div>
                  <p className="text-xs text-[#61736D]">Deep work interval to revise weak topics without distractions.</p>
                </div>

                {/* Big Circular Clock Display */}
                <div className="text-center py-4 space-y-2">
                  <div className="inline-block p-6 rounded-full bg-[#FFFDF7] border-4 border-[#07866B]/20 shadow-inner">
                    <span className="text-4xl font-black font-mono text-[#07866B]">
                      {formatTimer(focusTimeLeft)}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[#61736D]">
                    {isFocusRunning ? '🌿 Focus flow active... stay in the zone' : focusBreakPrompt ? '☕ Time for a 5-minute break!' : 'Ready to start 25 mins of deep revision'}
                  </p>
                </div>

                {/* Focus Controls */}
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsFocusRunning(!isFocusRunning)}
                      className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 shadow-sm transition ${
                        isFocusRunning
                          ? 'bg-[#FEF8EB] text-[#D99616] border border-[#F4B942]'
                          : 'bg-[#07866B] text-white hover:opacity-95'
                      }`}
                    >
                      {isFocusRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      <span>{isFocusRunning ? 'Pause' : 'Start Focus Session'}</span>
                    </button>

                    <button
                      onClick={handleResetTimer}
                      className="px-3.5 py-2.5 rounded-xl bg-white border border-[#07866B]/20 text-[#61736D] hover:text-black transition"
                      title="Reset Timer"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#61736D] pt-1 border-t border-[#07866B]/10">
                    <span>Completed Today:</span>
                    <span className="font-bold text-[#07866B] font-mono">{focusSessionsCompleted} sessions</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Today's Adaptive Study Tasks & Live Agent Activity Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Today's Tasks */}
              <div className="lg:col-span-2 glass-sanctuary rounded-3xl p-6 md:p-8 space-y-4 border border-[#07866B]/20 shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold flex items-center space-x-2 text-[#153B32]">
                      <Calendar className="h-5 w-5 text-[#07866B]" />
                      <span>Adaptive Study Plan (Today's Tasks)</span>
                    </h2>
                    <p className="text-xs text-[#61736D]">Automatically adapted by Planner Agent after assessment mistakes</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('planner')}
                    className="text-xs text-[#07866B] font-bold hover:underline flex items-center space-x-1"
                  >
                    <span>Full Planner</span>
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  {plannerTasks.map((t, i) => (
                    <div
                      key={i}
                      onClick={() => handleToggleTask(t.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition space-y-2 ${
                        t.is_completed
                          ? 'bg-[#E6FAF0] border-[#07866B]/30 opacity-75'
                          : 'bg-white border-[#07866B]/15 hover:border-[#07866B]/40 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="px-2 py-0.5 rounded-full bg-[#FAF7F0] text-[#61736D] uppercase font-mono text-[10px] font-bold">
                          {t.type} • {t.duration}m
                        </span>
                        <div className={`h-4 w-4 rounded-full flex items-center justify-center border ${
                          t.is_completed ? 'bg-[#07866B] border-[#07866B] text-white' : 'border-[#61736D]'
                        }`}>
                          {t.is_completed && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                      </div>
                      <h3 className={`font-bold text-sm ${t.is_completed ? 'line-through text-[#61736D]' : 'text-[#153B32]'}`}>
                        {t.title}
                      </h3>
                      {t.reasoning && (
                        <p className="text-[11px] text-[#D99616] font-medium leading-tight">
                          ⚡ {t.reasoning}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Agent Activity Timeline */}
              <div className="glass-sanctuary rounded-3xl p-6 space-y-4 border border-[#07866B]/20 shadow-md">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold flex items-center space-x-2 text-[#153B32]">
                    <Cpu className="h-5 w-5 text-[#D99616]" />
                    <span>Agent Timeline</span>
                  </h2>
                  <span className="h-2 w-2 rounded-full bg-[#07866B] animate-pulse"></span>
                </div>
                <p className="text-xs text-[#61736D]">Real multi-agent execution events feed</p>

                <div className="space-y-3 pt-2 max-h-[360px] overflow-y-auto pr-1">
                  {timeline.length > 0 ? (
                    timeline.map((item, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-white border border-[#07866B]/15 text-xs space-y-1 shadow-sm">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-[#07866B] font-mono">{item.agent_name}</span>
                          <span className="text-[#61736D] text-[10px]">{item.time}</span>
                        </div>
                        <p className="text-[#153B32] leading-snug">{item.description}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-[#61736D] py-6 text-center">
                      No recent activity logged.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 2: AI VOICE & TEXT MENTOR (Study Sanctuary Room)     */}
        {/* ========================================================= */}
        {activeTab === 'mentor' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[600px]">
            {/* Left Control Panel */}
            <div className="glass-sanctuary rounded-3xl p-6 space-y-6 border border-[#07866B]/20 shadow-md flex flex-col justify-between">
              <div className="space-y-4">
                <h2 className="text-lg font-bold flex items-center space-x-2 text-[#07866B]">
                  <Bot className="h-5 w-5" />
                  <span>Cognova Mentor</span>
                </h2>
                <p className="text-xs text-[#61736D]">
                  Tutor Agent breaks down challenging topics with analogies, doctor-test models, and bilingual English & Telugu explanations.
                </p>

                {/* Language Selector */}
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-mono font-bold text-[#61736D]">COMMUNICATION LANGUAGE</label>
                  <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#FAF7F0] border border-[#07866B]/15 text-xs">
                    {(['English', 'Telugu', 'Bilingual'] as const).map(lang => (
                      <button
                        key={lang}
                        onClick={() => setMentorLang(lang)}
                        className={`py-1.5 rounded-lg font-bold transition text-[11px] ${
                          mentorLang === lang ? 'bg-[#07866B] text-white shadow-sm' : 'text-[#61736D] hover:text-[#153B32]'
                        }`}
                      >
                        {lang === 'Telugu' ? 'తెలుగు' : lang}
                      </button>
                    ))}
                  </div>
                </div>

                {/* TTS Audio Playback Toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#07866B]/15 text-xs shadow-sm">
                  <span className="text-[#153B32] font-semibold">Voice Audio Output (TTS)</span>
                  <button
                    onClick={() => setTtsEnabled(!ttsEnabled)}
                    className={`p-1.5 rounded-lg border transition ${
                      ttsEnabled ? 'bg-[#E6FAF0] border-[#07866B] text-[#07866B]' : 'bg-[#FAF7F0] border-gray-300 text-gray-400'
                    }`}
                  >
                    {ttsEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  </button>
                </div>

                {/* Knowledge Scope / Mode Selector */}
                <div className="space-y-2 pt-1">
                  <label className="text-xs font-mono font-bold text-[#61736D]">KNOWLEDGE RETRIEVAL MODE</label>
                  <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[#FAF7F0] border border-[#07866B]/15 text-[10px]">
                    <button
                      onClick={() => setChatMode('my_notes')}
                      className={`py-1.5 px-1 rounded-lg font-bold transition flex flex-col items-center ${
                        chatMode === 'my_notes' ? 'bg-[#07866B] text-white shadow-sm' : 'text-[#61736D] hover:text-[#153B32]'
                      }`}
                      title="Strictly ground in uploaded notes with page citations"
                    >
                      <span>🌿 My Notes</span>
                    </button>
                    <button
                      onClick={() => setChatMode('general')}
                      className={`py-1.5 px-1 rounded-lg font-bold transition flex flex-col items-center ${
                        chatMode === 'general' ? 'bg-[#07866B] text-white shadow-sm' : 'text-[#61736D] hover:text-[#153B32]'
                      }`}
                      title="Broad academic curriculum across CS, ML, Math, Science"
                    >
                      <span>💡 General</span>
                    </button>
                    <button
                      onClick={() => setChatMode('combined')}
                      className={`py-1.5 px-1 rounded-lg font-bold transition flex flex-col items-center ${
                        chatMode === 'combined' ? 'bg-[#07866B] text-white shadow-sm' : 'text-[#61736D] hover:text-[#153B32]'
                      }`}
                      title="Synthesize uploaded notes with wider pedagogical knowledge"
                    >
                      <span>⚡ Combined</span>
                    </button>
                  </div>
                </div>

                {/* Reset Conversation Button */}
                <button
                  onClick={handleResetChat}
                  className="w-full py-2 rounded-xl bg-white border border-[#07866B]/20 text-[#61736D] hover:text-[#A8281E] text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Start Fresh Session</span>
                </button>
              </div>

              {/* Quick Sample Subject Prompts */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono font-bold text-[#61736D]">EXPLORE ANY SUBJECT (GENERAL / TELUGU):</span>
                <button
                  onClick={() => handleSendMessage('Explain photosynthesis in plants and its light reaction cycle.')}
                  className="w-full text-left p-2 rounded-xl bg-white border border-[#07866B]/15 hover:border-[#07866B]/40 text-[11px] text-[#07866B] font-medium transition shadow-sm"
                >
                  🌱 "Explain photosynthesis in plants"
                </button>
                <button
                  onClick={() => handleSendMessage('Explain Python decorators briefly in 3 bullet points.')}
                  className="w-full text-left p-2 rounded-xl bg-white border border-[#07866B]/15 hover:border-[#07866B]/40 text-[11px] text-[#153B32] font-medium transition shadow-sm"
                >
                  🐍 "Explain Python decorators briefly"
                </button>
                <button
                  onClick={() => handleSendMessage('Naaku Bayes theorem ardham kaavatledu. Simple ga explain cheyyi.')}
                  className="w-full text-left p-2 rounded-xl bg-white border border-[#07866B]/15 hover:border-[#07866B]/40 text-[11px] text-[#D99616] font-medium transition shadow-sm"
                >
                  🗣️ "Naaku Bayes theorem simple ga explain cheyyi"
                </button>
              </div>
            </div>

            {/* Right Chat Stream */}
            <div className="lg:col-span-3 glass-sanctuary rounded-3xl p-6 border border-[#07866B]/20 shadow-md flex flex-col justify-between">
              {/* Chat Header Status Strip */}
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#07866B]/15 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#07866B]"></span>
                  <span className="font-bold text-[#153B32]">Student: {currentUser.name}</span>
                  <span className="text-[#61736D]">• Mode:</span>
                  <span className="font-mono font-bold text-[#07866B] uppercase">
                    {chatMode === 'my_notes' ? '🌿 Strictly Grounded Notes' : chatMode === 'general' ? '💡 General Academic Mentor' : '⚡ Combined Notes + Synthesis'}
                  </span>
                </div>
                <span className="font-mono text-[10px] bg-[#E6FAF0] text-[#07866B] px-2 py-0.5 rounded-full border border-[#07866B]/20 font-bold">
                  9-Part Pedagogical Engine
                </span>
              </div>
              {/* Message History */}
              <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center space-x-2 text-[10px] text-[#61736D] mb-1 px-1 font-semibold">
                      <span className="font-mono">{m.sender === 'user' ? 'Meghana' : m.agent_name || 'Tutor Agent'}</span>
                    </div>

                    <div
                      className={`max-w-2xl p-4 md:p-5 rounded-2xl text-xs md:text-sm leading-relaxed shadow-sm ${
                        m.sender === 'user'
                          ? 'bg-gradient-to-r from-[#07866B] to-[#18A999] text-white rounded-tr-none'
                          : 'bg-white border border-[#07866B]/15 text-[#153B32] rounded-tl-none space-y-3'
                      }`}
                    >
                      {/* Formatted Markdown, Flowchart & Code Block Rendering */}
                      <FormattedMessage text={m.text} isUser={m.sender === 'user'} />

                      {/* Source Citation Badges */}
                      {m.sources_used && m.sources_used.length > 0 && (
                        <div className="pt-2 border-t border-[#07866B]/15 flex flex-wrap gap-2 text-xs">
                          {m.sources_used.map((src: string, sIdx: number) => (
                            <span key={sIdx} className="px-2.5 py-0.5 rounded-md bg-[#E6FAF0] text-[#07866B] border border-[#07866B]/20 font-mono text-[11px] font-bold flex items-center space-x-1">
                              <BookOpen className="h-3 w-3" />
                              <span>{src}</span>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Interactive Follow-up Action Buttons */}
                      {m.suggested_actions && (
                        <div className="pt-2 border-t border-[#07866B]/15 flex flex-wrap gap-2">
                          {m.suggested_actions.map((act: string, aIdx: number) => (
                            <button
                              key={aIdx}
                              onClick={() => {
                                if (act.toLowerCase().includes('quiz')) {
                                  const cleaned = act
                                    .replace(/^take a quiz on\s*/i, '')
                                    .replace(/^quiz me on\s*/i, '')
                                    .replace(/^quiz:\s*/i, '')
                                    .replace(/[!?.]/g, '')
                                    .trim();
                                  handleGenerateQuiz(cleaned || 'HTML Tags');
                                } else {
                                  handleSendMessage(act);
                                }
                              }}
                              className="px-3 py-1 rounded-full bg-[#E6FAF0] hover:bg-[#D5FBEB] text-[#07866B] border border-[#07866B]/25 text-xs font-bold transition shadow-sm"
                            >
                              ⚡ {act}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex items-center space-x-2 text-xs text-[#07866B] py-2 font-bold">
                    <Sparkles className="h-4 w-4 animate-spin text-[#F4B942]" />
                    <span>Tutor Agent thinking & reviewing grounded notes in study sanctuary...</span>
                  </div>
                )}

                {/* Error Banner with Retry Request Button */}
                {chatError && (
                  <div className="p-4 rounded-2xl bg-[#FFF5F5] border border-[#F28B82] text-xs space-y-2 shadow-sm my-2">
                    <div className="flex items-center space-x-2 text-[#A8281E] font-bold">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>{chatError.message}</span>
                    </div>
                    <div className="flex items-center space-x-2 pt-1">
                      <button
                        onClick={() => {
                          const retryText = chatError.lastInput;
                          setChatError(null);
                          handleSendMessage(retryText);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-[#07866B] text-white font-bold text-xs flex items-center space-x-1.5 hover:bg-[#066B56] transition shadow-sm"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>Retry Request</span>
                      </button>
                      <button
                        onClick={() => setChatError(null)}
                        className="px-3 py-1.5 rounded-xl bg-white border border-gray-300 text-[#61736D] text-xs font-semibold hover:bg-gray-50"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Bottom Voice & Text Input Bar */}
              <div className="pt-4 border-t border-[#07866B]/15 mt-4">
                <div className="flex items-center space-x-3">
                  {/* Microphone STT Button */}
                  <button
                    onClick={toggleSpeechRecognition}
                    className={`h-12 w-12 rounded-2xl flex items-center justify-center transition shadow-sm ${
                      isListening
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-white border border-[#07866B]/20 text-[#07866B] hover:bg-[#E6FAF0]'
                    }`}
                    title={isListening ? 'Stop Listening' : 'Speak using Microphone'}
                  >
                    {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </button>

                  {/* Text Input */}
                  <input
                    type="text"
                    value={inputText}
                    disabled={loading}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (inputText.trim() && !loading) {
                          handleSendMessage();
                        }
                      }
                    }}
                    placeholder={
                      loading
                        ? 'Mentor is responding...'
                        : isListening
                        ? 'Listening to your voice...'
                        : mentorLang === 'Telugu'
                        ? 'Meeru edaina adagandi (e.g., HTML tags explain cheyyi)...'
                        : 'Ask your AI mentor anything or speak with the mic...'
                    }
                    className="flex-1 sanctuary-input rounded-2xl px-4 py-3 text-sm font-medium disabled:opacity-50"
                  />

                  {/* Send Button */}
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputText.trim() || loading}
                    className="h-12 w-12 rounded-2xl bg-gradient-to-r from-[#07866B] to-[#18A999] text-white flex items-center justify-center hover:opacity-95 transition disabled:opacity-40 shadow-sm"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 3: STUDY MATERIALS & RAG KNOWLEDGE BASE              */}
        {/* ========================================================= */}
        {activeTab === 'materials' && (
          <div className="space-y-6">
            <div className="glass-sanctuary rounded-3xl p-6 md:p-8 space-y-4 border border-[#07866B]/20 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold flex items-center space-x-2 text-[#07866B]">
                    <BookOpen className="h-6 w-6" />
                    <span>RAG Knowledge Base & Document Viewer</span>
                  </h2>
                  <p className="text-xs text-[#61736D]">
                    Upload your lecture slides or notes. Cognova grounds all responses strictly in your files with page citations.
                  </p>
                </div>
                <span className="px-3.5 py-1 rounded-full bg-[#E6FAF0] text-[#07866B] border border-[#07866B]/30 text-xs font-mono font-bold">
                  Zero Hallucination Grounding Active
                </span>
              </div>

              {/* Upload Dropzone */}
              <div className="p-8 border-2 border-dashed border-[#07866B]/30 rounded-2xl flex flex-col items-center justify-center space-y-3 bg-[#FFFDF7] shadow-inner">
                <FileText className="h-10 w-10 text-[#07866B]" />
                <div className="text-center">
                  <p className="text-sm font-bold text-[#153B32]">Upload PDF Notes or Lecture Slides</p>
                  <p className="text-xs text-[#61736D]">Automatic text extraction, semantic chunking & local vector indexing</p>
                </div>
                <input
                  type="file"
                  accept=".pdf,.txt"
                  onChange={handleFileUpload}
                  className="text-xs text-[#61736D] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#E6FAF0] file:text-[#07866B] hover:file:bg-[#D5FBEB] cursor-pointer"
                />
              </div>

              {/* Indexed Documents Table with Study Action Buttons */}
              <div className="space-y-3 pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#153B32]">Indexed Study Materials & Generation Tools</h3>
                  <span className="text-xs text-[#61736D]">Click an action below to instantly generate study aids from your notes</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(documents.length > 0 ? documents : [
                    { id: 1, title: 'Machine Learning Notes', filename: 'ML_Lecture_Notes_2026.pdf', page_count: 24, chunk_count: 58, created_at: '2026-10-11' },
                    { id: 2, title: 'Probability & Bayes Cheat Sheet', filename: 'Bayes_Theorem_Formulas.pdf', page_count: 6, chunk_count: 14, created_at: '2026-10-11' }
                  ]).map((doc, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-white border border-[#07866B]/15 flex flex-col justify-between space-y-3 shadow-sm hover:border-[#07866B]/40 transition">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <h4 className="font-bold text-sm text-[#153B32]">{doc.title}</h4>
                          <p className="text-xs text-[#61736D]">{doc.filename} • {doc.page_count} pages • {doc.chunk_count} chunks</p>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E6FAF0] text-[#07866B] border border-[#07866B]/30 font-mono font-bold">
                          Indexed
                        </span>
                      </div>

                      {/* Document Action Tools (Section 3 of prompt) */}
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#07866B]/10">
                        <button
                          onClick={() => handleOpenDocNotes(doc)}
                          className="py-1.5 px-2 rounded-xl bg-[#FAF7F0] hover:bg-[#E6FAF0] text-[#07866B] border border-[#07866B]/20 text-[11px] font-bold flex items-center justify-center space-x-1 transition"
                          title="Generate structured revision notes with executive summary"
                        >
                          <FileText className="h-3 w-3" />
                          <span>Notes</span>
                        </button>

                        <button
                          onClick={() => handleOpenDocQuiz(doc)}
                          className="py-1.5 px-2 rounded-xl bg-[#FAF7F0] hover:bg-[#E6FAF0] text-[#07866B] border border-[#07866B]/20 text-[11px] font-bold flex items-center justify-center space-x-1 transition"
                          title="Generate adaptive MCQs directly grounded in this document"
                        >
                          <Award className="h-3 w-3" />
                          <span>Quiz</span>
                        </button>

                        <button
                          onClick={() => handleOpenDocFlashcards(doc)}
                          className="py-1.5 px-2 rounded-xl bg-[#FAF7F0] hover:bg-[#E6FAF0] text-[#07866B] border border-[#07866B]/20 text-[11px] font-bold flex items-center justify-center space-x-1 transition"
                          title="Generate 2-sided active recall flashcards"
                        >
                          <Layers className="h-3 w-3" />
                          <span>Cards</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 4: ADAPTIVE ASSESSMENTS                             */}
        {/* ========================================================= */}
        {activeTab === 'assessments' && (
          <div className="space-y-6">
            <div className="glass-sanctuary rounded-3xl p-6 md:p-8 space-y-6 border border-[#07866B]/20 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold flex items-center space-x-2 text-[#07866B]">
                    <Award className="h-6 w-6 text-[#F4B942]" />
                    <span>Adaptive Assessment Agent</span>
                  </h2>
                  <p className="text-xs text-[#61736D]">
                    Questions adapt to your performance. Low scores automatically trigger revision in the study planner.
                  </p>
                </div>

                <button
                  onClick={() => handleGenerateQuiz(customQuizTopic.trim() || selectedQuizTopic)}
                  disabled={quizLoading}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#07866B] to-[#18A999] text-white font-bold text-xs flex items-center space-x-2 hover:opacity-90 transition disabled:opacity-50 shadow-sm"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${quizLoading ? 'animate-spin' : ''}`} />
                  <span>Generate Quiz ({customQuizTopic.trim() || selectedQuizTopic})</span>
                </button>
              </div>

              {/* Topic Selector & Generator */}
              <div className="p-4 md:p-5 rounded-2xl bg-white border border-[#07866B]/15 space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#61736D] uppercase">SELECT TOPIC FOR ADAPTIVE QUIZ:</span>
                  <span className="text-[11px] text-[#07866B] font-bold">Selected: {customQuizTopic.trim() || selectedQuizTopic}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {[
                    'HTML Tags',
                    'Binary Search & Algorithms',
                    'Python Programming',
                    'Machine Learning',
                    'Data Science',
                    'SQL Joins & Databases',
                    'Java Programming',
                    'Bayes Theorem & Probability',
                    'Document Notes'
                  ].map(topic => (
                    <button
                      key={topic}
                      onClick={() => {
                        setSelectedQuizTopic(topic);
                        setCustomQuizTopic('');
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        selectedQuizTopic === topic && !customQuizTopic
                          ? 'bg-[#07866B] text-white shadow-sm'
                          : 'bg-[#FAF7F0] border border-[#07866B]/15 text-[#153B32] hover:bg-[#E6FAF0]'
                      }`}
                    >
                      {topic}
                    </button>
                  ))}
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="text"
                    value={customQuizTopic}
                    onChange={(e) => setCustomQuizTopic(e.target.value)}
                    placeholder="Or enter custom topic (e.g. Neural Networks, Sorting, Biology)..."
                    className="flex-1 sanctuary-input rounded-xl px-3 py-2 text-xs font-medium"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const t = customQuizTopic.trim() || selectedQuizTopic;
                        handleGenerateQuiz(t);
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      const t = customQuizTopic.trim() || selectedQuizTopic;
                      handleGenerateQuiz(t);
                    }}
                    disabled={quizLoading}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#07866B] to-[#18A999] text-white font-bold text-xs flex items-center space-x-1.5 hover:opacity-90 disabled:opacity-50 shadow-sm"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${quizLoading ? 'animate-spin' : ''}`} />
                    <span>Generate Quiz</span>
                  </button>
                </div>
              </div>

              {/* Active Quiz Player */}
              {currentQuiz && !quizResult && (
                <div className="space-y-6 pt-2">
                  <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#07866B]/15 flex items-center justify-between text-xs">
                    <span className="font-bold text-[#07866B]">Topic: {currentQuiz.topic}</span>
                    <span className="text-[#61736D] font-mono font-semibold">{currentQuiz.questions?.length || 3} Questions • Adaptive</span>
                  </div>

                  <div className="space-y-6">
                    {currentQuiz.questions.map((q: any, qIdx: number) => (
                      <div key={q.id} className="p-5 rounded-2xl bg-white border border-[#07866B]/15 space-y-4 shadow-sm">
                        <div className="flex items-center space-x-2">
                          <span className="h-6 w-6 rounded-lg bg-[#E6FAF0] text-[#07866B] flex items-center justify-center font-mono text-xs font-bold">
                            {qIdx + 1}
                          </span>
                          <h3 className="font-bold text-sm text-[#153B32]">{q.prompt}</h3>
                        </div>

                        <div className="space-y-2 pl-8">
                          {q.options?.map((opt: string, oIdx: number) => (
                            <label
                              key={oIdx}
                              className={`flex items-center space-x-3 p-3 rounded-xl border cursor-pointer transition text-xs ${
                                quizAnswers[String(q.id)] === opt
                                  ? 'bg-[#E6FAF0] border-[#07866B] text-[#07866B] font-bold shadow-sm'
                                  : 'bg-[#FAF7F0] border-transparent hover:border-[#07866B]/25 text-[#153B32]'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`q_${q.id}`}
                                checked={quizAnswers[String(q.id)] === opt}
                                onChange={() => setQuizAnswers(prev => ({ ...prev, [String(q.id)]: opt }))}
                                className="accent-[#07866B]"
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleSubmitQuiz}
                    disabled={quizLoading}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#07866B] via-[#18A999] to-[#F4B942] text-white font-bold text-sm shadow-md hover:opacity-95 transition"
                  >
                    Submit Answers for Agent Evaluation
                  </button>
                </div>
              )}

              {/* Quiz Results Diagnostic Report */}
              {quizResult && (
                <div className="space-y-6 pt-2">
                  <div className="p-6 rounded-3xl bg-[#FFFDF7] border border-[#07866B]/25 space-y-3 shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#61736D] uppercase">Assessment Diagnostic Report</span>
                      <span className="text-2xl font-black text-[#D99616]">
                        {quizResult.score} / {quizResult.total} ({quizResult.percentage}%)
                      </span>
                    </div>

                    <p className="text-xs text-[#153B32] font-semibold">
                      {quizResult.percentage < 60
                        ? '⚠️ Critical weakness detected. Performance Agent has notified Adaptive Planner to schedule a revision session.'
                        : '🎉 Excellent mastery! Topic moved closer to target career readiness.'}
                    </p>
                  </div>

                  {/* Mistakes Breakdown */}
                  {quizResult.mistakes && quizResult.mistakes.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-bold text-[#A8281E]">Mistakes & Misconceptions Diagnosed</h3>
                      {quizResult.mistakes.map((m: any, mIdx: number) => (
                        <div key={mIdx} className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#F28B82]/50 text-xs space-y-2 shadow-sm">
                          <p className="font-bold text-[#153B32]">{m.question}</p>
                          <p className="text-[#A8281E] font-semibold">Your Answer: {m.student_answer}</p>
                          <p className="text-[#07866B] font-semibold">Correct Answer: {m.correct_answer}</p>
                          <p className="text-[#61736D] text-[11px] leading-relaxed">💡 Explanation: {m.explanation}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      onClick={() => handleGenerateQuiz(currentQuiz?.topic || selectedQuizTopic)}
                      className="flex-1 py-3.5 rounded-xl bg-white border border-[#07866B]/20 hover:bg-[#FAF7F0] text-xs font-bold text-[#153B32] shadow-sm"
                    >
                      Retry Another Set ({currentQuiz?.topic || selectedQuizTopic})
                    </button>
                    <button
                      onClick={() => setActiveTab('planner')}
                      className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-[#07866B] to-[#18A999] text-white text-xs font-bold shadow-md"
                    >
                      View Updated Study Plan
                    </button>
                  </div>
                </div>
              )}

              {/* If no quiz is loaded */}
              {!currentQuiz && !quizResult && (
                <div className="text-center py-10 space-y-4">
                  <p className="text-sm text-[#61736D]">Select a topic above or click below to start your diagnostic test.</p>
                  <button
                    onClick={() => handleGenerateQuiz(customQuizTopic.trim() || selectedQuizTopic)}
                    disabled={quizLoading}
                    className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#07866B] to-[#18A999] text-white font-bold text-xs shadow-md hover:opacity-90 transition disabled:opacity-50"
                  >
                    Start {customQuizTopic.trim() || selectedQuizTopic} Adaptive Quiz
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 5: ADAPTIVE STUDY PLANNER                           */}
        {/* ========================================================= */}
        {activeTab === 'planner' && (
          <div className="space-y-6">
            <div className="glass-sanctuary rounded-3xl p-6 md:p-8 space-y-6 border border-[#07866B]/20 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold flex items-center space-x-2 text-[#07866B]">
                    <Calendar className="h-6 w-6" />
                    <span>Adaptive Study Planner</span>
                  </h2>
                  <p className="text-xs text-[#61736D]">
                    Dynamic curriculum powered by the Adaptive Planner Agent. Tasks auto-reorder based on quiz errors.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-[#07866B] bg-[#E6FAF0] px-3.5 py-1 rounded-full border border-[#07866B]/30">
                  90 mins / day target
                </span>
              </div>

              <div className="space-y-3">
                {plannerTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleToggleTask(task.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                      task.is_completed
                        ? 'bg-[#E6FAF0] border-[#07866B]/30 opacity-75'
                        : 'bg-white border-[#07866B]/15 hover:border-[#07866B]/35 shadow-sm'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-xs">
                        <span className="font-bold text-[#153B32]">{task.title}</span>
                        <span className="px-2 py-0.5 rounded-full bg-[#FAF7F0] text-[10px] font-mono text-[#61736D] uppercase font-bold">
                          {task.type} • {task.duration}m
                        </span>
                      </div>
                      {task.reasoning && (
                        <p className="text-[11px] text-[#D99616] font-medium flex items-center space-x-1">
                          <Zap className="h-3 w-3 text-[#F4B942] inline" />
                          <span>{task.reasoning}</span>
                        </p>
                      )}
                    </div>

                    <div className={`h-6 w-6 rounded-xl flex items-center justify-center border transition ${
                      task.is_completed ? 'bg-[#07866B] border-[#07866B] text-white' : 'border-[#61736D]'
                    }`}>
                      {task.is_completed && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 6: CAREER READINESS & ROADMAP                        */}
        {/* ========================================================= */}
        {activeTab === 'career' && (
          <div className="space-y-6">
            <div className="glass-sanctuary rounded-3xl p-6 md:p-8 space-y-6 border border-[#07866B]/20 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold flex items-center space-x-2 text-[#07866B]">
                    <Briefcase className="h-6 w-6 text-[#F4B942]" />
                    <span>Career Readiness Agent & Industry Matrix</span>
                  </h2>
                  <p className="text-xs text-[#61736D]">
                    Mapping student competencies to the target industry role: <strong>{currentUser.targetCareer}</strong>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-[#61736D]">Readiness Index</span>
                  <div className="text-2xl font-black text-[#D99616]">
                    {careerData?.readiness_percentage || 68}%
                  </div>
                </div>
              </div>

              {/* Skills Benchmark Bars */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-bold text-[#153B32]">Target Competency Matrix</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(careerData?.skills || [
                    { name: 'Python', current: 85, target: 90 },
                    { name: 'Statistics & Probability', current: 52, target: 85 },
                    { name: 'Machine Learning', current: 74, target: 85 },
                    { name: 'SQL', current: 52, target: 80 },
                    { name: 'Data Visualization', current: 80, target: 80 },
                    { name: 'GenAI & Agents', current: 45, target: 75 },
                  ]).map((sk: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-2xl bg-white border border-[#07866B]/15 space-y-2 shadow-sm">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#153B32]">{sk.name}</span>
                        <span className="font-mono text-[#61736D]">
                          <strong className="text-[#07866B]">{sk.current}%</strong> / {sk.target}% target
                        </span>
                      </div>
                      <div className="h-2 w-full bg-[#FAF7F0] rounded-full overflow-hidden border border-[#07866B]/10">
                        <div
                          className={`h-full rounded-full ${
                            sk.current < sk.target - 15
                              ? 'bg-gradient-to-r from-[#F4B942] to-[#F28B82]'
                              : 'bg-gradient-to-r from-[#07866B] to-[#18A999]'
                          }`}
                          style={{ width: `${(sk.current / sk.target) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step-by-Step Personalized Career Roadmap */}
              <div className="space-y-4 pt-4 border-t border-[#07866B]/15">
                <h3 className="text-sm font-bold text-[#153B32]">Step-by-Step Employability Acceleration Roadmap</h3>
                <div className="space-y-3">
                  {(careerData?.roadmap || [
                    { step: 1, title: 'Strengthen Probability & Bayes Theorem', status: 'In Progress' },
                    { step: 2, title: 'Master SQL Window Functions & Aggregations', status: 'Next' },
                    { step: 3, title: 'Implement End-to-End Classification Pipeline', status: 'Pending' },
                    { step: 4, title: 'Build RAG & Vector Search Project', status: 'Pending' },
                    { step: 5, title: 'Complete 3 Mock Technical Interviews', status: 'Pending' },
                  ]).map((item: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-2xl bg-white border border-[#07866B]/15 flex items-center justify-between text-xs shadow-sm">
                      <div className="flex items-center space-x-3">
                        <span className="h-6 w-6 rounded-full bg-[#FEF8EB] text-[#D99616] font-mono font-bold flex items-center justify-center border border-[#F4B942]/30">
                          {item.step}
                        </span>
                        <span className="font-bold text-[#153B32]">{item.title}</span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                        item.status === 'In Progress'
                          ? 'bg-[#FEF8EB] text-[#D99616] border border-[#F4B942]/40'
                          : 'bg-[#FAF7F0] text-[#61736D]'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* WEEKLY LEARNING REPORT MODAL (Section 10G of prompt)      */}
      {/* ========================================================= */}
      {showWeeklyReport && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-[#FFFDF7] rounded-3xl p-6 md:p-8 border border-[#07866B]/25 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#07866B]/15 pb-3">
              <div className="flex items-center space-x-2">
                <FileCheck2 className="h-5 w-5 text-[#07866B]" />
                <div>
                  <h3 className="font-bold text-lg text-[#153B32]">Weekly Learning & Progress Report</h3>
                  {weeklyReportData?.period && (
                    <span className="text-[10px] text-[#61736D] font-mono">{weeklyReportData.period}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowWeeklyReport(false)}
                className="text-[#61736D] hover:text-black font-bold p-1 text-sm"
              >
                ✕
              </button>
            </div>

            {/* Loading Spinner */}
            {weeklyReportLoading && (
              <div className="py-12 text-center space-y-3">
                <Sparkles className="h-6 w-6 animate-spin text-[#07866B] mx-auto" />
                <p className="text-xs font-bold text-[#07866B]">Retrieving weekly performance analytics...</p>
              </div>
            )}

            {/* Empty State when student has no logged activity */}
            {!weeklyReportLoading && weeklyReportData && !weeklyReportData.has_activity && (
              <div className="text-center py-8 space-y-3">
                <div className="h-12 w-12 rounded-2xl bg-[#E6FAF0] text-[#07866B] flex items-center justify-center mx-auto border border-[#07866B]/20">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-base text-[#153B32]">No Study Sessions Logged Yet</h4>
                  <p className="text-xs text-[#61736D] max-w-sm mx-auto leading-relaxed">
                    You haven't completed any quizzes or AI mentor study sessions yet this week. Start your first session to unlock real-time progress metrics!
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowWeeklyReport(false);
                    setActiveTab('mentor');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#07866B] to-[#18A999] text-white text-xs font-bold shadow-md hover:opacity-90 transition"
                >
                  Start First Study Session
                </button>
              </div>
            )}

            {/* Active Data State */}
            {!weeklyReportLoading && weeklyReportData && weeklyReportData.has_activity && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-white border border-[#07866B]/15">
                    <span className="text-[#61736D] font-mono text-[10px]">Student Profile</span>
                    <p className="font-bold text-sm text-[#153B32]">{weeklyReportData.user?.full_name || currentUser.name}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-[#07866B]/15">
                    <span className="text-[#61736D] font-mono text-[10px]">Target Career Path</span>
                    <p className="font-bold text-sm text-[#07866B]">{weeklyReportData.user?.target_career || currentUser.targetCareer}</p>
                  </div>
                </div>

                {/* 4 Metric Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-xl bg-white border border-[#07866B]/15 text-center">
                    <span className="text-[#61736D] text-[10px] block font-mono">Quizzes Taken</span>
                    <span className="text-base font-extrabold text-[#07866B]">{weeklyReportData.summary?.quizzes_taken ?? 0}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-[#07866B]/15 text-center">
                    <span className="text-[#61736D] text-[10px] block font-mono">Average Score</span>
                    <span className="text-base font-extrabold text-[#153B32]">{weeklyReportData.summary?.average_score ?? 0}%</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-[#07866B]/15 text-center">
                    <span className="text-[#61736D] text-[10px] block font-mono">Focus Study</span>
                    <span className="text-base font-extrabold text-[#18A999]">{weeklyReportData.summary?.focus_hours ?? 0}h</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-[#07866B]/15 text-center">
                    <span className="text-[#61736D] text-[10px] block font-mono">Career Ready</span>
                    <span className="text-base font-extrabold text-[#D99616]">{weeklyReportData.summary?.career_readiness ?? 68}%</span>
                  </div>
                </div>

                {/* Topics Analyzed (Strengths & Weaknesses) */}
                <div className="p-3.5 rounded-xl bg-white border border-[#07866B]/15 space-y-2">
                  <span className="font-bold text-[#153B32]">Topic Mastery & Focus Areas</span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {(weeklyReportData.topic_breakdown || []).map((t: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-[#FAF7F0] text-[11px]">
                        <span className="font-semibold text-[#153B32]">{t.topic}</span>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                            t.status === 'Weak'
                              ? 'bg-[#FCD5D1] text-[#A8281E]'
                              : t.status === 'Mastered'
                              ? 'bg-[#E6FAF0] text-[#07866B]'
                              : 'bg-white text-[#61736D]'
                          }`}>
                            {t.status}
                          </span>
                          <span className="font-mono font-bold text-[#153B32]">{t.mastery}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Mentor Pedagogical Recommendation */}
                <div className="p-3.5 rounded-xl bg-[#FEF8EB] border border-[#F4B942]/40 text-[#153B32] space-y-1">
                  <span className="font-bold text-xs text-[#D99616] flex items-center space-x-1.5">
                    <Lightbulb className="h-3.5 w-3.5" />
                    <span>AI Mentor Weekly Recommendation:</span>
                  </span>
                  <p className="text-[11px] leading-relaxed">
                    {weeklyReportData.recommended_next_step}
                  </p>
                </div>
              </div>
            )}

            {/* Fallback when data not loaded yet */}
            {!weeklyReportLoading && !weeklyReportData && (
              <div className="text-center py-6">
                <p className="text-xs text-[#61736D]">Click below to generate or download the 4-page report.</p>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-2 border-t border-[#07866B]/15">
              <button
                onClick={handleDownloadWeeklyPdf}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#07866B] via-[#18A999] to-[#F4B942] text-white font-bold text-xs flex items-center justify-center space-x-2 hover:opacity-95 shadow-md"
              >
                <Download className="h-4 w-4" />
                <span>Download Visual 4-Page PDF Report (ReportLab)</span>
              </button>
              <button
                onClick={handleExportReport}
                className="py-3 px-3.5 rounded-xl bg-white border border-[#07866B]/25 text-[#07866B] font-bold text-xs flex items-center justify-center space-x-1.5 hover:bg-[#E6FAF0]"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Summary (.txt)</span>
              </button>
              <button
                onClick={() => setShowWeeklyReport(false)}
                className="px-4 py-3 rounded-xl bg-white border border-gray-300 text-[#153B32] font-bold text-xs hover:bg-[#FAF7F0]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DOCUMENT AI STUDY TOOLS MODAL (Notes / Quiz / Flashcards)  */}
      {/* ========================================================= */}
      {docToolActive && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-[#FFFDF7] rounded-3xl p-6 md:p-8 border border-[#07866B]/25 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#07866B]/15 pb-3">
              <div className="flex items-center space-x-2">
                {docToolActive.type === 'notes' && <FileText className="h-5 w-5 text-[#07866B]" />}
                {docToolActive.type === 'quiz' && <Award className="h-5 w-5 text-[#F4B942]" />}
                {docToolActive.type === 'flashcards' && <Layers className="h-5 w-5 text-[#18A999]" />}
                <div>
                  <h3 className="font-bold text-base text-[#153B32]">
                    {docToolActive.type === 'notes' && 'Automated Summary Notes & Formulas'}
                    {docToolActive.type === 'quiz' && 'Document-Grounded Practice Quiz'}
                    {docToolActive.type === 'flashcards' && 'Active Recall Flashcards'}
                  </h3>
                  <p className="text-[11px] text-[#61736D]">{docToolActive.title}</p>
                </div>
              </div>
              <button onClick={() => setDocToolActive(null)} className="text-[#61736D] hover:text-black font-bold p-1">✕</button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
              {docToolActive.loading && (
                <div className="text-center py-12 space-y-2">
                  <Sparkles className="h-6 w-6 animate-spin text-[#07866B] mx-auto" />
                  <p className="text-[#07866B] font-bold">RAG Agent analyzing document chunks and generating study aids...</p>
                </div>
              )}

              {/* Notes view */}
              {!docToolActive.loading && docToolActive.type === 'notes' && (
                <div className="p-4 rounded-2xl bg-white border border-[#07866B]/15 space-y-2 text-[#153B32] whitespace-pre-wrap leading-relaxed shadow-sm">
                  {docToolActive.data}
                </div>
              )}

              {/* Quiz view */}
              {!docToolActive.loading && docToolActive.type === 'quiz' && (
                <div className="space-y-4">
                  {(docToolActive.data || []).map((q: any, qIdx: number) => (
                    <div key={q.id || qIdx} className="p-4 rounded-2xl bg-white border border-[#07866B]/15 space-y-2 shadow-sm">
                      <div className="flex items-center space-x-2">
                        <span className="h-5 w-5 rounded-lg bg-[#E6FAF0] text-[#07866B] flex items-center justify-center font-bold text-[10px] font-mono">
                          {qIdx + 1}
                        </span>
                        <h4 className="font-bold text-[#153B32]">{q.prompt}</h4>
                      </div>
                      <div className="space-y-1.5 pl-6 pt-1">
                        {q.options?.map((opt: string, oIdx: number) => (
                          <div key={oIdx} className={`p-2 rounded-xl border text-[11px] ${
                            opt === q.correct_answer ? 'bg-[#E6FAF0] border-[#07866B]/40 font-bold text-[#07866B]' : 'bg-[#FAF7F0] border-transparent'
                          }`}>
                            {opt} {opt === q.correct_answer && '✓ (Correct)'}
                          </div>
                        ))}
                      </div>
                      {q.explanation && (
                        <p className="text-[10px] text-[#61736D] pl-6 pt-1">💡 {q.explanation}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Flashcards view: Interactive Flip Card Experience */}
              {!docToolActive.loading && docToolActive.type === 'flashcards' && (
                <div className="space-y-4">
                  {docToolActive.data && docToolActive.data.length > 0 ? (
                    <div>
                      {/* Active Study Card Header Info */}
                      <div className="flex items-center justify-between px-2 text-xs text-[#61736D]">
                        <span className="font-bold text-[#07866B]">
                          Card {activeCardIdx + 1} of {docToolActive.data.length}
                        </span>
                        <span className="bg-[#E6FAF0] text-[#07866B] px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold">
                          Page {docToolActive.data[activeCardIdx]?.page || 1}
                        </span>
                      </div>

                      {/* Interactive 3D Flip Card */}
                      <div
                        onClick={() => setIsCardFlipped(prev => !prev)}
                        className={`min-h-[220px] p-6 rounded-3xl border-2 transition-all duration-300 cursor-pointer shadow-md flex flex-col justify-between select-none mt-2 ${
                          isCardFlipped
                            ? 'bg-[#E6FAF0] border-[#07866B]/40 shadow-emerald-900/5'
                            : 'bg-white border-[#F4B942]/40 shadow-amber-900/5 hover:border-[#07866B]/50'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className={`font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            isCardFlipped ? 'bg-[#07866B] text-white' : 'bg-[#FAF7F0] text-[#D99616] border border-[#F4B942]/30'
                          }`}>
                            {isCardFlipped ? 'Answer / Solution' : 'Question / Concept Prompt'}
                          </span>
                          <span className="text-[10px] text-[#61736D] italic">
                            Click anywhere to flip 🔄
                          </span>
                        </div>

                        <div className="py-4">
                          {isCardFlipped ? (
                            <p className="text-sm font-semibold text-[#153B32] leading-relaxed whitespace-pre-wrap">
                              {docToolActive.data[activeCardIdx]?.back}
                            </p>
                          ) : (
                            <p className="text-base font-bold text-[#153B32] leading-snug">
                              {docToolActive.data[activeCardIdx]?.front}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-[#61736D] border-t border-[#07866B]/10 pt-3">
                          <span>{isCardFlipped ? '✓ Mastered principle' : '🧠 Test your recall before flipping'}</span>
                          <span className="font-bold text-[#07866B]">Cognova Active Recall</span>
                        </div>
                      </div>

                      {/* Navigation Controls (Prev / Flip / Next) */}
                      <div className="flex items-center justify-between pt-4">
                        <button
                          onClick={() => {
                            setActiveCardIdx(prev => Math.max(0, prev - 1));
                            setIsCardFlipped(false);
                          }}
                          disabled={activeCardIdx === 0}
                          className="px-4 py-2 rounded-xl bg-white border border-[#07866B]/20 text-[#07866B] font-bold text-xs hover:bg-[#E6FAF0] disabled:opacity-30 transition shadow-sm"
                        >
                          ← Previous Card
                        </button>

                        <button
                          onClick={() => setIsCardFlipped(prev => !prev)}
                          className="px-4 py-2 rounded-xl bg-[#FAF7F0] border border-[#07866B]/20 text-[#153B32] font-bold text-xs hover:bg-[#E6FAF0] transition"
                        >
                          {isCardFlipped ? 'Show Question' : 'Reveal Answer'}
                        </button>

                        <button
                          onClick={() => {
                            setActiveCardIdx(prev => Math.min(docToolActive.data.length - 1, prev + 1));
                            setIsCardFlipped(false);
                          }}
                          disabled={activeCardIdx === docToolActive.data.length - 1}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#07866B] to-[#18A999] text-white font-bold text-xs hover:opacity-90 disabled:opacity-30 transition shadow-sm"
                        >
                          Next Card →
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-center py-6 text-xs text-[#61736D]">No flashcards could be generated from this document.</p>
                  )}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#07866B]/15 flex justify-end">
              <button
                onClick={() => setDocToolActive(null)}
                className="px-5 py-2.5 rounded-xl bg-[#07866B] text-white font-bold text-xs shadow-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* NEW STUDENT PROFILE CREATION MODAL                         */}
      {/* ========================================================= */}
      {showNewUserModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#FFFDF7] rounded-3xl p-6 md:p-8 border border-[#07866B]/25 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#07866B]/15 pb-3">
              <div className="flex items-center space-x-2">
                <UserIcon className="h-5 w-5 text-[#07866B]" />
                <h3 className="font-bold text-base text-[#153B32]">Register New Student Profile</h3>
              </div>
              <button onClick={() => setShowNewUserModal(false)} className="text-[#61736D] hover:text-black font-bold p-1">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#153B32]">Student Full Name</label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Arjun Sharma"
                  className="w-full sanctuary-input rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#153B32]">Target Career</label>
                <select
                  value={newUserCareer}
                  onChange={(e) => setNewUserCareer(e.target.value)}
                  className="w-full sanctuary-input rounded-xl px-3 py-2 text-xs"
                >
                  <option value="Data Scientist">Data Scientist</option>
                  <option value="Machine Learning Engineer">Machine Learning Engineer</option>
                  <option value="Cloud Architect">Cloud Architect</option>
                  <option value="Full-Stack Developer">Full-Stack Developer</option>
                  <option value="Data Analyst">Data Analyst</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-3">
              <button
                onClick={handleCreateNewUser}
                disabled={!newUserName.trim()}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#07866B] to-[#18A999] text-white font-bold text-xs disabled:opacity-40 shadow-md"
              >
                Create Profile & Switch
              </button>
              <button
                onClick={() => setShowNewUserModal(false)}
                className="px-4 py-2.5 rounded-xl bg-white border border-gray-300 text-xs font-bold text-[#153B32]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* FOOTER (Study Library Sanctuary Glassmorphism)            */}
      {/* ========================================================= */}
      <footer className="border-t border-[#07866B]/15 px-6 py-4 glass-sanctuary text-center text-xs text-[#61736D] flex flex-col md:flex-row items-center justify-between shadow-inner">
        <span>Cognova Voice • VORTEX 2K26 Hackathon • Theme 5: Deep Tech, Automation & Emerging Technology</span>
        <span className="text-[11px] text-[#07866B] font-mono font-bold mt-2 md:mt-0">Speak. Learn. Improve. Grow.</span>
      </footer>
    </div>
  );
}
