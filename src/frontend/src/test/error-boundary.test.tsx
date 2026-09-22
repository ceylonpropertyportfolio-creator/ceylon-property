import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * A render-time throw anywhere below the top-level boundary must show a
 * readable, recoverable fallback instead of a blank page.
 */
function ThrowingChild(): never {
  throw new Error("boom during render");
}

describe("top-level error boundary", () => {
  beforeEach(() => {
    // React logs the caught error; keep the test output clean.
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders a readable fallback with a reload action when a child throws", () => {
    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>,
    );

    const fallback = screen.getByTestId("app.error_boundary");
    expect(fallback).toBeInTheDocument();
    expect(fallback).toHaveTextContent("Something went wrong");
    expect(
      screen.getByTestId("app.error_boundary.reload_button"),
    ).toBeInTheDocument();
  });

  it("renders its children when nothing throws", () => {
    render(
      <ErrorBoundary>
        <p>All good</p>
      </ErrorBoundary>,
    );

    expect(screen.getByText("All good")).toBeInTheDocument();
    expect(screen.queryByTestId("app.error_boundary")).not.toBeInTheDocument();
  });
});
