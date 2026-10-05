import React, { useState } from "react";
import { X } from "lucide-react";

/** Type a value and press Enter or comma to add it as a chip. */
export const TagInput = ({ value = [], onChange, placeholder, suggestions = [] }) => {
  const [text, setText] = useState("");

  const add = (raw) => {
    const parts = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!parts.length) return;
    const lower = value.map((v) => v.toLowerCase());
    const next = [...value];
    parts.forEach((p) => {
      if (!lower.includes(p.toLowerCase())) {
        next.push(p);
        lower.push(p.toLowerCase());
      }
    });
    onChange(next);
    setText("");
  };

  const unused = suggestions.filter((s) => !value.some((v) => v.toLowerCase() === s.toLowerCase())).slice(0, 8);

  return (
    <div>
      <div className="flex min-h-[42px] flex-wrap items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2 py-1.5 shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
        {value.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
            {tag}
            <button
              type="button"
              className="rounded text-blue-400 hover:text-blue-800"
              aria-label={`Remove ${tag}`}
              onClick={() => onChange(value.filter((t) => t !== tag))}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          value={text}
          placeholder={value.length ? "Add more…" : placeholder}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add(text);
            } else if (e.key === "Backspace" && !text && value.length) {
              onChange(value.slice(0, -1));
            }
          }}
          onBlur={() => add(text)}
          className="min-w-[120px] flex-1 border-0 bg-transparent px-1 py-1 text-sm outline-none placeholder:text-slate-400 focus:ring-0"
        />
      </div>
      {unused.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {unused.map((s) => (
            <button key={s} type="button" onClick={() => add(s)} className="rounded-md border border-dashed border-slate-300 px-2 py-0.5 text-xs text-slate-500 hover:border-blue-400 hover:text-blue-600">
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
