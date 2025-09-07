import { Tabs } from "@/components/ui/tabs";
import { ProfileTabsList } from "./ProfileTabsList";
import type { ReactNode } from "react";

interface TabItem {
  value: string;
  label: string;
}

interface ProfileTabsProps {
  defaultValue: string;
  items: TabItem[];
  columns?: number; // default based on items length
  children: ReactNode;
  className?: string;
}

export function ProfileTabs({ defaultValue, items, columns, children, className }: ProfileTabsProps) {
  const cols = columns ?? (items.length === 3 ? 3 : items.length === 2 ? 2 : 4);
  return (
    <Tabs defaultValue={defaultValue} className={className || "bizlink-animate-slide-up profile-tabs"}>
      <ProfileTabsList items={items} columns={cols} />
      {children}
    </Tabs>
  );
}
