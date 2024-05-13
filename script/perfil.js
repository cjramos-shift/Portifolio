// fetch('https://api.github.com/repos/cjramos-shift/cjramos-shift/contents/README.md')
//     .then(response => response.json())
//     .then(data => {
//         // Decode the content from base64
//         const decodedContent = atob(data.content);
//         document.getElementById('readme-content').innerHTML = decodedContent;
//     })
//     .catch(error => {
//         console.error('Erro ao carregar o README:', error);
//     });

function nextPageWithTransition(url) {
    // debugger;
    // Adicione uma classe para iniciar a transição
    document.body.classList.add('page-transition');

    // Aguarde um pequeno intervalo para permitir que a animação ocorra
    setTimeout(function () {
        // Redirecione para a próxima página
        window.location.href = url;
    }, 700); // Tempo em milissegundos, ajuste conforme necessário
}