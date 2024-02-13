import React from 'react';
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live';

const CodeLevel = () => {
  return (
    <LiveProvider code={`<div>${'Hello, World!'}</div>`} scope={{ React }}>
      <div style={{ display: 'flex' }}>
        <div style={{ flex: '50%', padding: '20px' }}>
          <LiveEditor />
        </div>
        <div style={{ flex: '50%', padding: '20px' }}>
          <LivePreview />
        </div>
      </div>
      <LiveError />
    </LiveProvider>
  );
};

export default CodeLevel;

