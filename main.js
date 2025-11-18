const searchButton = document.getElementById('searchButton');
const searchInput = document.getElementById('searchInput');
const searchKey = document.getElementById('searchKey');
const resultSection = document.getElementById('resultSection');
const resultsContainer = document.getElementById('resultsContainer');
const loginSection = document.getElementById('loginSection');
const navbar = document.getElementById('navbar');
const titulo = document.getElementById('titulo');
const sobreSection = document.getElementById('sobreSection');
const sobreLink = document.getElementById('sobreLink');
const backButton = document.getElementById('backButton');
let treino = null;

const sanitize = s => String(s || '').toLowerCase().replace(/\s+/g, '').replace(/\//g, '');

searchButton.addEventListener('click', (event) => {
    event && event.preventDefault();

    console.log('Search Input:', searchInput.value);
    console.log('Search Key:', searchKey.value);

    const searchString = sanitize(searchInput.value) + sanitize(searchKey.value);
    console.log('Search String:', searchString);

    fetch(`./src/${searchString}.json`)
    .then(resposta => {
        if (!resposta.ok) {
            throw new Error('Não foi possível localizar o treino.');
        }
        return resposta.json();
    })
    .then(json => {
        console.log('Treino encontrado:', json);
        treino = json;
        popularTreino(json);
        return treino; // Opcional: permite encadear
    })
    .catch(erro => {
        console.error('Erro:', erro.message);
        alert('Erro: ' + erro.message);
    });

    navbar.style.display = 'block';
    loginSection.style.display = 'none';
    resultSection.style.display = 'block';
});

const popularTreino = (treino) => {
    resultsContainer.innerHTML = ''; // Limpa resultados anteriores
    
    const tituloElement = document.createElement('h2');
    tituloElement.innerText = treino.aluno || 'Treino Sem Nome';
    resultsContainer.appendChild(tituloElement);
    
    resultsContainer.innerHTML += `<br>`;
    
    treino.treino.diasTreino.forEach(dia => {
        const diaElement = document.createElement('h3');
        diaElement.innerText = dia.nome || 'Dia Sem Nome';
        resultsContainer.appendChild(diaElement);
        dia.exercicios.forEach(exercicio => {
            const exercicioDiv = document.createElement('div');
            exercicioDiv.classList.add('exercicio');
            exercicioDiv.style.cursor = 'pointer'; // Adiciona cursor de clique
            const teste = (exercicio.observacaoSerie == "") ? "" : `<br> ‎ ‎ ‎ ‎ ‎ ‎  Observações: ${exercicio.observacaoSerie}`;
            exercicioDiv.innerHTML = `<h5>${exercicio.nome}</h5>
                <p>  ‎ ‎ ‎ ‎ ‎ ‎  Séries: ${exercicio.series}
                <br> ‎ ‎ ‎ ‎ ‎ ‎  Descanso: ${exercicio.descanso}
                ${teste}
                </p>`;
                //<br> ‎ ‎ ‎ ‎ ‎ ‎  Observações: ${exercicio.observacaoSerie}
                
            
            // Adiciona evento de clique para abrir modal
            exercicioDiv.addEventListener('click', () => {
                abrirModalExercicio(exercicio);
            });
            
            resultsContainer.appendChild(exercicioDiv);
        });
    });
    
    console.log('Treino popularizado:', treino);
};

// Função para abrir o modal com o vídeo do exercício
const abrirModalExercicio = (exercicio) => {
    const modal = document.getElementById('exercicioModal');
    const modalVideo = document.getElementById('modalExercicioVideo');
    const modalTitle = document.getElementById('modalExercicioTitle');
    
    modalTitle.innerText = exercicio.nome;
    
    // Converte URL do YouTube para embed se necessário
    let embedUrl = exercicio.video;
    if (exercicio.video.includes('youtube.com') || exercicio.video.includes('youtu.be')) {
        embedUrl = exercicio.video.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/');
    }
    
    modalVideo.innerHTML = `<iframe width="100%" height="400" src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    
    modal.style.display = 'block';
};

// Fechar modal ao clicar no X
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('exercicioModal');
    const closeBtn = document.getElementById('closeModal');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
    
    // Fecha o modal ao clicar fora da imagem
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});

sobreLink.addEventListener('click', (event) => {
    event && event.preventDefault();
    navbar.style.display = 'block';
    loginSection.style.display = 'none';
    resultSection.style.display = 'none';
    sobreSection.style.display = 'block';
});

backButton.addEventListener('click', (event) => {
    event && event.preventDefault();
    navbar.style.display = 'block';
    loginSection.style.display = 'none';
    resultSection.style.display = 'block';
    sobreSection.style.display = 'none';
});