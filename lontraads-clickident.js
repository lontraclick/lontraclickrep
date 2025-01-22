(function() {
    console.log("Script iniciado");

    var originUrl = document.currentScript.getAttribute('data-origin-url');

    function getAllUrlParams() {
        return new URLSearchParams(window.location.search);
    }

    function replaceSpacesAndDashes(inputString) {
        return inputString.replace(/ /g, '_s_').replace(/-/g, '_d_').replace(/\//g, '');
    }

    function getClickId() {
        var urlParams = getAllUrlParams();
        var clickId = urlParams.get('gclid') || urlParams.get('wbraid') || urlParams.get('msclkid') || urlParams.get('fbclid') || '';
        
        if (clickId) {
            localStorage.setItem('clickId', clickId);
        } else {
            clickId = localStorage.getItem('clickId') || '';
        }

        return clickId;
    }

    function updateLinks() {
        var urlParams = getAllUrlParams();
        var clickId = getClickId();
        var modifiedClickId = replaceSpacesAndDashes(clickId);
        var links = document.getElementsByTagName('a');

        if (urlParams.has('tid')) {
            var originalTid = urlParams.get('tid');
            var replacedTid = replaceSpacesAndDashes(originalTid);
            urlParams.set('tid', replacedTid);
        }

        for (var i = 0; i < links.length; i++) {
            var link = links[i];
            var url = new URL(link.href);
            var anchorHash = url.hash;

            // Adicionar todos os parâmetros da URL atual
            urlParams.forEach(function(value, key) {
                url.searchParams.set(key, value);
            });

            // Adicionar ou substituir [sclid] com o clickId modificado
            if (modifiedClickId) {
                var linkHref = url.href.split('#')[0];
                linkHref = linkHref.replace('[sclid]', modifiedClickId).replace('%5Bsclid%5D', modifiedClickId);
                url = new URL(linkHref);
                url.searchParams.set('sclid', modifiedClickId);
            }

            // Reconstruir a URL com todos os parâmetros
            link.href = url.href.split('#')[0] + anchorHash;
        }

        console.log("Links atualizados com sucesso");
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
            var clickId = getClickId();
            var data = {
                action: 'lontraads_record_visit',
                domain: currentDomain,
                click_id: clickId
            };

            getAllUrlParams().forEach(function(value, key) {
                if (!['gclid', 'wbraid', 'msclkid', 'fbclid'].includes(key)) {
                    data[key] = value;
                }
            });

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
    }

    function init() {
        console.log("Iniciando funções principais");
        sendVisitorData();
        updateLinks();
    }

    if (document.readyState !== 'loading') {
        console.log("DOM já carregado, executando funções imediatamente");
        init();
    } else {
        console.log("DOM ainda carregando, adicionando evento listener");
        document.addEventListener('DOMContentLoaded', init);
    }

    console.log("Script concluído");
})();
