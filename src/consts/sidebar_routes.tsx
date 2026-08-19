import { BiLogosMongodb } from "solid-icons/bi";
import { BsFiletypeCsv, BsTerminal } from "solid-icons/bs";
import { SiMariadb, SiPostgresql } from "solid-icons/si";
import { SidebarRoute } from "../types/component_types";
import { lazy } from "solid-js";

let SIDEBAR_ROUTES: SidebarRoute[] = [
  {
    nome: "Json2Mongo",
    id: "json2mongo",
    icon: () => <BiLogosMongodb size={20} />,
    component: lazy(() => import("../screens/Json2Mongo/index.tsx"))
  },
  {
    nome: "Mongo2Postgres",
    id: "mongo2postgres",
    icon: () => <SiPostgresql size={20} />,
    component: lazy(() => import("../screens/Mongo2Postgres.tsx"))
  },
  {
    nome: "Csv Converter",
    id: "csv-converter",
    icon: () => <BsFiletypeCsv size={20} />,
    component: lazy(() => import("../screens/CsvConverter.tsx"))
  },
  {
    nome: "Mysql/Mariadb Converter",
    id: "mysql-mariadb-converter",
    icon: () => <SiMariadb size={20} />,
    component: lazy(() => import("../screens/MariadbMysqlConverter.tsx"))
  },
  {
    nome: "Scripts",
    id: "scripts",
    icon: () => <BsTerminal size={20} />,
    component: lazy(() => import("../screens/Scripts.tsx"))
  },

]

export default SIDEBAR_ROUTES;
