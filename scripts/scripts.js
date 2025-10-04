// scripts/scripts.js

const API_URL = "https://musiclibrary-qxyl.onrender.com";

// Função auxiliar para extrair o ID do vídeo e criar a URL da thumbnail
function getThumbnailUrl(youtubeUrl) {
  if (!youtubeUrl) return "./images/headerCapaM.png";

  let videoId = "";
  const match = youtubeUrl.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|(?:embed|v)\/))([a-zA-Z0-9_-]{11})/
  );

  if (match && match[1]) {
    videoId = match[1];
  } else {
    return "./images/headerCapaM.png";
  }

  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

// Função utilitária para garantir que a resposta seja uma lista válida ou lança um erro
async function getJsonArray(url) {
  const response = await fetch(url);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.erro || `Falha na API: ${response.status}`);
  }

  if (!Array.isArray(data)) {
    console.error("Erro de formato da API. Esperado Array, recebido:", data);
    throw new TypeError(
      "O formato de dados da API está incorreto. Esperada uma lista."
    );
  }

  return data;
}

// ====================================================================
// FUNÇÕES DE CARREGAMENTO E CADASTRO (Músicas e Formulário)
// ====================================================================

// Função 1: Carregar Cantores (para o <select> de Adicionar Música)
async function carregarCantores() {
  const selectCantores = document.querySelector(
    ".AdicionarMusica .form-select"
  );

  try {
    const cantores = await getJsonArray(`${API_URL}/cantores`);

    selectCantores.innerHTML = "<option selected>Selecione</option>";

    cantores.forEach((cantor) => {
      const option = document.createElement("option");
      option.value = cantor._id;
      option.textContent = cantor.nome;
      selectCantores.appendChild(option);
    });
  } catch (error) {
    console.error("Erro ao carregar cantores:", error);
    alert(
      `Não foi possível carregar a lista de cantores. Verifique a API. Detalhe: ${error.message}`
    );
  }
}

