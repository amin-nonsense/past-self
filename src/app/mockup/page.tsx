"use client";
import { useState } from "react";

const LETTER = "自転車でねてるとき、おちないのかな。ぼくもねながらうごいてるもの好きかも、電車とか。こがねいこうえんってどんなとこ。じてんしゃのまえのせきってちいさいこ用だよね、じゃあうしろのせきのひとがこぐの。あたまがからっぽって、どんなかんじかわからない。";
const INPUT = "今日は次女を連れて小金井公園に行った帰り道で...";

function MockA() {
  return (
    <main style={{ backgroundColor: "#FDF6E3", minHeight: "100vh", display: "flex", justifyContent: "center", padding: "48px 16px", fontFamily: "'Noto Serif JP', Georgia, serif" }}>
      <div style={{ width: "100%", maxWidth: "360px" }}>
        <p style={{ textAlign: "center", color: "#9C8B6E", fontSize: "11px", letterSpacing: "0.2em", marginBottom: "40px" }}>過去のあみんから</p>

        <div style={{
          backgroundColor: "#FFFEF7", border: "1px solid #D9CEB2", borderRadius: "4px", padding: "28px 24px", marginBottom: "32px",
          backgroundImage: "repeating-linear-gradient(transparent, transparent 27px, #E8DFC8 27px, #E8DFC8 28px)",
          backgroundPositionY: "36px", lineHeight: "28px",
        }}>
          <p style={{ fontSize: "11px", color: "#B8A88A", marginBottom: "16px" }}>小学生のあみんより</p>
          <p style={{ fontSize: "15px", color: "#3D3020", lineHeight: "2" }}>{LETTER}</p>
          <div style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
            <button style={{ flex: 1, padding: "10px", backgroundColor: "#3D3020", color: "#FDF6E3", border: "none", borderRadius: "2px", fontSize: "12px", fontFamily: "inherit", cursor: "pointer" }}>返事を書く</button>
            <button style={{ flex: 1, padding: "10px", backgroundColor: "transparent", color: "#9C8B6E", border: "1px solid #D9CEB2", borderRadius: "2px", fontSize: "12px", fontFamily: "inherit", cursor: "pointer" }}>返事しない</button>
          </div>
        </div>

        <hr style={{ border: "none", borderTop: "1px solid #D9CEB2", marginBottom: "32px" }} />

        <textarea readOnly defaultValue={INPUT} style={{ width: "100%", backgroundColor: "transparent", border: "none", borderBottom: "1px solid #D9CEB2", padding: "8px 0", fontSize: "14px", color: "#3D3020", fontFamily: "inherit", resize: "none", minHeight: "80px", outline: "none", lineHeight: "1.8", boxSizing: "border-box" }} />
        <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
          <button style={{ flex: 1, padding: "12px", backgroundColor: "transparent", color: "#9C8B6E", border: "1px solid #D9CEB2", borderRadius: "2px", fontSize: "13px", fontFamily: "inherit", cursor: "pointer" }}>🎤 話す</button>
          <button style={{ flex: 1, padding: "12px", backgroundColor: "#3D3020", color: "#FDF6E3", border: "none", borderRadius: "2px", fontSize: "13px", fontFamily: "inherit", cursor: "pointer" }}>送る</button>
        </div>
      </div>
    </main>
  );
}

function MockB() {
  return (
    <main style={{ backgroundColor: "#FFFFFF", minHeight: "100vh", display: "flex", justifyContent: "center", padding: "48px 16px", fontFamily: "-apple-system, 'Hiragino Sans', sans-serif" }}>
      <div style={{ width: "100%", maxWidth: "360px" }}>
        <p style={{ textAlign: "center", color: "#999", fontSize: "11px", letterSpacing: "0.1em", marginBottom: "40px" }}>過去のあみんから</p>

        <div style={{ marginBottom: "32px" }}>
          <p style={{ fontSize: "11px", color: "#BBB", marginBottom: "12px" }}>小学生のあみんより</p>
          <p style={{ fontSize: "15px", color: "#222", lineHeight: "1.9" }}>{LETTER}</p>
          <div style={{ marginTop: "20px", display: "flex", gap: "12px" }}>
            <button style={{ flex: 1, padding: "10px", backgroundColor: "#111", color: "#FFF", border: "none", borderRadius: "0px", fontSize: "12px", fontFamily: "inherit", cursor: "pointer" }}>返事を書く</button>
            <button style={{ flex: 1, padding: "10px", backgroundColor: "transparent", color: "#999", border: "1px solid #DDD", borderRadius: "0px", fontSize: "12px", fontFamily: "inherit", cursor: "pointer" }}>返事しない</button>
          </div>
        </div>

        <hr style={{ border: "none", borderTop: "1px solid #EEE", marginBottom: "32px" }} />

        <textarea readOnly defaultValue={INPUT} style={{ width: "100%", backgroundColor: "transparent", border: "none", borderBottom: "1px solid #EEE", padding: "8px 0", fontSize: "14px", color: "#222", fontFamily: "inherit", resize: "none", minHeight: "80px", outline: "none", lineHeight: "1.8", boxSizing: "border-box" }} />
        <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
          <button style={{ flex: 1, padding: "12px", backgroundColor: "transparent", color: "#999", border: "1px solid #DDD", borderRadius: "0px", fontSize: "13px", fontFamily: "inherit", cursor: "pointer" }}>🎤 話す</button>
          <button style={{ flex: 1, padding: "12px", backgroundColor: "#111", color: "#FFF", border: "none", borderRadius: "0px", fontSize: "13px", fontFamily: "inherit", cursor: "pointer" }}>送る</button>
        </div>
      </div>
    </main>
  );
}

