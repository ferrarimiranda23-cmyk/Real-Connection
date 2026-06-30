/////////////// ARQUIVO COM O SCRIPT DE TODAS AS TELAS, CONTROLANDO O FLUXO DE DADOS E INTERAÇÕES DO USUÁRIO, IDENTIFICANDO CADA ARQUIVO COM : (####.html) ///////////////
////////TELA DE LOGIN (login.html)/////////////////////////////

const formLogin = document.getElementById('formLogin');

if (formLogin) {
  const emailInput = document.getElementById('email');

  formLogin.addEventListener('submit', function(event) {
    // Pegamos o e-mail do login e guardamos temporariamente para rastrear quem acessou
    const emailUsuario = emailInput.value.trim();
    localStorage.setItem('userEmailLogin', emailUsuario);
  });
}

/* =========================
   NOME DO USUÁRIO NO MENU
========================= */
function atualizarNomeUsuarioNoMenu() {
  const dadosSalvos = localStorage.getItem("usuarioRealConnection");

  if (!dadosSalvos) return;

  try {
    const usuario = JSON.parse(dadosSalvos);
    const primeiroNome = usuario.nome ? usuario.nome.split(" ")[0] : "Usuário";

    const nomesMenu = document.querySelectorAll(
      ".sidebar .name, .menu-lateral .nome, #menu-nome-usuario"
    );

    nomesMenu.forEach(nome => {
      nome.textContent = primeiroNome;
    });
  } catch (erro) {
    console.log("Erro ao carregar nome do usuário no menu:", erro);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", atualizarNomeUsuarioNoMenu);
} else {
  atualizarNomeUsuarioNoMenu();
}

////////////  TELA DE CADASTRO (cadastro.html)/////////////////

const formCadastro = document.getElementById("formCadastro") || document.querySelector("form:not(.steps):not(#formLogin)");

if (formCadastro && document.getElementById("confirmar-senha")) {
  const nome = document.getElementById("nome");
  const email = document.getElementById("email");
  const dataNascimento = document.getElementById("data-nascimento");
  const cidade = document.getElementById("cidade");
  const senha = document.getElementById("senha");
  const confirmarSenha = document.getElementById("confirmar-senha");

  function calcularIdade(data) {
    const hoje = new Date();
    const nascimento = new Date(data);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();

    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  }

  formCadastro.addEventListener("submit", (event) => {
    event.preventDefault(); 

    if (senha.value !== confirmarSenha.value) {
      alert("As senhas precisam ser iguais.");
      confirmarSenha.focus();
      return;
    }

    const idade = calcularIdade(dataNascimento.value);
    if (idade < 18) {
      alert("O RealConnection é permitido apenas para maiores de 18 anos.");
      dataNascimento.focus();
      return;
    }

    const usuario = {
      nome: nome.value.trim(),
      email: email.value.trim(),
      dataNascimento: dataNascimento.value,
      idade: idade,
      cidade: cidade.value.trim(),
      fotos: { principal: "", galeria: ["", "", "", ""] } // Inicializa o espaço das fotos
    };

    localStorage.setItem("usuarioRealConnection", JSON.stringify(usuario));
    window.location.href = "editperfil.html";
  });
}



////////////  TELA DE EDIÇÃO DE PERFIL POR ETAPAS (editperfil.html)///////////////// 

const formEtapas = document.querySelector('.steps');

if (formEtapas) {
  const steps = document.querySelectorAll('.step');
  const nextBtn = document.getElementById('next');
  const prevBtn = document.getElementById('prev');
  const progress = document.querySelector('.progress-fill');
  let current = 0;

  function updateStep() {
    steps.forEach(step => step.classList.remove('active'));
    steps[current].classList.add('active');

    const percent = (current / (steps.length - 1)) * 100;
    if (progress) progress.style.width = percent + "%";
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const etapaAtual = steps[current];
      const opcoesContainer = etapaAtual.querySelector('.opcoes-container');

      if (opcoesContainer) {
        const minimo = Number(opcoesContainer.dataset.minimo);
        const selecionados = opcoesContainer.querySelectorAll('.opcao-btn.selecionado');

        if (selecionados.length < minimo) {
          alert(`Selecione no mínimo ${minimo} opções.`);
          return;
        }
      }

      if (current < steps.length - 1) {
        current++;
        updateStep();
      }
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (current > 0) {
        current--;
        updateStep();
      }
    });
  }

  document.querySelectorAll('.opcoes-container').forEach(container => {
    const botoes = container.querySelectorAll('.opcao-btn');
    const totalSelecionado = container.querySelector('.total-selecionado');
    const inputHidden = container.querySelector('.valores-selecionados');
    const campoOutros = container.querySelector('.campo-outros');

    botoes.forEach(botao => {
      botao.addEventListener('click', () => {
        botao.classList.toggle('selecionado');

        const selecionados = Array.from(
          container.querySelectorAll('.opcao-btn.selecionado')
        ).map(item => item.dataset.value);

        if (totalSelecionado) totalSelecionado.textContent = selecionados.length;
        if (inputHidden) inputHidden.value = selecionados.join(',');

        if (campoOutros) {
          if (selecionados.includes('outros')) {
            campoOutros.classList.add('mostrar');
          } else {
            campoOutros.classList.remove('mostrar');
            campoOutros.value = '';
          }
        }
      });
    });
  });

  document.querySelectorAll('select').forEach(select => {
    select.addEventListener('change', () => {
      const campoOutro = select.parentElement.querySelector('.campo-outros-select');
      if (!campoOutro) return;

      if (select.value === 'outro') {
        campoOutro.classList.add('mostrar');
      } else {
        campoOutro.classList.remove('mostrar');
        campoOutro.value = '';
      }
    });
  });

  formEtapas.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(formEtapas);
    
    const dadosPerfil = {
      estadoCivil: formData.get('estado-civil'),
      temFilhos: formData.get('filhos'),
      fuma: formData.get('fuma'),
      bebeAlcool: formData.get('alcool'),
      religiao: formData.get('religiao') ? formData.get('religiao').trim() : '',
      sexualidade: formData.get('sexualidade') === 'outro' ? formData.get('sexualidade-outro').trim() : formData.get('sexualidade'),
      descricao: formData.get('descricao') ? formData.get('descricao').trim() : '',
      objetivo: formData.get('objetivo'),
      valores: formData.get('valores') ? formData.get('valores').split(',') : [],
      valoresOutros: formData.get('valores-outros') ? formData.get('valores-outros').trim() : '',
      interesses: formData.get('interesses') ? formData.get('interesses').split(',') : [],
      interessesOutros: formData.get('interesses-outros') ? formData.get('interesses-outros').trim() : '',
      estiloVida: formData.get('estilo-vida'),
      tipoConversa: formData.get('tipo-conversa'),
      conexaoImportante: formData.get('conexao')
    };

    const cadastroAntigoString = localStorage.getItem("usuarioRealConnection");
    let usuarioCompleto = {};

    if (cadastroAntigoString) {
      usuarioCompleto = JSON.parse(cadastroAntigoString);
    }

    usuarioCompleto = {
      ...usuarioCompleto,
      perfil: dadosPerfil
    };

    localStorage.setItem("usuarioRealConnection", JSON.stringify(usuarioCompleto));
    window.location.href = "perfil.html";
  });

  updateStep();
}



