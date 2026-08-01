import {
  LayoutDashboard,
  CalendarRange,
  Library,
  GitBranch,
  Users,
  BarChart3,
  Megaphone,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

/** Menu principal do app de gestão (docs/06-navegacao-fluxos.md) */
export const mainNav: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Escalas", href: "/planejamento", icon: CalendarRange },
  { title: "Biblioteca Musical", href: "/biblioteca", icon: Library },
  { title: "Implantação de Músicas", href: "/implantacao", icon: GitBranch },
  { title: "Equipe", href: "/equipe", icon: Users },
  { title: "Relatórios", href: "/relatorios", icon: BarChart3 },
  { title: "Comunicação", href: "/comunicacao", icon: Megaphone },
  { title: "Configurações", href: "/configuracoes", icon: Settings },
];
