import { BookOpen, CakeSlice, Wine } from "lucide-react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MobileMenuNavProps {
  labels: { drinks: string; week: string; sweets: string; navigation: string };
}

const MobileMenuNav = ({ labels }: MobileMenuNavProps) => (
  <nav aria-label={labels.navigation} className="menu-mobile-nav fixed inset-x-0 bottom-0 z-40 border-t border-primary/30 bg-background px-2 pt-2 shadow-elegant md:hidden">
    <TabsList className="grid h-auto w-full grid-cols-3 gap-1 bg-transparent p-0">
      {([
        { value: "bebidas", label: labels.drinks, icon: Wine },
        { value: "semana", label: labels.week, icon: BookOpen },
        { value: "doces", label: labels.sweets, icon: CakeSlice },
      ] as const).map(({ value, label, icon: Icon }) => (
        <TabsTrigger
          key={value}
          value={value}
          className="flex min-h-14 flex-col gap-1 whitespace-normal rounded-md px-1 py-1 text-center text-[11px] leading-tight text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span className="line-clamp-2">{label}</span>
        </TabsTrigger>
      ))}
    </TabsList>
  </nav>
);

export default MobileMenuNav;