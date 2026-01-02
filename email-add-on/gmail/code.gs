const scriptProps = PropertiesService.getScriptProperties();
const API_URL = scriptProps.getProperty('API_URL');
const API_SECRET = scriptProps.getProperty('API_SECRET');

function buildAddOn(e) {
  Logger.log(JSON.stringify(e, null, 2));
  const email = Session.getActiveUser().getEmail();
  const implementation = checkOrCreateImplementation(email); // Retorna o objeto {id_implementacao: 1, ...}
    
  ensureBaseLabelsExist(implementation.id_implementacao);

  if (e.gmail && e.gmail.messageId) {
    return showEmailContextCard(e,implementation.id_implementacao);
  } else {
    return showHomePage(implementation.id_implementacao);  }
}

function ensureBaseLabelsExist(implementationId) {
    
    // Labels base que devem existir independentemente da API
    const baseLabels = [
        "1. Categorizado",
        "2. Resposta Gerada",
        "3. Resposta Validada",
        "4. Respondido"
    ];

    const categories = getCategories(implementationId); 
    
    if (!Array.isArray(categories)) {
        Logger.log('Erro: getCategories não retornou um array. Prosseguindo apenas com baseLabels.');
    } else {
        categories.forEach(cat => {
            if (cat.nome) {
                baseLabels.push(cat.nome);
            }
        });
    }
    
    if (baseLabels.length === 0) {
        Logger.log('Nenhum label (base ou customizado) para criar.');
        return;
    }


    baseLabels.forEach(labelName => {
        try {
            if (!GmailApp.getUserLabelByName(labelName)) {
                GmailApp.createLabel(labelName);
                Logger.log(`✅ Label criado: ${labelName}`);
            }
        } catch (e) {
            Logger.log(`❌ Erro ao criar o label "${labelName}": ${e}`);
        }
    });

    Logger.log('Verificação de labels concluída.');
}

function showHomePage(implementationId) {
  const card = CardService.newCardBuilder();

  // Secção de Função Extra
  const sendEmailsSection = CardService.newCardSection()
    .addWidget(
      CardService.newTextButton()
        .setText("🚀 Enviar Emails de Teste")
        .setOnClickAction(
          CardService.newAction()
            .setFunctionName("enviarEmailsDeTeste")
            .setParameters({ implementationId: String(implementationId) })
        )
    );

  // Secção de Auto-Resposta
  const autoReplySection = CardService.newCardSection()
    .addWidget(CardService.newTextParagraph().setText("<i>Funcionalidade desativada temporariamente</i>"))
    .addWidget(
      CardService.newTextButton()
        .setText("🤖 Ativar Auto-Resposta")
        .setOnClickAction(CardService.newAction().setFunctionName("startAutoReply"))
    );

  // Nova Secção de Categorização Manual
  const categorizarSection = CardService.newCardSection()
    .addWidget(CardService.newTextParagraph().setText("Clique para iniciar um ciclo de categorização automática de emails por palavras-chave."))
    .addWidget(
      CardService.newTextButton()
        .setText("🏷️ Categorizar Emails")
        .setOnClickAction(
          CardService.newAction()
            .setFunctionName("categorizarEmails")
            .setParameters({ implementationId: String(implementationId) })
        )  
    );

  // Secção de Gestão de Categorias
  const categorySection = CardService.newCardSection()
    .addWidget(CardService.newTextParagraph().setText("Gerir Palavras-chave por Categoria"));
  categorySection.addWidget(
    CardService.newTextButton()
      .setText("⚙️ Gerir Categorias")
      .setOnClickAction(
        CardService.newAction()
          .setFunctionName("showCategoryManagementPage")
          .setParameters({ implementationId: String(implementationId) })
      )
  );

  // Botão Suporte
  const supportButton = CardService.newTextButton()
    .setText("🛠️ Info")
    .setOpenLink(
      CardService.newOpenLink()
        .setUrl("https://medium.com/@pedromartinscorreia/ai4apgovernance-gmail-add-on-6d1cff48d259")
        .setOpenAs(CardService.OpenAs.NEW_TAB)
    );

  const supportSection = CardService.newCardSection()
    .addWidget(supportButton);

  card
    .addSection(categorySection)
    .addSection(categorizarSection)
    .addSection(autoReplySection)
    .addSection(supportSection)
  return [card.build()];
}

