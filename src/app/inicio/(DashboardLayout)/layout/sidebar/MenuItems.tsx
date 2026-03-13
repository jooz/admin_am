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
    subheader: "Chatbot",
  },
  {
    id: uniqueId(),
    title: "Base de Conocimiento",
    icon: IconTypography,
    href: "/inicio/chatbot/knowledge",
  },
  {
    id: uniqueId(),
    title: "Configuración",
    icon: IconCopy,
    href: "/inicio/chatbot/config",
  },
];

export default Menuitems;


