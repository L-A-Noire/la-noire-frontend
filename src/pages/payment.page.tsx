import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { initiatePayment } from "@/api/payment";
import {
  PaymentSchema,
  type PaymentFormValues,
} from "@/schemas/payment.schema";

export default function PaymentPage() {
  const [redirecting, setRedirecting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(PaymentSchema),
    defaultValues: { amount: 10000, mobile_num: "" },
  });

  const mutation = useMutation({
    mutationFn: (data: PaymentFormValues) =>
      initiatePayment({ amount: data.amount, mobile_num: data.mobile_num }),
    onSuccess: ({ gateway_url }) => {
      setRedirecting(true);
      window.location.href = gateway_url;
    },
  });

  const onSubmit = (data: PaymentFormValues) => {
    mutation.mutate(data);
  };

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-primary font-mono">
            PURCHASE COUPON
          </h1>
          <p className="text-sm text-muted-foreground font-mono">
            Secure payment through BitPay gateway
          </p>
        </div>

        <Card className="border-primary/20 bg-linear-to-br from-card/95 to-card/50 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-mono text-primary">
              PAYMENT DETAILS
            </CardTitle>
            <CardDescription>
              Complete the form below to proceed to the payment gateway.
            </CardDescription>
          </CardHeader>

          <Separator className="bg-primary/20" />

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="pt-6 space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="amount"
                  className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground"
                >
                  Amount (Toman)
                </Label>
                <Input
                  id="amount"
                  type="number"
                  dir="ltr"
                  placeholder="10000"
                  min={5001}
                  className={errors.amount ? "border-destructive" : ""}
                  {...register("amount", { valueAsNumber: true })}
                />
                {errors.amount && (
                  <p className="text-xs text-destructive font-mono">
                    {errors.amount.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="mobile_num"
                  className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground"
                >
                  Mobile Number
                </Label>
                <Input
                  id="mobile_num"
                  type="tel"
                  dir="ltr"
                  placeholder="09123726908"
                  className={errors.mobile_num ? "border-destructive" : ""}
                  {...register("mobile_num")}
                />
                {errors.mobile_num && (
                  <p className="text-xs text-destructive font-mono">
                    {errors.mobile_num.message}
                  </p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex-col gap-3 bg-muted/20 border-t border-primary/10 pt-4">
              <Button
                type="submit"
                disabled={mutation.isPending || redirecting}
                className="w-full font-mono uppercase tracking-wider text-xs"
              >
                {mutation.isPending
                  ? "Processing..."
                  : redirecting
                    ? "Redirecting to Gateway..."
                    : "Proceed to Payment"}
              </Button>

              {mutation.isError && (
                <p className="text-xs text-destructive text-center font-mono">
                  Payment initiation failed. Please try again.
                </p>
              )}
            </CardFooter>
          </form>
        </Card>

        <p className="text-center text-[10px] text-muted-foreground/60 font-mono">
          After successful payment, your coupon code will be delivered to the
          provided mobile number.
        </p>
      </div>
    </div>
  );
}
