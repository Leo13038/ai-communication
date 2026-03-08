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

  const copyText = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      alert("已复制");
    } catch {
      alert("复制失败，请手动复制");
    }
  };

  const riskColor =
    result?.risk !== undefined
      ? result.risk < 30
        ? "#16a34a"
        : result.risk < 60
        ? "#ca8a04"
        : "#dc2626"
      : "#333";

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f5f5",
        padding: "32px 16px",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          background: "#fff",
          borderRadius: 24,
          padding: 32,
          boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
        }}
      >
        <h1 style={{ fontSize: 56, margin: 0, fontWeight: 500 }}>好好说</h1>
        <p style={{ color: "#6b7280", fontSize: 18, marginTop: 16, marginBottom: 28 }}>
          把情绪化的话，翻译成更有效的表达
        </p>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="请输入你想说的话"
          style={{
            width: "100%",
            minHeight: 180,
            padding: 20,
            fontSize: 18,
            border: "1px solid #d1d5db",
            borderRadius: 20,
            outline: "none",
            resize: "vertical",
            boxSizing: "border-box",
          }}
        />

        <button
          onClick={handleRewrite}
          disabled={loading}
          style={{
            marginTop: 24,
            padding: "16px 28px",
            fontSize: 18,
            border: "none",
            borderRadius: 18,
            background: loading ? "#444" : "#111",
            color: "#fff",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "改写中..." : "改写一下"}
        </button>

        {error && (
          <p style={{ color: "crimson", marginTop: 16, fontSize: 16 }}>{error}</p>
        )}

        {result && (
          <div style={{ marginTop: 32, display: "grid", gap: 18 }}>
            <div
              style={{
                background: "#fafafa",
                padding: 18,
                borderRadius: 18,
                border: "1px solid #eee",
              }}
            >
              <h3 style={{ marginTop: 0 }}>情绪</h3>
              <p style={{ marginBottom: 0, lineHeight: 1.8 }}>{result.emotion}</p>
            </div>

            <div
              style={{
                background: "#fafafa",
                padding: 18,
                borderRadius: 18,
                border: "1px solid #eee",
              }}
            >
              <h3 style={{ marginTop: 0 }}>需要</h3>
              <p style={{ marginBottom: 0, lineHeight: 1.8 }}>{result.need}</p>
            </div>

            <div
              style={{
                background: "#fafafa",
                padding: 18,
                borderRadius: 18,
                border: "1px solid #eee",
              }}
            >
              <h3 style={{ marginTop: 0 }}>冲突风险</h3>
              <p style={{ marginBottom: 0, lineHeight: 1.8, color: riskColor, fontWeight: 600 }}>
                {result.risk}%
              </p>
            </div>

            <div
              style={{
                background: "#fafafa",
                padding: 18,
                borderRadius: 18,
                border: "1px solid #eee",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <h3 style={{ marginTop: 0 }}>温和版</h3>
                <button
                  onClick={() => copyText(result.rewrite.gentle)}
                  style={{
                    border: "1px solid #ddd",
                    background: "#fff",
                    borderRadius: 10,
                    padding: "6px 10px",
                    cursor: "pointer",
                  }}
                >
                  复制
                </button>
              </div>
              <p style={{ marginBottom: 0, lineHeight: 1.8 }}>{result.rewrite.gentle}</p>
            </div>

            <div
              style={{
                background: "#fafafa",
                padding: 18,
                borderRadius: 18,
                border: "1px solid #eee",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <h3 style={{ marginTop: 0 }}>坚定版</h3>
                <button
                  onClick={() => copyText(result.rewrite.firm)}
                  style={{
                    border: "1px solid #ddd",
                    background: "#fff",
                    borderRadius: 10,
                    padding: "6px 10px",
                    cursor: "pointer",
                  }}
                >
                  复制
                </button>
              </div>
              <p style={{ marginBottom: 0, lineHeight: 1.8 }}>{result.rewrite.firm}</p>
            </div>

            <div
              style={{
                background: "#fafafa",
                padding: 18,
                borderRadius: 18,
                border: "1px solid #eee",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <h3 style={{ marginTop: 0 }}>简洁版</h3>
                <button
                  onClick={() => copyText(result.rewrite.brief)}
                  style={{
                    border: "1px solid #ddd",
                    background: "#fff",
                    borderRadius: 10,
                    padding: "6px 10px",
                    cursor: "pointer",
                  }}
                >
                  复制
                </button>
              </div>
              <p style={{ marginBottom: 0, lineHeight: 1.8 }}>{result.rewrite.brief}</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}