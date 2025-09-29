import { auth, onAuth, provider, signInWithPopup, db, collection, addDoc } from "./firebase.js";


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
  const alunosList = document.getElementById('alunosList');
  
  btnAddAluno.addEventListener('click', e => addAluno());
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

const addAlunoToFirestore = async (nome, email, telefone, objetivo, idade, idPersonal) => {
  try {
    const docRef = await addDoc(collection(db, "alunos"), {
      nome: nome,
      email: email,
      telefone: telefone,
      objetivo: objetivo,
      idade: idade,
      personal: idPersonal
    });
    console.log("Aluno adicionado com ID: ", docRef.id);
  } catch (error) {
    console.error("Erro ao adicionar aluno:", error);
  }
};