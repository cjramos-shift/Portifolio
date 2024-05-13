let menuToggle = document.querySelector('.menuToggle');
let menu = document.querySelector('.menu');
menuToggle.onclick = function () {
    menu.classList.toggle('active');
}

function nextPageWithTransition(url) {
    // debugger;
    // Adicione uma classe para iniciar a transição
    document.body.classList.add('page-transition');

    // Aguarde um pequeno intervalo para permitir que a animação ocorra
    setTimeout(function () {
        // Redirecione para a próxima página
        window.location.href = url;
    },  700); // Tempo em milissegundos, ajuste conforme necessário
}

const startTransition = () => {
    const loader = document.querySelector(".loader");
    loader.style.transform = "translateX(100%)";
    appRoot.dataset.route = "a";
};