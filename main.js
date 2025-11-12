const searchButton = document.getElementById('searchButton');
const searchInput = document.getElementById('searchInput');
const searchKey = document.getElementById('searchKey');
const resultSection = document.getElementById('resultSection');
const navbar = document.getElementById('navbar');
let treino = null;

searchButton.addEventListener('click', () => {
    console.log('Search Input:', searchInput.value);
    console.log('Search Key:', searchKey.value);

    const semEspacos = searchInput.value.replace(/\s/g, "");

    const searchString = semEspacos.toLowerCase()+searchKey.value
    console.log('Search String:', searchString);

    //fetch(`./src/${searchString}.json`)
    fetch(`./public/${searchString}.json`)
    .then(resposta => {
        if (!resposta.ok) {
        throw new Error('Não foi possível localizar o treino.');
        }
        return resposta.json();
    })
    .then(json => {
        popularTreino(json);
        return treino; // Opcional: permite encadear
    })
    .catch(erro => {
        console.error('Erro:', erro.message);
    });
    navbar.style.display = 'block';
    loginSection.style.display = 'none';
    resultSection.style.display = 'block';
});

const popularTreino = (json) => {
    resultsContainer.innerHTML = '';

    const dias = json.treinos[json.treinos.length - 1].categorias[0].dias;
    dias.forEach(diaDeTreino => {
        const diaDiv = document.createElement('div');
        diaDiv.className = 'diasDeTreino';

        const h4 = document.createElement('h4');
        h4.textContent = `${diaDeTreino.dia} - ${diaDeTreino.foco}`;
        h4.classList.add('fw-bold'); // opcional: força negrito (Bootstrap)
        diaDiv.appendChild(h4);

        diaDeTreino.exercicios.forEach(exercicio => {
            const nomeP = document.createElement('h4');
            nomeP.textContent = exercicio.nome || '';
            const serieP = document.createElement('p');
            serieP.textContent = exercicio.series_repeticoes || '';
            diaDiv.appendChild(nomeP);
            diaDiv.appendChild(serieP);
        });

        resultsContainer.appendChild(diaDiv);
    });

}


