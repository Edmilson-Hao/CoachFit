const searchButton = document.getElementById('searchButton');
const searchInput = document.getElementById('searchInput');
const searchKey = document.getElementById('searchKey');
const resultSection = document.getElementById('resultSection');
const resultsContainer = document.getElementById('resultsContainer'); // ADICIONADO
const loginSection = document.getElementById('loginSection');         // ADICIONADO
const navbar = document.getElementById('navbar');
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

const popularTreino = (json) => {
    // garante que exista um container para os resultados
    const container = resultsContainer || (() => {
        const el = document.getElementById('resultsContainer') || document.createElement('div');
        el.id = 'resultsContainer';
        resultSection.appendChild(el);
        return el;
    })();

    container.innerHTML = '';

    // normaliza para um array de treinos (suporta [..] ou { treinos: [...] } ou { data: [...] })
    const treinosArray = Array.isArray(json)
        ? json
        : (Array.isArray(json.treinos) ? json.treinos : (Array.isArray(json.data) ? json.data : null));

    if (!treinosArray || !treinosArray.length) {
        container.textContent = 'Arquivo de treino vazio ou formato inesperado.';
        return;
    }

    const ultimo = treinosArray[treinosArray.length - 1];

    // obtém categorias/dias de forma segura
    const categorias = Array.isArray(ultimo.categorias) ? ultimo.categorias : (Array.isArray(ultimo.category) ? ultimo.category : []);
    const primeiraCategoria = categorias[0] || ultimo;
    const dias = Array.isArray(primeiraCategoria.dias) ? primeiraCategoria.dias : (Array.isArray(ultimo.dias) ? ultimo.dias : []);

    if (!dias.length) {
        container.textContent = 'Nenhum dia encontrado no treino.';
        return;
    }

    dias.forEach(diaDeTreino => {
        const diaDiv = document.createElement('div');
        diaDiv.className = 'diasDeTreino';

        const h4 = document.createElement('h4');
        h4.textContent = `${diaDeTreino.dia || ''} - ${diaDeTreino.foco || ''}`;
        h4.classList.add('fw-bold');
        diaDiv.appendChild(h4);

        (Array.isArray(diaDeTreino.exercicios) ? diaDeTreino.exercicios : []).forEach(exercicio => {
            const nomeP = document.createElement('p');
            nomeP.textContent = exercicio.nome || '';
            nomeP.className = 'ex-nome';
            const serieP = document.createElement('p');
            serieP.textContent = exercicio.series_repeticoes || '';
            serieP.className = 'ex-series';
            diaDiv.appendChild(nomeP);
            diaDiv.appendChild(serieP);
        });

        container.appendChild(diaDiv);
    });
}