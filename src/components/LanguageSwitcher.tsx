import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n, type Locale } from "@/lib/i18n";

const OPTIONS: { code: Locale; flag: string; label: string }[] = [
  { code: "pt-BR", flag: "🇧🇷", label: "PT" },
  { code: "en", flag: "🇬🇧", label: "EN" },
  { code: "es", flag: "🇪🇸", label: "ES" },
  { code: "fr", flag: "🇫🇷", label: "FR" },
];

interface Props {
  variant?: "light" | "dark";
}

const LanguageSwitcher = ({ variant = "dark" }: Props) => {
  const { locale, setLocale, t } = useI18n();
  const current = OPTIONS.find((o) => o.code === locale) ?? OPTIONS[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t("lang.label")}
        className={`inline-flex items-center gap-1.5 text-xs uppercase tracking-wider transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded px-1.5 py-1 ${
          variant === "light" ? "text-white/90" : "text-foreground/70"
        }`}
      >
        <Globe className="h-3.5 w-3.5" aria-hidden="true" />
        <span>{current.label}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        {OPTIONS.map((opt) => (
          <DropdownMenuItem
            key={opt.code}
            onSelect={() => setLocale(opt.code)}
            aria-current={opt.code === locale ? "true" : undefined}
            className={`text-xs uppercase tracking-wider cursor-pointer ${
              opt.code === locale ? "text-primary" : ""
            }`}
          >
            <span className="mr-2" aria-hidden="true">
              {opt.flag}
            </span>
            {t(`lang.${opt.code}` as const)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;