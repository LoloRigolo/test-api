export async function runGetTest({ url, totalRequests, delay, onResult }) {
  const stats = createEmptyStats();

  for (let i = 0; i < totalRequests; i++) {
    try {
      const start = performance.now();
      const res = await fetch(url);
      const time = performance.now() - start;

      updateStats(stats, res, time);
    } catch (e) {
      stats.total++;
      stats.networkErrors++;
    }

    onResult?.(stats, i + 1);

    if (delay > 0) await wait(delay);
  }

  return stats;
}

export async function runPostTest({
  url,
  totalRequests,
  delay,
  body,
  onResult,
}) {
  const stats = createEmptyStats();

  for (let i = 0; i < totalRequests; i++) {
    try {
      const start = performance.now();
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const time = performance.now() - start;

      updateStats(stats, res, time);
    } catch (e) {
      stats.total++;
      stats.networkErrors++;
    }

    onResult?.(stats, i + 1);

    if (delay > 0) await wait(delay);
  }

  return stats;
}

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
  return new Promise((res) => setTimeout(res, ms));
}
