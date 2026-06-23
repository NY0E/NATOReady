"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ── Data ──────────────────────────────────────────────────────────

const NATO: Record<string, string> = {
  A: "Alpha", B: "Bravo", C: "Charlie", D: "Delta", E: "Echo",
  F: "Foxtrot", G: "Golf", H: "Hotel", I: "India", J: "Juliet",
  K: "Kilo", L: "Lima", M: "Mike", N: "November", O: "Oscar",
  P: "Papa", Q: "Quebec", R: "Romeo", S: "Sierra", T: "Tango",
  U: "Uniform", V: "Victor", W: "Whiskey", X: "X-ray", Y: "Yankee",
  Z: "Zulu",
};

const LETTERS = Object.keys(NATO);
const WORDS = Object.values(NATO);

// Callsign prefixes and suffix pools for realistic callsign generation
const PREFIXES = ["W", "K", "N", "AA", "KD", "KE", "KF", "KG", "KI", "KJ", "WA", "WB", "WD", "WR", "NY", "KX", "N0", "W0", "K0", "N9", "W9"];
const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

function randomLetter() {
  return LETTERS[Math.floor(Math.random() * LETTERS.length)];
}

function randomWord() {
  const i = Math.floor(Math.random() * WORDS.length);
  return { word: WORDS[i], letter: LETTERS[i] };
}

function generateCallsign(): string {
  const prefix = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
  const digit = DIGITS[Math.floor(Math.random() * DIGITS.length)];
  const suffixLen = Math.random() < 0.5 ? 2 : 3;
  let suffix = "";
  for (let i = 0; i < suffixLen; i++) suffix += LETTERS[Math.floor(Math.random() * LETTERS.length)];
  return prefix + digit + suffix;
}

function callsignToPhonetic(callsign: string): string {
  return callsign.split("").map(c => {
    if (NATO[c]) return NATO[c];
    if (/[0-9]/.test(c)) {
      const nums: Record<string, string> = {
        "0": "Zero", "1": "One", "2": "Two", "3": "Three", "4": "Four",
        "5": "Five", "6": "Six", "7": "Seven", "8": "Eight", "9": "Nine"
      };
      return nums[c];
    }
    return c;
  }).join(" ");
}

// ── Types ─────────────────────────────────────────────────────────

type Mode = "home" | "letter-to-word" | "word-to-letter" | "callsign";
type Feedback = "correct" | "incorrect" | null;

interface Stats {
  correct: number;
  total: number;
  streak: number;
  bestStreak: number;
}

// ── Sub-components ────────────────────────────────────────────────

function StatPip({ label, value }: { label: string; value: number | string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "22px", color: "#e8a020", letterSpacing: "0.04em" }}>{value}</div>
      <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "9px", color: "#3a4a5a", letterSpacing: "0.18em", textTransform: "uppercase", marginTop: "2px" }}>{label}</div>
    </div>
  );
}

function StatsBar({ stats }: { stats: Stats }) {
  const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
  return (
    <div style={{ display: "flex", gap: "32px", justifyContent: "center", padding: "16px 0", borderBottom: "1px solid #1a2230" }}>
      <StatPip label="Correct" value={stats.correct} />
      <StatPip label="Total" value={stats.total} />
      <StatPip label="Accuracy" value={stats.total > 0 ? `${pct}%` : "--"} />
      <StatPip label="Streak" value={stats.streak} />
      <StatPip label="Best" value={stats.bestStreak} />
    </div>
  );
}

// ── Mode: Letter to Word ──────────────────────────────────────────

