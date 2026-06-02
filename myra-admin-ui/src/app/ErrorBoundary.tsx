import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { captureError } from "@/lib/logger";

type ErrorBoundaryState = {
  hasError: boolean;
  message?: string;
};

export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    captureError(error, { source: "react_error_boundary", componentStack: info.componentStack });
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle>Something went wrong</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The admin portal hit an unexpected error. Refreshing usually restores the session.
            </p>
            {this.state.message ? <pre className="rounded-md bg-slate-100 p-3 text-xs text-slate-700">{this.state.message}</pre> : null}
            <Button onClick={() => window.location.reload()}>Refresh app</Button>
          </CardContent>
        </Card>
      </main>
    );
  }
}
