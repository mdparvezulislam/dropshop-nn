import type { BaseDBEntity } from "@/shared/lib/database/types";

export type NavigationLocation = "header" | "footer" | "sidebar" | "mega_menu";

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  openInNewTab?: boolean;
  roles?: string[];
  children?: NavigationItem[];
  sortOrder: number;
  isVisible: boolean;
}

export interface NavigationMenu extends BaseDBEntity {
  name: string;
  location: NavigationLocation;
  items: NavigationItem[];
  isActive: boolean;
}
