const baseUrl = process.env.API_URL ?? "http://localhost:4000";
const path = process.env.PATH_TO_TEST ?? "/comics";
const method = process.env.METHOD ?? "GET";
const total = Number(process.env.TOTAL_REQUESTS ?? "15");
const delayMs = Number(process.env.DELAY_MS ?? "0");
const authToken = process.env.ACCESS_TOKEN;
const body = process.env.BODY_JSON;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function resolveUrl() {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${baseUrl}${path}`;
}

async function sendRequest(index) {
  const headers = {};

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  if (body) {
    headers["Content-Type"] = "application/json";
  }

  const startedAt = Date.now();
  const response = await fetch(resolveUrl(), {
    method,
    headers,
    body: body || undefined,
  });
  const durationMs = Date.now() - startedAt;
  const text = await response.text();
  const retryAfter = response.headers.get("retry-after") ?? "-";
  const limit = response.headers.get("x-ratelimit-limit") ?? "-";
  const remaining = response.headers.get("x-ratelimit-remaining") ?? "-";

  console.log(
    `${String(index).padStart(2, "0")} ${response.status} ${durationMs}ms limit=${limit} remaining=${remaining} retryAfter=${retryAfter}`,
  );

  if (response.status === 429) {
    console.log(text);
  }
}

console.log(`Testing ${method} ${resolveUrl()}`);
console.log(`total=${total} delayMs=${delayMs}`);

for (let index = 1; index <= total; index += 1) {
  await sendRequest(index);

  if (delayMs > 0 && index < total) {
    await sleep(delayMs);
  }
}
