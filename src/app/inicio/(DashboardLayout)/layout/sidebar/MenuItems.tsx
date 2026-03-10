import {
  IconAperture,
  IconCopy,
  IconLayoutDashboard,
  IconLogin,
  IconMoodHappy,
  IconTypography,
  IconUserPlus,
} from "@tabler/icons-react";

import { uniqueId } from "lodash";

const Menuitems = [



  {
    navlabel: true,
    subheader: "EXTRA",
  },
  {
    id: uniqueId(),
    title: "Noticias",
    icon: IconAperture,
    href: "inicio/news",
  },


];

export default Menuitems;


