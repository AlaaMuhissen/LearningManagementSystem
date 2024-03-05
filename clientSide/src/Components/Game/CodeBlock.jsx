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
        className={`rounded-lg flex items-center overflow-x-auto justify-center text-center min-h-12 ${value && value.length <= 6 ? 'min-w-12' : 'min-w-max'} md:${value && value.length <= 6 ? 'min-w-16' : 'min-w-max'}  md:min-h-16 lg:${value && value.length <= 10 ? 'min-w-20' : 'min-w-max'}  lg:min-h-20`}
        ref={drag}
        id={id}
        style={{
          border: isDragging ? "4px solid #FF4CB7" : "0px",
          backgroundColor: "#fff",
          color: "#4E75FF",
          fontWeight: '600',
          padding: "4px",
          width: "100%",
          height: "auto", 
          textWrap: "normal",
        }}
      >
      <div className='flex justify-start items-center'>
      <span className="truncate text-xs lg:text-lg">{value}</span>
        </div>      
      </div>

      );
      
        };
