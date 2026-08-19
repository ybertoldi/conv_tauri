import { Component } from "solid-js";
import { lazy } from "solid-js";

export interface SidebarRoute {
  nome: string;
  id: string;
  icon: Component;
  component: ReturnType<typeof lazy>;
}

