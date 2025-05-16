// video.js — 「畢業影片」卡片切換（使用主HTML的動畫系統）
(() => {
  console.log('👉 video.js 已載入');

  // 定義全域函數 - 載入畢業影片卡片HTML
  window.loadVideoCards = function() {
    const vw = Math.min(window.innerWidth * 0.9, 800);
    const videoCardHtml = `
      <div class="card m-3 p-3 border border-secondary border-opacity-50" style="width: ${vw}px;">
        <div class="card-header fs-5 fw-bold text-center mb-3">畢業影片</div>
        <div class="d-flex justify-content-center p-2">
          <div id="videoCarousel" class="carousel slide w-100">
            <div class="carousel-indicators">
              <button type="button" data-bs-target="#videoCarousel" data-bs-slide-to="0" class="active"></button>
              <button type="button" data-bs-target="#videoCarousel" data-bs-slide-to="1"></button>
            </div>
            <div class="carousel-inner">
              <div class="carousel-item active">
                <div class="ratio ratio-16x9">
                  <iframe
                    src="https://www.youtube.com/embed/ZHgyQGoeaB0?si=gYvO5IEYjY_H3dSg"
                    title="畢業影片 1"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; web-share"
                    allowfullscreen>
                  </iframe>
                </div>
              </div>
              <div class="carousel-item">
                <div class="ratio ratio-16x9">
                  <iframe
                    src="https://www.youtube.com/embed/vKB2Lg-IM3I?si=AFuaFfrQo8ugx4jd"
                    title="畢業影片 2"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; web-share"
                    allowfullscreen>
                  </iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // 註冊初始化監聽器 - 當卡片完成進場動畫後執行初始化
    // 使用MutationObserver監視DOM變化來初始化影片輪播
    setTimeout(() => {
      const videoCarouselEl = document.querySelector('#videoCarousel');
      if (videoCarouselEl) {
        // 初始化Bootstrap輪播
        new bootstrap.Carousel(videoCarouselEl, {
          interval: 5000,
          ride: 'carousel'
        });

        // 確保iframe可點擊
        videoCarouselEl.querySelectorAll('iframe').forEach(iframe => {
          iframe.style.pointerEvents = 'auto';
        });
      }
    }, 100); // 短暫延遲確保DOM已更新

    // 返回卡片HTML數組
    return [videoCardHtml];
  };

  // 獲取按鈕元素
  const toggleVideoBtn = document.getElementById('toggle-video-btn');

  // 綁定按鈕點擊事件
  toggleVideoBtn.addEventListener('click', () => {
    // 檢查是否已存在視頻卡片
    const existingVideoCard = document.querySelector('[data-component="video"]');
    
    if (!existingVideoCard) {
      // 載入視頻卡片並使用修改後的switchComponent函數
      const videoCards = window.loadVideoCards();
      window.switchComponent('video', videoCards, 'toggle');
      toggleVideoBtn.textContent = '隱藏畢業影片';
    } else {
      // 切換卡片，新函數會處理關閉卡片
      window.switchComponent('video', [], 'toggle');
      toggleVideoBtn.textContent = '畢業影片';
    }
  });
})();