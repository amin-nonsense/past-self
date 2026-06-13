"use client";

import { useState, useRef, useEffect } from "react";
import { loadData, saveData, addFragment, mergePastSelf, AppData, HistoryEntry } from "@/lib/storage";

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
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function Home() {
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

  useEffect(() => {
    const data = loadData();
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
    if (!transcript.trim() || !appData) return;
    const fragment = transcript;
    const now = new Date().toISOString();
    setTranscript("");

    const updatedData = addFragment(appData, fragment);
    const newCount = updatedData.letterCount + 1;
    const askAboutPast = newCount % 5 === 0;
    const dataWithCount = { ...updatedData, letterCount: newCount };
    saveData(dataWithCount);
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
        saveData(finalData);
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
              placeholder={status === "reply" ? "返事を書く..." : "今日のことを話すか、書いてください"}
              value={transcript + interim}
              onChange={(e) => setTranscript(e.target.value)}
              style={{ width: "100%", backgroundColor: "transparent", border: "none", borderBottom: "1px solid #E0E0E0", padding: "8px 0", fontSize: "14px", color: "#2D2D2D", fontFamily: "inherit", resize: "none", minHeight: "100px", outline: "none", lineHeight: "1.9", boxSizing: "border-box" }}
            />
            <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
              <button
                onClick={isRecording ? stopRecording : startRecording}
                style={{ flex: 1, padding: "13px", backgroundColor: isRecording ? "#FEF2F2" : "transparent", color: isRecording ? "#EF4444" : "#999", border: "1px solid", borderColor: isRecording ? "#FECACA" : "#DDD", borderRadius: "2px", fontSize: "13px", fontFamily: "inherit", cursor: "pointer" }}
              >
                {isRecording ? "● 録音中" : "🎤 話す"}
              </button>
              <button
                onClick={sendFragment}
                disabled={!transcript.trim()}
                style={{ flex: 1, padding: "13px", backgroundColor: transcript.trim() ? "#2D2D2D" : "#EEE", color: transcript.trim() ? "#FFF" : "#AAA", border: "none", borderRadius: "2px", fontSize: "13px", fontFamily: "inherit", cursor: transcript.trim() ? "pointer" : "default" }}
              >
                送る
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
                もらった手紙
              </button>
              <button
                onClick={() => setHistoryTab("fragments")}
                style={{ flex: 1, padding: "10px", fontSize: "11px", border: "none", backgroundColor: "transparent", borderBottom: historyTab === "fragments" ? "2px solid #2D2D2D" : "2px solid transparent", color: historyTab === "fragments" ? "#2D2D2D" : "#BBB", cursor: "pointer", fontFamily: "inherit" }}
              >
                送ったこと
              </button>
            </div>

            {historyTab === "letters" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {letters.map((letter) => (
                  <div key={letter.id} style={{ borderLeft: "1px solid #EEE", paddingLeft: "16px" }}>
                    {letter.timestamp && (
                      <p style={{ fontSize: "10px", color: "#CCC", marginBottom: "8px" }}>{formatDate(letter.timestamp)}</p>
                    )}
                    <p style={{ fontSize: "13px", color: "#AAA", lineHeight: "1.9", whiteSpace: "pre-wrap", fontFamily: "'Noto Serif JP', Georgia, serif" }}>
                      {letter.text}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {historyTab === "fragments" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {fragments.map((fragment) => (
                  <div key={fragment.id} style={{ borderLeft: "1px solid #EEE", paddingLeft: "16px" }}>
                    {fragment.timestamp && (
                      <p style={{ fontSize: "10px", color: "#CCC", marginBottom: "8px" }}>{formatDate(fragment.timestamp)}</p>
                    )}
                    <p style={{ fontSize: "13px", color: "#AAA", lineHeight: "1.9", whiteSpace: "pre-wrap" }}>
                      {fragment.text}
                    </p>
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
