import { useDrag } from 'react-dnd';
import '../../styles/game.css';

export default function CodeBlock({ id, value }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'image',
    item: { id, value },
    collect: monitor => ({ isDragging: !!monitor.isDragging() }),
  }));

  return (
    <div
      ref={drag}
      id={id}
      className="code-block"
      style={{ opacity: isDragging ? 0.35 : 1 }}
    >
      {/* Puzzle nub left */}
      <div className="block-nub block-nub-left" />
      {/* Puzzle nub right */}
      <div className="block-nub block-nub-right" />

      <span className="block-text">{value}</span>

      {/* Drag handle dots */}
      <div className="block-grip">
        <span/>
        <span/>
        <span/>
      </div>
    </div>
  );
}