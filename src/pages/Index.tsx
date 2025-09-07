import { AppLayout } from "@/components/AppLayout";
import { InfiniteFeed } from "@/components/InfiniteFeed";

export default function Index() {
  return (
    <AppLayout>
      <div className="">
        <InfiniteFeed showSearchAsLink />
      </div>
    </AppLayout>
  );
}