function LetterToWord({ onBack }: { onBack: () => void }) {
  const [letter, setLetter] = useState(randomLetter);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [stats, setStats] = useState<Stats>({ correct: 0, total: 0, streak: 0, bestStreak: 0 });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, [feedback]);

  const advance = useCallback(() => {
    setLetter(randomLetter());
    setInput("");
    setFeedback(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const submit = useCallback(() => {
    if (!input.trim()) return;
    const correct = input.trim().toLowerCase() === NATO[letter].toLowerCase();
    const newStreak = correct ? stats.streak + 1 : 0;
    setStats(s => ({
      correct: s.correct + (correct ? 1 : 0),
      total: s.total + 1,
      streak: newStreak,
      bestStreak: Math.max(s.bestStreak, newStreak),
    }));
    setFeedback(correct ? "correct" : "incorrect");
    setTimeout(advance, correct ? 600 : 1200);
  }, [input, letter, stats.streak, advance]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") submit();
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080c10", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: "16px 24px", borderBottom: "1px solid #1a2230", display: "flex", alignItems: "center", gap: "16px" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#3a5a7a", cursor: "pointer", fontFamily: "'Share Tech Mono', monospace", fontSize: "11px", letterSpacing: "0.1em" }}>← MODES</button>
        <div style={{ width: "1px", height: "14px", background: "#1a2230" }} />
        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "12px", color: "#e8a020", letterSpacing: "0.12em" }}>LETTER → WORD</div>
      </div>

      <StatsBar stats={stats} />

      {/* Main drill */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "48px", padding: "32px" }}>

        {/* The letter */}
        <div style={{
          fontSize: "clamp(120px, 28vw, 200px)",
          fontFamily: "'Share Tech Mono', monospace",
          fontWeight: 700,
          color: feedback === "correct" ? "#22c55e" : feedback === "incorrect" ? "#ef4444" : "#e8a020",
          letterSpacing: "-0.02em",
          lineHeight: 1,
          transition: "color 0.15s",
          userSelect: "none",
          textShadow: feedback === "correct" ? "0 0 60px rgba(34,197,94,0.3)" : feedback === "incorrect" ? "0 0 60px rgba(239,68,68,0.3)" : "0 0 60px rgba(232,160,32,0.15)",
        }}>
          {letter}
        </div>

        {/* Feedback word */}
        {feedback === "incorrect" && (
          <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "18px", color: "#ef4444", letterSpacing: "0.1em", marginTop: "-24px" }}>
            {NATO[letter].toUpperCase()}
          </div>
        )}

        {/* Input */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", width: "100%", maxWidth: "320px" }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Type the NATO word..."
            disabled={feedback !== null}
            style={{
              width: "100%",
              background: "#0c1118",
              border: `1px solid ${feedback === "correct" ? "#22c55e" : feedback === "incorrect" ? "#ef4444" : "#1e3050"}`,
              borderRadius: "4px",
              padding: "14px 18px",
              color: "#c8d8e8",
              fontSize: "18px",
              fontFamily: "'Inter', sans-serif",
              outline: "none",
              textAlign: "center",
              letterSpacing: "0.04em",
              transition: "border-color 0.15s",
            }}
            onFocus={e => { if (feedback === null) e.target.style.borderColor = "#2d4a6b"; }}
            onBlur={e => { if (feedback === null) e.target.style.borderColor = "#1e3050"; }}
          />
          <button
            onClick={submit}
            disabled={!input.trim() || feedback !== null}
            style={{
              background: !input.trim() || feedback !== null ? "#0c1118" : "#e8a020",
              border: "none", borderRadius: "4px", padding: "12px 32px",
              color: !input.trim() || feedback !== null ? "#2a3a4a" : "#080c10",
              fontFamily: "'Share Tech Mono', monospace", fontSize: "12px",
              letterSpacing: "0.12em", cursor: !input.trim() || feedback !== null ? "not-allowed" : "pointer",
              transition: "background 0.15s, color 0.15s",
            }}
          >
            CONFIRM
          </button>
        </div>

        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "10px", color: "#1e2d3d", letterSpacing: "0.15em" }}>
          ENTER TO CONFIRM
        </div>
      </div>
    </div>
  );
}

// ── Mode: Word to Letter ──────────────────────────────────────────

