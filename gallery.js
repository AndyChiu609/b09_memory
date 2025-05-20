// gallery.js — 「活動集錦」卡片切換（整合Fancybox，使用主HTML動畫系統，添加RWD支持）
(() => {
  console.log("👉 gallery.js 已載入");

  // 全局變量
  let allDetails = [];
  let modalOverlay = null;

  // 定義全域函數 - 載入活動集錦卡片HTML
  window.loadGalleryCards = function () {
    // 創建包含卡片和所有相關元素的HTML
    const galleryCardHtml = `
      <div class="card m-2 m-md-3 p-2 p-md-3 border border-secondary border-opacity-50 gallery-card">
        <div class="card-header fs-5 fw-bold text-center mb-2 mb-md-3">活動集錦</div>
        <div id="gallery-grid" class="gallery-masonry-grid"></div>
      </div>
    `;

    // 添加自定義CSS到頁面
    if (!document.getElementById("gallery-grid-styles")) {
      const styleElement = document.createElement("style");
      styleElement.id = "gallery-grid-styles";
      styleElement.textContent = `
        /* 響應式卡片樣式 */
        .gallery-card {
          width: 95%;
          max-width: 1200px;
          height: auto;
          max-height: 80vh;
          overflow: auto;
          margin: 0 auto;
        }
        
        @media (max-width: 576px) {
          .gallery-card {
            width: 100%;
            max-height: 75vh;
            margin: 0.5rem auto;
            padding: 0.5rem !important;
          }
          .gallery-card .card-header {
            font-size: 1.1rem !important;
            padding: 0.5rem;
            margin-bottom: 0.5rem !important;
          }
        }
        
        /* 響應式網格佈局 */
        .gallery-masonry-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          grid-gap: 15px;
          grid-auto-rows: 10px;
        }
        
        @media (max-width: 768px) {
          .gallery-masonry-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            grid-gap: 10px;
          }
        }
        
        @media (min-width: 769px) and (max-width: 991px) {
          .gallery-masonry-grid {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          }
        }
        
        .story-card {
          grid-row-end: span var(--card-height, 20);
          overflow: hidden;
          border-radius: 8px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          position: relative;
        }
        
        .story-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.3s ease-out;
          transform: scale(1.5);
        }
        
        .story-card:hover img {
          transform: scale(0.9);
        }
        
        .preview-title {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          background: linear-gradient(transparent, rgba(0,0,0,0.7));
          color: white;
          padding: 15px 10px 10px;
          transform: translateY(100%);
          transition: transform 0.3s ease-out;
        }
        
        /* 在觸摸設備上始終顯示標題 */
        @media (hover: none) {
          .preview-title {
            transform: translateY(0);
            padding: 10px 8px 8px;
          }
          
          .preview-title div {
            font-size: 0.9rem;
          }
        }
        
        .story-card:hover .preview-title {
          transform: translateY(0);
        }
        
        /* 添加滑入動畫 */
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        
        .story-card {
          animation: fadeInScale 0.3s forwards;
          animation-delay: calc(var(--card-index) * 0.05s);
          opacity: 0;
        }

        /* 詳細視窗中的圖片加上縮放游標提示 */
        .detail-image-link img {
          cursor: zoom-in;
        }
        
        /* 故事詳情視窗響應式樣式 */
        .story-detail {
          width: 95% !important;
          max-width: 800px !important;
          max-height: 90vh !important;
          padding: 1.5rem !important;
        }
        
        @media (max-width: 768px) {
          .story-detail {
            width: 95% !important;
            padding: 1rem !important;
          }
          
          .story-detail h4 {
            font-size: 1.2rem;
            margin-bottom: 0.5rem;
          }
          
          .story-detail img {
            max-height: 300px !important;
          }
          
          .story-detail p {
            font-size: 0.9rem;
          }
          
          .story-detail .d-flex {
            flex-direction: column;
          }
          
          .story-detail .d-flex span {
            margin-bottom: 0.3rem;
            font-size: 0.8rem;
          }
        }
      `;
      document.head.appendChild(styleElement);
    }

    // 創建或重用遮罩層
    if (!modalOverlay) {
      modalOverlay = document.createElement("div");
      modalOverlay.className = "modal-backdrop";
      modalOverlay.style.cssText =
        "display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:1040;";
      document.body.appendChild(modalOverlay);

      // 點擊遮罩關閉詳情
      modalOverlay.addEventListener("click", () => {
        closeAllDetails();
      });

      // 添加ESC鍵關閉功能
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          closeAllDetails();
        }
      });
    }

    // 初始化Fancybox全局設置
    if (typeof $.fancybox !== "undefined") {
      $.fancybox.defaults.lang = "zh-TW";
      $.fancybox.defaults.i18n = {
        "zh-TW": {
          CLOSE: "關閉",
          NEXT: "下一張",
          PREV: "上一張",
          ERROR: "無法載入內容。<br/>請稍後再試。",
          PLAY_START: "開始幻燈片",
          PLAY_STOP: "暫停幻燈片",
          FULL_SCREEN: "全螢幕",
          THUMBS: "縮圖",
          DOWNLOAD: "下載",
          SHARE: "分享",
          ZOOM: "縮放",
        },
      };

      // 為移動設備優化Fancybox設置
      if (window.innerWidth <= 768) {
        $.fancybox.defaults.btnTpl.arrowLeft =
          '<button data-fancybox-prev class="fancybox-button fancybox-button--arrow_left" title="{{PREV}}"><span style="font-size:18px;">←</span></button>';
        $.fancybox.defaults.btnTpl.arrowRight =
          '<button data-fancybox-next class="fancybox-button fancybox-button--arrow_right" title="{{NEXT}}"><span style="font-size:18px;">→</span></button>';
      }
    }

    // 在DOM更新後載入數據並初始化UI
    setTimeout(async () => {
      const grid = document.getElementById("gallery-grid");
      if (!grid) return;

      // 載入JSON數據
      let data = [];
      try {
        const res = await fetch("./網站小故事.json");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        data = await res.json();
      } catch (e) {
        console.error("❌ 載入活動資料失敗：", e);
        if (grid) {
          grid.insertAdjacentHTML(
            "beforeend",
            `<div class="text-danger p-2">活動資料載入錯誤：${e.message}</div>`
          );
        }
        return;
      }

      // 清空舊的詳情視窗
      allDetails.forEach((detail) => detail.remove());
      allDetails = [];

      // 圖片預加載
      const imgLoadPromises = [];
      data.forEach((item, index) => {
        const promise = new Promise((resolve) => {
          const tempImg = new Image();
          tempImg.src = `活動照片/${item.連結}`;
          tempImg.onload = () => {
            const aspectRatio = tempImg.naturalWidth / tempImg.naturalHeight;

            // 根據屏幕寬度調整網格跨度
            let gridSpan = Math.ceil(20 / aspectRatio);
            // 在小屏幕上減小網格跨度
            if (window.innerWidth <= 768) {
              gridSpan = Math.min(Math.max(gridSpan * 0.6, 12), 25);
            } else if (window.innerWidth <= 991) {
              gridSpan = Math.min(Math.max(gridSpan * 0.8, 13), 30);
            } else {
              gridSpan = Math.min(Math.max(gridSpan, 15), 35);
            }

            resolve({
              index,
              width: tempImg.naturalWidth,
              height: tempImg.naturalHeight,
              aspectRatio,
              gridSpan,
            });
          };

          tempImg.onerror = () => {
            resolve({
              index,
              width: 300,
              height: 200,
              aspectRatio: 1.5,
              gridSpan: window.innerWidth <= 768 ? 15 : 20,
            });
          };
        });

        imgLoadPromises.push(promise);
      });

      // 等待所有圖片預加載完成
      const imgSizes = await Promise.all(imgLoadPromises);

      // 創建卡片
      imgSizes.forEach((sizeData, i) => {
        const item = data[sizeData.index];

        // 創建卡片元素
        const card = document.createElement("div");
        card.className = "story-card";
        card.style.setProperty("--card-height", `${sizeData.gridSpan}`);
        card.style.setProperty("--card-index", i);

        // 創建圖片元素
        const img = document.createElement("img");
        img.src = `活動照片/${item.連結}`;
        img.alt = item.預覽標題;
        img.loading = "lazy";

        // 預覽標題
        const preview = document.createElement("div");
        preview.className = "preview-title";
        preview.innerHTML = `<div class="fw-bold">${item.預覽標題}</div>`;

        // 詳細視窗 - 適應RWD
        const detail = document.createElement("div");
        detail.className =
          "story-detail position-fixed top-50 start-50 translate-middle bg-white border rounded p-4 shadow";
        detail.style.cssText =
          "display:none; width:800px; max-width:95%; max-height:90vh; overflow:auto; z-index:1050; transform:scale(0.8); opacity:0; transition:all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);";

        // 根據屏幕大小調整詳情內容佈局
        const isSmallScreen = window.innerWidth <= 768;
        const imageMaxHeight = isSmallScreen ? "300px" : "450px";
        const titleSize = isSmallScreen ? "fs-5" : "fs-4";
        const metaLayout = isSmallScreen
          ? "d-flex flex-column"
          : "d-flex justify-content-between";

        detail.innerHTML = `
          <button class="close-btn btn-close position-absolute top-0 end-0 m-3"></button>
          <h4 class="${titleSize} fw-bold mb-3">${item.預覽標題}</h4>
          <div class="mb-3">
            <a href="活動照片/${
              item.連結
            }" class="detail-image-link" data-fancybox="images-${i}" data-caption="${
          item.預覽標題
        }">
              <img src="活動照片/${item.連結}" alt="${
          item.預覽標題
        }" class="img-fluid rounded mb-3" 
                   style="max-height:${imageMaxHeight}; width:100%; object-fit:contain; display:block; margin:0 auto;">
            </a>
          </div>
          <p class="mb-3">${item.故事內文}</p>
          <div class="${metaLayout} text-secondary">
            <span><i class="bi bi-geo-alt-fill me-1"></i>${item.地點}</span>
            <span class="${
              isSmallScreen ? "mt-2" : ""
            }"><i class="bi bi-calendar-event me-1"></i>${item.時間}</span>
          </div>
        `;

        allDetails.push(detail);

        // 組合元素
        card.appendChild(img);
        card.appendChild(preview);
        document.body.appendChild(detail);
        grid.appendChild(card);

        // 點擊卡片顯示詳情
        card.addEventListener("click", () => {
          closeAllDetails();
          modalOverlay.style.display = "block";
          detail.style.display = "block";
          setTimeout(() => {
            detail.style.opacity = "1";
            detail.style.transform = "scale(1) translate(-50%, -50%)";

            // 初始化該詳情視窗內的 Fancybox
            if (typeof $.fancybox !== "undefined") {
              $(`[data-fancybox="images-${i}"]`).fancybox({
                buttons: ["zoom", "slideShow", "fullScreen", "close"],
                animationEffect: "zoom",
                transitionEffect: "fade",
                infobar: true,
                touch: {
                  vertical: true,
                  momentum: true,
                },
                wheel: true,
                toolbar: true,
                arrows: true,
                clickContent: false,
                dblclickContent: function (current, event) {
                  return current.type === "image" ? "zoom" : false;
                },
                clickSlide: "close",
                mobile: {
                  preventCaptionOverlap: false,
                  idleTime: false,
                  clickContent: function (current, event) {
                    return current.type === "image" ? "toggleControls" : false;
                  },
                  dblclickContent: function (current, event) {
                    return current.type === "image" ? "zoom" : false;
                  },
                },
              });
            }
          }, 10);
        });

        // 關閉按鈕
        detail.querySelector(".close-btn").addEventListener("click", (e) => {
          e.stopPropagation();
          closeDetail(detail);
        });
      });
    }, 100);

    // 返回卡片HTML數組
    return [galleryCardHtml];
  };

  // 關閉詳情視窗的函數
  function closeDetail(detail) {
    // 先關閉可能打開的 Fancybox
    if (typeof $.fancybox !== "undefined" && $.fancybox.getInstance()) {
      $.fancybox.close();
    }

    detail.style.opacity = "0";
    detail.style.transform = "scale(0.8) translate(-50%, -50%)";

    setTimeout(() => {
      detail.style.display = "none";
      if (!document.querySelector('.story-detail[style*="opacity: 1"]')) {
        modalOverlay.style.display = "none";
      }
    }, 300);
  }

  // 關閉所有詳情視窗的函數
  function closeAllDetails() {
    // 先關閉可能打開的 Fancybox
    if (typeof $.fancybox !== "undefined" && $.fancybox.getInstance()) {
      $.fancybox.close();
    }

    allDetails.forEach((detail) => {
      if (detail.style.display !== "none") {
        closeDetail(detail);
      }
    });
  }

  // 響應視窗大小調整卡片佈局
  function updateGalleryLayout() {
    const galleryCard = document.querySelector(".gallery-card");
    if (!galleryCard) return;

    if (window.innerWidth <= 576) {
      galleryCard.style.width = "100%";
      galleryCard.style.padding = "0.5rem";
    } else if (window.innerWidth <= 991) {
      galleryCard.style.width = "90%";
      galleryCard.style.maxWidth = "900px";
    } else {
      galleryCard.style.width = "95%";
      galleryCard.style.maxWidth = "1200px";
    }
  }

  // 清理函數
  function cleanup() {
    // 關閉所有詳情視窗
    closeAllDetails();

    // 移除遮罩
    if (modalOverlay) {
      modalOverlay.remove();
      modalOverlay = null;
    }

    // 移除樣式表
    const styleElement = document.getElementById("gallery-grid-styles");
    if (styleElement) {
      styleElement.remove();
    }

    // 移除所有詳情視窗
    allDetails.forEach((detail) => detail.remove());
    allDetails = [];
  }

  // 獲取按鈕元素
  const btn = document.getElementById("toggle-gallery-btn");

  // 綁定按鈕點擊事件
  btn.addEventListener("click", () => {
    // 檢查是否已存在活動集錦卡片
    const existingGalleryCard = document.querySelector(
      '[data-component="gallery"]'
    );

    if (!existingGalleryCard) {
      // 載入活動集錦卡片並使用修改後的switchComponent函數
      const galleryCards = window.loadGalleryCards();
      window.switchComponent("gallery", galleryCards, "toggle");
      const iconHtml =
        window.innerWidth < 992 ? '<i class="bi bi-images me-2"></i>' : "";
      btn.innerHTML = `${iconHtml}隱藏活動集錦`;

      // 初始化佈局
      setTimeout(updateGalleryLayout, 100);
    } else {
      // 清理資源
      cleanup();

      // 切換卡片，新函數會處理關閉卡片
      window.switchComponent("gallery", [], "toggle");
      const iconHtml =
        window.innerWidth < 992 ? '<i class="bi bi-images me-2"></i>' : "";
      btn.innerHTML = `${iconHtml}活動集錦`;
    }
  });
})();
