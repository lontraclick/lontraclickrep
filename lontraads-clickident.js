(function() {
    console.log("Script iniciado");

    var originUrl = document.currentScript.getAttribute('data-origin-url');

    function getAllUrlParams() {
        return new URLSearchParams(window.location.search);
    }

    function getClickId() {
        var urlParams = getAllUrlParams();
        return urlParams.get('gclid') || urlParams.get('wbraid') || urlParams.get('msclkid') || urlParams.get('fbclid') || '';
    }

    function updateLinks() {
        var urlParams = getAllUrlParams();
        var clickId = getClickId();
        var links = document.getElementsByTagName('a');

        for (var i = 0; i < links.length; i++) {
            var link = links[i];
            var url = new URL(link.href);
            
            urlParams.forEach(function(value, key) {
                url.searchParams.set(key, value);
            });

            if (clickId) {
                url.searchParams.set('sclid', clickId);
            }

            link.href = url.toString();
        }
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
            var clickId = getClickId();
            var data = 'action=lontraads_record_visit' +
                       '&domain=' + encodeURIComponent(currentDomain) +
                       '&click_id=' + encodeURIComponent(clickId);

            urlParams.forEach(function(value, key) {
                if (!['gclid', 'wbraid', 'msclkid', 'fbclid'].includes(key)) {
                    data += '&' + encodeURIComponent(key) + '=' + encodeURIComponent(value);
                }
            });

            xhr.send(data);
            console.log("Dados enviados:", data);
        }
    }

    function init() {
        console.log("Iniciando funções principais");
        sendVisitorData();
        updateLinks();
    }

    if (document.readyState === 'loading') {
        console.log("DOM ainda carregando, adicionando evento listener");
        document.addEventListener('DOMContentLoaded', init);
    } else {
        console.log("DOM já carregado, executando funções imediatamente");
        init();
    }

    console.log("Script concluído");
})();
