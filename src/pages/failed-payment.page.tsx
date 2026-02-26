import { Link } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";

export default function FailedPaymentPage() {
  return (
    <div className="container mx-auto flex min-h-full items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 ring-1 ring-destructive/30">
            <HugeiconsIcon
              icon={Cancel01Icon}
              className="h-8 w-8 text-destructive"
            />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-destructive font-mono">
            PAYMENT FAILED
          </h1>
          <p className="text-sm text-muted-foreground font-mono">
            Your transaction could not be completed.
          </p>
        </div>

        <Card className="border-destructive/20 bg-linear-to-br from-card/95 to-card/50 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-mono text-primary">
                TRANSACTION STATUS
              </CardTitle>
              <Badge
                variant="outline"
                className="border-destructive/50 text-destructive font-mono px-3 py-1 animate-pulse"
              >
                FAILED
              </Badge>
            </div>
            <CardDescription>
              The payment was unsuccessful. No amount has been charged.
            </CardDescription>
          </CardHeader>

          <Separator className="bg-primary/20" />

          <CardContent className="pt-6">
            <div className="rounded-lg bg-muted/30 border border-border/50 p-4 space-y-2">
              <span className="text-[10px] uppercase text-muted-foreground tracking-wider font-bold">
                What happened?
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The payment gateway did not confirm your transaction. This could
                be due to insufficient funds, a cancelled payment, or a
                temporary issue with the gateway. Please try again.
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex-col gap-3 bg-muted/20 border-t border-primary/10 pt-4">
            <Button
              asChild
              className="w-full font-mono uppercase tracking-wider text-xs"
            >
              <Link to="/payment">Try Again</Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="w-full font-mono text-xs text-muted-foreground"
            >
              <Link to="/">Back to Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
