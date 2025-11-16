import { useState } from "react";
import Editor from "@monaco-editor/react";

export default function Debug() {
  const [code, setCode] = useState("// write JS here");
  const [output, setOutput] = useState("");

  const runCode = () => {
    let logs = [];
    const customConsole = {
      log: (...args) => logs.push(args.join(" ")),
    };

    try {
      const func = new Function("console", code);
      const result = func(customConsole);

      let finalOutput = "";
      if (logs.length) finalOutput += logs.join("\n") + "\n";
      if (result !== undefined) finalOutput += result;

      setOutput(finalOutput || "undefined");
    } catch (err) {
      setOutput(err.message);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto my-5 flex flex-col gap-4">
      <Editor
        height="300px"
        defaultLanguage="javascript"
        value={code}
        onChange={(val) => setCode(val)}
      />
      <button
        className="bg-[#212832] text-white px-4 py-2 rounded hover:bg-[#161c22]"
        onClick={runCode}
      >
        Run
      </button>
      <div className="bg-gray-100 p-4 rounded">
        <strong>Output:</strong>
        <pre>{output}</pre>
      </div>
    </div>
  );
}