function WordToLetter({ onBack }: { onBack: () => void }) {
  const getQuestion = () => {
    const { word, letter } = randomWord();
    const distractors = LETTERS.filter(l => l !== letter)
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);
    const options = [letter, ...distractors].sort(() => Math.random() - 0.5);
    return { word, letter, options };
  };

  const [question, setQuestion] = useState(getQuestion);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [stats, setStats] = useState<Stats>({ correct: 0, total: 0, streak: 0, bestStreak: 0 });

  const advance = useCallback(() => {
    setQuestion(getQuestion());
    setSelected(null);
    setFeedback(null);
  }, []);

  const pick = useCallback((option: string) => {
    if (feedback !== null) return;
    const correct = option === question.letter;
    const newStreak = correct ? stats.streak + 1 : 0;
    setStats(s => ({
      correct: s.correct + (correct ? 1 : 0),
      total: s.total + 1,
      streak: newStreak,
      bestStreak: Math.max(s.bestStreak, newStreak),
    }));
    setSelected(option);
    setFeedback(correct ? "correct" : "incorrect");
    setTimeout(advance, correct ? 600 : 1200);
  }, [feedback, question.letter, stats.streak, advance]);

  return (
    <div style={{ minHeight: "100vh", background: "#080c10", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "16px 24px", borderBottom: "1px solid #1a2230", display: "flex", alignItems: "center", gap: "16px" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#3a5a7a", cursor: "pointer", fontFamily: "'Share Tech Mono', monospace", fontSize: "11px", letterSpacing: "0.1em" }}>← MODES</button>
        <div style={{ width: "1px", height: "14px", background: "#1a2230" }} />
        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "12px", color: "#e8a020", letterSpacing: "0.12em" }}>WORD → LETTER</div>
      </div>

      <StatsBar stats={stats} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "56px", padding: "32px" }}>

        {/* The word */}
        <div style={{
          fontSize: "clamp(36px, 9vw, 64px)",
          fontFamily: "'Share Tech Mono', monospace",
          fontWeight: 700,
          color: feedback === "correct" ? "#22c55e" : feedback === "incorrect" ? "#ef4444" : "#c8d8e8",
          letterSpacing: "0.08em",
          transition: "color 0.15s",
          userSelect: "none",
        }}>
          {question.word}
        </div>

        {/* Options */}
        <div style={{ display: "flex", gap: "16px" }}>
          {question.options.map(option => {
            const isSelected = selected === option;
            const isCorrect = option === question.letter;
            let bg = "#0c1118";
            let border = "#1e3050";
            let color = "#8a9ab8";
            if (feedback !== null) {
              if (isCorrect) { bg = "#0a1f0a"; border = "#22c55e"; color = "#22c55e"; }
              else if (isSelected && !isCorrect) { bg = "#1f0a0a"; border = "#ef4444"; color = "#ef4444"; }
            }
            return (
              <button
                key={option}
                onClick={() => pick(option)}
                style={{
                  width: "80px", height: "80px",
                  background: bg, border: `2px solid ${border}`,
                  borderRadius: "6px", cursor: feedback !== null ? "default" : "pointer",
                  color, fontFamily: "'Share Tech Mono', monospace",
                  fontSize: "32px", fontWeight: 700,
                  transition: "all 0.15s",
                }}
              >
                {option}
              </button>
            );
          })}
        </div>

        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "10px", color: "#1e2d3d", letterSpacing: "0.15em" }}>
          SELECT THE CORRECT LETTER
        </div>
      </div>
    </div>
  );
}

// ── Mode: Callsign Drill ──────────────────────────────────────────

