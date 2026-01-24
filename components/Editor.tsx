
import React, { useState, useEffect, useRef } from 'react';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

const Editor: React.FC<EditorProps> = ({ value, onChange }) => {
  const [lineCount, setLineCount] = useState(1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const lines = value.split('\n').length;
    setLineCount(lines || 1);
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newValue = value.substring(0, start) + "  " + value.substring(end);
      onChange(newValue);
      
      // Reset cursor position (must wait for re-render)
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  return (
    <div className="flex flex-1 w-full h-full bg-[#0d1117] border border-slate-700 rounded-lg overflow-hidden relative group">
      <div className="w-12 bg-[#161b22] border-r border-slate-700 flex flex-col items-center pt-4 select-none text-slate-500 font-mono text-sm leading-6">
        {Array.from({ length: Math.max(lineCount, 1) }).map((_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="// Paste your code here to begin analysis..."
        className="flex-1 bg-transparent p-4 outline-none resize-none code-font text-slate-200 text-sm leading-6 placeholder:text-slate-600 h-full"
        spellCheck={false}
      />
      <div className="absolute top-2 right-4 text-[10px] uppercase tracking-widest text-slate-500 font-bold pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        Editor Mode
      </div>
    </div>
  );
};

export default Editor;
