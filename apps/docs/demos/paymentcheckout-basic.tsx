"use client";
import { PaymentCheckout } from "@lorenthi/ui/motion";

export default function Demo() {
  return (
    <PaymentCheckout
      amount={1234}
      demoValues={{ name: "Jan Janssens", number: "4539345345245425", expiry: "1128", cvc: "345" }}
      autoPlay
    />
  );
}
