import { PageTransition } from "@/components/layout/page-transition";

/**
 * A template remounts per navigation, which keeps route transitions animating
 * without freezing the DOM the way a layout-level AnimatePresence can.
 */
export default function AppTemplate({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <PageTransition>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </PageTransition>
  );
}
