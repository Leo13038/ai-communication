"use client";

import { useState } from "react";

type RewriteResult = {
  emotion: string;
  need: string;
  risk: number;
  rewrite: {
    gentle: string;
    firm: string;
    brief: string;
  };
};

export default function Home() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<RewriteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<"gentle" | "firm" | "brief" | "">("");

  const handleRewrite = async () => {
    if (!text.trim()) {
      setError("请先输入一句话");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/rewrite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "请求失败");
      }

      setResult(data);
      setCopied("");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("出错了，请稍后再试");
      }
    } finally {
      setLoading(false);
    }
  };

  const copyText = async (key: "gentle" | "firm" | "brief", value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setError("复制失败，请手动复制");
    }
  };

  const riskInfo =
    result?.risk !== undefined
      ? result.risk < 30
        ? { color: "#2baf70", label: "低" }
        : result.risk < 60
        ? { color: "#d38f27", label: "中" }
        : { color: "#de5667", label: "高" }
      : { color: "#6b7280", label: "-" };

  return (
    <main className="page">
      <div className="float one" />
      <div className="float two" />

      <section className="shell">
        <header className="head">
          <div>
            <h1>好好说话</h1>
            <p className="subtitle">把上头的话，换成对方更愿意回的聊天消息。</p>
          </div>
          <div className="status">
            <span className="dot" />
            对方在线中
          </div>
        </header>

        <div className="composer">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="比如：你怎么又不回我"
          />
          <div className="actions">
            <button onClick={handleRewrite} disabled={loading}>
              {loading ? "改写中..." : "帮我润色一下"}
            </button>
          </div>
          {error && <p className="error">{error}</p>}
        </div>

        {result && (
          <section className="result">
            <div className="meta">
              <div className="chip">
                <span className="label">情绪</span>
                <span className="value">{result.emotion}</span>
              </div>
              <div className="chip">
                <span className="label">我的需要</span>
                <span className="value">{result.need}</span>
              </div>
            </div>

            <div className="risk">
              <div className="risk-title">
                <span>冲突风险</span>
                <span style={{ color: riskInfo.color }}>
                  {result.risk}% · {riskInfo.label}
                </span>
              </div>
              <div className="bar">
                <div
                  className="bar-fill"
                  style={{ width: `${result.risk}%`, background: riskInfo.color }}
                />
              </div>
            </div>

            <div className="chat">
              <article className="bubble left">
                <div className="bubble-head">
                  <h3>温和版</h3>
                  <button onClick={() => copyText("gentle", result.rewrite.gentle)}>
                    {copied === "gentle" ? "已复制" : "复制"}
                  </button>
                </div>
                <p>{result.rewrite.gentle}</p>
              </article>

              <article className="bubble right">
                <div className="bubble-head">
                  <h3>坚定版</h3>
                  <button onClick={() => copyText("firm", result.rewrite.firm)}>
                    {copied === "firm" ? "已复制" : "复制"}
                  </button>
                </div>
                <p>{result.rewrite.firm}</p>
              </article>

              <article className="bubble left small">
                <div className="bubble-head">
                  <h3>简洁版</h3>
                  <button onClick={() => copyText("brief", result.rewrite.brief)}>
                    {copied === "brief" ? "已复制" : "复制"}
                  </button>
                </div>
                <p>{result.rewrite.brief}</p>
              </article>
            </div>
          </section>
        )}
      </section>

      <style jsx>{`
        .page {
          --bg1: #f4f7ff;
          --bg2: #eef3ff;
          --bg3: #fbfdff;
          --glass: rgba(255, 255, 255, 0.5);
          --glass-strong: rgba(255, 255, 255, 0.66);
          --line: rgba(255, 255, 255, 0.52);
          --text: #182033;
          --muted: #53607e;
          min-height: 100vh;
          padding: 32px 16px 48px;
          position: relative;
          overflow: hidden;
          background: linear-gradient(160deg, var(--bg1) 0%, var(--bg2) 42%, var(--bg3) 100%);
          color: var(--text);
          font-family: "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif;
        }

        .page::before,
        .page::after {
          content: "";
          position: absolute;
          inset: -20%;
          pointer-events: none;
        }

        .page::before {
          background: radial-gradient(circle at 20% 16%, #d8e7ff 0%, transparent 34%),
            radial-gradient(circle at 84% 13%, #ffe6ef 0%, transparent 32%),
            radial-gradient(circle at 70% 76%, #d8f6ff 0%, transparent 30%);
        }

        .page::after {
          opacity: 0.45;
          background-image: linear-gradient(
            120deg,
            rgba(255, 255, 255, 0.18) 0%,
            rgba(255, 255, 255, 0) 28%,
            rgba(255, 255, 255, 0.15) 60%,
            rgba(255, 255, 255, 0) 100%
          );
        }

        .float {
          position: absolute;
          border-radius: 999px;
          filter: blur(58px);
          opacity: 0.68;
          pointer-events: none;
        }

        .float.one {
          width: 320px;
          height: 320px;
          background: #bfd4ff;
          top: -70px;
          left: -120px;
          animation: drift 12s ease-in-out infinite;
        }

        .float.two {
          width: 360px;
          height: 360px;
          background: #ffd9e8;
          right: -150px;
          top: 38%;
          animation: drift 14s ease-in-out infinite reverse;
        }

        .shell {
          position: relative;
          z-index: 1;
          max-width: 920px;
          margin: 0 auto;
          padding: 28px;
          border-radius: 34px;
          background: var(--glass);
          border: 1px solid var(--line);
          backdrop-filter: blur(26px) saturate(150%);
          -webkit-backdrop-filter: blur(26px) saturate(150%);
          box-shadow: 0 24px 68px rgba(40, 62, 120, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.8);
        }

        .head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 20px;
        }

        h1 {
          margin: 0;
          font-size: clamp(38px, 7vw, 58px);
          line-height: 0.98;
          font-family: "SF Pro Display", "PingFang SC", "Segoe UI", sans-serif;
          font-weight: 600;
          letter-spacing: -0.02em;
          color: #111a2c;
          text-shadow: 0 1px 0 rgba(255, 255, 255, 0.6);
        }

        .subtitle {
          margin: 14px 0 0;
          color: var(--muted);
          font-size: 15px;
          line-height: 1.7;
        }

        .status {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.62);
          color: #33456c;
          border: 1px solid rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(12px);
          font-size: 13px;
          white-space: nowrap;
          box-shadow: 0 8px 20px rgba(89, 109, 170, 0.12);
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #45d38c;
          box-shadow: 0 0 0 6px rgba(69, 211, 140, 0.23);
        }

        .composer {
          padding: 18px;
          border: 1px solid rgba(255, 255, 255, 0.68);
          border-radius: 24px;
          background: var(--glass-strong);
          backdrop-filter: blur(16px);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
        }

        textarea {
          width: 100%;
          min-height: 156px;
          border: none;
          outline: none;
          resize: vertical;
          font-size: 17px;
          line-height: 1.7;
          background: transparent;
          color: #1c2740;
          font-family: inherit;
        }

        textarea::placeholder {
          color: #8090b0;
        }

        .actions {
          margin-top: 12px;
          display: flex;
          justify-content: flex-end;
        }

        .actions button {
          border: 1px solid rgba(255, 255, 255, 0.8);
          border-radius: 999px;
          padding: 11px 20px;
          background: linear-gradient(135deg, #6e8fff 0%, #8fa4ff 100%);
          color: #fff;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.18s ease;
          box-shadow: 0 10px 24px rgba(80, 107, 208, 0.33), inset 0 1px 0 rgba(255, 255, 255, 0.4);
        }

        .actions button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 14px 28px rgba(80, 107, 208, 0.36), inset 0 1px 0 rgba(255, 255, 255, 0.5);
        }

        .actions button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error {
          margin: 10px 0 0;
          color: #d13f60;
          font-size: 14px;
        }

        .result {
          margin-top: 20px;
          padding: 18px;
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.7);
          background: rgba(255, 255, 255, 0.58);
          backdrop-filter: blur(16px);
          animation: reveal 0.38s ease;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
        }

        .meta {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .chip {
          padding: 12px 14px;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.75);
          background: rgba(255, 255, 255, 0.62);
          backdrop-filter: blur(12px);
        }

        .label {
          font-size: 12px;
          color: #6a7694;
          display: block;
          margin-bottom: 4px;
        }

        .value {
          font-size: 15px;
          color: #1d2942;
        }

        .risk {
          margin-top: 12px;
          background: rgba(255, 255, 255, 0.62);
          padding: 12px 14px;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.76);
          backdrop-filter: blur(12px);
        }

        .risk-title {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 8px;
          font-size: 13px;
          color: #5e6f92;
        }

        .bar {
          width: 100%;
          height: 8px;
          border-radius: 999px;
          background: rgba(144, 163, 205, 0.22);
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          border-radius: 999px;
          transition: width 0.35s ease;
        }

        .chat {
          margin-top: 14px;
          display: grid;
          gap: 10px;
        }

        .bubble {
          max-width: 86%;
          padding: 11px 13px;
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.78);
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 18px rgba(60, 83, 143, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8);
        }

        .bubble.left {
          justify-self: start;
          background: rgba(255, 255, 255, 0.72);
        }

        .bubble.right {
          justify-self: end;
          background: rgba(217, 233, 255, 0.74);
          border-color: rgba(255, 255, 255, 0.8);
        }

        .bubble.small {
          background: rgba(245, 240, 255, 0.76);
          border-color: rgba(255, 255, 255, 0.8);
        }

        .bubble-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-bottom: 4px;
        }

        h3 {
          margin: 0;
          font-size: 13px;
          color: #4f5f81;
          font-weight: 600;
        }

        .bubble p {
          margin: 0;
          font-size: 16px;
          line-height: 1.65;
          color: #1b2740;
          word-break: break-word;
        }

        .bubble button {
          border: 1px solid rgba(255, 255, 255, 0.82);
          background: rgba(255, 255, 255, 0.76);
          border-radius: 999px;
          padding: 4px 10px;
          font-size: 12px;
          color: #4c5f86;
          cursor: pointer;
          transition: background 0.18s ease, transform 0.18s ease;
        }

        .bubble button:hover {
          background: rgba(255, 255, 255, 0.94);
          transform: translateY(-1px);
        }

        @media (max-width: 760px) {
          .shell {
            padding: 16px;
            border-radius: 24px;
          }

          .head {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .subtitle {
            font-size: 15px;
          }

          textarea {
            min-height: 132px;
            font-size: 16px;
          }

          .meta {
            grid-template-columns: 1fr;
          }

          .bubble {
            max-width: 100%;
          }
        }

        @keyframes drift {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-12px);
          }
        }

        @keyframes reveal {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  );
}