// Função 2: Cadastrar Música
async function adicionarMusica(event) {
  event.preventDefault();

  const nomeMusica = document.querySelector(".input-group.nome input").value;
  const nomeArtista = document.querySelector(
    ".input-group.artista input"
  ).value;
  const linkYoutube = document.querySelector(".input-group.link input").value;
  const selectCantor = document.querySelector(".AdicionarMusica .form-select");
  const cantorId = selectCantor.value;

  if (cantorId === "Selecione" || !nomeMusica || !nomeArtista || !linkYoutube) {
    alert("Por favor, preencha todos os campos e selecione um cantor.");
    return;
  }

  const dadosMusica = { nomeMusica, nomeArtista, linkYoutube, cantorId };

  try {
    const response = await fetch(`${API_URL}/musicas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dadosMusica),
    });

    const resultado = await response.json();

    if (response.status === 201) {
      alert(`Música "${resultado.nomeMusica}" adicionada com sucesso!`);
      // Limpa o formulário
      document.querySelector(".input-group.nome input").value = "";
      document.querySelector(".input-group.artista input").value = "";
      document.querySelector(".input-group.link input").value = "";
      selectCantor.value = "Selecione";

      carregarMusicas(); // Recarrega a listagem principal
    } else {
      alert(`Erro ao adicionar música: ${resultado.erro}`);
    }
  } catch (error) {
    console.error("Erro de conexão ao adicionar música:", error);
    alert("Erro ao se comunicar com o servidor.");
  }
}

// Função 3: Carregar TODAS as Músicas (Listagem Principal) - CORRIGIDA PARA LAYOUT
async function carregarMusicas() {
  const listagemMusicasSection = document.querySelector(".ListagemMusicas");
  listagemMusicasSection.innerHTML = "<h1>Listagem de Músicas</h1>";

  try {
    const musicas = await getJsonArray(`${API_URL}/musicas`);

    if (musicas.length === 0) {
      listagemMusicasSection.innerHTML += "<p>Nenhuma música cadastrada.</p>";
      return;
    }

    // CRIAÇÃO DA LINHA RESPONSIVA
    let rowContainer = document.createElement("div");
    rowContainer.className = "row justify-content-start";

    musicas.forEach((musica) => {
      const cantorNome = musica.cantorId ? musica.cantorId.nome : "N/A";
      const thumbUrl = getThumbnailUrl(musica.linkYoutube);

      // CLASSES DE COLUNA: 4 colunas em XL, 3 em LG, 2 em SM.
      const colClasses =
        "col-12 col-sm-6 col-lg-4 col-xl-3 mb-4 d-flex justify-content-center";

      // HTML DO CARD: width: 18rem e height: 100% mantidos
      const cardHTML = `
                <div class="${colClasses}">
                    <div class="card" style="width: 18rem; height: 100%;">
                        <img src="${thumbUrl}" class="card-img-top" alt="Capa da Música do Youtube">
                        <div class="card-body">
                            <h5 class="card-title">${musica.nomeMusica}</h5>
                            <h6>Artista: ${musica.nomeArtista}</h6>
                            <h6>Cantor: ${cantorNome}</h6>
                            <a href="${musica.linkYoutube}" target="_blank" class="btn btn-danger">Youtube</a>
                        </div>
                    </div>
                </div>
            `;
      rowContainer.innerHTML += cardHTML;
    });

    listagemMusicasSection.appendChild(rowContainer);
  } catch (error) {
    console.error("Erro ao carregar músicas:", error);
    alert(`Não foi possível carregar as músicas. Detalhe: ${error.message}`);
  }
}

// ====================================================================
// FUNÇÕES DE FILTRAGEM (Para a seção "Por Cantores")
// ====================================================================

// Função 4: Renderiza o filtro e adiciona o Listener
async function popularFiltroCantores() {
  const filtroSelect = document.getElementById("filtroCantorSelect");
  if (!filtroSelect) return;

  try {
    const cantores = await getJsonArray(`${API_URL}/cantores`);

    filtroSelect.innerHTML =
      "<option value='Selecione'>Selecione o Cantor</option>";

    cantores.forEach((cantor) => {
      const option = document.createElement("option");
      option.value = cantor._id;
      option.textContent = cantor.nome;
      filtroSelect.appendChild(option);
    });

    // Adiciona o Event Listener que dispara o filtro quando a seleção muda
    filtroSelect.addEventListener("change", (e) => {
      const selectedId = e.target.value;
      const selectedName = e.target.options[e.target.selectedIndex].text;

      filtrarMusicasPorCantor(selectedId, selectedName);
    });
  } catch (error) {
    console.error("Erro ao popular a lista de filtro:", error);
  }
}

// Função 5: Busca as músicas filtradas no backend e renderiza - CORRIGIDA LIMPEZA
async function filtrarMusicasPorCantor(cantorId, cantorNome) {
  const porCantoresSection = document.querySelector(".PorCantores");

  // --- CORREÇÃO: Limpa todos os resultados anteriores (títulos, parágrafos e cards) ---
  // Remove todos os filhos da seção que NÃO são o H1 (título da seção) e o SELECT de filtro.
  Array.from(porCantoresSection.children).forEach((child) => {
    const isHeader = child.tagName === "H1";
    const isSelect =
      child.tagName === "SELECT" ||
      child.id === "filtroCantorSelect" ||
      child.classList.contains("form-select");

    // Remove qualquer elemento que NÃO seja o H1 ou o SELECT
    if (!isHeader && !isSelect) {
      child.remove();
    }
  });
  // --- FIM DA CORREÇÃO DE LIMPEZA ---

  if (!cantorId || cantorId === "Selecione") {
    porCantoresSection.innerHTML += `<h2 class="mt-3">Selecione um cantor para visualizar suas músicas.</h2>`;
    return;
  }

  try {
    const musicas = await getJsonArray(`${API_URL}/musicas/cantor/${cantorId}`);

    // CRIAÇÃO DA LINHA RESPONSIVA
    let rowContainer = document.createElement("div");
    rowContainer.className = "row justify-content-start";

    // Adicionamos o título H2
    let h2Title = document.createElement("h2");
    h2Title.className = "mt-3";
    h2Title.textContent = `Músicas de ${cantorNome}`;
    porCantoresSection.appendChild(h2Title);

    if (musicas.length === 0) {
      porCantoresSection.innerHTML += `<p>Nenhuma música cadastrada para ${cantorNome}.</p>`;
      return;
    }

    musicas.forEach((musica) => {
      const thumbUrl = getThumbnailUrl(musica.linkYoutube);

      // Classes responsivas de coluna
      const colClasses =
        "col-12 col-sm-6 col-lg-4 col-xl-3 mb-4 d-flex justify-content-center";

      // HTML DO CARD: width: 18rem mantido
      const cardHTML = `
                <div class="${colClasses}">
                    <div class="card" style="width: 18rem; height: 100%;">
                        <img src="${thumbUrl}" class="card-img-top" alt="Capa da Música do Youtube">
                        <div class="card-body">
                            <h5 class="card-title">${musica.nomeMusica}</h5>
                            <h6>Artista: ${musica.nomeArtista}</h6>
                            <a href="${musica.linkYoutube}" target="_blank" class="btn btn-danger">Youtube</a>
                        </div>
                    </div>
                </div>
            `;
      rowContainer.innerHTML += cardHTML;
    });

    porCantoresSection.appendChild(rowContainer);
  } catch (error) {
    console.error("Erro ao carregar músicas por cantor:", error);
    porCantoresSection.innerHTML += `<p>Erro ao buscar músicas do cantor ${cantorNome}.</p>`;
  }
}

// ====================================================================
// INICIALIZAÇÃO E EVENT LISTENERS GERAIS
// ====================================================================

// Liga o evento de clique ao botão de Adicionar
document
  .querySelector(".AdicionarMusica .btn-secondary")
  .addEventListener("click", adicionarMusica);

// Dispara as funções de carregamento ao carregar a página
document.addEventListener("DOMContentLoaded", carregarMusicas);
document.addEventListener("DOMContentLoaded", carregarCantores);
document.addEventListener("DOMContentLoaded", popularFiltroCantores);

// ====================================================================
// Lógica do Menu Mobile (jQuery)
// ====================================================================

function motrarMenu() {
  $("header nav#nav-esq ul#menu-principal").css("display", "flex");
  $("header nav#nav-esq ul#menu-principal").addClass(
    "animate__animated animate__fadeInRight animate__slow"
  );

  $("header nav#nav-esq ul#icone-menu li#menu").css("display", "none");
  $("header nav#nav-esq ul#icone-menu li#menux").css("display", "flex");
}

function esconderMenu() {
  $("header nav#nav-esq ul#menu-principal").css("display", "none");

  $("header nav#nav-esq ul#icone-menu li#menu").css("display", "flex");
  $("header nav#nav-esq ul#icone-menu li#menux").css("display", "none");
}

let controle = true;

$("header nav#nav-esq ul#icone-menu").click(function () {
  if (controle == true) {
    motrarMenu();
    controle = false;
  } else {
    esconderMenu();
    controle = true;
  }
});
