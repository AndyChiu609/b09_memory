// video.js — 「畢業影片」卡片切換（使用主HTML的動畫系統並增加RWD支持）
(() => {
  console.log("👉 video.js 已載入");

  // 全局變量來追踪事件監聽器是否已綁定
  let resizeListenerAdded = false;
  let carouselInstance = null;

  // 添加RWD特定樣式
  function addVideoStyles() {
    // 檢查樣式是否已經存在，如果存在則移除舊的
    const existingStyle = document.getElementById("video-card-styles");
    if (existingStyle) {
      existingStyle.remove();
    }

    const styleElement = document.createElement("style");
    styleElement.id = "video-card-styles";
    styleElement.textContent = `
      /* 視頻卡片響應式樣式 - 使用更專一的選擇器避免影響其他元素 */
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
        .video-card .carousel-control-prev, 
        .video-card .carousel-control-next {
          width: 10%;
        }
      }
      
      @media (min-width: 577px) and (max-width: 991px) {
        .video-card {
          width: 90%;
          max-width: 650px;
        }
      }
      
      /* 輪播指示器恢復為橫線設計，但優化觸控區域 - 更專一的選擇器 */
      .video-card .carousel-indicators {
        bottom: -30px;
      }
      
      .video-card .carousel-indicators [data-bs-target] {
        width: 30px;
        height: 3px;
        border-radius: 0;
        background-color: rgba(0,0,0,0.5);
        margin: 0 6px;
        opacity: 0.5;
      }
      
      .video-card .carousel-indicators .active {
        background-color: #007bff;
        opacity: 1;
      }
      
      /* 在小屏幕上增加觸摸區域但保持視覺上的細線 - 限定在視頻卡片內 */
      @media (max-width: 768px) {
        .video-card .carousel-indicators [data-bs-target] {
          height: 3px;
          margin-top: 10px;  /* 增加上方空間便於觸摸 */
          margin-bottom: 10px;
          position: relative;
        }
        
        /* 創建隱形的觸摸區域 */
        .video-card .carousel-indicators [data-bs-target]::before {
          content: '';
          position: absolute;
          top: -10px;
          left: 0;
          width: 100%;
          height: 23px; /* 3px線高 + 上下各10px額外觸摸區 */
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
      videoCard.style.width = "95%";
      videoCard.style.maxWidth = "800px";
      videoCard.style.padding = "1rem";
    }
  }

  // 初始化輪播
  function initializeCarousel() {
    const videoCarouselEl = document.querySelector("#videoCarousel");
    if (!videoCarouselEl) return;

    // 如果已經有一個實例，先銷毀它
    if (carouselInstance) {
      carouselInstance.dispose();
      carouselInstance = null;
    }

    // 創建新的輪播實例
    carouselInstance = new bootstrap.Carousel(videoCarouselEl, {
      interval: 0, // 不自動播放，避免用戶在觀看一個視頻時自動切換
      ride: false,
      touch: true, // 開啟觸控支持
    });

    // 確保iframe可點擊
    videoCarouselEl.querySelectorAll("iframe").forEach((iframe) => {
      iframe.style.pointerEvents = "auto";
    });

    // 移除舊的事件監聽器（如果有的話）
    videoCarouselEl.removeEventListener("slide.bs.carousel", handleSlideEvent);

    // 添加輪播導航事件監聽器
    videoCarouselEl.addEventListener("slide.bs.carousel", handleSlideEvent);
  }

  // 處理輪播切換事件的函數
  function handleSlideEvent(e) {
    // 暫停當前視頻（如果正在播放）
    const currentVideo = e.target.querySelector(".carousel-item.active iframe");
    if (currentVideo) {
      const videoSrc = currentVideo.src;
      currentVideo.src = videoSrc; // 重新加載iframe以暫停視頻
    }
  }

  // 定義全域函數 - 載入畢業影片卡片HTML
  window.loadVideoCards = function () {
    // 添加樣式
    addVideoStyles();

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
      // 初始化輪播
      initializeCarousel();

      // 初始化佈局
      updateVideoCardLayout();

      // 如果還沒有添加resize監聽器，添加它
      if (!resizeListenerAdded) {
        window.addEventListener("resize", updateVideoCardLayout);
        resizeListenerAdded = true;
      }
    }, 300); // 增加延遲時間確保DOM完全更新

    // 返回卡片HTML數組
    return [videoCardHtml];
  };

  // 清理函數 - 移除所有添加的資源和事件監聽器
  function cleanup() {
    // 移除resize事件監聽器
    if (resizeListenerAdded) {
      window.removeEventListener("resize", updateVideoCardLayout);
      resizeListenerAdded = false;
    }

    // 銷毀輪播實例
    if (carouselInstance) {
      carouselInstance.dispose();
      carouselInstance = null;
    }

    // 移除輪播事件監聽器
    const videoCarousel = document.querySelector("#videoCarousel");
    if (videoCarousel) {
      videoCarousel.removeEventListener("slide.bs.carousel", handleSlideEvent);
    }

    // 保留樣式表，因為切換時會重新添加
  }

  // 定義單獨的按鈕狀態更新函數
  function updateVideoButtonState(isActive) {
    const toggleVideoBtn = document.getElementById("toggle-video-btn");
    if (!toggleVideoBtn) return;

    // 使用 requestAnimationFrame 確保 DOM 更新時序正確
    requestAnimationFrame(() => {
      // 更新按鈕文字
      const btnTextElement = toggleVideoBtn.querySelector(".btn-text");
      if (btnTextElement) {
        btnTextElement.textContent = isActive ? "隱藏畢業影片" : "畢業影片";
      }

      // 更新按鈕樣式類
      if (isActive) {
        toggleVideoBtn.classList.remove("btn-outline-primary");
        toggleVideoBtn.classList.add("btn-primary");
      } else {
        toggleVideoBtn.classList.remove("btn-primary");
        toggleVideoBtn.classList.add("btn-outline-primary");
      }
    });
  }

  // 獲取按鈕元素
  const toggleVideoBtn = document.getElementById("toggle-video-btn");
  if (!toggleVideoBtn) return; // 如果按鈕不存在，退出

  // 綁定按鈕點擊事件 - 使用完全重構的邏輯
  toggleVideoBtn.addEventListener("click", () => {
    // 檢查是否已存在視頻卡片
    const existingVideoCard = document.querySelector(
      '[data-component="video"]'
    );

    // 確定當前意圖（顯示或隱藏）
    const shouldShowVideo = !existingVideoCard;

    // 處理組件切換和資源清理
    if (shouldShowVideo) {
      // 步驟 1: 載入視頻卡片
      const videoCards = window.loadVideoCards();

      // 步驟 2: 切換組件 - 這會關閉導航欄
      window.switchComponent("video", videoCards, "toggle");

      // 步驟 3: 在適當延遲後更新按鈕 (確保導航交互已完成)
      setTimeout(() => {
        updateVideoButtonState(true);
      }, 350); // 延遲 350ms 確保導航欄折疊動畫已完成
    } else {
      // 步驟 1: 清理資源
      cleanup();

      // 步驟 2: 切換組件 - 這會關閉導航欄
      window.switchComponent("video", [], "toggle");

      // 步驟 3: 在適當延遲後更新按鈕 (確保導航交互已完成)
      setTimeout(() => {
        updateVideoButtonState(false);
      }, 350); // 延遲 350ms 確保導航欄折疊動畫已完成
    }
  });

  // 當頁面載入時，確保按鈕初始狀態正確
  document.addEventListener("DOMContentLoaded", () => {
    const existingVideoCard = document.querySelector(
      '[data-component="video"]'
    );
    updateVideoButtonState(!!existingVideoCard);
  });
})();