function CallsignDrill({ onBack }: { onBack: () => void }) {
  const [callsign, setCallsign] = useState(generateCallsign);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [correct, setCorrect] = useState("");
  const [stats, setStats] = useState<Stats>({ correct: 0, total: 0, streak: 0, bestStreak: 0 });
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, [feedback]);

  const advance = useCallback(() => {
    setCallsign(generateCallsign());
    setInput("");
    setFeedback(null);
    setCorrect("");
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

  const submit = useCallback(() => {
    if (!input.trim()) return;
    const expected = callsignToPhonetic(callsign);
    const isCorrect = normalize(input) === normalize(expected);
    const newStreak = isCorrect ? stats.streak + 1 : 0;
    setStats(s => ({
      correct: s.correct + (isCorrect ? 1 : 0),
      total: s.total + 1,
      streak: newStreak,
      bestStreak: Math.max(s.bestStreak, newStreak),
    }));
    setCorrect(expected);
    setFeedback(isCorrect ? "correct" : "incorrect");
    setTimeout(advance, isCorrect ? 1000 : 2000);
  }, [input, callsign, stats.streak, advance]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080c10", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "16px 24px", borderBottom: "1px solid #1a2230", display: "flex", alignItems: "center", gap: "16px" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#3a5a7a", cursor: "pointer", fontFamily: "'Share Tech Mono', monospace", fontSize: "11px", letterSpacing: "0.1em" }}>← MODES</button>
        <div style={{ width: "1px", height: "14px", background: "#1a2230" }} />
        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "12px", color: "#e8a020", letterSpacing: "0.12em" }}>CALLSIGN DRILL</div>
      </div>

      <StatsBar stats={stats} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "40px", padding: "32px" }}>

        {/* The callsign */}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "9px", color: "#3a4a5a", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "12px" }}>Speak this callsign phonetically</div>
          <div style={{
            fontSize: "clamp(48px, 12vw, 96px)",
            fontFamily: "'Share Tech Mono', monospace",
            fontWeight: 700,
            color: feedback === "correct" ? "#22c55e" : feedback === "incorrect" ? "#ef4444" : "#e8a020",
            letterSpacing: "0.12em",
            transition: "color 0.15s",
            userSelect: "none",
          }}>
            {callsign}
          </div>
        </div>

        {/* Correct answer on miss */}
        {feedback === "incorrect" && (
          <div style={{ background: "#0a1a0a", border: "1px solid #1e3a1e", borderRadius: "6px", padding: "12px 20px", maxWidth: "480px", textAlign: "center" }}>
            <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "9px", color: "#3a6a3a", letterSpacing: "0.15em", marginBottom: "6px" }}>CORRECT ANSWER</div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#22c55e", lineHeight: 1.6 }}>{correct}</div>
          </div>
        )}

        {/* Input */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", width: "100%", maxWidth: "480px" }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="November Yankee Zero Echo..."
            disabled={feedback !== null}
            rows={3}
            style={{
              width: "100%",
              background: "#0c1118",
              border: `1px solid ${feedback === "correct" ? "#22c55e" : feedback === "incorrect" ? "#ef4444" : "#1e3050"}`,
              borderRadius: "4px",
              padding: "14px 18px",
              color: "#c8d8e8",
              fontSize: "16px",
              fontFamily: "'Inter', sans-serif",
              outline: "none",
              textAlign: "center",
              letterSpacing: "0.02em",
              resize: "none",
              lineHeight: 1.6,
              transition: "border-color 0.15s",
            }}
            onFocus={e => { if (feedback === null) e.target.style.borderColor = "#2d4a6b"; }}
            onBlur={e => { if (feedback === null) e.target.style.borderColor = "#1e3050"; }}
          />
          <button
            onClick={submit}
            disabled={!input.trim() || feedback !== null}
            style={{
              background: !input.trim() || feedback !== null ? "#0c1118" : "#e8a020",
              border: "none", borderRadius: "4px", padding: "12px 32px",
              color: !input.trim() || feedback !== null ? "#2a3a4a" : "#080c10",
              fontFamily: "'Share Tech Mono', monospace", fontSize: "12px",
              letterSpacing: "0.12em", cursor: !input.trim() || feedback !== null ? "not-allowed" : "pointer",
              transition: "background 0.15s, color 0.15s",
            }}
          >
            CONFIRM
          </button>
        </div>

        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "10px", color: "#1e2d3d", letterSpacing: "0.15em" }}>
          ENTER TO CONFIRM · SHIFT+ENTER FOR NEW LINE
        </div>
      </div>
    </div>
  );
}

// ── Home screen ───────────────────────────────────────────────────

