const bgImg = document.getElementById('bg-img');
const toggleBtn = document.getElementById('toggle-bg-btn');

let isHidden = false;

toggleBtn.addEventListener('click', () => {
  isHidden = !isHidden;
  
  // 設置背景圖片透明度
  bgImg.style.opacity = isHidden ? '0' : '0.5';
  
  // 更新按鈕文字
  toggleBtn.textContent = isHidden ? '恢復背景' : '我要看背景';
});