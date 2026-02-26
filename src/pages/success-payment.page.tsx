import { useSearchParams, Link } from "react-router-dom";
import { useCallback, useRef, useState } from "react";
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
import {
  CheckmarkCircle01Icon,
  Copy01Icon,
  Pdf01Icon,
} from "@hugeicons/core-free-icons";
import { toast } from "react-toastify";

export default function SuccessPaymentPage() {
  const [searchParams] = useSearchParams();
  const amount = searchParams.get("amount");
  const factorId = searchParams.get("factorId");
  const receiptRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyFactorId = useCallback(async () => {
    if (!factorId) return;
    try {
      await navigator.clipboard.writeText(factorId);
      setCopied(true);
      toast.success("Factor ID copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  }, [factorId]);

  const handleSavePdf = useCallback(() => {
    window.print();
  }, []);

  if (!amount || !factorId) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md border-destructive/30">
          <CardContent className="pt-6 text-center space-y-4">
            <p className="text-sm text-muted-foreground font-mono">
              Invalid payment information. Missing required parameters.
            </p>
            <Button asChild variant="outline" className="font-mono text-xs">
              <Link to="/payment">Back to Payment</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container m-auto flex min-h-full items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6" ref={receiptRef}>
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 ring-1 ring-green-500/30">
            <HugeiconsIcon
              icon={CheckmarkCircle01Icon}
              className="h-8 w-8 text-green-500"
            />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-green-500 font-mono">
            PAYMENT SUCCESSFUL
          </h1>
          <p className="text-sm text-muted-foreground font-mono">
            Your transaction has been completed successfully.
          </p>
        </div>

        <Card className="border-green-500/20 bg-linear-to-br from-card/95 to-card/50 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-mono text-primary">
                RECEIPT
              </CardTitle>
              <Badge
                variant="outline"
                className="border-green-500/50 text-green-500 font-mono px-3 py-1"
              >
                PAID
              </Badge>
            </div>
            <CardDescription>
              Transaction details for your records.
            </CardDescription>
          </CardHeader>

          <Separator className="bg-primary/20" />

          <CardContent className="pt-6 space-y-4">
            <div className="rounded-lg bg-muted/30 border border-border/50 p-4 space-y-1">
              <span className="text-[10px] uppercase text-muted-foreground tracking-wider font-bold">
                Amount Paid
              </span>
              <p className="font-mono text-2xl font-bold text-primary">
                {Number(amount).toLocaleString()} Toman
              </p>
            </div>

            <div className="rounded-lg bg-muted/30 border border-border/50 p-4 space-y-2">
              <span className="text-[10px] uppercase text-muted-foreground tracking-wider font-bold">
                Factor ID
              </span>
              <div className="flex items-center gap-2">
                <code className="flex-1 font-mono text-sm text-foreground bg-background/50 px-3 py-2 rounded border border-border/50 select-all">
                  {factorId}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyFactorId}
                  className="shrink-0 gap-1.5 font-mono text-xs"
                >
                  <HugeiconsIcon icon={Copy01Icon} className="h-3.5 w-3.5" />
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex-col gap-3 bg-muted/20 border-t border-primary/10 pt-4">
            <Button
              onClick={handleSavePdf}
              variant="outline"
              className="w-full font-mono uppercase tracking-wider text-xs gap-2 print:hidden"
            >
              <HugeiconsIcon icon={Pdf01Icon} className="h-4 w-4" />
              Save as PDF
            </Button>
            <Button
              asChild
              variant="ghost"
              className="w-full font-mono text-xs text-muted-foreground print:hidden"
            >
              <Link to="/">Back to Home</Link>
            </Button>
          </CardFooter>
        </Card>

        <p className="text-center text-[10px] text-muted-foreground/60 font-mono print:hidden">
          Please save your Factor ID. You will need it to use your coupon.
        </p>
      </div>
    </div>
  );
}
