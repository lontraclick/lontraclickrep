(function() {
    console.log("Script iniciado");

    var originUrl = document.currentScript.getAttribute('data-origin-url');

    function getAllUrlParams() {
        return new URLSearchParams(window.location.search);
    }

    function getClickIds() {
        var urlParams = getAllUrlParams();
        var clickIds = {};
        ['gclid', 'wbraid', 'msclkid', 'fbclid'].forEach(function(param) {
            var value = urlParams.get(param);
            if (value) {
                clickIds[param] = value;
                localStorage.setItem(param, value);
            } else {
                var storedValue = localStorage.getItem(param);
                if (storedValue) {
                    clickIds[param] = storedValue;
                }
            }
        });
        return clickIds;
    }

    function updateLinks() {
        console.log("Iniciando updateLinks");
        var urlParams = getAllUrlParams();
        console.log("Parâmetros da URL atual:", urlParams.toString());

        var links = document.getElementsByTagName('a');
        console.log("Total de links encontrados:", links.length);

        for (var i = 0; i < links.length; i++) {
            var link = links[i];
            var originalHref = link.href;
            
            var url = new URL(originalHref, window.location.href);
            
            urlParams.forEach(function(value, key) {
                url.searchParams.set(key, value);
            });
            
            link.href = url.toString();
            
            console.log(`Link ${i + 1} modificado:`, originalHref, "->", link.href);
        }

        console.log("Modificação de links concluída");
    }

    function sendVisitorData() {
        console.log("Iniciando sendVisitorData");
        if (!originUrl) {
            console.error('Origin URL não encontrada. O script não pode prosseguir.');
            return;
        }

        var currentDomain = window.location.hostname;

        var data = {
            action: 'lontraads_record_visit',
            domain: currentDomain
        };

        // Adiciona todos os parâmetros da URL, incluindo os clickIds
        getAllUrlParams().forEach(function(value, key) {
            data[key] = value;
        });

        // Adiciona os clickIds armazenados no localStorage, se não estiverem na URL
        var storedClickIds = getClickIds();
        for (var key in storedClickIds) {
            if (!data[key]) {
                data[key] = storedClickIds[key];
            }
        }

        fetch(originUrl + '/wp-admin/admin-ajax.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(data)
        })
        .then(response => response.json())
        .then(data => console.log('Dados do visitante enviados com sucesso:', data))
        .catch(error => console.error('Erro ao enviar dados do visitante:', error));

        console.log("Dados enviados:", data);
    }

    function init() {
        console.log("Iniciando funções principais");
        updateLinks();
        sendVisitorData();
    }

    if (document.readyState !== 'loading') {
        console.log("DOM já carregado, executando funções imediatamente");
        init();
    } else {
        console.log("DOM ainda carregando, adicionando evento listener");
        document.addEventListener('DOMContentLoaded', init);
    }

    // Adiciona um ouvinte para modificar links dinâmicos
    document.addEventListener('click', function(e) {
        if (e.target.tagName === 'A') {
            var link = e.target;
            var url = new URL(link.href, window.location.href);
            var urlParams = getAllUrlParams();
            
            urlParams.forEach(function(value, key) {
                url.searchParams.set(key, value);
            });
            
            // Adiciona clickIds armazenados, se não estiverem na URL
            var storedClickIds = getClickIds();
            for (var key in storedClickIds) {
                if (!url.searchParams.has(key)) {
                    url.searchParams.set(key, storedClickIds[key]);
                }
            }
            
            link.href = url.toString();
            console.log("Link clicado modificado:", link.href);
        }
    }, true);

    console.log("Script concluído");
})();
