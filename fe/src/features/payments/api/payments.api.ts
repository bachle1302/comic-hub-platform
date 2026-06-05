import { clientApiGet, clientApiPost } from "@/shared/api/client-api";
import {
  coinPackageSchema,
  createPaymentOrderInputSchema,
  createPaymentOrderResultSchema,
  paymentOrderSchema,
  paymentOrdersPaginatedSchema,
  type CoinPackage,
  type CreatePaymentOrderInput,
  type CreatePaymentOrderResult,
  type PaymentOrder,
  type PaymentOrdersPaginated,
  type PaymentOrdersQuery,
} from "./payments.schema";

function buildPaymentOrdersQuery(query?: PaymentOrdersQuery): string {
  const params = new URLSearchParams();

  if (query?.page !== undefined) {
    params.set("page", String(query.page));
  }

  if (query?.limit !== undefined) {
    params.set("limit", String(query.limit));
  }

  const queryString = params.toString();

  return queryString ? `?${queryString}` : "";
}

export function getCoinPackages(): Promise<CoinPackage[]> {
  return clientApiGet("/payments/coin-packages", coinPackageSchema.array());
}

export function createPaymentOrder(
  input: CreatePaymentOrderInput,
): Promise<CreatePaymentOrderResult> {
  const body = createPaymentOrderInputSchema.parse(input);

  return clientApiPost("/payments/orders", createPaymentOrderResultSchema, body, {
    auth: true,
  });
}

export function getMyPaymentOrders(
  query?: PaymentOrdersQuery,
): Promise<PaymentOrdersPaginated> {
  return clientApiGet(
    `/payments/orders/me${buildPaymentOrdersQuery(query)}`,
    paymentOrdersPaginatedSchema,
    {
      auth: true,
    },
  );
}

export function getPaymentOrder(id: number): Promise<PaymentOrder> {
  return clientApiGet(`/payments/orders/${id}`, paymentOrderSchema, {
    auth: true,
  });
}
