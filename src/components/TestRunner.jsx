import React, { useState } from "react";
import { runGetTest, runPostTest } from "../helpers/requestRunner";

export default function TestRunner() {
  const [url, setUrl] = useState("");
  const [totalRequests, setTotalRequests] = useState(10);
  const [delay, setDelay] = useState(0);
  const [stats, setStats] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleStart = async () => {
    if (!url) {
      alert("Veuillez entrer une URL");
      return;
    }

    setIsRunning(true);
    setStats(null);

    const result = await runGetTest({
      url,
      totalRequests: parseInt(totalRequests),
      delay: parseInt(delay),
      onResult: (stats, current) => {
        console.log(`Requête ${current}/${totalRequests}`, stats);
      },
    });

    setStats(result);
    setIsRunning(false);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Testeur d’API</h2>

      <div style={{ marginBottom: 10 }}>
        <label>URL de l’API :</label>
        <br />
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{ width: "100%" }}
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>Nombre de requêtes :</label>
        <br />
        <input
          type="number"
          value={totalRequests}
          onChange={(e) => setTotalRequests(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>Délai entre requêtes (ms) :</label>
        <br />
        <input
          type="number"
          value={delay}
          onChange={(e) => setDelay(e.target.value)}
        />
      </div>

      <button onClick={handleStart} disabled={isRunning}>
        {isRunning ? "Test en cours..." : "Lancer le test"}
      </button>

      {stats && (
        <div style={{ marginTop: 20 }}>
          <h3>Résultats :</h3>
          <pre>{JSON.stringify(stats, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
