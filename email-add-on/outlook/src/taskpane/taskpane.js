/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

/* global document, Office */
import { verificarOuCriarImplementacao } from "../services/implementacaoService.js";


Office.onReady(async (info) => {
  if (info.host === Office.HostType.Outlook) {
    document.getElementById("sideload-msg").style.display = "none";
    document.getElementById("app-body").style.display = "flex";
    document.getElementById("run").onclick = run;

    // 🚀 1) Obter email do utilizador
    const email = Office.context.mailbox.userProfile.emailAddress;
    console.log("Email do utilizador:", email);

    // 🚀 2) Verificar/criar implementação na API
    const implementacao = await verificarOuCriarImplementacao(email);

    // 🚀 3) Guardar ID para usar em outros endpoints
    if (implementacao?.id) {
      localStorage.setItem("id_implementacao", implementacao.id);
      console.log("ID implementacao:", implementacao.id);
    }
  }
});

export async function run() {
  /**
   * Insert your Outlook code here
   */

  const item = Office.context.mailbox.item;
  let insertAt = document.getElementById("item-subject");
  let label = document.createElement("b").appendChild(document.createTextNode("Subject: "));
  insertAt.appendChild(label);
  insertAt.appendChild(document.createElement("br"));
  insertAt.appendChild(document.createTextNode(item.subject));
  insertAt.appendChild(document.createElement("br"));
}
