import { applyMiddlewares } from "./middleware";

export async function runGetTest({
  url,
  totalRequests,
  delay,
  onResult,
  middlewares = [],
}) {
  const stats = createEmptyStats();

  for (let i = 0; i < totalRequests; i++) {
    let request = {
      url,
      options: { method: "GET" },
    };

    try {
      request = await applyMiddlewares(request, middlewares);

      const start = performance.now();
      const res = await fetch(request.url, request.options);
      const time = performance.now() - start;

      updateStats(stats, res, time);
    } catch (err) {
      stats.total++;
      stats.networkErrors++;
    }

    onResult?.(stats, i + 1);
    if (delay > 0) await wait(delay);
  }

  return stats;
}

export async function runWriteTest({
  url,
  method,
  totalRequests,
  delay,
  body,
  onResult,
  middlewares = [],
}) {
  const stats = createEmptyStats();

  for (let i = 0; i < totalRequests; i++) {
    let request = {
      url,
      options: {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: ["POST", "PUT"].includes(method)
          ? JSON.stringify(body)
          : undefined,
      },
    };

    try {
      request = await applyMiddlewares(request, middlewares);

      const start = performance.now();
      const res = await fetch(request.url, request.options);
      const time = performance.now() - start;

      updateStats(stats, res, time);
    } catch (err) {
      stats.total++;
      stats.networkErrors++;
    }

    onResult?.(stats, i + 1);
    if (delay > 0) await wait(delay);
  }

  return stats;
}

// Utils

function createEmptyStats() {
  return {
    total: 0,
    success: 0,
    networkErrors: 0,
    http4xx: 0,
    http5xx: 0,
    durations: [],
  };
}

function updateStats(stats, res, duration) {
  stats.total++;
  stats.durations.push(duration);

  if (res.ok) {
    stats.success++;
  } else if (res.status >= 400 && res.status < 500) {
    stats.http4xx++;
  } else if (res.status >= 500) {
    stats.http5xx++;
  }
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
