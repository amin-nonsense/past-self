"use client";

import { useState, useRef, useEffect } from "react";
import { addFragment, mergePastSelf, AppData, HistoryEntry } from "@/lib/storage";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SpeechRecognition: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    webkitSpeechRecognition: any;
  }
}

type Letter = { id: string; text: string; timestamp: string };
type Fragment = { id: string; text: string; timestamp: string };

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function groupByDate<T extends { timestamp: string }>(items: T[]): { date: string; items: T[] }[] {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const key = item.timestamp ? formatDate(item.timestamp) : "日付不明";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  }
  return Array.from(map.entries()).map(([date, items]) => ({ date, items }));
}

const MicIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

export default function Home() {
  const [pin, setPin] = useState<string | null>(null);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [appData, setAppData] = useState<AppData | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [pendingLetter, setPendingLetter] = useState<Letter | null>(null);
  const [letters, setLetters] = useState<Letter[]>([]);
  const [fragments, setFragments] = useState<Fragment[]>([]);
  const [status, setStatus] = useState<"idle" | "waiting" | "arrived" | "reply">("idle");
  const [historyTab, setHistoryTab] = useState<"letters" | "fragments">("letters");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const DELAY_MIN = 0;
  const DELAY_MAX = 0;

  const defaultAppData = (): AppData => ({
    pastSelf: { places: [], things: [], people: [], habits: [], emotions: [], selfImage: [] },
    presentSelf: {},
    history: [],
    letterCount: 0,
  });

  const loadFromKV = async (p: string) => {
    const res = await fetch("/api/data/load", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin: p }),
    });
    const { data } = await res.json();
    return (data as AppData) ?? defaultAppData();
  };

  const saveToKV = async (p: string, data: AppData) => {
    await fetch("/api/data/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin: p, data }),
    });
  };

  const handlePinSubmit = async () => {
    const p = pinInput.trim();
    if (!p) return;
    const data = await loadFromKV(p);
    setPin(p);
    setAppData(data);
    const restoredLetters = data.history
      .filter((m) => m.role === "assistant")
      .map((m, i) => ({ id: String(i), text: m.content, timestamp: m.timestamp ?? "" }))
      .reverse();
    setLetters(restoredLetters);
    const restoredFragments = data.history
      .filter((m) => m.role === "user")
      .map((m, i) => ({ id: String(i), text: m.content, timestamp: m.timestamp ?? "" }))
      .reverse();
    setFragments(restoredFragments);
  };

  useEffect(() => {
    const savedPin = localStorage.getItem("past-self-pin");
    if (savedPin) {
      setPinInput(savedPin);
      loadFromKV(savedPin).then((data) => {
        setPin(savedPin);
        setAppData(data);
        const restoredLetters = data.history
          .filter((m) => m.role === "assistant")
          .map((m, i) => ({ id: String(i), text: m.content, timestamp: m.timestamp ?? "" }))
          .reverse();
        setLetters(restoredLetters);
        const restoredFragments = data.history
          .filter((m) => m.role === "user")
          .map((m, i) => ({ id: String(i), text: m.content, timestamp: m.timestamp ?? "" }))
          .reverse();
        setFragments(restoredFragments);
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { alert("Chromeで開いてください"); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = "ja-JP";
    recognition.continuous = true;
    recognition.interimResults = true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let finalText = "";
      let interimText = "";
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) finalText += event.results[i][0].transcript;
        else interimText += event.results[i][0].transcript;
      }
      if (finalText) setTranscript((prev) => prev + finalText);
      setInterim(interimText);
    };
    recognition.onend = () => setInterim("");
    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
    setInterim("");
  };

  const sendFragment = async () => {
    if (!transcript.trim() || !appData || !pin) return;
    const fragment = transcript;
    const now = new Date().toISOString();
    setTranscript("");

    const updatedData = addFragment(appData, fragment);
    const newCount = updatedData.letterCount + 1;
    const askAboutPast = newCount % 5 === 0;
    const dataWithCount = { ...updatedData, letterCount: newCount };
    await saveToKV(pin, dataWithCount);
    setAppData(dataWithCount);
    setStatus("waiting");

    const newFragment: Fragment = { id: now, text: fragment, timestamp: now };
    setFragments((prev) => [newFragment, ...prev]);

    const delay = DELAY_MIN + Math.random() * (DELAY_MAX - DELAY_MIN);

    setTimeout(async () => {
      try {
        const res = await fetch("/api/letter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fragment,
            history: dataWithCount.history,
            appData: dataWithCount,
            askAboutPast,
          }),
        });
        const { letter } = await res.json();

        const letterTime = new Date().toISOString();
        const newHistory: HistoryEntry[] = [
          ...dataWithCount.history,
          { role: "user", content: fragment, timestamp: now },
          { role: "assistant", content: letter, timestamp: letterTime },
        ];

        const recentConversation = `大人のあみん：${fragment}\n小学生のあみん：${letter}`;
        const extractRes = await fetch("/api/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversation: recentConversation }),
        });
        const { extracted } = await extractRes.json();
        const updatedPastSelf = mergePastSelf(dataWithCount.pastSelf, extracted);

        const finalData: AppData = {
          ...dataWithCount,
          history: newHistory,
          pastSelf: updatedPastSelf,
        };
        await saveToKV(pin!, finalData);
        setAppData(finalData);

        const newLetter: Letter = { id: letterTime, text: letter, timestamp: letterTime };
        setPendingLetter(newLetter);
        setLetters((prev) => [newLetter, ...prev]);
        setStatus("arrived");
      } catch (e) {
        console.error(e);
        setStatus("idle");
      }
    }, delay);
  };

  const hasHistory = letters.length > 0 || fragments.length > 0;

  if (!pin) {
    return (
      <main style={{ backgroundColor: "#FFFFFF", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px", fontFamily: "-apple-system, 'Hiragino Sans', sans-serif" }}>
        <div style={{ width: "100%", maxWidth: "280px" }}>
          <p style={{ textAlign: "center", color: "#999", fontSize: "11px", letterSpacing: "0.15em", marginBottom: "40px", fontFamily: "'Noto Serif JP', Georgia, serif" }}>
            過去のあみんから
          </p>
          <input
            type="text"
            placeholder="PIN"
            value={pinInput}
            onChange={(e) => { setPinInput(e.target.value); setPinError(false); }}
            onKeyDown={(e) => e.key === "Enter" && handlePinSubmit()}
            style={{ width: "100%", border: "none", borderBottom: `1px solid ${pinError ? "#EF4444" : "#E0E0E0"}`, padding: "8px 0", fontSize: "18px", textAlign: "center", letterSpacing: "0.3em", outline: "none", marginBottom: "24px", boxSizing: "border-box", backgroundColor: "transparent" }}
          />
          <button
            onClick={() => { localStorage.setItem("past-self-pin", pinInput.trim()); handlePinSubmit(); }}
            style={{ width: "100%", padding: "13px", backgroundColor: pinInput.trim() ? "#2D2D2D" : "#EEE", color: pinInput.trim() ? "#FFF" : "#AAA", border: "none", borderRadius: "2px", fontSize: "13px", cursor: pinInput.trim() ? "pointer" : "default", fontFamily: "inherit" }}
          >
            入る
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={{ backgroundColor: "#FFFFFF", minHeight: "100vh", display: "flex", justifyContent: "center", padding: "56px 20px 40px", fontFamily: "-apple-system, 'Hiragino Sans', sans-serif" }}>
      <div style={{ width: "100%", maxWidth: "360px" }}>

        <p style={{ textAlign: "center", color: "#999", fontSize: "11px", letterSpacing: "0.15em", marginBottom: "44px", fontFamily: "'Noto Serif JP', Georgia, serif" }}>
          過去のあみんから
        </p>

        {status === "waiting" && (
          <p style={{ textAlign: "center", color: "#BBB", fontSize: "13px", padding: "60px 0", fontFamily: "'Noto Serif JP', Georgia, serif" }}>
            むこうで読んでる…
          </p>
        )}

        {(status === "arrived" || status === "reply") && pendingLetter && (
          <div style={{ borderLeft: "2px solid #D9CEB2", paddingLeft: "20px", marginBottom: "32px" }}>
            <p style={{ fontSize: "11px", color: "#B8A88A", marginBottom: "14px", fontFamily: "'Noto Serif JP', Georgia, serif" }}>
              小学生のあみんより
            </p>
            <p style={{ fontSize: "15px", color: "#2D2D2D", lineHeight: "2", fontFamily: "'Noto Serif JP', Georgia, serif", whiteSpace: "pre-wrap" }}>
              {pendingLetter.text}
            </p>
            {status === "arrived" && (
              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <button onClick={() => setStatus("reply")} style={{ flex: 1, padding: "11px", backgroundColor: "#2D2D2D", color: "#FFF", border: "none", borderRadius: "2px", fontSize: "12px", fontFamily: "inherit", cursor: "pointer" }}>返事を書く</button>
                <button onClick={() => { setPendingLetter(null); setStatus("idle"); }} style={{ flex: 1, padding: "11px", backgroundColor: "transparent", color: "#999", border: "1px solid #DDD", borderRadius: "2px", fontSize: "12px", fontFamily: "inherit", cursor: "pointer" }}>返事しない</button>
              </div>
            )}
          </div>
        )}

        {status === "reply" && (
          <hr style={{ border: "none", borderTop: "1px solid #EEE", marginBottom: "28px" }} />
        )}

        {(status === "idle" || status === "reply") && (
          <div>
            <textarea
              placeholder={status === "reply" ? "返事を書く..." : "今日のことを教えて"}
              value={transcript + interim}
              onChange={(e) => setTranscript(e.target.value)}
              style={{ width: "100%", backgroundColor: "transparent", border: "none", borderBottom: "1px solid #E0E0E0", padding: "8px 0", fontSize: "14px", color: "#2D2D2D", fontFamily: "inherit", resize: "none", minHeight: "100px", outline: "none", lineHeight: "1.9", boxSizing: "border-box" }}
            />
            <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
              <button
                onClick={isRecording ? stopRecording : startRecording}
                style={{ flex: 1, padding: "13px", backgroundColor: isRecording ? "#FEF2F2" : "transparent", color: isRecording ? "#EF4444" : "#999", border: "1px solid", borderColor: isRecording ? "#FECACA" : "#DDD", borderRadius: "2px", fontSize: "13px", fontFamily: "inherit", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
              >
                {isRecording ? <><span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#EF4444", display: "inline-block" }} />録音中</> : <><MicIcon />話す</>}
              </button>
              <button
                onClick={sendFragment}
                disabled={!transcript.trim()}
                style={{ flex: 1, padding: "13px", backgroundColor: transcript.trim() ? "#2D2D2D" : "#EEE", color: transcript.trim() ? "#FFF" : "#AAA", border: "none", borderRadius: "2px", fontSize: "13px", fontFamily: "inherit", cursor: transcript.trim() ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
              >
                <SendIcon />送る
              </button>
            </div>
          </div>
        )}

        {/* 履歴エリア */}
        {hasHistory && status === "idle" && (
          <div style={{ marginTop: "48px" }}>
            {/* タブ */}
            <div style={{ display: "flex", borderBottom: "1px solid #EEE", marginBottom: "24px" }}>
              <button
                onClick={() => setHistoryTab("letters")}
                style={{ flex: 1, padding: "10px", fontSize: "11px", border: "none", backgroundColor: "transparent", borderBottom: historyTab === "letters" ? "2px solid #2D2D2D" : "2px solid transparent", color: historyTab === "letters" ? "#2D2D2D" : "#BBB", cursor: "pointer", fontFamily: "inherit" }}
              >
                届いた
              </button>
              <button
                onClick={() => setHistoryTab("fragments")}
                style={{ flex: 1, padding: "10px", fontSize: "11px", border: "none", backgroundColor: "transparent", borderBottom: historyTab === "fragments" ? "2px solid #2D2D2D" : "2px solid transparent", color: historyTab === "fragments" ? "#2D2D2D" : "#BBB", cursor: "pointer", fontFamily: "inherit" }}
              >
                送った
              </button>
            </div>

            {historyTab === "letters" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                {groupByDate(letters).map(({ date, items }) => (
                  <div key={date}>
                    <p style={{ fontSize: "10px", color: "#CCC", letterSpacing: "0.05em", marginBottom: "16px" }}>{date}</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                      {items.map((letter) => (
                        <div key={letter.id} style={{ borderLeft: "1px solid #EEE", paddingLeft: "16px" }}>
                          <p style={{ fontSize: "10px", color: "#DDD", marginBottom: "8px" }}>{formatTime(letter.timestamp)}</p>
                          <p style={{ fontSize: "13px", color: "#AAA", lineHeight: "1.9", whiteSpace: "pre-wrap", fontFamily: "'Noto Serif JP', Georgia, serif" }}>
                            {letter.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {historyTab === "fragments" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                {groupByDate(fragments).map(({ date, items }) => (
                  <div key={date}>
                    <p style={{ fontSize: "10px", color: "#CCC", letterSpacing: "0.05em", marginBottom: "16px" }}>{date}</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                      {items.map((fragment) => (
                        <div key={fragment.id} style={{ borderLeft: "1px solid #EEE", paddingLeft: "16px" }}>
                          <p style={{ fontSize: "10px", color: "#DDD", marginBottom: "8px" }}>{formatTime(fragment.timestamp)}</p>
                          <p style={{ fontSize: "13px", color: "#AAA", lineHeight: "1.9", whiteSpace: "pre-wrap" }}>
                            {fragment.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
