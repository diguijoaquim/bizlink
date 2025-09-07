import { TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TabItem {
  value: string;
  label: string;
}

interface ProfileTabsListProps {
  items: TabItem[];
  columns?: number; // default 4
}

export function ProfileTabsList({ items, columns = 4 }: ProfileTabsListProps) {
  const gridCols = columns === 3 ? "grid-cols-3" : columns === 2 ? "grid-cols-2" : "grid-cols-4";
  return (
    <TabsList className={`profile-tabs-list grid ${gridCols} gap-1 justify-items-center justify-center mx-auto w-full max-w-sm md:max-w-none`}>
      {items.map((it) => (
        <TabsTrigger key={it.value} value={it.value} className="profile-tabs-trigger text-[11px] md:text-sm px-2 py-1">
          {it.label}
        </TabsTrigger>
      ))}
    </TabsList>
  );
}
