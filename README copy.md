# Debug guide
1) Откройте напрямую в браузере:
   `/api/proxy.php?TEST=1` — должны увидеть JSON {"status":"success",...}. Если нет — PHP не исполняется.
2) Затем проверьте:
   `/api/proxy.php?ACTION=PARSE_COMPANY_DIRECT&COMPANY_ID=XXXX`
   `/api/proxy.php?ACTION=PARSE_REVIEWS_DIRECT&COMPANY_ID=XXXX`
   Если `status:error` и `upstream_preview` — смотрите текст ошибки апстрима.
3) В `index.html` улучшен парсер: если придёт HTML, вы увидите превью ответа в блоке ошибки.
