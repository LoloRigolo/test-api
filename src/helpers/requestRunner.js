export async function runTest({ url, totalRequests, delay, onResult }) {
  const stats = {
    total: 0,
    success: 0,
    networkErrors: 0,
    http4xx: 0,
    http5xx: 0,
    durations: [],
  };

  for (let i = 0; i < totalRequests; i++) {
    try {
      const start = performance.now();
      const res = await fetch(url);
      const time = performance.now() - start;

      stats.total++;
      stats.durations.push(time);

      if (res.ok) {
        stats.success++;
      } else if (res.status >= 400 && res.status < 500) {
        stats.http4xx++;
      } else if (res.status >= 500) {
        stats.http5xx++;
      }
    } catch (e) {
      stats.total++;
      stats.networkErrors++;
      console.log(e);
    }

    onResult?.(stats, i + 1);

    if (delay > 0) {
      await new Promise((res) => setTimeout(res, delay));
    }
  }

  return stats;
}
