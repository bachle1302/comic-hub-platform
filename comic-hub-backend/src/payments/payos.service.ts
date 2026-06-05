import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  PayOS,
  type CreatePaymentLinkResponse,
  type Webhook,
  type WebhookData,
} from '@payos/node';

type CreatePaymentLinkInput = {
  amount: number;
  cancelUrl?: string;
  description: string;
  orderCode: number;
  returnUrl?: string;
};

@Injectable()
export class PayosService {
  constructor(private readonly configService: ConfigService) {}

  async createPaymentLink(
    input: CreatePaymentLinkInput,
  ): Promise<CreatePaymentLinkResponse> {
    const payos = this.createClient();

    return payos.paymentRequests.create({
      orderCode: input.orderCode,
      amount: input.amount,
      description: input.description,
      returnUrl:
        input.returnUrl ??
        this.configService.get<string>('PAYMENT_RETURN_URL') ??
        'http://localhost:3000/me/wallet?payment=success',
      cancelUrl:
        input.cancelUrl ??
        this.configService.get<string>('PAYMENT_CANCEL_URL') ??
        'http://localhost:3000/me/wallet?payment=cancel',
    });
  }

  async verifyWebhook(payload: Webhook): Promise<WebhookData> {
    const payos = this.createClient();

    try {
      return await payos.webhooks.verify(payload);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Invalid PayOS webhook',
      );
    }
  }

  private createClient(): PayOS {
    const clientId = this.configService.get<string>('PAYOS_CLIENT_ID');
    const apiKey = this.configService.get<string>('PAYOS_API_KEY');
    const checksumKey = this.configService.get<string>('PAYOS_CHECKSUM_KEY');

    if (!clientId || !apiKey || !checksumKey) {
      throw new ServiceUnavailableException(
        'Payment provider is not configured',
      );
    }

    return new PayOS({
      clientId,
      apiKey,
      checksumKey,
    });
  }
}
