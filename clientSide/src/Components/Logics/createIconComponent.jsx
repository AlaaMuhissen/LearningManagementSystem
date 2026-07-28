import { FaShirt } from "react-icons/fa6";
import { IoShirtSharp } from "react-icons/io5";
import { GiHoodie } from "react-icons/gi";
import { GiSkirt } from "react-icons/gi";
import { GiUnderwearShorts } from "react-icons/gi";
import { GiMonclerJacket } from "react-icons/gi";
import { FaHatWizard } from "react-icons/fa";
import { GiPirateCoat } from "react-icons/gi";
import { FaVest } from "react-icons/fa";
import { GiSonicShoes } from "react-icons/gi";
import { GiRunningShoe } from "react-icons/gi";
import { PiHighHeelFill } from "react-icons/pi";
import { GiFlipFlops } from "react-icons/gi";
import { GiSchoolBag } from "react-icons/gi";
import { BsFillHandbagFill } from "react-icons/bs";
import { GiBeachBag } from "react-icons/gi";
import { PiHandbagFill } from "react-icons/pi";
import { HiMiniShoppingBag } from "react-icons/hi2";
import { GiDuffelBag } from "react-icons/gi";
import { IoWallet } from "react-icons/io5";
import { FaRedhat } from "react-icons/fa";
import { GiJewelCrown } from "react-icons/gi";
import { GiDoubleNecklace } from "react-icons/gi";
import { GiDropEarrings } from "react-icons/gi";
import { GiChelseaBoot } from "react-icons/gi";
import { GiConverseShoe } from "react-icons/gi";
import { GiDiamondRing } from "react-icons/gi";
import { PiPantsFill } from "react-icons/pi";
import { GiDress } from "react-icons/gi";
import { TbShirtSport } from "react-icons/tb";
import { PiShirtFoldedFill } from "react-icons/pi";
import { IoWatch } from "react-icons/io5";
import { FaQuestion } from "react-icons/fa";
import { PiFileCssBold } from "react-icons/pi";
import { TbFileTypeHtml } from "react-icons/tb";

export const getIconComponent = (iconString , size ,color) => {
  
    const iconMap = {
      PiFileCssBold,
      TbFileTypeHtml,
      BsFillHandbagFill,
      HiMiniShoppingBag,
      GiDuffelBag,
      GiSchoolBag,
      GiBeachBag,
      IoWallet,
      PiHandbagFill,
      FaShirt,
      IoShirtSharp,
      FaHatWizard,
      GiHoodie,
      GiSkirt,
      GiUnderwearShorts,
      GiMonclerJacket,
      GiPirateCoat,
      FaVest,
      GiRunningShoe,
      GiSonicShoes,
      PiHighHeelFill,
      GiFlipFlops,
      FaRedhat,
      GiJewelCrown,
      GiDoubleNecklace,
      GiDropEarrings,
      GiChelseaBoot,
      GiConverseShoe,
      GiDiamondRing,
      PiPantsFill,
      GiDress,
      TbShirtSport,
      PiShirtFoldedFill,
      IoWatch,
      FaQuestion
};
  
    const IconComponent = iconMap[iconString];
    return IconComponent ? <IconComponent color={color} size={`${size}`}/> : null;
  };