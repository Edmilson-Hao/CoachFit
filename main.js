const searchButton = document.getElementById('searchButton');
const searchInput = document.getElementById('searchInput');
const searchKey = document.getElementById('searchKey');
const resultSection = document.getElementById('resultSection');
const resultsContainer = document.getElementById('resultsContainer'); // ADICIONADO
const loginSection = document.getElementById('loginSection');         // ADICIONADO
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
            const obsLine = (exercicio.observacaoSerie && String(exercicio.observacaoSerie).trim() !== '') 
                ?  ''
                : `‎ ‎ ‎ ‎ ‎ ‎  Observações: ${exercicio.observacaoSerie}`;
            exercicioDiv.innerHTML = `<h5>${exercicio.nome}</h5>
                <p>  ‎ ‎ ‎ ‎ ‎ ‎  Séries: ${exercicio.series}
                <br> ‎ ‎ ‎ ‎ ‎ ‎  Descanso: ${exercicio.descanso}
                <br> ${obsLine}</p>`;
            resultsContainer.appendChild(exercicioDiv);
        });
    });
    
    
}

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