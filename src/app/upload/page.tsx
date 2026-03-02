"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { UploadResponse } from "@/types";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<UploadResponse | null>(null);
  const [criticalError, setCriticalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.name.endsWith(".csv")) {
      setFile(dropped);
      setResult(null);
      setCriticalError(null);
    } else {
      setCriticalError("Only CSV files are accepted.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setResult(null);
      setCriticalError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setCriticalError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data: UploadResponse = await res.json();
      setResult(data);

      if (data.success && data.inserted > 0) {
        setTimeout(() => router.push("/dashboard"), 2000);
      }
    } catch {
      setCriticalError("Network error. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Upload CSV</h1>
      <p className="text-slate-500 mb-8">
        Upload a CSV file with columns:{" "}
        <code className="bg-slate-100 px-1.5 py-0.5 rounded text-sm">
          questionId, text, topic, difficulty, correct
        </code>
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`card cursor-pointer border-2 border-dashed transition-colors duration-200 ${
          isDragging
            ? "border-blue-400 bg-blue-50"
            : file
            ? "border-green-400 bg-green-50"
            : "border-slate-200 hover:border-blue-300 hover:bg-blue-50/50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="text-4xl">{file ? "✅" : "📁"}</div>
          {file ? (
            <>
              <p className="font-semibold text-green-700">{file.name}</p>
              <p className="text-sm text-slate-500">
                {(file.size / 1024).toFixed(1)} KB — click to change
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold text-slate-700">
                Drop your CSV here or click to browse
              </p>
              <p className="text-sm text-slate-400">Only .csv files accepted</p>
            </>
          )}
        </div>
      </div>

      <div className="card mt-4 bg-slate-50">
        <h3 className="font-semibold text-sm text-slate-600 mb-2">
          Expected CSV Format
        </h3>
        <pre className="text-xs text-slate-500 overflow-x-auto whitespace-pre-wrap">
          {`questionId,text,topic,difficulty,correct
q1,For 3x = 3 what is x?,Algebra,1,true
q2,Solve the differential equation dy/dx = y,Calculus,3,false
q3,P(A)=0.3 and P(B)=0.5 — find P(A∪B),Probability,2,true`}
        </pre>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { col: "questionId", desc: "Unique question identifier" },
            { col: "text", desc: "The full question content" },
            { col: "topic", desc: "Subject area (e.g. Algebra)" },
            { col: "difficulty", desc: "Integer from 1 (easy) to 5 (hard)" },
            { col: "correct", desc: "true or false" },
          ].map(({ col, desc }) => (
            <div key={col} className="text-xs">
              <span className="font-mono font-semibold text-blue-600">{col}</span>
              <span className="text-slate-400 ml-1">— {desc}</span>
            </div>
          ))}
        </div>
      </div>

      {criticalError && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {criticalError}
        </div>
      )}

      {result && (
        <div
          className={`mt-4 p-4 rounded-xl border text-sm ${
            result.success
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {result.success ? (
            <div>
              <p className="font-semibold mb-1">Upload complete!</p>
              <p>
                {result.inserted} records inserted, {result.skipped} skipped.
              </p>
              {result.errors.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium text-amber-700">
                    Warnings ({result.errors.length}):
                  </p>
                  <ul className="list-disc list-inside mt-1 space-y-0.5">
                    {result.errors.map((e, i) => (
                      <li key={i} className="text-amber-600">
                        {e}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {result.inserted > 0 && (
                <p className="mt-2 text-green-600">
                  Redirecting to dashboard…
                </p>
              )}
            </div>
          ) : (
            <div>
              <p className="font-semibold mb-1">Upload failed</p>
              <ul className="list-disc list-inside space-y-0.5">
                {result.errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? "Uploading…" : "Upload File"}
        </button>
        {file && (
          <button
            onClick={() => {
              setFile(null);
              setResult(null);
              setCriticalError(null);
            }}
            className="btn-secondary"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
