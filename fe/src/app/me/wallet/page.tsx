import { WalletPaymentPageClient } from "@/features/payments/ui/WalletPaymentPageClient";

type WalletPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getSingleParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function WalletPage({ searchParams }: WalletPageProps) {
  const params = await searchParams;

  return (
    <WalletPaymentPageClient
      paymentStatus={getSingleParam(params.payment)}
    />
  );
}
