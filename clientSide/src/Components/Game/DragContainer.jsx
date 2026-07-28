import { useState, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import useSound from 'use-sound';
import ohNoSound from '/sounds/oh-no-113125.mp3';
import CodeBlock from './CodeBlock';
import '../../styles/game.css';

export default function DragContainer({
  availableBlocks, boardId, level, setUserAnswerCallback,
  userAnswer, isRun, answerBlockNum, onCorrectAnswer, counter, tempC
}) {
  let c = tempC;
  const [board, setBoard] = useState([]);
  const [equal, setEqual] = useState(false);
  const [wrongBlocks, setWrongBlocks] = useState([]);
  const [blocks, setBlocks] = useState({});
  const [isOver, setIsOver] = useState(false);
  const [justDropped, setJustDropped] = useState(false);
  const [playOhNo] = useSound(ohNoSound);

  const [, drop] = useDrop(() => ({
    accept: 'image',
    drop: (item) => addImageToBoard(item.id),
    collect: (monitor) => {
      setIsOver(monitor.isOver());
      return {};
    },
  }));

  useEffect(() => {
    if (isRun) {
      setWrongBlocks(userAnswer.filter(ans => ans.id !== ans.boardId));
    }
  }, [isRun, userAnswer]);

  useEffect(() => {
    if (Object.keys(blocks).length !== 0) {
      setUserAnswerCallback(prev => {
        const updated = prev.filter(ans => ans.boardId !== blocks.boardId);
        return [...updated, blocks];
      });
      if (parseInt(level) === 1 && c >= answerBlockNum) {
        const wrong = userAnswer.filter(ans => ans.id !== ans.boardId);
        if (userAnswer.length !== answerBlockNum && wrong.length === 0) {
          setBlocks({ ...board });
        } else {
          wrong.length === 0 && onCorrectAnswer();
        }
      }
    }
  }, [blocks]);

  const addImageToBoard = (id) => {
    const pictureList = availableBlocks.find(p => id === p.id);
    setBoard([pictureList]);
    counter(c => c + 1);
    setJustDropped(true);
    setTimeout(() => setJustDropped(false), 400);
    if (pictureList.id === boardId) {
      setEqual(true);
    } else {
      setEqual(false);
      playOhNo();
      setWrongBlocks(prev => [...prev, pictureList]);
    }
    setBlocks({ ...pictureList, boardId });
  };

  const isEmpty = board.length === 0;
  const isWrong = (!equal && parseInt(level) === 1) ||
    wrongBlocks.some(obj => obj.boardId === boardId);
  const isCorrect = !isEmpty && !isWrong;

  let slotClass = 'drop-slot';
  if (isOver && isEmpty) slotClass += ' slot-hover';
  if (isCorrect) slotClass += ' slot-correct';
  if (isWrong) slotClass += ' slot-wrong';
  if (isEmpty) slotClass += ' slot-empty';
  if (justDropped) slotClass += ' slot-pop';

  return (
    <div ref={drop} className={slotClass} id={boardId}>
      {/* Socket nubs */}
      <div className="slot-nub slot-nub-left" />
      <div className="slot-nub slot-nub-right" />

      {isEmpty ? (
        <div className="slot-placeholder">
          {isOver ? <span className="slot-drop-hint">✓</span> : <span className="slot-number">?</span>}
        </div>
      ) : (
        <CodeBlock id={board[0]?.id} value={board[0]?.value} />
      )}

      {/* Correct sparkles */}
      {isCorrect && (
        <div className="slot-sparkles">
          <span>✦</span><span>✦</span><span>✦</span>
        </div>
      )}
    </div>
  );
}