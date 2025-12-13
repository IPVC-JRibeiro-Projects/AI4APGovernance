window.chatbotsMapNaoResp = {};

async function carregarChatbotsNaoRespondidas() {
  try {
    const res = await fetch("/chatbots");
    const chatbots = await res.json();

    const filtroChatbot = document.getElementById("filtroChatbotNaoResp");
    if (filtroChatbot) {
      filtroChatbot.innerHTML =
        '<option value="">Todos os Chatbots</option>' +
        chatbots
          .map(
            (bot) =>
              `<option value="${String(bot.chatbot_id)}">${bot.nome}</option>`
          )
          .join("");
    }

    window.chatbotsMapNaoResp = {};
    chatbots.forEach((bot) => {
      window.chatbotsMapNaoResp[bot.chatbot_id] = bot.nome;
    });
  } catch (err) {
    console.error("Erro ao carregar chatbots (nao respondidas):", err);
  }
}


function formatarDataHoraISO(isoString) {
  if (!isoString) return "-";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;

    const dia = String(d.getDate()).padStart(2, "0");
    const mes = String(d.getMonth() + 1).padStart(2, "0");
    const ano = d.getFullYear();
    const horas = String(d.getHours()).padStart(2, "0");
    const mins = String(d.getMinutes()).padStart(2, "0");

    return `${dia}/${mes}/${ano} ${horas}:${mins}`;
  } catch {
    return isoString;
  }
}


async function carregarTabelaNaoRespondidas() {
  const lista = document.getElementById("listaNaoRespondidas");
  const titulo = document.getElementById("tituloNaoRespondidas");

  if (!lista) return;

  lista.innerHTML = "<p>A carregar perguntas nao respondidas...</p>";
  if (titulo) titulo.textContent = "";

  const textoPesquisa =
    (document.getElementById("pesquisaNaoRespondida")?.value || "")
      .toLowerCase()
      .trim();
  const filtroChatbot =
    document.getElementById("filtroChatbotNaoResp")?.value || "";
  const filtroEstado =
    document.getElementById("filtroEstadoNaoResp")?.value || "";

  try {
    const res = await fetch("/perguntas-nao-respondidas");
    const json = await res.json();

    if (!Array.isArray(json)) {
      lista.innerHTML =
        "<p style='color:red;'>Erro ao carregar perguntas nao respondidas.</p>";
      console.error("Resposta inesperada de /nao-respondidas:", json);
      return;
    }

    let perguntas = json;

    let filtradas = perguntas.filter((p) => {
      let okPesquisa = true;
      if (textoPesquisa) {
        const target = (p.pergunta || "") + " " + (p.fonte || "");
        okPesquisa = target.toLowerCase().includes(textoPesquisa);
      }

      let okChatbot = true;
      if (filtroChatbot) {
        okChatbot = String(p.chatbot_id) === String(filtroChatbot);
      }

      let okEstado = true;
      if (filtroEstado) {
        okEstado =
          (p.estado || "").toLowerCase() === filtroEstado.toLowerCase();
      }

      return okPesquisa && okChatbot && okEstado;
    });

    if (filtradas.length === 0) {
      lista.innerHTML =
        "<p>Nao existem perguntas nao respondidas para os filtros selecionados.</p>";
      if (titulo) titulo.textContent = "0 perguntas encontradas.";
      return;
    }

    if (titulo) {
      const total = filtradas.length;
      const pendentes = filtradas.filter(
        (p) => (p.estado || "").toLowerCase() === "pendente"
      ).length;
      titulo.textContent = `${total} pergunta${
        total > 1 ? "s" : ""
      } no total (${pendentes} pendente${pendentes === 1 ? "" : "s"}).`;
    }

    const chatbotsMap = window.chatbotsMapNaoResp || {};

    lista.innerHTML = `
      <table class="faq-tabela-backoffice">
        <thead>
          <tr>
            <th>Chatbot</th>
            <th>Pergunta</th>
            <th>Fonte</th>
            <th>Estado</th>
            <th>Criada em</th>
            <th>Acoes</th>
          </tr>
        </thead>
        <tbody>
          ${filtradas
            .map((p) => {
              const nomeBot = chatbotsMap[p.chatbot_id] || "-";
              const fonte = p.fonte || "-";
              const score =
                typeof p.max_score === "number" ? p.max_score.toFixed(2) : "-";
              const estadoValor = (p.estado || "pendente").toLowerCase();
              const opcoesEstado = ["pendente", "tratada", "ignorada"]
                .map(
                  (estado) =>
                    `<option value="${estado}" ${
                      estado === estadoValor ? "selected" : ""
                    }>${estado.charAt(0).toUpperCase() + estado.slice(1)}</option>`
                )
                .join("");
              const selectEstado = `
                <div class="estado-select-wrapper estado-${estadoValor}">
                  <select class="estado-dropdown" onchange="alterarEstado(${p.id}, this.value, this)">
                    ${opcoesEstado}
                  </select>
                </div>`;

              const criadoEm = formatarDataHoraISO(p.criado_em);

              return `
              <tr>
                <td>${nomeBot}</td>
                <td>${p.pergunta || "-"}</td>
                <td>${fonte}</td>
                <td style="text-align:center;">${selectEstado}</td>
                <td>${criadoEm || "-"}</td>
                <td>
                  <button class="btn-remover" onclick="removerPergunta(${p.id})">Remover</button>
                </td>
              </tr>
            `;
            })
            .join("")}
        </tbody>
      </table>
    `;
  } catch (err) {
    console.error("Erro ao carregar perguntas nao respondidas:", err);
    lista.innerHTML =
      "<p style='color:red;'>Erro ao carregar perguntas nao respondidas.</p>";
  }
}

