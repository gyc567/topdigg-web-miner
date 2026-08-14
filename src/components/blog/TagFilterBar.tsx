import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { MoreHorizontal } from "lucide-react";
import type { BlogMeta } from "@/lib/blog-data";

interface TagFilterBarProps {
  posts: BlogMeta[];
  selectedTags: Set<string>;
  onToggleTag: (tag: string) => void;
}

function selectTopTags(posts: BlogMeta[], n = 12): { top: string[]; overflow: string[] } {
  const counts = new Map<string, number>();
  const recent = new Map<string, number>();
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 86_400_000;

  for (const p of posts) {
    for (const t of p.tags) {
      counts.set(t, (counts.get(t) ?? 0) + 1);
      if (new Date(p.date).getTime() > thirtyDaysAgo) {
        recent.set(t, (recent.get(t) ?? 0) + 1);
      }
    }
  }

  const sorted = [...counts.entries()].sort(
    ([a, aCount], [b, bCount]) =>
      (bCount - aCount) || ((recent.get(b) ?? 0) - (recent.get(a) ?? 0))
  );

  const top = sorted.slice(0, n).map(([t]) => t);
  const overflow = sorted.slice(n).map(([t]) => t);
  return { top, overflow };
}

export function TagFilterBar({ posts, selectedTags, onToggleTag }: TagFilterBarProps) {
  const { t } = useTranslation();
  // Memoize: only recompute when posts reference changes (not on every render)
  const { top, overflow } = useMemo(() => selectTopTags(posts, 12), [posts]);

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {/* Top-12 tag chips */}
      {top.map((tag) => (
        <Badge
          key={tag}
          variant={selectedTags.has(tag) ? "default" : "outline"}
          className="cursor-pointer select-none"
          onClick={() => onToggleTag(tag)}
        >
          {tag}
        </Badge>
      ))}

      {/* Overflow: More tags popover */}
      {overflow.length > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="text-xs gap-1">
              <MoreHorizontal className="h-3 w-3" />
              {t("blog.moreTags", { count: overflow.length })}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[240px] p-0" align="start">
            <Command>
              <CommandInput placeholder={t("blog.searchPlaceholder")} />
              <CommandList>
                <CommandEmpty>{t("blog.noResults")}</CommandEmpty>
                <CommandGroup>
                  {overflow.map((tag) => (
                    <CommandItem
                      key={tag}
                      onSelect={() => onToggleTag(tag)}
                      className="cursor-pointer"
                    >
                      <span className={selectedTags.has(tag) ? "font-bold" : ""}>
                        {tag}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
