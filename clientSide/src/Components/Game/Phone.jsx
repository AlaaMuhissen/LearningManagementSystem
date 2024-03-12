import React , {useState} from 'react'
import { DeviceFrameset } from 'react-device-frameset'
import 'react-device-frameset/styles/marvel-devices.min.css'
import 'react-device-frameset/styles/device-emulator.min.css'
import RefreshIcon from '@mui/icons-material/Refresh';
import IconButton from '@mui/material/IconButton';
import { CiBatteryFull } from "react-icons/ci";
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import { FaWifi } from "react-icons/fa";
import HomeIcon from '@mui/icons-material/Home';
import ExploreIcon from '@mui/icons-material/Explore';
import SettingsIcon from '@mui/icons-material/Settings';

function Phone({resultHtml}) {
    const [value, setValue] = useState(0);
    const getCurrentTime = () => {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      };
  return (
    <div className='top-0 z-10 right-0 absolute w-full h-full flex justify-center items-center'>
    <div className='w-full h-full flex justify-center items-center bg-black bg-opacity-75 p-4'>
    <DeviceFrameset device="iPhone X" color="gold" zoom= '50%'>

    <div style={{  backgroundColor: '#ffffff', height: '100%', borderRadius: '10px', display: 'flex', flexDirection: 'column' }}>

      <div style={{ backgroundColor: '#dcdcdc', height: '30px', borderTopLeftRadius: '10px', borderTopRightRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 10px' }}>
        <span className=' p-2 pt-6 text-black text-xl '>{getCurrentTime()}</span>
        <div className='flex gap-3 p-2 pt-6 items-center'>
        <FaWifi /> 
        <CiBatteryFull fontSize={'28px'} color='yellow' /> 
        </div>
      </div>
     
      <div style={{ backgroundColor: '#dcdcdc', height: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '25px 0' }}>
        <div style={{ width: '90%', backgroundColor: '#ffffff', height: '40px', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <input type="text" placeholder="https//wwww.myWebsite.com" style={{ border: 'none', width: '100%', height: '100%', borderRadius: '10px', paddingLeft: '10px' }} />
          <IconButton color="primary">
            <RefreshIcon />
           </IconButton>
        </div>
      </div>
  
      <div style={{ flex: 1, padding: '10px' }}>
      <div className='w-full h-full flex justify-start items-start'>
     <span className='text-black p-4  text-4xl text-wrap' dangerouslySetInnerHTML={{ __html: resultHtml }}/>
      </div>
    </div>
    <BottomNavigation value={value} onChange={(event, newValue) => setValue(newValue)} style={{ backgroundColor: '#dcdcdc', borderBottomLeftRadius: '10px', borderBottomRightRadius: '10px' }}>
        <BottomNavigationAction label="Home" icon={<HomeIcon />} />
        <BottomNavigationAction label="Explore" icon={<ExploreIcon />} />
        <BottomNavigationAction label="Settings" icon={<SettingsIcon />} />
      </BottomNavigation>
    </div>
 
    
    </DeviceFrameset>
    </div>
    </div>
  )
}

export default Phone