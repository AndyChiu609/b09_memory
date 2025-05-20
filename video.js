// video.js — 「畢業影片」卡片切換（使用主HTML的動畫系統並增加RWD支持）
(() => {
  console.log("👉 video.js 已載入");

  // 添加RWD特定樣式
  if (!document.getElementById("video-card-styles")) {
    const styleElement = document.createElement("style");
    styleElement.id = "video-card-styles";
    styleElement.textContent = `
      /* 視頻卡片響應式樣式 */
      .video-card {
        width: 95%;
        max-width: 800px;
        margin: 1rem auto;
        transition: all 0.3s ease;
      }
      
      @media (max-width: 576px) {
        .video-card {
          width: 100%;
          margin: 0.5rem auto;
        }
        .video-card .card-header {
          font-size: 1.1rem !important;
          padding: 0.5rem;
        }
        .carousel-control-prev, .carousel-control-next {
          width: 10%;
        }
      }
      
      @media (min-width: 577px) and (max-width: 991px) {
        .video-card {
          width: 90%;
          max-width: 650px;
        }
      }
      
      /* 輪播指示器恢復為橫線設計，但優化觸控區域 */
      .carousel-indicators {
        bottom: -30px;
      }
      
      .carousel-indicators [data-bs-target] {
        width: 30px;
        height: 3px;
        border-radius: 0;
        background-color: rgba(0,0,0,0.5);
        margin: 0 6px;
        opacity: 0.5;
      }
      
      .carousel-indicators .active {
        background-color: #007bff;
        opacity: 1;
      }
      
      /* 在小屏幕上增加触摸区域但保持视觉上的细线 */
      @media (max-width: 768px) {
        .carousel-indicators [data-bs-target] {
          height: 3px;
          margin-top: 10px;  /* 增加上方空间便于触摸 */
          margin-bottom: 10px;
          position: relative;
        }
        
        /* 创建隐形的触摸区域 */
        .carousel-indicators [data-bs-target]::before {
          content: '';
          position: absolute;
          top: -10px;
          left: 0;
          width: 100%;
          height: 23px; /* 3px线高 + 上下各10px额外触摸区 */
          background: transparent;
        }
      }
      
      /* 在輪播下方添加空間，避免指示器擠壓 */
      #videoCarousel {
        margin-bottom: 35px;
      }
    `;
    document.head.appendChild(styleElement);
  }

  // 定義全域函數 - 載入畢業影片卡片HTML
  window.loadVideoCards = function () {
    const videoCardHtml = `
      <div class="card p-2 p-md-3 border border-secondary border-opacity-50 video-card">
        <div class="card-header fs-5 fw-bold text-center mb-2 mb-md-3">畢業影片</div>
        <div class="d-flex justify-content-center p-1 p-md-2">
          <div id="videoCarousel" class="carousel slide w-100">
            <div class="carousel-indicators">
              <button type="button" data-bs-target="#videoCarousel" data-bs-slide-to="0" class="active" aria-current="true" aria-label="影片 1"></button>
              <button type="button" data-bs-target="#videoCarousel" data-bs-slide-to="1" aria-label="影片 2"></button>
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
                <div class="carousel-caption d-none d-md-block">
                  <h5>畢業影片 #1</h5>
                  <p class="d-none d-lg-block">台大地理系的美麗記憶</p>
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
                <div class="carousel-caption d-none d-md-block">
                  <h5>畢業影片 #2</h5>
                  <p class="d-none d-lg-block">我們的大學時光</p>
                </div>
              </div>
            </div>
            <!-- 移除左右箭頭控制，避免擋住YouTube播放器上的按鈕 -->
          </div>
        </div>
        <div class="card-footer text-muted text-center py-2 d-none d-sm-block">
          <small>使用下方指示點切換影片</small>
        </div>
      </div>
    `;

    // 註冊初始化監聽器 - 當卡片完成進場動畫後執行初始化
    setTimeout(() => {
      const videoCarouselEl = document.querySelector("#videoCarousel");
      if (videoCarouselEl) {
        // 初始化Bootstrap輪播
        new bootstrap.Carousel(videoCarouselEl, {
          interval: 0, // 不自動播放，避免用戶在觀看一個視頻時自動切換
          ride: false,
          touch: true, // 開啟觸控支持
        });

        // 確保iframe可點擊
        videoCarouselEl.querySelectorAll("iframe").forEach((iframe) => {
          iframe.style.pointerEvents = "auto";
        });

        // 添加輪播導航事件監聽器
        videoCarouselEl.addEventListener("slide.bs.carousel", function (e) {
          // 暫停當前視頻（如果正在播放）
          const currentVideo = videoCarouselEl.querySelector(
            ".carousel-item.active iframe"
          );
          if (currentVideo) {
            const videoSrc = currentVideo.src;
            currentVideo.src = videoSrc; // 重新加載iframe以暫停視頻
          }
        });
      }
    }, 100); // 短暫延遲確保DOM已更新

    // 返回卡片HTML數組
    return [videoCardHtml];
  };

  // 根據視窗大小調整影片卡片布局
  function updateVideoCardLayout() {
    const videoCard = document.querySelector(".video-card");
    if (!videoCard) return;

    // 調整卡片寬度和間距
    if (window.innerWidth < 576) {
      // 手機尺寸
      videoCard.style.width = "100%";
      videoCard.style.padding = "0.5rem";
    } else if (window.innerWidth < 992) {
      // 平板尺寸
      videoCard.style.width = "90%";
      videoCard.style.padding = "0.75rem";
    } else {
      // 桌面尺寸
      videoCard.style.width = "800px";
      videoCard.style.padding = "1rem";
    }
  }

  // 清理函數
  function cleanup() {
    // 移除樣式表
    const styleElement = document.getElementById("video-card-styles");
    if (styleElement) {
      styleElement.remove();
    }
  }

  // 獲取按鈕元素
  const toggleVideoBtn = document.getElementById("toggle-video-btn");

  // 綁定按鈕點擊事件
  toggleVideoBtn.addEventListener("click", () => {
    // 檢查是否已存在視頻卡片
    const existingVideoCard = document.querySelector(
      '[data-component="video"]'
    );

    if (!existingVideoCard) {
      // 載入視頻卡片並使用修改後的switchComponent函數
      const videoCards = window.loadVideoCards();
      window.switchComponent("video", videoCards, "toggle");

      // 更新按鈕文字
      const iconHtml =
        window.innerWidth < 992 ? '<i class="bi bi-film me-2"></i>' : "";
      toggleVideoBtn.innerHTML = `${iconHtml}隱藏畢業影片`;
    } else {
      // 清理資源
      cleanup();

      // 切換卡片，新函數會處理關閉卡片
      window.switchComponent("video", [], "toggle");

      // 更新按鈕文字
      const iconHtml =
        window.innerWidth < 992 ? '<i class="bi bi-film me-2"></i>' : "";
      toggleVideoBtn.innerHTML = `${iconHtml}畢業影片`;
    }
  });
})();