function showCategoryManagementPage(e) {
  const implementationId = e.parameters.implementationId;
  const card = CardService.newCardBuilder();
  const categorias = getCategories(implementationId);

  //
  // 🔹 SECÇÃO TÍTULO
  //
  const headerSection = CardService.newCardSection()
    .addWidget(
      CardService.newTextParagraph().setText("⚙️ <b>Gestão de Categorias</b>")
    );

  card.addSection(headerSection);


  //
  // 🔹 UMA SECTION POR CATEGORIA
  //
  if (categorias.length > 0) {

    categorias.forEach((cat) => {
      if (cat.nome === ".Outro") return;

      const sec = CardService.newCardSection();

      // Nome da categoria
      sec.addWidget(
        CardService.newTextParagraph().setText(`<b>${cat.nome}</b>`)
      );

      // ButtonSet: editar + eliminar
      const btns = CardService.newButtonSet();

      btns.addButton(
        CardService.newTextButton()
          .setText("🔧 Editar")
          .setOnClickAction(
            CardService.newAction()
              .setFunctionName("showCategoryKeywordManager")
              .setParameters({
                labelName: String(cat.nome),
                implementationId: String(implementationId)
              })
          )
      );

      btns.addButton(
        CardService.newTextButton()
          .setText("🗑️ Apagar")
          .setTextButtonStyle(CardService.TextButtonStyle.DESTRUCTIVE)
          .setOnClickAction(
            CardService.newAction()
              .setFunctionName("deleteCategory")
              .setParameters({
                implementationId: String(implementationId),
                categoryId: String(cat.id_categoria),
                categoryName: String(cat.nome)
              })
          )
      );

      sec.addWidget(btns);

      // Adiciona a section desta categoria ao card
      card.addSection(sec);
    });

  } else {
    const emptySection = CardService.newCardSection()
      .addWidget(
        CardService.newTextParagraph().setText("Nenhuma categoria encontrada.")
      );
    card.addSection(emptySection);
  }


  //
  // 🔹 SECÇÃO PARA CRIAR NOVA CATEGORIA
  //
  const createSection = CardService.newCardSection()
    .addWidget(
      CardService.newTextButton()
        .setText("➕ Criar Nova Categoria")
        .setOnClickAction(
          CardService.newAction()
            .setFunctionName("showCreateCategoryPrompt")
            .setParameters({ implementationId: String(implementationId) })
        )
    );

  card.addSection(createSection);

  return [card.build()];
}

function showCategories(e) {
  const implementationId = e.parameters.implementationId;
  const categories = getCategories(implementationId);

  const card = CardService.newCardBuilder();
  const section = CardService.newCardSection();

  if (!categories || categories.length === 0) {
    // Mensagem informativa quando não há categorias
    section.addWidget(
      CardService.newTextParagraph()
        .setText("Nenhuma categoria foi encontrada para esta implementação.")
    );

    // (Opcional) botão direto para criar uma nova categoria
    section.addWidget(
      CardService.newTextButton()
        .setText("Criar nova categoria")
        .setOnClickAction(
          CardService.newAction()
            .setFunctionName("showCreateCategoryPrompt")
            .setParameters({ implementationId: String(implementationId) })
        )
    );
  } else {
    // Exibe as categorias normalmente
    categories.forEach(category => {
      section.addWidget(
        CardService.newTextParagraph().setText(`• ${category.name}`)
      );
    });
  }

  card.addSection(section);
  return [card.build()];
}



