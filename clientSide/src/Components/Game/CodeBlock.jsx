import React from 'react'
import { useDrag } from 'react-dnd'




export default function CodeBlock({id, value}) {
 
    const [{ isDragging }, drag] = useDrag(() => ({
        type: "image",
        item: { id: id , value : value },
        collect: (monitor) => ({
          isDragging: !!monitor.isDragging(),
        }),
      }));
      return (
        <div
          className='rounded-lg flex justify-center items-center text-center overflow-hidden overflow-x-auto'
          ref={drag}
          id={id}
          style={{
            border: isDragging ? "4px solid #FF4CB7" : "0px",
            backgroundColor: "#fff",
            color: "#4E75FF",
            fontWeight: '600',
            padding: "4px",
            minWidth: value &&value.length <= 10 ? "70px" : "max-content",
            minHeight: "70px",
            width: "100%",
            height: "auto", 
            textWrap: "normal",
          }}
        >
      <span className="truncate text-sm">{value}</span>

      </div>

      );
      
        };
