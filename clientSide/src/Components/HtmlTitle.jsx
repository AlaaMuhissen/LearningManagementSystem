import { IoIosArrowBack ,IoIosArrowForward } from "react-icons/io";

function HtmlTitle({title}) {
  return (
    <h2 className='text-[#d1d1d1] font-bold inline-flex items-center text-base md:text-xl sm:text-lg mb-4 md:mb-8 sm:mb-6' style={{fontFamily :'cursive'}}>
    <IoIosArrowBack className='md:text-xl sm:text-lg' fontWeight={'800'}/>
    {title}  / 
    <IoIosArrowForward className='md:text-xl sm:text-lg' fontWeight={'800'}/>
  </h2>
  )
}

export default HtmlTitle
