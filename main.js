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

  dashboardProfessor.innerHTML += `
      <h2>Bem-vindo, ${user.displayName || 'Usuário'}! <button id="btnLogout">Sair</button></h2>
      <p>Email: ${user.email}</p>
  `;
  
    const btnLogout = document.getElementById('btnLogout');
    btnLogout.addEventListener('click', () => {
        auth.signOut().then(() => {
        console.log('Usuário deslogado com sucesso.');
        dashboardProfessor.style.display = 'none';
        loginSection.style.display = 'block';
      }).catch((error) => {
        console.error('Erro ao deslogar:', error);
      });
    });

  dashboardProfessor.innerHTML += `
    <button id='btnAddAluno'>Adicionar Aluno</button>
    <button id='btnVerAlunos'>Ver Alunos</button>
  `;
  const btnAddAluno = document.getElementById('btnAddAluno');
  const btnVerAlunos = document.getElementById('btnVerAlunos');
  
  btnAddAluno.addEventListener('click', e => addAluno());
  btnVerAlunos.addEventListener('click', e => listAlunos(auth.currentUser.uid));
};

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