//////// TELA DO PERFIL DO USUÁRIO COM UPLOAD DE FOTOS (perfil.html)///////////

const mainPerfilPage = document.querySelector(".perfil-page");

if (mainPerfilPage) {
  // Controle do menu lateral (Sidebar) //
  const toggle = document.getElementById("toggle");
  const sidebar = document.getElementById("sidebar");

  if (toggle && sidebar) {
    toggle.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
    });
  }

  // Carrega e renderiza as informações textuais e imagens salvas //
  const dadosSalvos = localStorage.getItem("usuarioRealConnection");

  if (!dadosSalvos) {
    window.location.href = "cadastro.html";
  } else {
    const usuario = JSON.parse(dadosSalvos);
    const perfil = usuario.perfil || {};
    if (!usuario.fotos) { usuario.fotos = { principal: "", galeria: ["", "", "", ""] }; }

    const dicionarioFormatacao = {
      'solteiro': 'Solteiro(a)', 'divorciado': 'Divorciado(a)', 'viuvo': 'Viúvo(a)',
      'relacionamento-serio': 'Relacionamento sério', 'novas-conexoes': 'Novas conexões',
      'amizades': 'Amizades', 'conversas-com-proposito': 'Conversas com propósito',
      'caseiro': 'Mais caseiro(a)', 'social': 'Mais social', 'equilibrado': 'Equilibrado',
      'aventureiro': 'Aventureiro(a)', 'leve': 'Conversas leves', 'profunda': 'Conversas profundas',
      'engracada': 'Conversas engraçadas', 'variada': 'Um pouco de tudo'
    };

    const formatarTexto = (chave) => dicionarioFormatacao[chave] || chave;

    // Vincula os dados textuais nos elementos correspondentes //
    const elMenuNome = document.getElementById("menu-nome-usuario");
    const elPerfilNome = document.getElementById("perfil-nome");
    const elPerfilIdade = document.getElementById("perfil-idade");
    const elPerfilLocal = document.getElementById("perfil-local");
    const elPerfilDesc = document.getElementById("perfil-descricao");
    const elPerfilObj = document.getElementById("perfil-objetivo");

    if (elMenuNome) elMenuNome.textContent = usuario.nome ? usuario.nome.split(" ")[0] : "Usuário";
    if (elPerfilNome) elPerfilNome.textContent = usuario.nome || "Nome não informado";
    if (elPerfilIdade) elPerfilIdade.textContent = usuario.idade ? `${usuario.idade} anos` : "-- anos";
    if (elPerfilLocal) elPerfilLocal.textContent = usuario.cidade ? `📍 ${usuario.cidade}` : "📍 Não informado";
    if (elPerfilDesc) elPerfilDesc.textContent = perfil.descricao || "Nenhuma descrição adicionada ainda.";
    if (elPerfilObj) elPerfilObj.textContent = formatarTexto(perfil.objetivo);

    // Carrega imagens em cache se o usuário já tiver feito o upload anteriormente //
    if (usuario.fotos.principal) {
      document.getElementById("img-perfil-principal").src = usuario.fotos.principal;
    }
    usuario.fotos.galeria.forEach((fotoUrl, index) => {
      if (fotoUrl) {
        const imgEl = document.getElementById(`img-galeria-${index + 1}`);
        if (imgEl) imgEl.src = fotoUrl;
      }
    });

    // Renderização das tags de Valores e Interesses //
    const containerValores = document.getElementById("container-valores");
    if (containerValores) {
      containerValores.innerHTML = "";
      if (perfil.valores && perfil.valores.length > 0) {
        perfil.valores.forEach(valor => {
          const span = document.createElement("span");
          span.textContent = formatarTexto(valor);
          containerValores.appendChild(span);
        });
        if (perfil.valoresOutros) {
          const spanOutros = document.createElement("span");
          spanOutros.textContent = perfil.valoresOutros;
          containerValores.appendChild(spanOutros);
        }
      } else {
        containerValores.innerHTML = "<span>Nenhum valor selecionado</span>";
      }
    }

    const containerInteresses = document.getElementById("container-interesses");
    if (containerInteresses) {
      containerInteresses.innerHTML = "";
      if (perfil.interesses && perfil.interesses.length > 0) {
        perfil.interesses.forEach(interesse => {
          const span = document.createElement("span");
          span.textContent = formatarTexto(interesse);
          containerInteresses.appendChild(span);
        });
        if (perfil.interessesOutros) {
          const spanOutros = document.createElement("span");
          spanOutros.textContent = perfil.interessesOutros;
          containerInteresses.appendChild(spanOutros);
        }
      } else {
        containerInteresses.innerHTML = "<span>Nenhum interesse selecionado</span>";
      }
    }

    const elPrefSocial = document.getElementById("perfil-preferencia-social");
    const elPrefVida = document.getElementById("perfil-preferencia-vida");
    const elPrefConversa = document.getElementById("perfil-preferencia-conversa");

    if (elPrefSocial) {
      const estadoCivilFormatado = formatarTexto(perfil.estadoCivil);
      const sexualidadeFormatada = formatarTexto(perfil.sexualidade);
      elPrefSocial.textContent = `${estadoCivilFormatado} / ${sexualidadeFormatada}`;
    }
    if (elPrefVida) elPrefVida.textContent = formatarTexto(perfil.estiloVida);
    if (elPrefConversa) elPrefConversa.textContent = formatarTexto(perfil.tipoConversa);

    
    //// LÓGICA DE UPLOAD E CONVERSÃO DE IMAGENS (FileReader -> Base64) (tem q converter pra base64) //////////
   
    function salvarFotoNoStorage(tipo, index, base64String) {
      const dadosAtuais = JSON.parse(localStorage.getItem("usuarioRealConnection"));
      if (!dadosAtuais.fotos) dadosAtuais.fotos = { principal: "", galeria: ["", "", "", ""] };
      
      if (tipo === 'principal') {
        dadosAtuais.fotos.principal = base64String;
      } else if (tipo === 'galeria') {
        dadosAtuais.fotos.galeria[index] = base64String;
      }
      
      localStorage.setItem("usuarioRealConnection", JSON.stringify(dadosAtuais));
    }

    function gerenciarUpload(inputElement, imgElement, tipo, index = 0) {
      if (!inputElement) return;
      inputElement.addEventListener("change", (e) => {
        const arquivo = e.target.files[0];
        if (arquivo) {
          const reader = new FileReader();
          reader.onload = function(event) {
            const base64Result = event.target.result;
            imgElement.src = base64Result; // Altera visualmente na tela na hora //
            salvarFotoNoStorage(tipo, index, base64Result); // Guarda de forma permanente //
          };
          reader.readAsDataURL(arquivo);
        }
      });
    }

    //// Ativa os listeners para monitorar uploads do usuário ////
    gerenciarUpload(document.getElementById("input-foto-principal"), document.getElementById("img-perfil-principal"), "principal");
    gerenciarUpload(document.getElementById("input-galeria-1"), document.getElementById("img-galeria-1"), "galeria", 0);
    gerenciarUpload(document.getElementById("input-galeria-2"), document.getElementById("img-galeria-2"), "galeria", 1);
    gerenciarUpload(document.getElementById("input-galeria-3"), document.getElementById("img-galeria-3"), "galeria", 2);
    gerenciarUpload(document.getElementById("input-galeria-4"), document.getElementById("img-galeria-4"), "galeria", 3);
  }
}
