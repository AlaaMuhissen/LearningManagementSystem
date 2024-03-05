import React, { useState } from 'react';
import MonacoEditor from 'react-monaco-editor';

function CodeEditor() {
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');

  const handleEditorChange = (newValue, e) => {
    setCode(newValue);
  };

  const runCode = () => {
    try {
      // Create a new function from the user's code and execute it
      const runner = new Function(code);
      const result = runner();
      setOutput(String(result)); // Convert result to string
    } catch (error) {
      setOutput(`<pre style="color: red;">Error: ${error.message}</pre>`);
    }
  };

  return (
    <div>
      <h2>Monaco Editor Example</h2>
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1 }}>
          <MonacoEditor
            width="100%"
            height="600"
            language="javascript"
            theme="vs-dark"
            value={code}
            options={{ 
              selectOnLineNumbers: true 
            }}
            onChange={handleEditorChange}
          />
        </div>
        <div style={{ flex: 1 }}>
          <h3>Output:</h3>
          <div dangerouslySetInnerHTML={{ __html: output }} />
        </div>
      </div>
      <button onClick={runCode}>Run</button>
    </div>
  );
}

export default CodeEditor;
