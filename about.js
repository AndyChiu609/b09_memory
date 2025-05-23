// about.js — 「關於我們」卡片切換（使用主HTML的動畫系統並增加RWD支持）
(() => {
  console.log("👉 about.js 已載入");

  // 全局變量來追踪事件監聽器是否已綁定
  let resizeListenerAdded = false;

  // 添加RWD特定樣式
  function addAboutStyles() {
    // 檢查樣式是否已經存在，如果存在則移除舊的
    const existingStyle = document.getElementById("about-card-styles");
    if (existingStyle) {
      existingStyle.remove();
    }

    const styleElement = document.createElement("style");
    styleElement.id = "about-card-styles";
    styleElement.textContent = `
      /* 關於我們卡片響應式樣式 */
      .about-card {
        width: 95%;
        max-width: 900px;
        margin: 1rem auto;
        transition: all 0.3s ease;
      }
      
      @media (max-width: 576px) {
        .about-card {
          width: 100%;
          margin: 0.5rem auto;
        }
        .about-card .card-header {
          font-size: 1.1rem !important;
          padding: 0.5rem;
        }
        .about-card .about-content {
          padding: 1rem;
        }
      }
      
      @media (min-width: 577px) and (max-width: 991px) {
        .about-card {
          width: 90%;
          max-width: 750px;
        }
      }
      
      /* 關於我們內容樣式 */
      .about-content {
        padding: 1.5rem;
        line-height: 1.8;
      }
      
      .about-section {
        margin-bottom: 2rem;
      }
      
      .about-section:last-child {
        margin-bottom: 0;
      }
      
      .about-section h5 {
        color: #0d6efd;
        font-weight: 600;
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid #e9ecef;
      }
      
      .about-section p {
        color: #495057;
        margin-bottom: 1rem;
      }
      
      .highlight-box {
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        border-left: 4px solid #0d6efd;
        padding: 1.5rem;
        border-radius: 0.5rem;
        margin: 1.5rem 0;
      }
      
      .stat-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
        margin: 2rem 0;
      }
      
      .stat-item {
        text-align: center;
        padding: 1.5rem;
        background: white;
        border-radius: 0.75rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        transition: transform 0.3s ease;
      }
      
      .stat-item:hover {
        transform: translateY(-3px);
      }
      
      .stat-number {
        font-size: 2.5rem;
        font-weight: 700;
        color: #0d6efd;
        display: block;
        line-height: 1;
      }
      
      .stat-label {
        font-size: 0.9rem;
        color: #6c757d;
        margin-top: 0.5rem;
      }
      
      @media (max-width: 768px) {
        .about-content {
          padding: 1rem;
        }
        
        .stat-grid {
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
        }
        
        .stat-item {
          padding: 1rem;
        }
        
        .stat-number {
          font-size: 2rem;
        }
        
        .highlight-box {
          padding: 1rem;
          margin: 1rem 0;
        }
      }
      
      /* 添加入場動畫 */
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .about-section {
        animation: fadeInUp 0.6s ease forwards;
        animation-delay: calc(var(--section-index) * 0.2s);
        opacity: 0;
      }
    `;
    document.head.appendChild(styleElement);
  }

  // 根據視窗大小調整關於我們卡片布局
  function updateAboutCardLayout() {
    const aboutCard = document.querySelector(".about-card");
    if (!aboutCard) return;

    // 調整卡片寬度和間距
    if (window.innerWidth < 576) {
      // 手機尺寸
      aboutCard.style.width = "100%";
      aboutCard.style.padding = "0.5rem";
    } else if (window.innerWidth < 992) {
      // 平板尺寸
      aboutCard.style.width = "90%";
      aboutCard.style.padding = "0.75rem";
    } else {
      // 桌面尺寸
      aboutCard.style.width = "95%";
      aboutCard.style.maxWidth = "900px";
      aboutCard.style.padding = "1rem";
    }
  }

  // 定義全域函數 - 載入關於我們卡片HTML
  window.loadAboutCards = function () {
    // 添加樣式
    addAboutStyles();

    const aboutCardHtml = `
      <div class="card p-2 p-md-3 border border-secondary border-opacity-50 about-card">
        <div class="card-header fs-5 fw-bold text-center mb-2 mb-md-3">關於我們</div>
        <div class="about-content">
          
          <div class="about-section" style="--section-index: 0">
            <h5><i class="bi bi-mortarboard-fill me-2"></i>NTU GEOG B10</h5>
            <p>我們是台灣大學地理環境資源學系 B10 屆的畢業生。在這四年的求學過程中，我們一起探索了地理學的奧秘，從人文地理到自然地理，從 GIS 技術到田野調查，每一個領域都留下了我們共同學習的足跡。</p>
            
            <div class="highlight-box">
              <p class="mb-0"><strong>地理學不只是地圖和位置，更是理解世界運作方式的鑰匙。</strong><br>
              我們學會用地理的眼光看待社會、環境與空間的互動關係，培養了跨領域的思維能力。</p>
            </div>
          </div>

          <div class="about-section" style="--section-index: 1">
            <h5><i class="bi bi-people-fill me-2"></i>我們的旅程</h5>
            <p>從大一的地理學概論開始，我們一步步深入了解這個學科的豐富內涵。無論是踏查台北盆地的地形變遷，還是分析都市空間的社會結構，每一次的學習都讓我們對這個世界有更深的認識。</p>
            <p>四年來，我們不僅在課堂上學習理論知識，更重要的是透過實習、田野調查、專題研究等實作經驗，培養了分析問題和解決問題的能力。</p>
          </div>

          <div class="stat-grid about-section" style="--section-index: 2">
            <div class="stat-item">
              <span class="stat-number">4</span>
              <div class="stat-label">年求學時光</div>
            </div>
            <div class="stat-item">
              <span class="stat-number">30+</span>
              <div class="stat-label">班級同學</div>
            </div>
            <div class="stat-item">
              <span class="stat-number">100+</span>
              <div class="stat-label">學分修習</div>
            </div>
            <div class="stat-item">
              <span class="stat-number">∞</span>
              <div class="stat-label">珍貴回憶</div>
            </div>
          </div>

          <div class="about-section" style="--section-index: 3">
            <h5><i class="bi bi-heart-fill me-2"></i>感謝與展望</h5>
            <p>感謝所有任課老師的悉心指導，感謝同窗好友的相伴成長，也感謝家人的支持與鼓勵。地理系不僅給了我們專業知識，更重要的是培養了我們的人文關懷和全球視野。</p>
            <p>即將踏出校園，我們將帶著在地理系學到的知識和技能，在各自的道路上發光發熱。無論走到哪裡，我們都會記得自己是台大地理人，永遠以此為榮。</p>
            
            <div class="highlight-box">
              <p class="mb-0 text-center"><strong>🎓 台灣大學地理環境資源學系 B10 屆 🎓</strong><br>
              <em>「用地理的眼光看世界，用熱忱的心改變未來」</em></p>
            </div>
          </div>

        </div>
      </div>
    `;

    // 註冊初始化監聽器 - 當卡片完成進場動畫後執行初始化
    setTimeout(() => {
      // 初始化佈局
      updateAboutCardLayout();

      // 如果還沒有添加resize監聽器，添加它
      if (!resizeListenerAdded) {
        window.addEventListener("resize", updateAboutCardLayout);
        resizeListenerAdded = true;
      }
    }, 300); // 增加延遲時間確保DOM完全更新

    // 返回卡片HTML數組
    return [aboutCardHtml];
  };

  // 清理函數 - 移除所有添加的資源和事件監聽器
  function cleanup() {
    // 移除resize事件監聽器
    if (resizeListenerAdded) {
      window.removeEventListener("resize", updateAboutCardLayout);
      resizeListenerAdded = false;
    }

    // 移除樣式表
    const styleElement = document.getElementById("about-card-styles");
    if (styleElement) {
      styleElement.remove();
    }
  }

  // 獲取按鈕元素
  const btn = document.getElementById("toggle-about-btn");
  if (!btn) return; // 如果按鈕不存在，退出

  // 綁定按鈕點擊事件 - 統一使用 gallery.js 的邏輯
  btn.addEventListener("click", () => {
    // 檢查是否已存在關於我們卡片
    const existingAboutCard = document.querySelector(
      '[data-component="about"]'
    );

    if (!existingAboutCard) {
      // 載入關於我們卡片並使用修改後的switchComponent函數
      const aboutCards = window.loadAboutCards();
      window.switchComponent("about", aboutCards, "toggle");

      // 更新按鈕文字
      const btnTextElement = btn.querySelector(".btn-text");
      if (btnTextElement) {
        btnTextElement.textContent = "隱藏關於我們";
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
      window.switchComponent("about", [], "toggle");

      // 更新按鈕文字
      const btnTextElement = btn.querySelector(".btn-text");
      if (btnTextElement) {
        btnTextElement.textContent = "關於我們";
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
