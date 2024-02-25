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
          className='rounded-lg'
          ref={drag}  
          id={id}  
          style={{ 
            border: isDragging ? "4px solid #FF4CB7" : "0px",
            minWidth : "70px",
            minHeight: "70px",
            backgroundColor: "#fff",
            color: "#4E75FF",
            display: "flex",
            fontWeight: '600',
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            overflow: "hidden",
            textOverflow: "ellipsis",
            wordWrap: "break-word",
            padding: "4px",
          }}
        
        >
          {value}
          </div>
      );
      
        };
