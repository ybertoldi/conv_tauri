import { BiLogosMongodb } from "solid-icons/bi";
import { BsFiletypeCsv, BsTerminal } from "solid-icons/bs";
import { SiMariadb, SiPostgresql } from "solid-icons/si";
import { SidebarRoute } from "../types/component_types";
import { lazy } from "solid-js";

let SIDEBAR_ROUTES: SidebarRoute[] = [
  {
    nome: "Json2Mongo",
    href: "/Json2Mongo",
    icon: () => <BiLogosMongodb size={32} />,
    component: lazy(() => import("../screens/Json2Mongo.tsx"))
  },
  {
    nome: "Mongo2Postgres",
    href: "/Mongo2Postgres",
    icon: () => <SiPostgresql size={32} />,
    component: lazy(() => import("../screens/Mongo2Postgres.tsx"))
  },
  {
    nome: "Csv Converter",
    href: "/Csv Converter",
    icon: () => <BsFiletypeCsv size={32} />,
    component: lazy(() => import("../screens/CsvConverter.tsx"))
  },
  {
    nome: "Mysql/Mariadb Converter",
    href: "/Mysql-Mariadb-Converter",
    icon: () => <SiMariadb size={32} />,
    component: lazy(() => import("../screens/MariadbMysqlConverter.tsx"))
  },
  {
    nome: "Scripts",
    href: "/Scripts",
    icon: () => <BsTerminal size={32} />,
    component: lazy(() => import("../screens/Scripts.tsx"))
  },

]

export default SIDEBAR_ROUTES;
