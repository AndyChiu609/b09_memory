// picture-wall.js — 照片牆功能（整合Cloudinary圖片和Fancybox特效，使用主HTML動畫系統，增加RWD支持）
(() => {
  console.log("👉 picture-wall.js 已載入");

  // 確保按鈕存在
  let btn = document.getElementById("toggle-picture-wall-btn");
  if (!btn) {
    // 建立導航按鈕
    btn = document.createElement("button");
    btn.id = "toggle-picture-wall-btn";
    btn.className = "btn btn-outline-primary btn-lg rounded-pill";
    btn.textContent = "照片牆";

    // 找到導航欄並插入新按鈕
    const nav = document.querySelector("header nav");
    // 插入到"活動集錦"按鈕之後
    const galleryBtn = document.getElementById("toggle-gallery-btn");
    if (galleryBtn) {
      nav.insertBefore(btn, galleryBtn.nextSibling);
    } else {
      nav.appendChild(btn);
    }
  }

  // 定義全域函數 - 載入照片牆卡片HTML
  window.loadPictureWallCards = function () {
    // 創建包含卡片和所有相關元素的HTML
    const pictureWallCardHtml = `
      <div class="card m-2 m-md-3 p-2 p-md-3 border border-secondary border-opacity-50 picture-wall-card">
        <div class="card-header fs-5 fw-bold text-center mb-2 mb-md-3">畢業紀念照片牆</div>
        <div id="picture-wall-grid" class="picture-wall-grid"></div>
      </div>
    `;

    // 添加自定義CSS到頁面
    if (!document.getElementById("picture-wall-styles")) {
      const styleElement = document.createElement("style");
      styleElement.id = "picture-wall-styles";
      styleElement.textContent = `
        /* 響應式卡片容器 */
        .picture-wall-card {
          width: 95%;
          max-width: 1300px;
          height: auto;
          max-height: 80vh;
          overflow: auto;
          margin: 0 auto;
        }
        
        @media (max-width: 576px) {
          .picture-wall-card {
            width: 100%;
            max-height: 75vh;
            margin: 0.5rem auto;
            padding: 0.5rem !important;
          }
          .picture-wall-card .card-header {
            font-size: 1.1rem !important;
            padding: 0.5rem;
            margin-bottom: 0.5rem !important;
          }
        }
        
        /* 響應式網格佈局 */
        .picture-wall-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          grid-gap: 15px;
          grid-auto-rows: 10px;
        }
        
        @media (max-width: 768px) {
          .picture-wall-grid {
            grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
            grid-gap: 10px;
          }
        }
        
        @media (min-width: 769px) and (max-width: 991px) {
          .picture-wall-grid {
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
            grid-gap: 12px;
          }
        }
        
        .picture-card {
          grid-row-end: span var(--card-height, 25);
          overflow: hidden;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          cursor: pointer;
          position: relative;
        }
        
        .picture-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.2);
        }
        
        /* 在小螢幕上減少懸停動畫幅度 */
        @media (max-width: 768px) {
          .picture-card:hover {
            transform: translateY(-2px);
          }
        }
        
        .picture-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.5s ease;
          transform: scale(1.5);
        }
        
        .picture-card:hover img {
          transform: scale(0.9);
        }
        
        /* 在觸摸設備上優化縮放效果 */
        @media (hover: none) {
          .picture-card img {
            transform: scale(1.2);
          }
          
          .picture-card:hover img {
            transform: scale(1);
          }
        }
        
        /* 添加滑入動畫 */
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .picture-card {
          animation: fadeInUp 0.4s forwards;
          animation-delay: calc(var(--card-index) * 0.05s);
          opacity: 0;
        }
        
        /* 移動設備上減少動畫延遲，加速載入 */
        @media (max-width: 768px) {
          .picture-card {
            animation-delay: calc(var(--card-index) * 0.03s);
          }
        }
        
        /* Fancybox 自定義樣式 */
        .fancybox-caption {
          font-family: 'Noto Sans TC', sans-serif;
          font-size: 16px;
        }
        
        /* 移動設備上的Fancybox控制項優化 */
        @media (max-width: 768px) {
          .fancybox-navigation .fancybox-button {
            padding: 12px !important;
          }
          
          .fancybox-button {
            padding: 10px !important;
          }
          
          .fancybox-caption {
            font-size: 14px;
            padding: 8px 12px;
          }
        }
      `;
      document.head.appendChild(styleElement);
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
      const grid = document.getElementById("picture-wall-grid");
      if (!grid) return;

      // 載入JSON數據
      let data = [];
      try {
        const res = await fetch("./cloudinary_images.json");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        data = await res.json();
      } catch (e) {
        console.error("❌ 載入照片資料失敗：", e);

        // 測試用：如果無法載入JSON，使用預設資料
        data = [
          {
            name: "何震偉_02",
            url: "https://res.cloudinary.com/dy1rjjukz/image/upload/v1746892881/%E7%B6%B2%E7%AB%99%E7%94%A8/%E4%BD%95%E9%9C%87%E5%81%89_02_smumrl.jpg",
          },
          {
            name: "何震偉_08",
            url: "https://res.cloudinary.com/dy1rjjukz/image/upload/v1746892883/%E7%B6%B2%E7%AB%99%E7%94%A8/%E4%BD%95%E9%9C%87%E5%81%89_08_zh9lga.jpg",
          },
          {
            name: "何震偉_25",
            url: "https://res.cloudinary.com/dy1rjjukz/image/upload/v1746892921/%E7%B6%B2%E7%AB%99%E7%94%A8/%E4%BD%95%E9%9C%87%E5%81%89_25_gvz3go.jpg",
          },
          {
            name: "廖迅威_01",
            url: "https://res.cloudinary.com/dy1rjjukz/image/upload/v1746892923/%E7%B6%B2%E7%AB%99%E7%94%A8/%E5%BB%96%E8%BF%85%E5%A8%81_01_qgzkyc.jpg",
          },
          {
            name: "廖迅威_02",
            url: "https://res.cloudinary.com/dy1rjjukz/image/upload/v1746892922/%E7%B6%B2%E7%AB%99%E7%94%A8/%E5%BB%96%E8%BF%85%E5%A8%81_02_aw9nhp.jpg",
          },
        ];
      }

      // 圖片預加載
      const imgLoadPromises = [];
      data.forEach((item, index) => {
        const promise = new Promise((resolve) => {
          const tempImg = new Image();
          tempImg.src = item.url;
          tempImg.onload = () => {
            const aspectRatio = tempImg.naturalWidth / tempImg.naturalHeight;

            // 根據屏幕寬度調整網格跨度
            let gridSpan = Math.ceil(25 / aspectRatio);

            // 在小屏幕上減小網格跨度，但保持原始比例關係
            if (window.innerWidth <= 768) {
              gridSpan = Math.min(Math.max(gridSpan * 0.65, 13), 30);
            } else if (window.innerWidth <= 991) {
              gridSpan = Math.min(Math.max(gridSpan * 0.8, 15), 35);
            } else {
              gridSpan = Math.min(Math.max(gridSpan, 15), 40);
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
              height: 300,
              aspectRatio: 1,
              gridSpan: window.innerWidth <= 768 ? 18 : 25,
            });
          };
        });

        imgLoadPromises.push(promise);
      });

      // 等待所有圖片預加載完成
      const imgSizes = await Promise.all(imgLoadPromises);

      // 創建圖片牆
      imgSizes.forEach((sizeData, i) => {
        const item = data[sizeData.index];

        // 創建卡片元素
        const card = document.createElement("div");
        card.className = "picture-card";
        card.style.setProperty("--card-height", `${sizeData.gridSpan}`);
        card.style.setProperty("--card-index", i);

        // 創建圖片元素，整合Fancybox
        const link = document.createElement("a");
        link.href = item.url;
        link.dataset.fancybox = "picture-wall";
        link.dataset.caption = item.name;

        const img = document.createElement("img");
        img.src = item.url;
        img.alt = item.name;
        img.loading = "lazy"; // 延遲加載提高性能

        link.appendChild(img);
        card.appendChild(link);
        grid.appendChild(card);
      });

      // 初始化 Fancybox
      if (typeof $.fancybox !== "undefined") {
        $('[data-fancybox="picture-wall"]').fancybox({
          buttons: ["zoom", "slideShow", "fullScreen", "close"],
          animationEffect: "zoom-in-out",
          transitionEffect: "circular",
          infobar: true,
          touch: {
            vertical: true, // 允許垂直滑動
            momentum: true, // 增加慣性效果
          },
          wheel: true, // 允許滾輪縮放
          toolbar: true, // 顯示工具欄
          arrows: true, // 顯示切換箭頭
          loop: true, // 循環瀏覽
          // 移動設備上的優化配置
          mobile: {
            preventCaptionOverlap: false,
            idleTime: false,
            clickContent: function (current, event) {
              return current.type === "image" ? "toggleControls" : false;
            },
            dblclickContent: function (current, event) {
              return current.type === "image" ? "zoom" : false;
            },
            arrows: true, // 確保移動設備上顯示箭頭
          },
          beforeShow: function (instance, current) {
            // 可以在這裡添加自定義行為
          },
        });
      }

      // 初始化響應式佈局
      updatePictureWallLayout();
    }, 100);

    // 返回卡片HTML數組
    return [pictureWallCardHtml];
  };

  // 響應視窗大小變化
  function updatePictureWallLayout() {
    const pictureWallCard = document.querySelector(".picture-wall-card");
    if (!pictureWallCard) return;

    // 根據視窗大小調整容器
    if (window.innerWidth <= 576) {
      pictureWallCard.style.width = "100%";
      pictureWallCard.style.padding = "0.5rem";
    } else if (window.innerWidth <= 991) {
      pictureWallCard.style.width = "95%";
      pictureWallCard.style.maxWidth = "900px";
      pictureWallCard.style.padding = "0.75rem";
    } else {
      pictureWallCard.style.width = "95%";
      pictureWallCard.style.maxWidth = "1300px";
      pictureWallCard.style.padding = "1rem";
    }
  }

  // 清理函數
  function cleanup() {
    // 關閉 Fancybox 如果開啟的話
    if (typeof $.fancybox !== "undefined" && $.fancybox.getInstance()) {
      $.fancybox.close();
    }

    // 移除添加的樣式表
    const styleElement = document.getElementById("picture-wall-styles");
    if (styleElement) {
      styleElement.remove();
    }
  }

  // 獲取按鈕元素
  btn = document.getElementById("toggle-picture-wall-btn");

  // 綁定按鈕點擊事件
  btn.addEventListener("click", () => {
    // 檢查是否已存在照片牆卡片
    const existingPictureWallCard = document.querySelector(
      '[data-component="pictureWall"]'
    );

    if (!existingPictureWallCard) {
      // 載入照片牆卡片並使用修改後的switchComponent函數
      const pictureWallCards = window.loadPictureWallCards();
      window.switchComponent("pictureWall", pictureWallCards, "toggle");

      // 更新按鈕文字
      const iconHtml =
        window.innerWidth < 992 ? '<i class="bi bi-grid-3x3 me-2"></i>' : "";
      btn.innerHTML = `${iconHtml}隱藏照片牆`;

      // 初始化響應式佈局
      setTimeout(updatePictureWallLayout, 100);
    } else {
      // 清理資源
      cleanup();

      // 切換卡片，新函數會處理關閉卡片
      window.switchComponent("pictureWall", [], "toggle");

      // 更新按鈕文字
      const iconHtml =
        window.innerWidth < 992 ? '<i class="bi bi-grid-3x3 me-2"></i>' : "";
      btn.innerHTML = `${iconHtml}照片牆`;
    }
  });
})();
