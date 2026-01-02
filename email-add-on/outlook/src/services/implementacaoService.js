import { API_URL, API_SECRET } from "../config/api.js";

export async function obterImplementacao(email) {
  const res = await fetch(`${API_URL}/implementacao/${email}`, {
    headers: {
      "Authorization": `Bearer ${API_SECRET}`
    }
  });
  return res.status === 404 ? null : await res.json();
}

export async function criarImplementacao(email) {
  const res = await fetch(`${API_URL}/implementacao`, {
    method: "POST",
    headers: {
        "Content-Type": "application/json", 
        "Authorization": `Bearer ${API_SECRET}`
    },
    body: JSON.stringify({ email }),
  });
  return await res.json();
}

export async function verificarOuCriarImplementacao(email) {
  const existente = await obterImplementacao(email);

  if (existente) {
    console.log("Implementação existente:", existente);
    return existente;
  }

  const nova = await criarImplementacao(email);
  console.log("Implementação criada:", nova.implementacao);
  return nova.implementacao;
}
