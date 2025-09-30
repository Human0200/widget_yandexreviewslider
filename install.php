<?php
require_once './crest.php';

$result = CRest::installApp();
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Установка и настройки приложения</title>
    <script src="//api.bitrix24.com/api/v1/"></script>
    <style>
        :root{
            --bg:#f5f7fa;--card:#fff;--text:#333;--muted:#6b7280;--primary:#2f81b7;--primary2:#236a9a;--border:#e5e7eb;--ok:#2fc06e;--err:#ff5752;
        }
        html,body{height:100%}
        body{margin:0;background:var(--bg);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Ubuntu,"Helvetica Neue",Arial}
        .container{display:grid;place-items:start center;padding:24px}
        .card{width:min(760px,100%);background:#fff;border:1px solid var(--border);border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,.06);padding:20px}
        .icon{font-size:40px;margin-bottom:8px}
        h1{margin:0 0 6px;font-size:22px}
        p{margin:0 0 16px;color:var(--muted)}
        .grid{display:grid;gap:14px;margin-top:12px}
        .row{display:grid;gap:8px}
        label{font-weight:600;font-size:14px}
        input[type="text"],input[type="number"]{width:100%;padding:10px 12px;border-radius:8px;border:1px solid var(--border);font-size:14px;background:#fff;outline:none}
        input[type="text"]:focus,input[type="number"]:focus{border-color:var(--primary);box-shadow:0 0 0 3px rgba(47,129,183,.12)}
        .inline{display:grid;grid-template-columns:1fr 200px;gap:12px}
        @media(max-width:560px){.inline{grid-template-columns:1fr}}
        .checkbox{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--border);border-radius:8px;background:#fff}
        .hint{color:var(--muted);font-size:12px}
        .actions{margin-top:16px;display:flex;gap:10px;flex-wrap:wrap}
        .btn{appearance:none;border:none;border-radius:8px;padding:10px 16px;font-weight:700;cursor:pointer;font-size:14px}
        .btn-primary{background:var(--primary);color:#fff}
        .btn-primary:hover{background:var(--primary2)}
        .btn-secondary{background:#eef2f7;color:#111827}
        .msg{margin-top:10px;font-size:14px;display:none}
        .msg.show{display:block}
        .msg.ok{color:var(--ok)}
        .msg.err{color:var(--err)}
        .sep{height:1px;background:var(--border);margin:16px 0}
    </style>
</head>
<body>
<div class="container">
    <div class="card">
        <?php if (!empty($result) && isset($result['install']) && $result['install'] == true) { ?>
            <div class="icon" style="color:var(--ok)">✓</div>
            <h1>Установка завершена</h1>
            <p>Приложение установлено. Сразу задайте настройки — они сохранятся через <code>app.option.set</code>.</p>

            <div class="sep"></div>

            <div class="grid" id="settings">
                <div class="row">
                    <label for="yandexId">ID компании из Яндекса</label>
                    <input id="yandexId" type="text" placeholder="например, 123456789012" autocomplete="off" />
                    <div class="hint">Идентификатор организации из Яндекс.Бизнес/Справочника.</div>
                </div>

                <div class="inline">
                    <div class="row">
                        <label for="limit">LIMIT</label>
                        <input id="limit" type="number" min="1" max="1000" step="1" placeholder="например, 50" />
                        <div class="hint">Максимальное количество элементов (1–1000).</div>
                    </div>

                    <div class="row">
                        <label for="hideNeg">HIDE_NEAGTIVE</label>
                        <div class="checkbox">
                            <input id="hideNeg" type="checkbox" />
                            <span>Скрывать негатив</span>
                        </div>
                        <div class="hint">Сохраняется в ключ <code>HIDE_NEAGTIVE</code>.</div>
                    </div>
                </div>

                <div class="actions">
                    <button id="saveBtn" class="btn btn-primary">Сохранить</button>
                    <button id="reloadBtn" class="btn btn-secondary" type="button">Перезагрузить</button>
                    <button id="finishBtn" class="btn btn-secondary" type="button">Завершить установку</button>
                </div>

                <div id="msg" class="msg"></div>
            </div>
        <?php } else { ?>
            <div class="icon" style="color:var(--err)">✗</div>
            <h1>Ошибка установки</h1>
            <p>При установке произошла ошибка. Попробуйте ещё раз или обратитесь в поддержку.</p>
        <?php } ?>
    </div>
</div>

<script>
(function(){
    // Ключи опций
    const KEY_YA = "YANDEX_COMPANY_ID";
    const KEY_LIMIT = "LIMIT";
    const KEY_HIDE_NEG = "HIDE_NEAGTIVE";
    const KEY_HIDE_NEG_ALT = "HIDE_NEGATIVE"; // читаем и альтернативное написание, если ранее сохраняли так

    const $yandexId = document.getElementById("yandexId");
    const $limit    = document.getElementById("limit");
    const $hideNeg  = document.getElementById("hideNeg");
    const $save     = document.getElementById("saveBtn");
    const $reload   = document.getElementById("reloadBtn");
    const $finish   = document.getElementById("finishBtn");
    const $msg      = document.getElementById("msg");

    function showMsg(text, type="ok"){
        $msg.textContent = text;
        $msg.className = "msg show " + (type === "ok" ? "ok" : "err");
    }

    function asYN(v){ return v ? "Y" : "N"; }
    function fromYN(v){ return String(v).toUpperCase() === "Y"; }
    function clamp(n,min,max){
        const num = Number(n);
        if (Number.isNaN(num)) return null;
        return Math.max(min, Math.min(max, num));
    }

    function resize(){
        try{
            BX24 && BX24.resizeWindow && BX24.resizeWindow(document.body.offsetWidth, document.body.offsetHeight);
            BX24 && BX24.resizeIframe && BX24.resizeIframe();
        }catch(e){}
    }

    function loadOptions(){
        return new Promise((resolve,reject)=>{
            BX24.callMethod('app.option.get', {}, res=>{
                if(res.error()){
                    reject(res.error());
                    return;
                }
                const data = res.data() || {};
                $yandexId.value = data[KEY_YA] || "";
                $limit.value    = data[KEY_LIMIT] || "";

                const raw = (data[KEY_HIDE_NEG] !== undefined) ? data[KEY_HIDE_NEG] : data[KEY_HIDE_NEG_ALT];
                $hideNeg.checked = raw ? fromYN(raw) : false;

                resize();
                resolve(data);
            });
        });
    }

    function saveOptions(){
        const yaId = ($yandexId.value || "").trim();
        const lim  = ($limit.value || "").trim();

        if(!yaId){
            showMsg("Введите ID компании из Яндекса.", "err");
            return;
        }
        let limitNum = lim === "" ? null : clamp(lim, 1, 1000);
        if(lim !== "" && limitNum === null){
            showMsg("LIMIT должен быть числом (1–1000).", "err");
            return;
        }

        const options = {};
        options[KEY_YA] = yaId;
        options[KEY_LIMIT] = (limitNum === null) ? "" : String(limitNum);
        options[KEY_HIDE_NEG] = asYN($hideNeg.checked);

        $save.disabled = true;
        BX24.callMethod('app.option.set', { options }, res=>{
            $save.disabled = false;
            if(res.error()){
                showMsg("Ошибка сохранения: " + res.error_description(), "err");
            }else{
                showMsg("Сохранено!");
            }
            resize();
        });
    }

    BX24.init(function(){
        // Подгружаем текущие значения
        loadOptions().catch(e=>{
            showMsg("Не удалось загрузить опции: " + (e && e.error_description ? e.error_description : String(e)), "err");
        });

        // Кнопки
        $save && $save.addEventListener('click', saveOptions);
        $reload && $reload.addEventListener('click', ()=>{
            loadOptions()
              .then(()=>showMsg("Настройки перезагружены."))
              .catch(e=>showMsg("Ошибка при перезагрузке: " + (e && e.error_description ? e.error_description : String(e)), "err"));
        });
        $finish && $finish.addEventListener('click', ()=>{
            // Завершаем установку (как в твоём примере), если хочешь — можно редиректить на другую страницу.
            BX24.installFinish();
        });

        resize();
    });
})();
</script>
</body>
</html>
<?php
$install_handler = ($_SERVER['HTTPS'] === 'on' || $_SERVER['SERVER_PORT'] === '443' ? 'https' : 'http') . '://' .
    $_SERVER['SERVER_NAME'] .
    (in_array($_SERVER['SERVER_PORT'], ['80','443'], true) ? '' : ':' . $_SERVER['SERVER_PORT']) .
    str_replace($_SERVER['DOCUMENT_ROOT'], '', realpath(__DIR__ . '/install_handler.php'));

$uninstall_handler = ($_SERVER['HTTPS'] === 'on' || $_SERVER['SERVER_PORT'] === '443' ? 'https' : 'http') . '://' .
    $_SERVER['SERVER_NAME'] .
    (in_array($_SERVER['SERVER_PORT'], ['80','443'], true) ? '' : ':' . $_SERVER['SERVER_PORT']) .
    str_replace($_SERVER['DOCUMENT_ROOT'], '', realpath(__DIR__ . '/uninstall_handler.php'));
