import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  Home01Icon,
  ReloadIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class RootErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-background">
          <Card className="max-w-md w-full border-destructive/50 shadow-lg animate-in fade-in zoom-in duration-300">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-destructive/10 p-3 ring-1 ring-destructive/20">
                  <HugeiconsIcon
                    icon={Alert02Icon}
                    className="h-10 w-10 text-destructive"
                  />
                </div>
              </div>
              <CardTitle className="text-xl font-bold tracking-tight">
                Something went wrong
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                An unexpected error occurred. Our team has been notified.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {import.meta.env.DEV && this.state.error && (
                <div className="mt-4 p-4 rounded-md bg-muted/50 text-xs font-mono overflow-auto max-h-[200px] border border-border">
                  <p className="text-destructive font-semibold mb-1">
                    {this.state.error.toString()}
                  </p>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {this.state.error.stack?.split("\n").slice(0, 3).join("\n")}
                    ...
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button
                variant="outline"
                onClick={this.handleGoHome}
                className="w-full sm:w-auto gap-2"
              >
                <HugeiconsIcon icon={Home01Icon} className="h-4 w-4" />
                Go Home
              </Button>
              <Button
                onClick={this.handleReset}
                className="w-full sm:w-auto gap-2"
              >
                <HugeiconsIcon icon={ReloadIcon} className="h-4 w-4" />
                Try Again
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
