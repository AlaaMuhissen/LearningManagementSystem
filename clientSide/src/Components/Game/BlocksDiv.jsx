import { useMemo } from 'react';
import CodeBlock from './CodeBlock';
import '../../styles/game.css';

// Fisher-Yates shuffle — doesn't mutate the original array
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function BlocksDiv({ availableBlocks }) {
  // Shuffle once per new set of blocks, not on every render — otherwise
  // the blocks would jump around each time this component re-renders.
  const shuffledBlocks = useMemo(() => shuffle(availableBlocks || []), [availableBlocks]);

  return (
    <div className="blocks-panel">
      <div className="blocks-title">
        <span>🧩</span> Drag blocks to answer
      </div>
      <div className="blocks-list">
        {shuffledBlocks.map((code, i) => (
          <div key={code.id ?? i} className="block-item" style={{ animationDelay: `${i * 0.06}s` }}>
            <CodeBlock id={code.id} value={code.value} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default BlocksDiv;