function MockC() {
  return (
    <main style={{ backgroundColor: "#FFFFFF", minHeight: "100vh", display: "flex", justifyContent: "center", padding: "48px 16px", fontFamily: "-apple-system, 'Hiragino Sans', sans-serif" }}>
      <div style={{ width: "100%", maxWidth: "360px" }}>
        <p style={{ textAlign: "center", color: "#999", fontSize: "11px", letterSpacing: "0.15em", marginBottom: "40px", fontFamily: "'Noto Serif JP', Georgia, serif" }}>過去のあみんから</p>

        <div style={{ borderLeft: "2px solid #D9CEB2", paddingLeft: "20px", marginBottom: "32px" }}>
          <p style={{ fontSize: "11px", color: "#B8A88A", marginBottom: "12px", fontFamily: "'Noto Serif JP', Georgia, serif" }}>小学生のあみんより</p>
          <p style={{ fontSize: "15px", color: "#2D2D2D", lineHeight: "1.9", fontFamily: "'Noto Serif JP', Georgia, serif" }}>{LETTER}</p>
          <div style={{ marginTop: "20px", display: "flex", gap: "12px" }}>
            <button style={{ flex: 1, padding: "10px", backgroundColor: "#2D2D2D", color: "#FFF", border: "none", borderRadius: "2px", fontSize: "12px", fontFamily: "-apple-system, sans-serif", cursor: "pointer" }}>返事を書く</button>
            <button style={{ flex: 1, padding: "10px", backgroundColor: "transparent", color: "#999", border: "1px solid #DDD", borderRadius: "2px", fontSize: "12px", fontFamily: "-apple-system, sans-serif", cursor: "pointer" }}>返事しない</button>
          </div>
        </div>

        <hr style={{ border: "none", borderTop: "1px solid #EEE", marginBottom: "32px" }} />

        <textarea readOnly defaultValue={INPUT} style={{ width: "100%", backgroundColor: "transparent", border: "none", borderBottom: "1px solid #EEE", padding: "8px 0", fontSize: "14px", color: "#2D2D2D", fontFamily: "-apple-system, sans-serif", resize: "none", minHeight: "80px", outline: "none", lineHeight: "1.8", boxSizing: "border-box" }} />
        <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
          <button style={{ flex: 1, padding: "12px", backgroundColor: "transparent", color: "#999", border: "1px solid #DDD", borderRadius: "2px", fontSize: "13px", fontFamily: "inherit", cursor: "pointer" }}>🎤 話す</button>
          <button style={{ flex: 1, padding: "12px", backgroundColor: "#2D2D2D", color: "#FFF", border: "none", borderRadius: "2px", fontSize: "13px", fontFamily: "inherit", cursor: "pointer" }}>送る</button>
        </div>
      </div>
    </main>
  );
}

export default function Mockup() {
  const [tab, setTab] = useState<"A" | "B" | "C">("A");
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "center", gap: "0", position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, backgroundColor: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)", borderBottom: "1px solid #EEE" }}>
        {(["A", "B", "C"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, maxWidth: "120px", padding: "12px", fontSize: "13px", border: "none", borderBottom: tab === t ? "2px solid #333" : "2px solid transparent", backgroundColor: "transparent", cursor: "pointer", color: tab === t ? "#333" : "#999", fontWeight: tab === t ? "bold" : "normal" }}>
            {t === "A" ? "A：便箋" : t === "B" ? "B：無機質" : "C：中間"}
          </button>
        ))}
      </div>
      <div style={{ paddingTop: "48px" }}>
        {tab === "A" && <MockA />}
        {tab === "B" && <MockB />}
        {tab === "C" && <MockC />}
      </div>
    </div>
  );
}
