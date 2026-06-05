import { clientApiGet } from "@/shared/api/client-api";
import {
  transactionsSchema,
  walletSchema,
  type Transaction,
  type Wallet,
} from "./wallet.schema";

export function getWallet(): Promise<Wallet> {
  return clientApiGet("/me/wallet", walletSchema, {
    auth: true,
  });
}

export function getTransactions(): Promise<Transaction[]> {
  return clientApiGet("/me/transactions", transactionsSchema, {
    auth: true,
  });
}
