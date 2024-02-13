import React, { useState, useEffect } from 'react';

import { useDrop } from 'react-dnd';
import useSound from 'use-sound';
import ohNoSound from '/sounds/oh-no-113125.mp3'
import CodeBlock from './CodeBlock';

export default function DragContainer({ availableBlocks, boardId, level, setUserAnswerCallback ,userAnswer , isRun, answerBlockNum, onCorrectAnswer ,counter ,tempC }) {
  let c = tempC;
    const [board, setBoard] = useState([]);
    const [equal, setEqual] = useState(false);
    const [wrongBlocks, setWrongBlocks] = useState([]);
    const [blocks, setBlocks] = useState({});
    const [playOhNo] = useSound(ohNoSound);
 
    const [{ isOver }, drop] = useDrop(() => ({
        accept: "image",
        drop: (item) => addImageToBoard(item.id),
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    useEffect(() => {
        if (isRun) {
            const wrongBlock = userAnswer.filter((userAns) => userAns.id != userAns.boardId )
            setWrongBlocks(wrongBlock);
        }
    }, [isRun ,userAnswer]);

    
    useEffect(() => {
      if (Object.keys(blocks).length !== 0) {
          setUserAnswerCallback(prevBlocks => {
              const updatedUserAnswer = prevBlocks.filter(ans => ans.boardId !== blocks.boardId);
              return [...updatedUserAnswer, blocks];
          });
         
       
          if ((parseInt(level) === 1) && (c >= answerBlockNum)) {
              const is = userAnswer.filter(ans => ans.id !== ans.boardId);
              if((userAnswer.length !== answerBlockNum) &&( is.length === 0)){
                setBlocks({...board});
              }
            else{
              (is.length === 0) && onCorrectAnswer();
            }
            
          }
      }
  }, [blocks]);

    const addImageToBoard = (id) => {
        const pictureList = availableBlocks.find((picture) => id === picture.id);
        setBoard([pictureList]);
        counter((c) => c+1);
        if(pictureList.id === boardId){
            setEqual(true);    
        }
        else{
            setEqual(false);
            playOhNo();
            setWrongBlocks(prevWrongBlocks => [...prevWrongBlocks , pictureList]);
          
        }
        setBlocks({
            ...pictureList,
            "boardId" :boardId
          });
       
    };

   
    return (
        <>
     
          <div
            className="rounded-lg"
            ref={drop}
            style={{
              width: "70px",
              height: "70px",
              border:
                board.length === 0
                  ? "1px solid #888"
                  : (!equal && parseInt(level) === 1  ) || wrongBlocks.some((obj) => obj.boardId === boardId)
                  ? "4px solid red"
                  : "4px solid green",
            }}
            id={boardId}
          >
             {<CodeBlock id={board[0]?.id} value={board[0]?.value}/>
            }
          </div>
      
        </>
      );
      
}
