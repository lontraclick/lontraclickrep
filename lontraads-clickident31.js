(function() {
    console.log("Script iniciado");

    var originUrl = document.currentScript.getAttribute('data-origin-url');

    function getClickIds() {
        var urlParams = new URLSearchParams(window.location.search);
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

        var data = {
            action: 'lontraads_record_visit'
        };

        // Adiciona os clickIds
        var clickIds = getClickIds();
        for (var key in clickIds) {
            data[key] = clickIds[key];
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
            var clickIds = getClickIds();
            
            for (var key in clickIds) {
                url.searchParams.set(key, clickIds[key]);
            }
            
            console.log("Link clicado modificado:", url.toString());
            window.location.href = url.toString();
        }
    });

    console.log("Script concluído");
})();
