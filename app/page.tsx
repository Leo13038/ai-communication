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
        ? { color: "#1b8f52", label: "低" }
        : result.risk < 60
        ? { color: "#c9811f", label: "中" }
        : { color: "#d84545", label: "高" }
      : { color: "#6b7280", label: "-" };

  return (
    <main className="page">
      <div className="float one" />
      <div className="float two" />
      <section className="shell">
        <header className="head">
          <div>
            <p className="kicker">恋爱消息润色器</p>
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
          --bg1: #f1f8ef;
          --bg2: #fffaf0;
          --card: #ffffffd9;
          --line: #dde8d8;
          --text: #21302b;
          --muted: #5f7468;
          --accent: #2a9d6f;
          min-height: 100vh;
          padding: 24px 16px 40px;
          position: relative;
          overflow: hidden;
          background: radial-gradient(circle at 10% 10%, #d9f4de 0%, transparent 40%),
            radial-gradient(circle at 90% 15%, #ffe5c8 0%, transparent 32%),
            linear-gradient(150deg, var(--bg1) 0%, var(--bg2) 100%);
          color: var(--text);
          font-family: "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif;
        }

        .float {
          position: absolute;
          border-radius: 999px;
          filter: blur(40px);
          opacity: 0.5;
          pointer-events: none;
        }

        .float.one {
          width: 180px;
          height: 180px;
          background: #bbe7ca;
          top: 15%;
          left: -60px;
          animation: drift 8s ease-in-out infinite;
        }

        .float.two {
          width: 240px;
          height: 240px;
          background: #ffd9b8;
          right: -90px;
          top: 45%;
          animation: drift 10s ease-in-out infinite reverse;
        }

        .shell {
          position: relative;
          z-index: 1;
          max-width: 920px;
          margin: 0 auto;
          padding: 26px;
          border-radius: 28px;
          background: var(--card);
          border: 1px solid #ffffff99;
          backdrop-filter: blur(14px);
          box-shadow: 0 24px 54px rgba(28, 56, 45, 0.12);
        }

        .head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 18px;
        }

        .kicker {
          margin: 0 0 8px;
          font-size: 13px;
          letter-spacing: 0.08em;
          color: #3f7f66;
        }

        h1 {
          margin: 0;
          font-size: clamp(36px, 7vw, 56px);
          line-height: 1;
          font-family: "STKaiti", "KaiTi", "Songti SC", "STSong", serif;
          font-weight: 600;
          letter-spacing: 0.02em;
          color: #2f443b;
        }

        .subtitle {
          margin: 12px 0 0;
          color: var(--muted);
          font-size: 16px;
        }

        .status {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          border-radius: 999px;
          background: #ecfbf2;
          color: #246648;
          font-size: 13px;
          white-space: nowrap;
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #2fbf77;
          box-shadow: 0 0 0 6px #2fbf7722;
        }

        .composer {
          padding: 16px;
          border: 1px solid var(--line);
          border-radius: 20px;
          background: #fdfefe;
        }

        textarea {
          width: 100%;
          min-height: 150px;
          border: none;
          outline: none;
          resize: vertical;
          font-size: 17px;
          line-height: 1.7;
          background: transparent;
          color: var(--text);
          font-family: inherit;
        }

        textarea::placeholder {
          color: #9aaea3;
        }

        .actions {
          margin-top: 10px;
          display: flex;
          justify-content: flex-end;
        }

        .actions button {
          border: none;
          border-radius: 14px;
          padding: 11px 18px;
          background: linear-gradient(135deg, #1c9a68 0%, #2eb27d 100%);
          color: #fff;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
        }

        .actions button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 10px 20px #1b875a2b;
        }

        .actions button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error {
          margin: 10px 0 0;
          color: #c43d3d;
          font-size: 14px;
        }

        .result {
          margin-top: 20px;
          padding: 16px;
          border-radius: 20px;
          border: 1px solid var(--line);
          background: linear-gradient(180deg, #ffffff 0%, #f8fbf8 100%);
          animation: reveal 0.35s ease;
        }

        .meta {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .chip {
          padding: 12px 14px;
          border-radius: 14px;
          border: 1px solid #e6ede3;
          background: #ffffff;
        }

        .label {
          font-size: 12px;
          color: #678074;
          display: block;
          margin-bottom: 4px;
        }

        .value {
          font-size: 15px;
        }

        .risk {
          margin-top: 12px;
          background: #fff;
          padding: 12px 14px;
          border-radius: 14px;
          border: 1px solid #e6ede3;
        }

        .risk-title {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 8px;
          font-size: 13px;
          color: #587365;
        }

        .bar {
          width: 100%;
          height: 8px;
          border-radius: 999px;
          background: #ecf2ea;
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
          padding: 11px 12px;
          border-radius: 16px;
          border: 1px solid #e4ece0;
          box-shadow: 0 6px 14px #3248380e;
        }

        .bubble.left {
          justify-self: start;
          background: #ffffff;
        }

        .bubble.right {
          justify-self: end;
          background: #dcf8e8;
          border-color: #cdecd8;
        }

        .bubble.small {
          background: #fff6df;
          border-color: #f0e4c8;
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
          color: #476455;
          font-weight: 600;
        }

        .bubble p {
          margin: 0;
          font-size: 16px;
          line-height: 1.65;
          color: #1f3028;
          word-break: break-word;
        }

        .bubble button {
          border: 1px solid #d8e2d4;
          background: #fff;
          border-radius: 999px;
          padding: 4px 10px;
          font-size: 12px;
          color: #4b6558;
          cursor: pointer;
          transition: background 0.18s ease;
        }

        .bubble button:hover {
          background: #f3f8f2;
        }

        @media (max-width: 760px) {
          .shell {
            padding: 16px;
            border-radius: 22px;
          }

          .head {
            flex-direction: column;
            gap: 12px;
          }

          .subtitle {
            font-size: 15px;
          }

          textarea {
            min-height: 130px;
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
            transform: translateY(-10px);
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
