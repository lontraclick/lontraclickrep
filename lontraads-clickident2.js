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
    }

    if (document.readyState !== 'loading') {
        console.log("DOM já carregado, executando funções imediatamente");
        init();
    } else {
        console.log("DOM ainda carregando, adicionando evento listener");
        document.addEventListener('DOMContentLoaded', init);
    }

    document.addEventListener('click', function(e) {
        var target = e.target;
        while (target && !(target.tagName === 'A' || target.tagName === 'BUTTON')) {
            target = target.parentElement;
        }
        
        if (target && (target.tagName === 'A' || target.tagName === 'BUTTON')) {
            e.preventDefault();
            
            var url = new URL(target.href || target.getAttribute('data-href') || window.location.href);
            var urlParams = getAllUrlParams();
            
            urlParams.forEach(function(value, key) {
                url.searchParams.set(key, value);
            });
            
            var clickId = getClickId();
            if (clickId) {
                url.searchParams.set('sclid', clickId);
            }
            
            console.log("Link/botão clicado modificado:", url.toString());
            
            window.location.href = url.toString();
        }
    }, true);

    console.log("Script concluído");
})();