function showCategoryKeywordManager(e) {
  const labelName = e.parameters.labelName;  // Obtém o nome da categoria
  const implementationId = e.parameters.implementationId;  // Obtém o ID da implementação

  console.log(implementationId);  // Verifica se o parâmetro foi passado corretamente
  console.log(labelName);  // Verifica o conteúdo de labelName

  if (!implementationId || !labelName) {
    console.log("Erro: Parâmetros necessários não encontrados.");
    return;  // Retorna um erro ou exibe uma mensagem ao usuário
  }

  const categorias = getCategories(implementationId);  // Obtém as categorias usando o implementationId

  console.log(categorias);  // Verifica as categorias recuperadas

  // Encontrar a categoria que corresponde ao labelName
  const categoria = categorias.find(cat => cat.nome.trim() === labelName.trim());

  if (!categoria) {
    console.log(`Categoria com label '${labelName}' não encontrada.`);
    return;  // Retorna um erro ou exibe uma mensagem ao usuário
  }

  const categoryId = String(categoria.id_categoria);  // Passar categoryId como string

  const card = CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader().setTitle("🗂️ Gestão de Palavras-chave"))
    .addSection(
      CardService.newCardSection()
        .addWidget(CardService.newTextParagraph().setText(`Categoria: <b>${labelName}</b>`))
    );

  const keywordSection = CardService.newCardSection()
    .addWidget(CardService.newTextParagraph().setText("Palavras-chave atuais:"));

  // Buscar as palavras-chave da categoria
  const keywords = getKeywords(implementationId, categoryId);  // Função que chama o backend para obter as keywords

  if (keywords.length > 0) {
    keywords.forEach(keyword => {
      // Verificar se 'keyword.keyword' está presente
      if (keyword && keyword.keyword) {
        keywordSection.addWidget(
          CardService.newDecoratedText()
            .setText(`<b><i>${keyword.keyword}</i></b>`)
            .setWrapText(true)
            .setButton(
              CardService.newTextButton()
                .setText("❌ Remover")
                .setOnClickAction(
                  CardService.newAction()
                    .setFunctionName("removerKeyword")
                    .setParameters({ 
                      categoryId: String(categoryId),  // Passa o ID da categoria
                      implementationId: String(implementationId) , // Passa o ID da implementação
                      keywordId: String(keyword.id_keyword)  // Garantir que o ID seja passado como string
                    })
                )
            )
        );
      } else {
        console.log(`Keyword inválida: ${keyword}`);
      }
    });
  } else {
    keywordSection.addWidget(CardService.newTextParagraph().setText("Nenhuma palavra-chave definida."));
  }
  const inputSection = CardService.newCardSection()
    .addWidget(
      CardService.newTextInput()
        .setFieldName("novaKeyword")  // Define o campo de texto
        .setTitle("Adicionar nova palavra-chave")
    )
    .addWidget(
      CardService.newTextButton()
        .setText("➕ Adicionar")
        .setOnClickAction(
          CardService.newAction()
            .setFunctionName("adicionarKeyword")  // Define a função que será chamada
            .setParameters({
              categoryId: categoryId,  // Passa o ID da categoria
              implementationId: implementationId  // Passa o ID da implementação
            })
        )
    );


  return [card.addSection(keywordSection).addSection(inputSection).build()];
}



