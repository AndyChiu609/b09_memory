// credits.js — 「工作人員名單」卡片切換（參考gallery.js設計，使用主HTML動畫系統，添加RWD支持）
(() => {
  console.log("👉 credits.js 已載入");

  // 全局變量
  let allDetails = [];
  let modalOverlay = null;
  let resizeListenerAdded = false;

  // 定義全域函數 - 載入工作人員名單卡片HTML
  window.loadCreditsCards = function () {
    // 創建包含卡片和所有相關元素的HTML
    const creditsCardHtml = `
      <div class="card m-2 m-md-3 p-2 p-md-3 border border-secondary border-opacity-50 credits-card">
        <div class="card-header fs-5 fw-bold text-center mb-2 mb-md-3">工作人員名單</div>
        <div id="credits-grid" class="credits-masonry-grid"></div>
      </div>
    `;

    // 添加自定義CSS到頁面
    if (!document.getElementById("credits-grid-styles")) {
      const styleElement = document.createElement("style");
      styleElement.id = "credits-grid-styles";
      styleElement.textContent = `
        /* 響應式卡片樣式 */
        .credits-card {
          width: 95%;
          max-width: 1200px;
          height: auto;
          max-height: 80vh;
          overflow: auto;
          margin: 0 auto;
        }
        
        @media (max-width: 576px) {
          .credits-card {
            width: 100%;
            max-height: 75vh;
            margin: 0.5rem auto;
            padding: 0.5rem !important;
          }
          .credits-card .card-header {
            font-size: 1.1rem !important;
            padding: 0.5rem;
            margin-bottom: 0.5rem !important;
          }
        }
        
        /* 響應式網格佈局 */
        .credits-masonry-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          grid-gap: 20px;
          padding: 15px;
        }
        
        @media (max-width: 768px) {
          .credits-masonry-grid {
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            grid-gap: 15px;
            padding: 10px;
          }
        }
        
        @media (min-width: 769px) and (max-width: 991px) {
          .credits-masonry-grid {
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          }
        }
        
        .staff-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          overflow: hidden;
          position: relative;
          transition: all 0.3s ease;
          cursor: pointer;
          border: 2px solid transparent;
        }
        
        .staff-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
          border-color: #0d6efd;
        }
        
        .staff-card img {
          width: 100%;
          aspect-ratio: 1 / 1;
          object-fit: cover;
          display: block;
          transition: transform 0.3s ease;
          transform: scale(1.05);
        }
        
        .staff-card:hover img {
          transform: scale(0.95);
        }
        
        .staff-info {
          padding: 15px;
        }
        
        @media (max-width: 768px) {
          .staff-info {
            padding: 12px;
          }
        }
        
        .staff-name {
          font-size: 1.1rem;
          font-weight: 600;
          color: #333;
          margin-bottom: 5px;
        }
        
        .staff-position {
          font-size: 0.9rem;
          color: #0d6efd;
          font-weight: 500;
          margin-bottom: 8px;
        }
        
        .staff-preview {
          font-size: 0.85rem;
          color: #666;
          line-height: 1.4;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        
        /* 添加滑入動畫 */
        @keyframes fadeInUp {
          from { 
            opacity: 0; 
            transform: translateY(30px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        .staff-card {
          animation: fadeInUp 0.4s forwards;
          animation-delay: calc(var(--card-index) * 0.1s);
          opacity: 0;
        }
        
        /* 工作人員詳情視窗響應式樣式 */
        .staff-detail {
          width: 95% !important;
          max-width: 600px !important;
          max-height: 90vh !important;
          padding: 2rem !important;
          background: white;
          border-radius: 15px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }
        
        @media (max-width: 768px) {
          .staff-detail {
            width: 95% !important;
            padding: 1.5rem !important;
            max-height: 85vh !important;
          }
          
          .staff-detail h4 {
            font-size: 1.3rem;
            margin-bottom: 0.5rem;
          }
          
          .staff-detail .staff-detail-photo {
            max-height: 250px !important;
          }
          
          .staff-detail p {
            font-size: 0.95rem;
          }
          
          .staff-detail .staff-meta {
            flex-direction: column;
            gap: 0.5rem;
          }
          
          .staff-detail .staff-meta span {
            font-size: 0.9rem;
          }
        }
        
        .staff-detail-photo {
          width: 200px;
          height: 200px;
          border-radius: 50%;
          object-fit: cover;
          border: 4px solid #f8f9fa;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        @media (max-width: 768px) {
          .staff-detail-photo {
            width: 150px;
            height: 150px;
          }
        }
        
        .staff-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e9ecef;
        }
        
        .close-btn {
          position: absolute;
          top: 15px;
          right: 15px;
          background: #f8f9fa;
          border: none;
          border-radius: 50%;
          width: 35px;
          height: 35px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .close-btn:hover {
          background: #e9ecef;
          transform: scale(1.1);
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

    // 在DOM更新後載入數據並初始化UI
    setTimeout(async () => {
      const grid = document.getElementById("credits-grid");
      if (!grid) return;

      // 載入JSON數據
      let data = [];
      try {
        const res = await fetch("./credits.json");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        data = await res.json();
      } catch (e) {
        console.error("❌ 載入工作人員資料失敗：", e);
        if (grid) {
          grid.insertAdjacentHTML(
            "beforeend",
            `<div class="text-danger p-2">工作人員資料載入錯誤：${e.message}</div>`
          );
        }
        return;
      }

      // 清空舊的詳情視窗
      allDetails.forEach((detail) => detail.remove());
      allDetails = [];

      // 創建工作人員卡片
      data.forEach((person, index) => {
        // 創建卡片元素
        const card = document.createElement("div");
        card.className = "staff-card";
        card.style.setProperty("--card-index", index);

        // 創建圖片元素
        const img = document.createElement("img");
        img.src = `credit_pic/${person.photo}`;
        img.alt = person.name;
        img.className = "staff-photo";
        img.loading = "lazy";

        // 工作人員資訊
        const info = document.createElement("div");
        info.className = "staff-info";

        info.innerHTML = `
          <div class="staff-name">${person.name}</div>
          <div class="staff-position">${person.position}</div>
        `;

        // 詳細視窗 - 適應RWD
        const detail = document.createElement("div");
        detail.className =
          "staff-detail position-fixed top-50 start-50 translate-middle";
        detail.style.cssText =
          "display:none; z-index:1050; transform:scale(0.8); opacity:0; transition:all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);";

        const isSmallScreen = window.innerWidth <= 768;
        const titleSize = isSmallScreen ? "fs-5" : "fs-4";

        detail.innerHTML = `
          <button class="close-btn" aria-label="關閉">
            <i class="bi bi-x-lg"></i>
          </button>
          <div class="text-center mb-3">
            <a href="credit_pic/${person.photo}" data-fancybox="staff-photo-${index}" data-caption="${person.name}">
              <img src="credit_pic/${person.photo}" alt="${person.name}" class="staff-detail-photo mb-3" style="cursor: zoom-in;">
            </a>
            <h4 class="${titleSize} fw-bold mb-1">${person.name}</h4>
            <div class="text-primary fw-medium mb-2">${person.position}</div>
          </div>
          <div class="border rounded p-3 bg-light">
            <h6 class="text-secondary mb-2">
              <i class="bi bi-chat-quote-fill me-1"></i>想說的話
            </h6>
            <p class="mb-0 lh-base">${person.message}</p>
          </div>
          <div class="staff-meta">
            <span class="text-muted">
              <i class="bi bi-calendar-event me-1"></i>${person.timestamp}
            </span>
          </div>
        `;

        allDetails.push(detail);

        // 組合元素
        card.appendChild(img);
        card.appendChild(info);
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
              $(`[data-fancybox="staff-photo-${index}"]`).fancybox({
                buttons: ["zoom", "fullScreen", "close"],
                animationEffect: "zoom",
                transitionEffect: "fade",
                infobar: true,
                touch: {
                  vertical: true,
                  momentum: true,
                },
                wheel: true,
                toolbar: true,
                arrows: false,
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

        // 圖片載入錯誤處理
        img.onerror = () => {
          img.src =
            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDIwMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTgwIiBmaWxsPSIjZjhmOWZhIi8+CjxwYXRoIGQ9Ik0xMDAgNjBDMTA4LjI4NCA2MCA5NSA3My4yODQgOTUgODVTMTA4LjI4NCAxMTAgMTAwIDExMFM4NS4yODQgOTcuNzE2IDc1IDg1UzgxLjcxNiA2MCA5MCA2MEg5MFoiIGZpbGw9IiNkZWUyZTYiLz4KPHN2Zz4K";
          img.alt = `${person.name} 的照片載入失敗`;
        };
      });

      // 如果還沒有添加resize監聽器，添加它
      if (!resizeListenerAdded) {
        window.addEventListener("resize", updateCreditsLayout);
        resizeListenerAdded = true;
      }

      // 初始化佈局
      updateCreditsLayout();
    }, 100);

    // 返回卡片HTML數組
    return [creditsCardHtml];
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
      if (!document.querySelector('.staff-detail[style*="opacity: 1"]')) {
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
  function updateCreditsLayout() {
    const creditsCard = document.querySelector(".credits-card");
    if (!creditsCard) return;

    if (window.innerWidth <= 576) {
      creditsCard.style.width = "100%";
      creditsCard.style.padding = "0.5rem";
    } else if (window.innerWidth <= 991) {
      creditsCard.style.width = "90%";
      creditsCard.style.maxWidth = "900px";
    } else {
      creditsCard.style.width = "95%";
      creditsCard.style.maxWidth = "1200px";
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
    const styleElement = document.getElementById("credits-grid-styles");
    if (styleElement) {
      styleElement.remove();
    }

    // 移除所有詳情視窗
    allDetails.forEach((detail) => detail.remove());
    allDetails = [];

    // 移除resize事件監聽器
    if (resizeListenerAdded) {
      window.removeEventListener("resize", updateCreditsLayout);
      resizeListenerAdded = false;
    }
  }

  // 獲取按鈕元素
  const btn = document.getElementById("toggle-credits-btn");
  if (!btn) return; // 如果按鈕不存在，退出

  // 綁定按鈕點擊事件 - 統一使用 gallery.js 的邏輯
  btn.addEventListener("click", () => {
    // 檢查是否已存在工作人員名單卡片
    const existingCreditsCard = document.querySelector(
      '[data-component="credits"]'
    );

    if (!existingCreditsCard) {
      // 載入工作人員名單卡片並使用修改後的switchComponent函數
      const creditsCards = window.loadCreditsCards();
      window.switchComponent("credits", creditsCards, "toggle");

      // 更新按鈕文字
      const btnTextElement = btn.querySelector(".btn-text");
      if (btnTextElement) {
        btnTextElement.textContent = "隱藏credit";
      }

      // 改變按鈕顏色為實心
      btn.classList.remove("btn-outline-primary");
      btn.classList.add("btn-primary");
      // 🔑 同步 Bootstrap Toggle 狀態
      btn.classList.add("active");
      btn.setAttribute("aria-pressed", "true");
    } else {
      // 清理資源
      cleanup();

      // 切換卡片，新函數會處理關閉卡片
      window.switchComponent("credits", [], "toggle");

      // 更新按鈕文字
      const btnTextElement = btn.querySelector(".btn-text");
      if (btnTextElement) {
        btnTextElement.textContent = "credit";
      }

      // 恢復按鈕顏色為空心
      btn.classList.remove("btn-primary");
      btn.classList.add("btn-outline-primary");
      // 🔑 同步 Bootstrap Toggle 狀態
      btn.classList.remove("active");
      btn.setAttribute("aria-pressed", "false");
    }
  });
})();
