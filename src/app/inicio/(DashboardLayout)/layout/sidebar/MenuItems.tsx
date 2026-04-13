import {
  IconAperture,
  IconCopy,
  IconLayoutDashboard,
  IconLogin,
  IconMoodHappy,
  IconTypography,
  IconUserPlus,
  IconNewSection,
  IconEdit,
} from "@tabler/icons-react";

import { uniqueId } from "lodash";

const Menuitems = [
  {
    navlabel: true,
    subheader: "Noticias",
  },
  {
    id: uniqueId(),
    title: "Registro de Noticias",
    icon: IconNewSection,
    href: "/inicio/news",
  },
  {
    id: uniqueId(),
    title: "Edición de Noticias",
    icon: IconEdit,
    href: "/inicio/news/edit",
  },
];

export default Menuitems;