function showEmailContextCard(e, id_implementacao) {
  // ------------------------------------------------------------
  // 1️⃣ Obter Message ID REAL
  // ------------------------------------------------------------
  const opaqueId = e.gmail.messageId;
  const message = GmailApp.getMessageById(opaqueId);
  const messageId = message.getId();

  const thread = message.getThread();
  const subject = message.getSubject();

  const cardBuilder = CardService.newCardBuilder();
  const section = CardService.newCardSection();

  // ------------------------------------------------------------
  // 2️⃣ Obter resposta gerada via API externa
  // ------------------------------------------------------------
  const resposta = getGeneratedResponse(id_implementacao, thread.getId(), messageId);

  // ------------------------------------------------------------
  // 3️⃣ Secção de Categorias
  // ------------------------------------------------------------
  const categorias = getCategories(String(id_implementacao));

  if (categorias && categorias.length > 0) {
    const categoriaSection = CardService.newCardSection()
      .setHeader("📂 Categorizar email");

    const categoriaDropdown = CardService.newSelectionInput()
      .setFieldName("id_categoria")
      .setTitle("Selecionar categoria")
      .setType(CardService.SelectionInputType.DROPDOWN);

    categorias.forEach(cat => {
      categoriaDropdown.addItem(cat.nome, String(cat.id_categoria), false);
    });

    categoriaSection.addWidget(categoriaDropdown);

    categoriaSection.addWidget(
      CardService.newTextButton()
        .setText("💾 Guardar categoria")
        .setOnClickAction(
          CardService.newAction()
            .setFunctionName("categorizarEmailManualmente")
            .setParameters({
              messageId: messageId,
              threadId: thread.getId(),
              id_implementacao: String(id_implementacao)
            })
        )
    );

    cardBuilder.addSection(categoriaSection);
  }

  // ------------------------------------------------------------
  // 4️⃣ Lógica baseada no status
  // ------------------------------------------------------------
  // ------------------------------------------------------------
  // 🟢 PRIORIDADE MÁXIMA: o email já foi respondido
  // Verifica:
  // 1) Se o utilizador enviou a última mensagem diretamente no Gmail
  // 2) Se existe resposta validada na API
  // ------------------------------------------------------------
  const userEmail = Session.getActiveUser().getEmail();
  const lastMsg = thread.getMessages().slice(-1)[0];
  const lastFrom = lastMsg.getFrom();

  // true se última mensagem foi enviada pelo próprio utilizador
  const repliedByUser =
    lastFrom.includes(userEmail) || lastFrom.includes(`<${userEmail}>`);

  if (repliedByUser || (resposta && resposta.data_validacao)) {

    section.addWidget(
      CardService.newTextParagraph()
        .setText("✅ Este email já foi respondido.")
    );

    // FINALIZA o card (não mostra gerar/enviar)
    cardBuilder.addSection(section);
    cardBuilder.setHeader(
      CardService.newCardHeader().setTitle("✉️ Email: " + subject)
    );

    return [cardBuilder.build()];
  }


  // ❌ Sem resposta registada na API
  else if (!resposta) {

    section.addWidget(
      CardService.newTextParagraph().setText("❌ Ainda não existe resposta gerada.")
    );

    section.addWidget(
      CardService.newTextButton()
        .setText("✨ Gerar resposta")
        .setOnClickAction(
          CardService.newAction()
            .setFunctionName("generateResponseFromRag")
            .setParameters({
              id_implementacao: String(id_implementacao),
              threadId: thread.getId(),
              messageId: messageId
            })
        )
    );
  }

  // 🟥 STATUS = ERROR
  else if (resposta.status === "ERROR") {

    section.addWidget(
      CardService.newTextParagraph().setText("⚠️ Ocorreu um erro ao gerar a resposta.")
    );

    section.addWidget(
      CardService.newTextParagraph()
        .setText("<i>Detalhe técnico:</i> " + resposta.conteudo)
    );

    section.addWidget(
      CardService.newTextButton()
        .setText("♻️ Tentar gerar novamente")
        .setOnClickAction(
          CardService.newAction()
            .setFunctionName("generateResponseFromRag")
            .setParameters({
              id_implementacao: String(id_implementacao),
              threadId: thread.getId(),
              messageId: messageId
            })
        )
    );
  }

  // 🟡 STATUS = PROCESSING
  else if (resposta.status === "PROCESSING") {

    section.addWidget(
      CardService.newTextParagraph()
        .setText("⏳ A resposta está a ser gerada. Aguarde alguns segundos e atualize a página.")
    );
  }

  // 🟢 STATUS = DONE
  else if (resposta.status === "DONE") {

    // ------------------------------------------------------------
    // 🆕 ➤ ADICIONAR LABEL AUTOMATICAMENTE
    // ------------------------------------------------------------
    let label = GmailApp.getUserLabelByName("2. Resposta Gerada");
    if (!label) {
      label = GmailApp.createLabel("2. Resposta Gerada");
    }
    thread.addLabel(label);

    section.addWidget(
      CardService.newTextParagraph()
        .setText("💬 <b>Resposta gerada:</b>")
    );

    section.addWidget(
      CardService.newTextParagraph().setText(resposta.conteudo)
    );

    section.addWidget(
      CardService.newTextButton()
        .setText("📨 Enviar resposta")
        .setOnClickAction(
          CardService.newAction()
            .setFunctionName("approveAndSendResponse")
            .setParameters({
              threadId: thread.getId(),
              messageId: messageId,
              id_implementacao: String(id_implementacao),
              id_resposta: String(resposta.id_resposta)
            })
        )
    );
  }

  // ------------------------------------------------------------
  // 5️⃣ Construir card final
  // ------------------------------------------------------------
  //cardBuilder.addSection(section);

  cardBuilder.setHeader(
    CardService.newCardHeader().setTitle("✉️ Email: " + subject)
  );

  return [cardBuilder.build()];
}

