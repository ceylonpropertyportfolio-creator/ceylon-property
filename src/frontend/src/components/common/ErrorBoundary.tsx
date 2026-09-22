import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Top-level render-error boundary. A throw anywhere below shows a readable,
 * recoverable fallback instead of a blank page. The fallback offers a reload
 * action, which is the only reliable recovery from an arbitrary render throw.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled render error", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background px-6 py-20">
          <EmptyState
            icon={AlertTriangle}
            data-ocid="app.error_boundary"
            title="Something went wrong"
            description="The page ran into an unexpected problem. Reloading usually clears it."
            action={
              <Button
                type="button"
                onClick={() => window.location.reload()}
                data-ocid="app.error_boundary.reload_button"
                className="rounded-full"
              >
                Reload the page
              </Button>
            }
          />
        </div>
      );
    }
    return this.props.children;
  }
}
