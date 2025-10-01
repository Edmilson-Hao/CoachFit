import { auth, onAuth, provider, signInWithPopup, db, collection, addDoc, query, where, getDocs, doc, updateDoc } from "./firebase.js";


// DOM Elements Style Manipulation
const dashboardProfessor = document.getElementById('dashboardProfessor');
const loginSection = document.getElementById('loginSection');
document.innerWidth < document.innerHeight ? dashboardProfessor.classList.add('wideScreen') : dashboardProfessor.classList.remove('mobile');
const radios = document.querySelectorAll('input[name="perfil"]');
//

// Atualiza ano
document.getElementById('year').textContent = new Date().getFullYear();

// Efeito ripple Material no botão fallback
const btn = document.getElementById('btnGoogle');
btn.addEventListener('click', (e) => {
  const circle = document.createElement('span');
  const diameter = Math.max(btn.clientWidth, btn.clientHeight);
  const rect = btn.getBoundingClientRect();
  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${e.clientX - rect.left - diameter/2}px`;
  circle.style.top  = `${e.clientY - rect.top  - diameter/2}px`;
  circle.classList.add('ripple');
  const old = btn.getElementsByClassName('ripple')[0];
  if (old) old.remove();
  btn.appendChild(circle);
  // 👉 Fluxo de OAuth manual (fallback)
  // Redirecione para sua rota backend que inicia o OAuth com Google (Authorization Code Flow)
  // Ex.: window.location.href = '/api/auth/google/start';
  // Como este é apenas o index estático, deixamos um console para referência:
  console.log('[Login] Iniciar fluxo OAuth no backend em /api/auth/google/start');
  signInWithPopup(auth, provider)
    .then((result) => {
      // Usuário autenticado com sucesso
      const user = result.user;
      console.log('Usuário autenticado:', user);

      // Redirecionar para o dashboard ou outra página
      const perfilSelecionadoObj = Array.from(radios).find(r => r.checked);
      const perfilSelecionado = perfilSelecionadoObj ? perfilSelecionadoObj.value : 'personal'; // valor padrão
      loginSection.style.display = 'none';
      dashboardProfessor.style.display = 'block';
      populateDashboard(user, perfilSelecionado);
    })
    .catch((error) => {
      console.error('Erro ao autenticar:', error);
      console.error('Não foi possível concluir o login. Tente novamente.');
    });
});


const populateDashboard = (user, perfil) => {

  dashboardProfessor.innerHTML = `
      <h2>Bem-vindo, ${user.displayName || 'Usuário'}!</h2>
      <p>Email: ${user.email}</p>
      <button id='btnAddAluno'>Adicionar Aluno</button>
      <button id='btnVerAlunos'>Ver Alunos</button>
      <button id='btnListarExercicios'>Listar Exercícios</button>
      <button id='btnListarTreinos'>Listar Treino</button>
      <button id="btnLogout">Sair</button>
  `;

  const btnLogout = document.getElementById('btnLogout');
  btnLogout.addEventListener('click', e => logOut());

  const btnAddAluno = document.getElementById('btnAddAluno');
  const btnVerAlunos = document.getElementById('btnVerAlunos');
  const btnListarExercicios = document.getElementById('btnListarExercicios');
  const btnListarTreinos = document.getElementById('btnListarTreinos');

  btnAddAluno.addEventListener('click', e => addAluno());
  btnVerAlunos.addEventListener('click', e => listAlunos(auth.currentUser.uid));
  btnListarExercicios.addEventListener('click', e => listExercicios());
  btnListarTreinos.addEventListener('click', e => listTreinos());
};

const logOut = () => {
  auth.signOut().then(() => {
    console.log('Usuário deslogado com sucesso.');
    dashboardProfessor.style.display = 'none';
    loginSection.style.display = 'block';
  }).catch((error) => {
    console.error('Erro ao deslogar:', error);
  });
}

const addAluno = () => {
  const addAlunoSection = document.getElementById('addAlunoSection');
  addAlunoSection.style.display = 'block';

  const btnSalvarAluno = document.getElementById('btnSalvarAluno');
  // Remove qualquer listener anterior
  btnSalvarAluno.replaceWith(btnSalvarAluno.cloneNode(true));
  const newBtnSalvarAluno = document.getElementById('btnSalvarAluno');
  newBtnSalvarAluno.addEventListener('click', e => {
    const alunoNome = document.getElementById('alunoNome').value;
    const alunoEmail = document.getElementById('alunoEmail').value;
    const alunoTelefone = document.getElementById('alunoTelefone').value;
    const alunoObjetivo = document.getElementById('alunoObjetivo').value;
    const alunoIdade = document.getElementById('alunoIdade').value;

    addAlunoToFirestore(alunoNome, alunoEmail, alunoTelefone, alunoObjetivo, alunoIdade, auth.currentUser.uid);

    document.getElementById('alunoNome').value = '';
    document.getElementById('alunoEmail').value = '';
    document.getElementById('alunoTelefone').value = '';
    document.getElementById('alunoObjetivo').value = '';
    document.getElementById('alunoIdade').value = '';
    addAlunoSection.style.display = 'none';
  });
}

const listAlunos = async (idPersonal) => {
  const alunosListSection = document.getElementById('alunosListSection');
  alunosListSection.style.display = 'block';
  alunosListSection.innerHTML = '<h3>Lista de Alunos</h3><div id="listaAlunos" style="width: 100%;"></div>';
  const listaAlunos = document.getElementById('listaAlunos');

  const q = query(collection(db, "alunos"), where("personal", "==", idPersonal));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((docSnap) => {
    const aluno = docSnap.data();
    const alunoId = docSnap.id;
    const alunoDiv = document.createElement('div');
    alunoDiv.style.border = "1px solid #ccc";
    alunoDiv.style.borderRadius = "8px";
    alunoDiv.style.padding = "12px";
    alunoDiv.style.marginBottom = "16px";
    alunoDiv.style.background = "#f9f9f9";
    alunoDiv.style.cursor = "pointer";

    alunoDiv.innerHTML = `
      <strong>Nome:</strong> ${aluno.nome}<br>
      <strong>Email:</strong> ${aluno.email}<br>
      <strong>Telefone:</strong> ${aluno.telefone}<br>
      <strong>Objetivo:</strong> ${aluno.objetivo}<br>
      <strong>Idade:</strong> ${aluno.idade}
    `;

    alunoDiv.addEventListener('click', () => {
      mostrarEditarAluno(aluno, alunoId);
    });

    listaAlunos.appendChild(alunoDiv);
  });
};

// Função para mostrar o formulário de edição
const mostrarEditarAluno = (aluno, alunoId) => {
  // Remove qualquer formulário de edição anterior
  const oldEditDiv = document.getElementById('editarAlunoDiv');
  if (oldEditDiv) oldEditDiv.remove();

  // Cria o div de edição
  const editDiv = document.createElement('div');
  editDiv.id = 'editarAlunoDiv';
  editDiv.style.border = "2px solid #0B57D0";
  editDiv.style.borderRadius = "10px";
  editDiv.style.padding = "18px";
  editDiv.style.margin = "20px 0";
  editDiv.style.background = "#eaf1fb";
  editDiv.innerHTML = `
    <h4>Editar Aluno</h4>
    <label>Nome:<br><input id="editNome" value="${aluno.nome}" /></label><br>
    <label>Email:<br><input id="editEmail" value="${aluno.email}" /></label><br>
    <label>Telefone:<br><input id="editTelefone" value="${aluno.telefone}" /></label><br>
    <label>Objetivo:<br><input id="editObjetivo" value="${aluno.objetivo}" /></label><br>
    <label>Idade:<br><input id="editIdade" value="${aluno.idade}" /></label><br>
    <button id="btnSalvarEdicao">Salvar</button>
    <button id="btnCancelarEdicao">Cancelar</button>
  `;

  // Adiciona o div ao alunosListSection
  document.getElementById('alunosListSection').appendChild(editDiv);

  document.getElementById('btnCancelarEdicao').onclick = () => editDiv.remove();

  document.getElementById('btnSalvarEdicao').onclick = async () => {
    const novosDados = {
      nome: document.getElementById('editNome').value,
      email: document.getElementById('editEmail').value,
      telefone: document.getElementById('editTelefone').value,
      objetivo: document.getElementById('editObjetivo').value,
      idade: document.getElementById('editIdade').value
    };
    try {
      // Atualiza no Firestore
      await updateAlunoFirestore(alunoId, novosDados);
      alert('Aluno atualizado com sucesso!');
      editDiv.remove();
      // Atualiza a lista
      listAlunos(aluno.personal);
    } catch (e) {
      alert('Erro ao atualizar aluno.');
    }
  };
};

// Função para atualizar no Firestore
const updateAlunoFirestore = async (alunoId, novosDados) => {
  const alunoRef = doc(db, "alunos", alunoId);
  await updateDoc(alunoRef, novosDados);
};

// Função para listar exercícios
const listExercicios = async () => {
  let exerciciosListSection = document.getElementById('exerciciosListSection');
  exerciciosListSection.style.display = 'block';
  if (!exerciciosListSection) {
    exerciciosListSection = document.createElement('div');
    exerciciosListSection.id = 'exerciciosListSection';
    exerciciosListSection.style.background = "#fff";
    exerciciosListSection.style.border = "1px solid #ccc";
    exerciciosListSection.style.borderRadius = "10px";
    exerciciosListSection.style.padding = "18px";
    exerciciosListSection.style.margin = "20px 0";
    exerciciosListSection.style.maxWidth = "500px";
    exerciciosListSection.style.position = "relative";
    // Troque de document.body para dashboardProfessor:
    dashboardProfessor.appendChild(exerciciosListSection);
  }
  exerciciosListSection.innerHTML = `
    <h3>Lista de Exercícios</h3>
    <input type="text" id="pesquisaExercicio" placeholder="Pesquisar exercício..." style="width:100%;margin-bottom:10px;padding:8px;border-radius:6px;border:1px solid #ccc;">
    <button id="btnNovoExercicio" style="margin-bottom:12px;">Novo Exercício</button>
    <div id="listaExercicios"></div>
    <button id="btnFecharExercicios" style="position:absolute;top:10px;right:10px;">Fechar</button>
  `;

  document.getElementById('btnFecharExercicios').onclick = () => exerciciosListSection.remove();
  document.getElementById('btnNovoExercicio').onclick = () => mostrarEditarExercicio();
  document.getElementById('pesquisaExercicio').oninput = (e) => renderExercicios(e.target.value);

  // Função para renderizar a lista de exercícios
  async function renderExercicios(filtro = "") {
    const listaExercicios = document.getElementById('listaExercicios');
    listaExercicios.innerHTML = "Carregando...";
    const q = collection(db, "exercicios");
    const querySnapshot = await getDocs(q);
    listaExercicios.innerHTML = "";
    querySnapshot.forEach((docSnap) => {
      const exercicio = docSnap.data();
      const exercicioId = docSnap.id;
      if (
        filtro &&
        !exercicio.nome.toLowerCase().includes(filtro.toLowerCase())
      ) return;
      const exercicioDiv = document.createElement('div');
      exercicioDiv.style.border = "1px solid #eee";
      exercicioDiv.style.borderRadius = "8px";
      exercicioDiv.style.padding = "10px";
      exercicioDiv.style.marginBottom = "10px";
      exercicioDiv.style.background = "#f7f8fa";
      exercicioDiv.style.cursor = "pointer";
      exercicioDiv.innerHTML = `
        <strong>${exercicio.nome}</strong><br>
        Objetivo: ${exercicio.objetivo}<br>
        <small>${exercicio.youtube ? 'Possui vídeo' : 'Sem vídeo'}</small>
      `;
      exercicioDiv.onclick = () => mostrarEditarExercicio(exercicio, exercicioId);
      listaExercicios.appendChild(exercicioDiv);
    });
    if (!listaExercicios.innerHTML) listaExercicios.innerHTML = "<em>Nenhum exercício encontrado.</em>";
  }

  renderExercicios();
};

// Função para criar/editar exercício
const mostrarEditarExercicio = (exercicio = {}, exercicioId = null) => {
  // Remove qualquer formulário anterior
  let oldEditDiv = document.getElementById('editarExercicioDiv');
  if (oldEditDiv) oldEditDiv.remove();

  const editDiv = document.createElement('div');
  editDiv.id = 'editarExercicioDiv';
  editDiv.style.border = "2px solid #0B57D0";
  editDiv.style.borderRadius = "10px";
  editDiv.style.padding = "18px";
  editDiv.style.margin = "20px 0";
  editDiv.style.background = "#eaf1fb";
  editDiv.style.maxWidth = "500px";

  editDiv.innerHTML = `
    <h4>${exercicioId ? 'Editar' : 'Novo'} Exercício</h4>
    <label>Nome:<br><input id="exNome" value="${exercicio.nome || ''}" /></label><br>
    <label>Objetivo:<br>
      <select id="exObjetivo">
        <option value="Neuromuscular" ${exercicio.objetivo === "Neuromuscular" ? "selected" : ""}>Neuromuscular</option>
        <option value="Mobilidade" ${exercicio.objetivo === "Mobilidade" ? "selected" : ""}>Mobilidade</option>
        <option value="Alongamento" ${exercicio.objetivo === "Alongamento" ? "selected" : ""}>Alongamento</option>
        <option value="Cárdio" ${exercicio.objetivo === "Cárdio" ? "selected" : ""}>Cárdio</option>
      </select>
    </label><br>
    <label>Link do vídeo do YouTube:<br><input id="exYoutube" value="${exercicio.youtube || ''}" /></label><br>
    ${exercicio.youtube ? `<div style="margin:10px 0;"><iframe width="100%" height="720" src="https://www.youtube.com/embed/${extrairIdYoutube(exercicio.youtube)}" frameborder="0" allowfullscreen></iframe></div>` : ""}
    <button id="btnSalvarExercicio">${exercicioId ? 'Salvar' : 'Criar'}</button>
    <button id="btnCancelarExercicio">Cancelar</button>
  `;

  document.body.appendChild(editDiv);

  document.getElementById('btnCancelarExercicio').onclick = () => editDiv.remove();

  document.getElementById('btnSalvarExercicio').onclick = async () => {
    const nome = document.getElementById('exNome').value.trim();
    const objetivo = document.getElementById('exObjetivo').value;
    const youtube = document.getElementById('exYoutube').value.trim();
    if (!nome) return alert('Preencha o nome do exercício.');
    const dados = { nome, objetivo, youtube };
    try {
      if (exercicioId) {
        // Atualizar
        await updateDoc(doc(db, "exercicios", exercicioId), dados);
        alert('Exercício atualizado!');
      } else {
        // Criar novo
        await addDoc(collection(db, "exercicios"), dados);
        alert('Exercício criado!');
      }
      editDiv.remove();
      listExercicios();
    } catch (e) {
      alert('Erro ao salvar exercício.');
    }
  };
};

// Função utilitária para extrair o ID do vídeo do YouTube
function extrairIdYoutube(url) {
  if (!url) return "";
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : "";
}

// Função para listar treinos
const listTreinos = async () => {
  const treinosSection = document.getElementById('treinosListSection');
  treinosSection.style.display = 'block';
  treinosSection.innerHTML = `
    <h3>Treinos Cadastrados</h3>
    <button id="btnNovoTreino">Novo Treino</button>
    <div id="listaTreinos"></div>
  `;

  // Listar treinos do Firestore
  const listaTreinosDiv = document.getElementById('listaTreinos');
  listaTreinosDiv.innerHTML = "Carregando...";
  const q = collection(db, "treinos");
  const querySnapshot = await getDocs(q);
  listaTreinosDiv.innerHTML = "";
  querySnapshot.forEach((docSnap) => {
    const treino = docSnap.data();
    const treinoId = docSnap.id;
    const treinoDiv = document.createElement('div');
    treinoDiv.style.border = "1px solid #ccc";
    treinoDiv.style.borderRadius = "8px";
    treinoDiv.style.padding = "12px";
    treinoDiv.style.marginBottom = "16px";
    treinoDiv.style.background = "#f9f9f9";
    treinoDiv.style.cursor = "pointer";
    treinoDiv.innerHTML = `
      <strong>${treino.nome || 'Sem nome'}</strong><br>
      <strong>Dias:</strong> ${treino.dias?.length || 0} <br>
      <strong>Cárdio:</strong> ${treino.cardio || ''} <br>
      <button class="btnEditarTreino" data-id="${treinoId}">Editar</button>
    `;
    listaTreinosDiv.appendChild(treinoDiv);
  });

  // Botão novo treino
  document.getElementById('btnNovoTreino').onclick = () => mostrarEditarTreino();

  // Botões editar
  document.querySelectorAll('.btnEditarTreino').forEach(btn => {
    btn.onclick = async (e) => {
      const id = e.target.getAttribute('data-id');
      // Busca treino pelo id
      const treinoDoc = querySnapshot.docs.find(d => d.id === id);
      if (treinoDoc) mostrarEditarTreino(treinoDoc.data(), id);
    };
  });
};

// Função para criar/editar treino
const mostrarEditarTreino = async (treino = { nome: "", dias: [], cardio: "" }, treinoId = null) => {
  const treinosSection = document.getElementById('treinosListSection');
  treinosSection.innerHTML = `
    <h4>${treinoId ? 'Editar' : 'Novo'} Treino</h4>
    <label>Nome do Treino:<br>
      <input id="treinoNome" value="${treino.nome || ''}" placeholder="Nome do treino"/>
    </label>
    <br>
    <label>Sessões de Cárdio:<br>
      <input id="sessaoCardio" value="${treino.cardio || ''}" placeholder="Ex: 20min corrida, 10min bike"/>
    </label>
    <div id="diasTreino"></div>
    <button id="btnAddDia" type="button">Adicionar Dia</button>
    <br><br>
    <button id="btnSalvarTreino">${treinoId ? 'Salvar' : 'Criar'}</button>
    <button id="btnCancelarTreino">Cancelar</button>
  `;

  // Renderiza os dias de treino
  function renderDias() {
    const diasDiv = document.getElementById('diasTreino');
    diasDiv.innerHTML = "";
    treino.dias.forEach((dia, idx) => {
      const diaDiv = document.createElement('div');
      diaDiv.style.border = "1px solid #bbb";
      diaDiv.style.borderRadius = "8px";
      diaDiv.style.padding = "10px";
      diaDiv.style.marginBottom = "10px";
      diaDiv.style.background = "#f7f8fa";
      diaDiv.innerHTML = `
        <label>Nome do Dia: <input value="${dia.nome || ''}" id="diaNome${idx}" /></label>
        <button type="button" id="btnAddExercicio${idx}">Adicionar Exercício</button>
        <button type="button" id="btnRemoverDia${idx}">Remover Dia</button>
        <div id="exerciciosDia${idx}"></div>
      `;
      diasDiv.appendChild(diaDiv);

      renderExerciciosDia(idx);

      document.getElementById(`btnAddExercicio${idx}`).onclick = () => adicionarExercicioAoDia(idx);
      document.getElementById(`btnRemoverDia${idx}`).onclick = () => {
        treino.dias.splice(idx, 1);
        renderDias();
      };
      document.getElementById(`diaNome${idx}`).oninput = (e) => {
        treino.dias[idx].nome = e.target.value;
      };
    });
  }

  // Renderiza exercícios de um dia
  function renderExerciciosDia(idx) {
    const exDiv = document.getElementById(`exerciciosDia${idx}`);
    exDiv.innerHTML = "";
    treino.dias[idx].exercicios = treino.dias[idx].exercicios || [];
    treino.dias[idx].exercicios.forEach((ex, exIdx) => {
      const exBloco = document.createElement('div');
      exBloco.style.border = "1px solid #eee";
      exBloco.style.borderRadius = "6px";
      exBloco.style.padding = "8px";
      exBloco.style.margin = "8px 0";
      exBloco.style.background = "#fff";
      exBloco.innerHTML = `
        <strong>${ex.nome || ''}</strong>
        <button type="button" id="btnRemoverEx${idx}_${exIdx}">Remover</button>
        <br>
        Séries: <input type="number" min="1" value="${ex.series?.length || 1}" id="numSeries${idx}_${exIdx}" style="width:40px;">
        <div id="seriesDiv${idx}_${exIdx}"></div>
        Descanso (seg): <input type="number" min="0" value="${ex.descanso || 0}" id="descanso${idx}_${exIdx}" style="width:60px;">
        <br>
        Observações: <input value="${ex.obs || ''}" id="obs${idx}_${exIdx}" style="width:200px;">
        <br>
        ${ex.video ? `<iframe width="220" height="124" src="https://www.youtube.com/embed/${extrairIdYoutube(ex.video)}" frameborder="0" allowfullscreen></iframe>` : ""}
      `;
      exDiv.appendChild(exBloco);

      renderSeries(idx, exIdx);

      document.getElementById(`btnRemoverEx${idx}_${exIdx}`).onclick = () => {
        treino.dias[idx].exercicios.splice(exIdx, 1);
        renderExerciciosDia(idx);
      };
      document.getElementById(`numSeries${idx}_${exIdx}`).onchange = (e) => {
        const n = parseInt(e.target.value) || 1;
        ex.series = ex.series || [];
        while (ex.series.length < n) ex.series.push({ reps: '', peso: '' });
        while (ex.series.length > n) ex.series.pop();
        renderSeries(idx, exIdx);
      };
      document.getElementById(`descanso${idx}_${exIdx}`).oninput = (e) => ex.descanso = e.target.value;
      document.getElementById(`obs${idx}_${exIdx}`).oninput = (e) => ex.obs = e.target.value;
    });
  }

  // Renderiza séries de um exercício
  function renderSeries(idx, exIdx) {
    const ex = treino.dias[idx].exercicios[exIdx];
    const sDiv = document.getElementById(`seriesDiv${idx}_${exIdx}`);
    sDiv.innerHTML = "";
    ex.series = ex.series || [{ reps: '', peso: '' }];
    ex.series.forEach((serie, sIdx) => {
      const sLinha = document.createElement('div');
      sLinha.innerHTML = `
        Série ${sIdx + 1}: 
        Repetições: <input type="number" min="1" value="${serie.reps || ''}" id="reps${idx}_${exIdx}_${sIdx}" style="width:50px;">
        Peso: <input type="number" min="0" value="${serie.peso || ''}" id="peso${idx}_${exIdx}_${sIdx}" style="width:60px;">
      `;
      sDiv.appendChild(sLinha);

      document.getElementById(`reps${idx}_${exIdx}_${sIdx}`).oninput = (e) => ex.series[sIdx].reps = e.target.value;
      document.getElementById(`peso${idx}_${exIdx}_${sIdx}`).oninput = (e) => ex.series[sIdx].peso = e.target.value;
    });
  }

  // Adiciona um novo dia
  document.getElementById('btnAddDia').onclick = () => {
    treino.dias.push({ nome: '', exercicios: [] });
    renderDias();
  };

  // Adiciona exercício ao dia (com pesquisa)
  async function adicionarExercicioAoDia(idx) {
    // Busca exercícios cadastrados
    const q = collection(db, "exercicios");
    const querySnapshot = await getDocs(q);
    const lista = [];
    querySnapshot.forEach((docSnap) => {
      const ex = docSnap.data();
      lista.push({ id: docSnap.id, ...ex });
    });

    // Cria popup de seleção
    let popup = document.getElementById('popupExercicios');
    if (popup) popup.remove();
    popup = document.createElement('div');
    popup.id = 'popupExercicios';
    popup.style.position = 'fixed';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%,-50%)';
    popup.style.background = '#fff';
    popup.style.border = '2px solid #0B57D0';
    popup.style.borderRadius = '10px';
    popup.style.padding = '20px';
    popup.style.zIndex = 9999;
    popup.style.maxWidth = '400px';
    popup.innerHTML = `
      <h4>Escolha um exercício</h4>
      <input type="text" id="pesquisaExSel" placeholder="Pesquisar..." style="width:100%;margin-bottom:10px;">
      <div id="listaExSel"></div>
      <button id="btnFecharPopupEx">Fechar</button>
    `;
    document.body.appendChild(popup);

    function renderListaExSel(filtro = "") {
      const listaDiv = document.getElementById('listaExSel');
      listaDiv.innerHTML = "";
      lista.filter(ex => !filtro || ex.nome.toLowerCase().includes(filtro.toLowerCase()))
        .forEach((ex, exIdx) => {
          const exDiv = document.createElement('div');
          exDiv.style.border = "1px solid #eee";
          exDiv.style.borderRadius = "6px";
          exDiv.style.padding = "6px";
          exDiv.style.marginBottom = "6px";
          exDiv.style.background = "#f7f8fa";
          exDiv.style.cursor = "pointer";
          exDiv.innerHTML = `
            <strong>${ex.nome}</strong> (${ex.objetivo})<br>
            ${ex.youtube ? `<iframe width="180" height="100" src="https://www.youtube.com/embed/${extrairIdYoutube(ex.youtube)}" frameborder="0" allowfullscreen></iframe>` : ""}
          `;
          exDiv.onclick = () => {
            treino.dias[idx].exercicios.push({
              nome: ex.nome,
              video: ex.youtube,
              objetivo: ex.objetivo,
              series: [{ reps: '', peso: '' }],
              descanso: 0,
              obs: ''
            });
            renderExerciciosDia(idx);
            popup.remove();
          };
          listaDiv.appendChild(exDiv);
        });
      if (!listaDiv.innerHTML) listaDiv.innerHTML = "<em>Nenhum exercício encontrado.</em>";
    }

    renderListaExSel();
    document.getElementById('pesquisaExSel').oninput = (e) => renderListaExSel(e.target.value);
    document.getElementById('btnFecharPopupEx').onclick = () => popup.remove();
  }

  // Salvar treino no Firestore
  document.getElementById('btnSalvarTreino').onclick = async () => {
    treino.nome = document.getElementById('treinoNome').value;
    treino.cardio = document.getElementById('sessaoCardio').value;
    // Limpeza dos dados
    treino.dias = (treino.dias || []).filter(dia => dia.nome && (dia.exercicios && dia.exercicios.length));
    treino.dias.forEach(dia => {
      dia.exercicios = (dia.exercicios || []).filter(ex => ex.nome);
      dia.exercicios.forEach(ex => {
        ex.series = (ex.series || []).filter(serie => serie.reps && serie.peso);
      });
    });
    try {
      if (treinoId) {
        await updateDoc(doc(db, "treinos", treinoId), treino);
      } else {
        await addDoc(collection(db, "treinos"), treino);
      }
      listTreinos();
    } catch (e) {
      console.error("Erro ao salvar treino:", e);
    }
  };

  document.getElementById('btnCancelarTreino').onclick = () => listTreinos();

  renderDias();
};

// Adicione o evento ao botão "Listar Treinos"
const btnListarTreinos = document.getElementById('btnListarTreinos');
if (btnListarTreinos) {
  btnListarTreinos.addEventListener('click', listTreinos);
}