function aplicarClasseEstado(selectElement, estado) {
  if (!selectElement) return;
  const wrapper = selectElement.closest(".estado-select-wrapper");
  if (!wrapper) return;
  wrapper.classList.remove("estado-pendente", "estado-tratada", "estado-ignorada");
  wrapper.classList.add(`estado-${estado}`);
}

async function alterarEstado(perguntaId, novoEstado, selectElement) {
  const estadosPermitidos = ["pendente", "tratada", "ignorada"];
  const estadoNormalizado = (novoEstado || "").trim().toLowerCase();

  if (!estadosPermitidos.includes(estadoNormalizado)) {
    alert("Estado invalido. Use pendente, tratada ou ignorada.");
    carregarTabelaNaoRespondidas();
    return;
  }

  const res = await fetch(`/perguntas-nao-respondidas/${perguntaId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      estado: estadoNormalizado,
    }),
  });
  const json = await res.json();
  if (json.success) {
    aplicarClasseEstado(selectElement, estadoNormalizado);
    carregarTabelaNaoRespondidas();
  } else {
    alert("Nao foi possivel atualizar o estado. Tente novamente.");
    carregarTabelaNaoRespondidas();
  }
}

async function removerPergunta(perguntaId) {
  const res = await fetch(`/perguntas-nao-respondidas/${perguntaId}`, {
    method: "DELETE",
  });
  const json = await res.json();
  if (json.success) {
    carregarTabelaNaoRespondidas();
  }
}

window.carregarChatbotsNaoRespondidas = carregarChatbotsNaoRespondidas;
window.carregarTabelaNaoRespondidas = carregarTabelaNaoRespondidas;

document.addEventListener("DOMContentLoaded", () => {
  carregarChatbotsNaoRespondidas().then(() => {
    carregarTabelaNaoRespondidas();
  });

  const pesquisaInput = document.getElementById("pesquisaNaoRespondida");
  const filtroChatbot = document.getElementById("filtroChatbotNaoResp");
  const filtroEstado = document.getElementById("filtroEstadoNaoResp");

  if (pesquisaInput)
    pesquisaInput.addEventListener("input", carregarTabelaNaoRespondidas);
  if (filtroChatbot)
    filtroChatbot.addEventListener("change", carregarTabelaNaoRespondidas);
  if (filtroEstado)
    filtroEstado.addEventListener("change", carregarTabelaNaoRespondidas);
});
