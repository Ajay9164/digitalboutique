import { PageSkeleton } from "@/components/shared/page-skeleton";

export default function RootLoading() {
  return (
    <div className="mx-auto w-full max-w-lg px-4 py-8 sm:px-6">
      <PageSkeleton />
    </div>
  );
}
