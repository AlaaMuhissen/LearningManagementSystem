import React from 'react'
import { IoIosArrowBack ,IoIosArrowForward } from "react-icons/io";
function HtmlTitle({title}) {
  return (
    <h2 className='text-[#d1d1d1] md:mb-8 font-bold inline-flex items-center text-xl' style={{fontFamily :'cursive'} }><IoIosArrowBack fontWeight={'800'}/>{title}  / <IoIosArrowForward fontWeight={'800'}/></h2>
  )
}

export default HtmlTitle