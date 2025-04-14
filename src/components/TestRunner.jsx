import React, { useState } from "react";
import { runGetTest, runPostTest } from "../helpers/requestRunner";
import "./TestRunner.css";

export default function TestRunner() {
  const [campaigns, setCampaigns] = useState([
    {
      id: Date.now(),
      url: "",
      method: "GET",
      totalRequests: 10,
      delay: 0,
      body: "{}",
    },
  ]);
  const [results, setResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const handleAddCampaign = () => {
    setCampaigns([
      ...campaigns,
      {
        id: Date.now(),
        url: "",
        method: "GET",
        totalRequests: 10,
        delay: 0,
        body: "{}",
      },
    ]);
  };

  const handleRemoveCampaign = (id) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
    setResults((prev) => prev.filter((r) => r.id !== id));
  };

  const handleChange = (id, field, value) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleStart = async () => {
    setIsRunning(true);

    setResults([]);

    for (const c of campaigns) {
      if (!c.url) continue;

      const commonParams = {
        url: c.url,
        totalRequests: parseInt(c.totalRequests),
        delay: parseInt(c.delay),
      };

      const result =
        c.method === "GET"
          ? await runGetTest(commonParams)
          : await runPostTest({
              ...commonParams,
              body: JSON.parse(c.body),
            });

      setResults((prev) => [
        ...prev.filter((r) => r.id !== c.id),
        { id: c.id, url: c.url, stats: result },
      ]);
    }

    setStats(null);

    const result = await runGetTest({
      url,
      totalRequests: parseInt(totalRequests),
      delay: parseInt(delay),
      onResult: (stats, current) => {
        console.log(`Requête ${current}/${totalRequests}`, stats);
      },
    });


    setIsRunning(false);
  };

  return (
    <div className="tester-container">
      {campaigns.map((c, i) => (
        <div className="campaign-block" key={c.id}>
          <div className="campaign-header">
            <h2>Bloc #{i + 1}</h2>
            <button
              onClick={() => handleRemoveCampaign(c.id)}
              className="remove-btn"
              title="Supprimer ce bloc"
            >
              ❌
            </button>
          </div>

          <div className="form-group">
            <label>URL :</label>
            <input
              type="text"
              value={c.url}
              onChange={(e) => handleChange(c.id, "url", e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="form-group-row">
            <div>
              <label>Méthode :</label>
              <select
                value={c.method}
                onChange={(e) => handleChange(c.id, "method", e.target.value)}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
              </select>
            </div>

            <div>
              <label>Requêtes :</label>
              <input
                type="number"
                value={c.totalRequests}
                onChange={(e) =>
                  handleChange(c.id, "totalRequests", e.target.value)
                }
              />
            </div>

            <div>
              <label>Délai (ms) :</label>
              <input
                type="number"
                value={c.delay}
                onChange={(e) => handleChange(c.id, "delay", e.target.value)}
              />
            </div>
          </div>

          {c.method === "POST" && (
            <div className="form-group">
              <label>Corps JSON :</label>
              <textarea
                value={c.body}
                onChange={(e) => handleChange(c.id, "body", e.target.value)}
                rows={3}
              />
            </div>
          )}

          {results.find((r) => r.id === c.id) && (
            <div className="result-block">
              <h3>→ {c.url}</h3>
              <div className="stat-grid">
                <StatItem
                  label="Total"
                  value={results.find((r) => r.id === c.id).stats.total}
                />
                <StatItem
                  label="Succès"
                  value={results.find((r) => r.id === c.id).stats.success}
                />
                <StatItem
                  label="Réseau"
                  value={results.find((r) => r.id === c.id).stats.networkErrors}
                />
                <StatItem
                  label="4xx"
                  value={results.find((r) => r.id === c.id).stats.http4xx}
                />
                <StatItem
                  label="5xx"
                  value={results.find((r) => r.id === c.id).stats.http5xx}
                />
                <StatItem
                  label="Taux réussite"
                  value={`${(
                    (results.find((r) => r.id === c.id).stats.success /
                      results.find((r) => r.id === c.id).stats.total) *
                    100
                  ).toFixed(1)} %`}
                />
              </div>
              <div className="durations">
                <ul>
                  <li>
                    Moyenne :{" "}
                    {average(
                      results.find((r) => r.id === c.id).stats.durations
                    ).toFixed(2)}{" "}
                    ms
                  </li>
                  <li>
                    Min :{" "}
                    {Math.min(
                      ...results.find((r) => r.id === c.id).stats.durations
                    ).toFixed(2)}{" "}
                    ms
                  </li>
                  <li>
                    Max :{" "}
                    {Math.max(
                      ...results.find((r) => r.id === c.id).stats.durations
                    ).toFixed(2)}{" "}
                    ms
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      ))}

      <button onClick={handleAddCampaign} className="add-btn">
        ➕ Ajouter un bloc de test
      </button>

      <button onClick={handleStart} disabled={isRunning}>
        {isRunning ? "Tests en cours..." : "Lancer les tests"}
      </button>
    </div>
  );
}

function StatItem({ label, value }) {
  return (
    <div className="stat-card">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function average(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}
