// Applique les middlewares en chaîne (style Express)
export async function applyMiddlewares(req, middlewares) {
  let i = 0;

  async function next(modifiedReq) {
    const mw = middlewares[i++];
    if (!mw) return modifiedReq;
    return await mw(modifiedReq, next);
  }

  return await next(req);
}

// Transforme les chaînes de texte (écrites par l’utilisateur) en fonctions JS
export function parseMiddlewares(codeStrings) {
  const mws = [];

  for (const code of codeStrings) {
    if (!code.trim()) continue;

    try {
      // Évalue la string comme une fonction JS
      const fn = eval(`(${code})`);

      if (typeof fn === "function") {
        mws.push(fn);
      } else {
        console.warn("Middleware non fonctionnel :", code);
      }
    } catch (e) {
      console.error("Erreur middleware invalide :", code, e);
    }
  }

  return mws;
}
