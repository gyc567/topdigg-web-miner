import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CATEGORY_SLUGS,
  CATEGORY_LABEL,
  type CategorySlug,
} from "@/lib/blog-categories";
import type { SupportedLocale } from "@/lib/locale";
import { normalizeLang } from "@/lib/locale";

interface CategoryFilterProps {
  value: CategorySlug | "all";
  onChange: (value: CategorySlug | "all") => void;
}

export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  const { i18n } = useTranslation();
  const locale = normalizeLang(i18n.language) as SupportedLocale;

  return (
    <Select
      value={value}
      onValueChange={(v) => onChange(v as CategorySlug | "all")}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder={i18n.t("blog.allCategories")} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{i18n.t("blog.allCategories")}</SelectItem>
        {CATEGORY_SLUGS.map((slug) => (
          <SelectItem key={slug} value={slug}>
            {CATEGORY_LABEL[slug][locale]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
