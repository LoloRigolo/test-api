import React, { useState } from "react";
import { runGetTest, runWriteTest } from "../helpers/requestRunner";
import { parseMiddlewares } from "../helpers/middleware";
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
  const [middlewares, setMiddlewares] = useState([""]);

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

    const parsedMiddlewares = parseMiddlewares(middlewares);

    for (const c of campaigns) {
      if (!c.url) continue;

      const commonParams = {
        url: c.url,
        totalRequests: parseInt(c.totalRequests),
        delay: parseInt(c.delay),
        middlewares: parsedMiddlewares,
        onResult: (stats) => {
          setResults((prev) => {
            const without = prev.filter((r) => r.id !== c.id);
            return [...without, { id: c.id, url: c.url, stats }];
          });
        },
      };

      const runFn = c.method === "GET" ? runGetTest : runWriteTest;

      await runFn({
        ...commonParams,
        method: c.method,
        body: JSON.parse(c.body || "{}"),
      });
    }

    setIsRunning(false);
  };

  return (
    <div className="tester-container">
      <h1 className="title">Multi-Tests d’API</h1>

      {campaigns.map((c, i) => (
        <div className="campaign-block" key={c.id}>
          <div className="campaign-header">
            <button
              onClick={() => handleRemoveCampaign(c.id)}
              className="remove-campaign-btn"
              title="Supprimer ce bloc"
            >
              ❌
            </button>
            <h2>Bloc #{i + 1}</h2>
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
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
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

          {["POST", "PUT"].includes(c.method) && (
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

      <div className="form-group">
        <label>Middlewares JS :</label>
        {middlewares.map((mw, i) => (
          <div key={i} className="middleware-row">
            <textarea
              rows={2}
              value={mw}
              onChange={(e) =>
                setMiddlewares((prev) =>
                  prev.map((v, j) => (j === i ? e.target.value : v))
                )
              }
              placeholder="ecrire async function(req, next) { /* ton code... */ return next(req); }"
            />
            <button
              type="button"
              className="remove-middleware-btn"
              onClick={() =>
                setMiddlewares((prev) => prev.filter((_, j) => j !== i))
              }
              title="Supprimer ce middleware"
            >
              ❌
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setMiddlewares((prev) => [...prev, ""])}
          className="add-btn"
          style={{ marginTop: "10px" }}
        >
          ➕ Ajouter un middleware
        </button>
      </div>

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
