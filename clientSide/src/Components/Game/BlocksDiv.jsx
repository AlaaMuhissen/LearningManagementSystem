import React ,{useEffect ,useState} from 'react'
import img from '/abstract-colorful-cube-shapes-sculpture.jpg'
import CodeBlock from './CodeBlock';
function BlocksDiv({availableBlocks}) {  

  return (
   <>
   <div className='w-full lg:w-4/5  mx-auto p-3 md:p-4 lg:p-8 relative overflow-hidden rounded-lg'>
    <div className=" w-full mx-auto p-3 md:p-4 relative overflow-hidden rounded-lg ">
      <div className="lg:h-full w-full flex absolute inset-0 transform  items-center "
        style={{
          backgroundImage: `url(${img})`,
          backgroundPosition: 'right',
          border: '1px solid #FF4CB7',
          borderRadius : '0.5rem',
        }}
      /> 
        <div className="relative z-10 flex justify-center items-center">
          <div className="lg:gap-4 lg:max-h-screen lg:flex-col overflow-y-scroll flex flex-row overflow-x-auto  items-center gap-4  ">
          {availableBlocks?.map((code, i) => (
            <CodeBlock id={code.id} value={code.value} key={i} />
          ))}
          </div>
      </div>
    </div>
  </div>
   </>
  )
}

export default BlocksDiv;