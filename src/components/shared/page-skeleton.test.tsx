import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { BookOpen } from "lucide-react";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { EmptyState } from "@/components/shared/empty-state";

describe("PageSkeleton", () => {
  it("exposes busy semantics for assistive tech", () => {
    const { container } = render(<PageSkeleton />);
    expect(container.firstChild).toHaveAttribute("aria-busy", "true");
  });
});

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(
      <EmptyState
        icon={BookOpen}
        title="No projects yet"
        description="Create your first journal entry."
      />,
    );
    expect(screen.getByText("No projects yet")).toBeInTheDocument();
    expect(
      screen.getByText("Create your first journal entry."),
    ).toBeInTheDocument();
  });
});
