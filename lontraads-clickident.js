(function() {
    console.log("Script iniciado");

    var originUrl = document.currentScript.getAttribute('data-origin-url');

    function getAllUrlParams() {
        return new URLSearchParams(window.location.search);
    }

    function enhancePageLinks() {
        console.log("Iniciando enhancePageLinks");
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
        var pluginDomain = new URL(originUrl).hostname;

        console.log("Current Domain:", currentDomain, "Plugin Domain:", pluginDomain);

        if (currentDomain !== pluginDomain) {
            var xhr = new XMLHttpRequest();
            xhr.open('POST', originUrl + '/wp-admin/admin-ajax.php', true);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        console.log('Dados do visitante enviados com sucesso');
                    } else {
                        console.error('Erro ao enviar dados do visitante');
                    }
                }
            };

            var urlParams = getAllUrlParams();
            var data = 'action=lontraads_record_visit' +
                       '&domain=' + encodeURIComponent(currentDomain);

            urlParams.forEach(function(value, key) {
                data += '&' + encodeURIComponent(key) + '=' + encodeURIComponent(value);
            });

            xhr.send(data);
            console.log("Dados enviados:", data);
        }
    }

    function init() {
        console.log("Iniciando funções principais");
        enhancePageLinks();
        sendVisitorData();
    }

    if (document.readyState === 'loading') {
        console.log("DOM ainda carregando, adicionando evento listener");
        document.addEventListener('DOMContentLoaded', init);
    } else {
        console.log("DOM já carregado, executando funções imediatamente");
        init();
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
            
            link.href = url.toString();
            console.log("Link clicado modificado:", link.href);
        }
    }, true);

    console.log("Script concluído");
})();
