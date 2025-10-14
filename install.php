<?php
require_once 'crest.php';

// Устанавливаем приложение
$result = CRest::installApp();
if ($result && ! isset($result['error'])) {
    echo 'Приложение успешно установлено!';

    // Регистрируем блок отзывов
    registerReviewsBlock();
} else {
    echo 'Ошибка установки: '.($result['error_description'] ?? 'Неизвестная ошибка');
}

// Функция для регистрации блока отзывов
function registerReviewsBlock()
{
    $htmlCode = '<div class="lsyr_app-body">
  <!-- Скрытые контейнеры для атрибутов настроек -->
  <div class="lsyr_attr-company-id" style="display: none;"></div>
  <div class="lsyr_attr-limit" style="display: none;"></div>
  <div class="lsyr_attr-hide-negative" style="display: none;"></div>
  <div class="lsyr_attr-sort-column" style="display: none;"></div>
  <div class="lsyr_attr-sort-order" style="display: none;"></div>
  <div class="lsyr_attr-slide-desktop-count" style="display: none;"></div>
  <div class="lsyr_attr-slide-mobile-count" style="display: none;"></div>
  
  <div class="lsyr_review-box lsyr_review-unselectable">
    <div class="lsyr_business-summary-rating-badge-view__rating">
      <span id="companyName">Загрузка...</span>
      <br><br>
      <span id="companyRating">—</span> из 5
    </div>
    <div class="lsyr_business-rating-badge-view__stars" id="companyStars">
      <!-- Stars will be generated here -->
    </div>
    <a target="_blank" href="" id="companyMapLink">
      <!-- Логотип Яндекс.Карт SVG -->
    </a>
    <div class="lsyr_reviews-count" id="companyCounts">
      <a target="_blank" href="" id="companyCountsLink">на основе — отзывов</a>
    </div>
    <a target="_blank" href="" id="companyReviewLink" class="lsyr_reviews-btn lsyr_reviews-btn-form" rel="nofollow noreferrer noopener">Оставить отзыв</a>
  </div>
  
  <div class="lsyr_review-list">
    <div class="lsyr_slider-viewport">
      <div class="lsyr_slider-track" id="track">
        <!-- Reviews will be generated here -->
      </div>
    </div>
    
    <div class="lsyr_review-bottom">
      <div class="lsyr_buttons">
        <button class="lsyr_button-prev" id="prev" tabindex="0" role="button" aria-label="Previous slide">
          <!-- SVG кнопки "Назад" -->
        </button>
        <button class="lsyr_button-next" id="next" tabindex="0" role="button" aria-label="Next slide">
          <!-- SVG кнопки "Вперед" -->
        </button>
      </div>
      <div class="lsyr_pagination lsyr_pagination-clickable lsyr_pagination-bullets lsyr_pagination-horizontal" id="pagination">
        <!-- Pagination bullets will be generated here -->
      </div>
      <div class="lsyr_business-review-view_copy">
        <div>разработано</div>
        <a href="https://lead-space.ru/?utm_source=marketplace.1c-bitrix" target="_blank">
          <!-- Логотип Lead Space -->
        </a>
      </div>
    </div>
  </div>
</div>
';

    $blockData = [
        'code' => 'yandex_reviews_block',
        'fields' => [
            'NAME' => 'Блок отзывов Яндекс',
            'DESCRIPTION' => 'Блок для отображения отзывов с Яндекс.Карт',
            'SECTIONS' => 'cover,about',
            'PREVIEW' => 'https://www.bitrix24.ru/images/b24_screen.png',
            'CONTENT' => $htmlCode,
        ],
        'manifest' => [
            'assets' => [
                'css' => [
                    'https://app.lead-space.ru/WidgetYandexReviews/slick/slick.css',
                    'https://app.lead-space.ru/WidgetYandexReviews/slick/slick-theme.css',
                    'https://app.lead-space.ru/WidgetYandexReviews/style.css',
                ],
                'js' => [
                    'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js',
                    'https://unpkg.com/vue@3/dist/vue.global.prod.js',
                    'https://app.lead-space.ru/WidgetYandexReviews/slick/slick.min.js',
                    'https://app.lead-space.ru/WidgetYandexReviews/js/readmore.js',
                    'https://app.lead-space.ru/WidgetYandexReviews/main.js',
                ],
            ],
            'style' => [
                // Стили применяются к реальным элементам с классами
                '.lsyr_app-body' => [
                    'name' => 'Основной контейнер',
                    'type' => 'box',
                ],
                '.lsyr_review-box' => [
                    'name' => 'Блок с рейтингом',
                    'type' => 'box',
                ],
                '.lsyr_review-list' => [
                    'name' => 'Список отзывов',
                    'type' => 'box',
                ],
            ],
            'attrs' => [
                // Атрибуты применяются к конкретным скрытым контейнерам
                '.lsyr_attr-company-id' => [
                    'name' => 'ID компании в Яндекс.Картах',
                    'type' => 'text',
                    'attribute' => 'data-company-id',
                    'value' => '',
                ],
                '.lsyr_attr-limit' => [
                    'name' => 'Количество отображаемых отзывов(не больше 50)',
                    'type' => 'text',
                    'attribute' => 'data-limit',
                    'value' => '',
                ],
                '.lsyr_attr-slide-desktop-count' => [
                    'name' => 'Количество отображаемых слайдов на ПК',
                    'type' => 'text',
                    'attribute' => 'data-slide-desktop-count',
                    'value' => '',
                ],
                '.lsyr_attr-slide-mobile-count' => [
                    'name' => 'Количество отображаемых слайдов на Мобильном устройстве',
                    'type' => 'text',
                    'attribute' => 'data-slide-mobile-count',
                    'value' => '',
                ],
                '.lsyr_attr-hide-negative' => [
                    'name' => 'Фильтрация отзывов',
                    'type' => 'list',
                    'attribute' => 'data-hide-negative',
                    'items' => [
                        'true' => 'Скрывать негативные (рейтинг < 4)',
                        'false' => 'Показывать все отзывы',
                    ],
                ],
                '.lsyr_attr-sort-column' => [
                    'name' => 'Сортировка по',
                    'type' => 'list',
                    'attribute' => 'data-sort-column',
                    'items' => [
                        'rating' => 'Рейтингу',
                        'name' => 'Имени автора',
                    ],
                ],
                '.lsyr_attr-sort-order' => [
                    'name' => 'Порядок сортировки',
                    'type' => 'list',
                    'attribute' => 'data-sort-order',
                    'items' => [
                        'desc' => 'По убыванию',
                        'asc' => 'По возрастанию',
                    ],
                ],
            ],
        ],
    ];

    // Сначала удаляем старый блок (если есть)
    $unregisterResult = CRest::call('landing.repo.unregister', [
        'code' => $blockData['code'],
    ]);

    // Регистрируем новый блок
    $registerResult = CRest::call('landing.repo.register', $blockData);

    if (isset($registerResult['result'])) {
        echo '<br>Блок отзывов успешно зарегистрирован!';
    } else {
        echo '<br>Ошибка регистрации блока: '.($registerResult['error_description'] ?? 'Неизвестная ошибка');
    }
}
?>
  <script src="//api.bitrix24.com/api/v1/"></script>
  <script>BX24.installFinish();</script>
