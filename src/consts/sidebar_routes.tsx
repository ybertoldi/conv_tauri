import { BiLogosMongodb } from "solid-icons/bi";
import { BsFiletypeCsv, BsTerminal } from "solid-icons/bs";
import { SiMariadb, SiPostgresql } from "solid-icons/si";
import { SidebarRoute } from "../types/component_types";

let SIDEBAR_ROUTES: SidebarRoute[] = [
  {
    nome: "Json2Mongo",
    href: "#",
    icon: () => <BiLogosMongodb size={32} />
  },
  {
    nome: "Mongo2Postgres",
    href: "#",
    icon: () => <SiPostgresql size={32} />
  },
  {
    nome: "Csv Converter",
    href: "#",
    icon: () => <BsFiletypeCsv size={32} />
  },
  {
    nome: "Mysql/Mariadb Converter",
    href: "#",
    icon: () => <SiMariadb size={32} />
  },
  {
    nome: "Scripts",
    href: "#",
    icon: () => <BsTerminal size={32} />
  },

]

export default SIDEBAR_ROUTES;