function Home({ onSelect }: { onSelect: (mode: Mode) => void }) {
  const modes = [
    {
      id: "letter-to-word" as Mode,
      label: "Letter → Word",
      desc: "See a letter. Type the NATO word. The core skill for transmitting your callsign.",
      example: "G → ?",
      answer: "Golf",
      color: "#e8a020",
    },
    {
      id: "word-to-letter" as Mode,
      label: "Word → Letter",
      desc: "See a NATO word. Pick the correct letter. For copying a callsign being given to you.",
      example: "Whiskey → ?",
      answer: "W",
      color: "#e8a020",
    },
    {
      id: "callsign" as Mode,
      label: "Callsign Drill",
      desc: "A random callsign appears. Spell it out in full NATO phonetics.",
      example: "KD9XYZ → ?",
      answer: "Kilo Delta Nine X-ray Yankee Zulu",
      color: "#e8a020",
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#080c10", color: "#c8d8e8", fontFamily: "'Inter', sans-serif", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <div style={{ borderBottom: "1px solid #1a2230", padding: "24px 32px", display: "flex", alignItems: "baseline", gap: "16px" }}>
        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "26px", color: "#e8a020", letterSpacing: "0.08em" }}>NATOReady</div>
        <div style={{ fontSize: "11px", color: "#3a5a7a", letterSpacing: "0.15em", textTransform: "uppercase" }}>Phonetic Alphabet Drills</div>
      </div>

      {/* Hero */}
      <div style={{ padding: "48px 32px 16px", maxWidth: "600px" }}>
        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "12px", color: "#e8a020", letterSpacing: "0.1em", marginBottom: "12px" }}>
          // not the alphabet. the reflex.
        </div>
        <p style={{ fontSize: "16px", lineHeight: "1.7", color: "#6a7a8a", margin: 0 }}>
          Knowing the NATO alphabet and being able to use it on the air are different things.
          These drills build the reflexive recall you need when someone asks for your callsign
          and there is static on the line.
        </p>
      </div>

      {/* Reference strip */}
      <div style={{ margin: "24px 32px", padding: "16px 20px", background: "#0c1118", border: "1px solid #1a2230", borderRadius: "4px", overflowX: "auto" }}>
        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "9px", color: "#3a4a5a", letterSpacing: "0.18em", marginBottom: "10px" }}>QUICK REFERENCE</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 0", minWidth: "480px" }}>
          {LETTERS.map(l => (
            <div key={l} style={{ width: "calc(100% / 13)", textAlign: "center" }}>
              <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "13px", color: "#e8a020", fontWeight: 700 }}>{l}</div>
              <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "8px", color: "#3a5a6a", letterSpacing: "0.04em" }}>{NATO[l]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Mode cards */}
      <div style={{ padding: "8px 32px 48px", display: "flex", flexDirection: "column", gap: "12px", maxWidth: "640px" }}>
        {modes.map(mode => (
          <button
            key={mode.id}
            onClick={() => onSelect(mode.id)}
            style={{
              background: "#0c1118", border: "1px solid #1a2230", borderRadius: "6px",
              padding: "20px 24px", cursor: "pointer", textAlign: "left",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              gap: "24px", transition: "border-color 0.15s, background 0.15s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#e8a020"; (e.currentTarget as HTMLButtonElement).style.background = "#10160c"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#1a2230"; (e.currentTarget as HTMLButtonElement).style.background = "#0c1118"; }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "13px", color: "#e8a020", letterSpacing: "0.06em", marginBottom: "6px", fontWeight: 700 }}>
                {mode.label}
              </div>
              <div style={{ fontSize: "13px", color: "#4a5a6a", lineHeight: 1.5 }}>{mode.desc}</div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "16px", color: "#3a5a7a", marginBottom: "2px" }}>{mode.example}</div>
              <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "11px", color: "#22c55e" }}>{mode.answer}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div style={{ marginTop: "auto", padding: "16px 32px", borderTop: "1px solid #1a2230", display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "11px", color: "#1e2d3d", letterSpacing: "0.1em" }}>NY0E.COM</span>
        <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "11px", color: "#1e2d3d", letterSpacing: "0.1em" }}>73</span>
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────

export default function NATOReady() {
  const [mode, setMode] = useState<Mode>("home");

  if (mode === "letter-to-word") return <LetterToWord onBack={() => setMode("home")} />;
  if (mode === "word-to-letter") return <WordToLetter onBack={() => setMode("home")} />;
  if (mode === "callsign") return <CallsignDrill onBack={() => setMode("home")} />;
  return <Home onSelect={setMode} />;
}
