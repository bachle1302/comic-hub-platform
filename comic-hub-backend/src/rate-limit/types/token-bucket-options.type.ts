export type TokenBucketOptions = {
  capacity: number;
  refillRate: number;
  refillIntervalMs: number;
  cost?: number;
  keyPrefix?: string;
};

export type TokenBucketConsumeInput = {
  key: string;
  capacity: number;
  refillRate: number;
  refillIntervalMs: number;
  cost: number;
};

export type TokenBucketConsumeResult = {
  allowed: boolean;
  tokensRemaining: number;
  retryAfterMs: number;
};
