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
                console.log(`Click ID encontrado: ${param} = ${value}`);
            } else {
                var storedValue = localStorage.getItem(param);
                if (storedValue) {
                    clickIds[param] = storedValue;
                    console.log(`Click ID recuperado do localStorage: ${param} = ${storedValue}`);
                }
            }
        });
        return clickIds;
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

        console.log("Dados a serem enviados:", data);

        fetch(originUrl + '/wp-admin/admin-ajax.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(data)
        })
        .then(response => response.json())
        .then(data => console.log('Resposta do servidor:', data))
        .catch(error => console.error('Erro ao enviar dados do visitante:', error));
    }

    function init() {
        console.log("Iniciando funções principais");
        sendVisitorData();
    }

    if (document.readyState !== 'loading') {
        console.log("DOM já carregado, executando funções imediatamente");
        init();
    } else {
        console.log("DOM ainda carregando, adicionando evento listener");
        document.addEventListener('DOMContentLoaded', init);
    }

    // Adiciona um ouvinte para modificar apenas o link clicado
    document.addEventListener('click', function(e) {
        var target = e.target.closest('a');
        if (target) {
            e.preventDefault();
            
            var url = new URL(target.href, window.location.href);
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
            
            console.log("Link clicado modificado:", url.toString());
            window.location.href = url.toString();
        }
    });

    console.log("Script concluído");
})();
