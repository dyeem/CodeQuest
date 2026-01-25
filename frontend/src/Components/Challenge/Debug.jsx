import { useState } from "react";
import Editor from "@monaco-editor/react";
import { Play, Terminal, Info } from "lucide-react";

export default function Debug({ data, setData }) {
  // data: { instruction: string, code: string }
  const [output, setOutput] = useState("");

  const runCode = () => {
    let logs = [];
    const customConsole = {
      log: (...args) => logs.push(args.join(" ")),
    };

    try {
      const func = new Function("console", data.code + "\nreturn solve();");
      const result = func(customConsole);

      let finalOutput = "";
      if (logs.length) finalOutput += logs.join("\n") + "\n";
      if (result !== undefined) finalOutput += `Result: ${result}`;

      setOutput(finalOutput || "undefined");
    } catch (err) {
      setOutput(err.message);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-10 flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col gap-2">
        <label className="font-bold text-[#a8a29e] uppercase tracking-widest text-xs flex items-center gap-2">
            <Info size={14} className="text-[#d4af37]" />
            Challenge Instructions
        </label>
        <textarea
            rows={3}
            placeholder="Describe what needs to be fixed or tested in the code below..."
            className="w-full bg-[#0c0a09] border border-[#44403c] px-4 py-3 rounded text-[#e7e5e4] focus:ring-1 focus:ring-[#d4af37] focus:outline-none transition-all placeholder-[#44403c] font-serif italic"
            value={data.instruction}
            onChange={(e) => setData({ ...data, instruction: e.target.value })}
        />
      </div>

      <div className="bg-[#292524] p-1 rounded-sm border-2 border-[#44403c] shadow-2xl">
        <div className="bg-[#1e1e1e] p-2 border border-[#000]">
            <Editor
                height="400px"
                defaultLanguage="javascript"
                theme="vs-dark"
                value={data.code}
                onChange={(val) => setData({ ...data, code: val })}
                options={{
                    fontSize: 14,
                    fontFamily: 'monospace',
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                }}
            />
        </div>
      </div>

      <button
        className="flex items-center justify-center gap-3 bg-[#2c241b] text-[#d4af37] px-8 py-4 rounded font-bold uppercase tracking-[0.3em] border border-[#d4af37]/40 hover:bg-[#d4af37] hover:text-[#1c1917] transition-all duration-300 self-center shadow-xl group"
        onClick={runCode}
      >
        <Play size={20} className="group-hover:fill-current" />
        Run Code
      </button>

      <div className="bg-[#0c0a09] p-6 rounded-sm border-2 border-[#44403c] shadow-inner relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5"></div>
        <div className="flex items-center gap-2 mb-4 border-b border-[#292524] pb-2 text-[#a8a29e] font-bold uppercase tracking-widest text-xs">
            <Terminal size={14} className="text-[#d4af37]" />
            Console Output
        </div>
        <pre className="text-[#2dd4bf] font-mono text-sm leading-relaxed whitespace-pre-wrap">
            {output || "// Awaiting output..."}
        </pre>
      </div>
    </div>
  );
}