import anime from 'animejs';

// 答案icon&解釋：惡意來源
const whyIcons = {
  sns: "✉️",
  software: "💻",
  update: "🔧",
  usb: "🔌",
  social: "😈",
  network: "🌐"
};
const whyAnswers = {
  sns: "透過假冒通知、公司或親友的不明來信或連結，點擊後即感染。",
  software: "下載/安裝來路不明或盜版軟體，常內藏勒索病毒。",
  update: "系統或軟體長期未更新，產生漏洞，容易被入侵。",
  usb: "插入陌生隨身碟/裝置，內藏病毒自動執行感染。",
  social: "社交工程詐騙，誘導提供密碼或點擊惡意連結。",
  network: "服務對外開放、弱密碼或遠端桌面，容易遭攻擊。"
};

// 點選成因按鈕時顯示說明
document.querySelectorAll('.cause-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.cause-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const k = btn.dataset.answer;
    const answerBox = document.getElementById('why-answer');
    answerBox.style.opacity = 0;
    setTimeout(() => {
      answerBox.innerHTML = `<span style="font-size:1.3em;margin-right:0.62em;">${whyIcons[k]}</span>${whyAnswers[k]}`;
      anime({
        targets: answerBox,
        opacity: [0, 1],
        translateY: [18, 0],
        duration: 340,
        easing: 'easeOutCubic'
      });
    }, 90);
    anime({
      targets: btn,
      scale:[1,1.09,1],
      duration:225,
      easing:'easeOutElastic(.8,1.2)'
    });
  });
});

// “救回資料”模擬按鈕
const rescueOutcomes = [
  { txt: "完整備份，資料救回！", type: "good", icon: "💾" },
  { txt: "成功移除病毒，但資料遺失", type: "bad", icon: "🗑️" },
  { txt: "部分找回，但損毀不少", type: "mid", icon: "📁" },
  { txt: "專家協助下部份救回", type: "mid", icon: "🆘" },
  { txt: "贖金付了，資料仍未回復", type: "bad", icon: "💸" },
  { txt: "備份太舊，只救回部分", type: "mid", icon: "🕰️" }
];

document.getElementById('try-rescue-btn').addEventListener('click', function() {
  const resultDiv = document.getElementById('rescue-result');
  const outcome = rescueOutcomes[Math.floor(Math.random() * rescueOutcomes.length)];
  resultDiv.innerHTML = `<span style="font-size:1.22em;vertical-align:middle;margin-right:0.45em;">${outcome.icon}</span>${outcome.txt}`;
  resultDiv.style.color = outcome.type === 'good' ? 'var(--success)' : (outcome.type==='bad'?'var(--danger)':'#4767ae');
  anime({
    targets: resultDiv,
    scale: [0.93,1.10,1],
    opacity: [0,1],
    translateY: [23,0],
    duration: 540,
    easing: 'easeOutCubic'
  });
});

// 遊戲參數
let vulnGameRunning = false;
let curVuln = null;
let vulnScore = 0;
let vulnTimer = 15;
let vulnTimerId = null;
let canvas, ctx;
let canvasRect;
let endMsgDiv = document.getElementById("virus-game-endmsg");

// 新增: 是否已經點過第一個
let firstVulnClicked = false;

// 遊戲狀態標示
const scoreLabel = document.getElementById("virus-game-score");
const timerLabel = document.getElementById("virus-game-timer");
const restartBtn = document.getElementById("virus-game-restart");

// ===== 修正：每次顯示遊戲頁時 canvas/binding 必正確，且 canvasRect 要準確 =====
function updateCanvasRect() {
  if (canvas) canvasRect = canvas.getBoundingClientRect();
}

// 新漏洞數據（更貼近資安宣導）
const vulnList = [
  {color:"#f84c39", emoji:"🔓", explain:"弱密碼/重複密碼"},
  {color:"#3eb5de", emoji:"📧", explain:"釣魚郵件連結"},
  {color:"#6f5adb", emoji:"🖥️", explain:"未安裝安全更新"},
  {color:"#b7b415", emoji:"💾", explain:"未備份重要檔案"},
  {color:"#388e55", emoji:"⚠️", explain:"未安裝防毒軟體"},
  {color:"#a566f4", emoji:"🔧", explain:"漏洞未修補"},
  {color:"#e68729", emoji:"👇", explain:"隨意下載可疑附件"},
  {color:"#2db2c7", emoji:"🔌", explain:"插入陌生USB裝置"},
  {color:"#e245b1", emoji:"🌐", explain:"遠端桌面暴露在網路"},
  {color:"#1b5de0", emoji:"🗣️", explain:"社交工程詐騙"},
  {color:"#617ebb", emoji:"👽", explain:"安裝不明來源APP"},
  {color:"#d3a513", emoji:"🖱️", explain:"點擊可疑廣告"}
];

function randVuln() {
  const v = vulnList[Math.floor(Math.random()*vulnList.length)];
  const size = 50 + Math.random()*32; 
  updateCanvasRect();
  const x = 15 + Math.random() * (canvas.width-size-30);
  const y = 20 + Math.random() * (canvas.height-size-28);
  return {
    ...v,
    x, y, size,
    show: true
  };
}

function drawVuln() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  if(curVuln && curVuln.show) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(curVuln.x+curVuln.size/2, curVuln.y+curVuln.size/2, curVuln.size/2, 0, Math.PI*2);
    ctx.shadowColor = curVuln.color+"cc";
    ctx.shadowBlur = 17;
    ctx.globalAlpha = 0.80;
    ctx.fillStyle = curVuln.color;
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.font = `bold ${curVuln.size*0.78}px system-ui,Arial`;
    ctx.globalAlpha = 1;
    ctx.textAlign="center";
    ctx.textBaseline="middle";
    ctx.fillText(curVuln.emoji, curVuln.x+curVuln.size/2, curVuln.y+curVuln.size/2+1.5);
    ctx.restore();
    ctx.save();
    ctx.font = "bold 1.05em 'Inter',sans-serif";
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = "#242b45";
    ctx.textAlign = "center";
    ctx.fillText(curVuln.explain, curVuln.x+curVuln.size/2, curVuln.y+curVuln.size+17);
    ctx.restore();
  }
}

function checkVulnHit(mx, my) {
  if(!vulnGameRunning || !curVuln || !curVuln.show) return;
  if (!canvasRect) updateCanvasRect();
  let dx = mx - (curVuln.x+curVuln.size/2);
  let dy = my - (curVuln.y+curVuln.size/2);
  if(dx*dx + dy*dy <= (curVuln.size/2)*(curVuln.size/2)) {
    if (!firstVulnClicked) {
      firstVulnClicked = true;
      startVulnTimer();
    }
    curVuln.show = false;
    vulnScore += 1;
    scoreLabel.textContent = `得分：${vulnScore}`;
    animeVulnPop(curVuln.x, curVuln.y, curVuln.size, curVuln.color);
    playPop();
    setTimeout(()=>{
      if(vulnGameRunning) {
        curVuln = randVuln();
      } else {
        curVuln = null;
      }
      drawVuln();
    }, 180);
  }
}

function animeVulnPop(x,y,size,color) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x+size/2,y+size/2,size/1.6,0,Math.PI*2);
  ctx.globalAlpha=0.13;
  ctx.fillStyle="#fff";
  ctx.fill();
  ctx.restore();
  let flash = {r:size/2};
  anime({
    targets: flash,
    r:[size/2,size/2+19],
    easing: 'easeOutCirc',
    duration:190,
    update:()=>{
      ctx.save();
      ctx.beginPath();
      ctx.arc(x+size/2,y+size/2,flash.r,0,Math.PI*2);
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.18-(flash.r-size/2)*0.009;
      ctx.lineWidth = 11-(flash.r-size/2)*0.45;
      ctx.stroke();
      ctx.restore();
    }
  });
}

function playPop() {
  let osc = new window.AudioContext();
  let o = osc.createOscillator();
  let g = osc.createGain();
  o.frequency.value = 200+Math.random()*370;
  o.type="triangle";
  o.connect(g); g.connect(osc.destination);
  g.gain.linearRampToValueAtTime(0.21,osc.currentTime+0.0);
  g.gain.linearRampToValueAtTime(0.0,osc.currentTime+0.12);
  o.start();
  o.stop(osc.currentTime+0.13);
  o.onended=()=>osc.close();
}

function vulnCanvasClick(ev) {
  if(!vulnGameRunning) return;
  updateCanvasRect();
  let x, y;
  if(ev.touches && ev.touches.length>0) {
    x = ev.touches[0].clientX - canvasRect.left;
    y = ev.touches[0].clientY - canvasRect.top;
  } else {
    x = ev.clientX - canvasRect.left;
    y = ev.clientY - canvasRect.top;
  }
  checkVulnHit(x,y);
}

function startVulnTimer() {
  clearInterval(vulnTimerId);
  vulnTimerId = setInterval(()=>{
    if(!vulnGameRunning) return;
    vulnTimer--;
    if(vulnTimer < 0) return; 
    timerLabel.textContent = `剩餘：${Math.max(0, vulnTimer)} 秒`;
    if(vulnTimer<=0) {
      endVulnGame();
    }
  }, 1000);
}

function setupVulnGameCanvasEvents() {
  if (canvas) {
    canvas.removeEventListener('click', vulnCanvasClick);
    canvas.removeEventListener('touchstart', vulnCanvasClick);
    canvas.addEventListener('click', vulnCanvasClick, {passive:true});
    canvas.addEventListener('touchstart', vulnCanvasClick, {passive:true});
  }
}

function startVulnGame() {
  canvas = document.getElementById("virus-game-canvas");
  ctx = canvas.getContext("2d");
  updateCanvasRect();
  vulnScore = 0;
  vulnTimer = 15;
  scoreLabel.textContent = `得分：0`;
  timerLabel.textContent = `剩餘：15 秒`;
  restartBtn.style.display = "none";
  endMsgDiv.style.display = "none";
  vulnGameRunning = true;
  firstVulnClicked = false;
  curVuln = randVuln();
  drawVuln();
  setupVulnGameCanvasEvents();
  clearInterval(vulnTimerId);
  requestAnimationFrame(function gameLoop(){
    if(!vulnGameRunning) return;
    drawVuln();
    requestAnimationFrame(gameLoop);
  });
}

function endVulnGame() {
  vulnGameRunning = false;
  clearInterval(vulnTimerId);
  restartBtn.style.display = "";
  endMsgDiv.style.display = "";
  curVuln = null;  
  drawVuln();
  let msg;
  if(vulnScore>=25) {
    msg = `太厲害了！你成功發現並修補 <b style="color:var(--success)">${vulnScore}</b> 個漏洞！資安達人！`;
  } else if(vulnScore>=16) {
    msg = `很棒！你修補了 <b style="color:#267bd6">${vulnScore}</b> 個漏洞，資安守護還能更進步！`;
  } else {
    msg = `只修補了 <b style="color:var(--danger)">${vulnScore}</b> 個漏洞，要再加強安全意識喔！`;
  }
  endMsgDiv.innerHTML = msg + `<br><small style="color:#6e75ac">點「再玩一次」挑戰更高分！</small>`;
}

restartBtn.addEventListener('click', startVulnGame);

window.addEventListener('resize', ()=>{
  if(gameContent && gameContent.style.display!=="none") {
    updateCanvasRect();
  }
});

const gotoGameBtn = document.getElementById("goto-game-btn");
const mainContent = document.getElementById("main-content");
const gameContent = document.getElementById("game-content");
const gameExitBtn = document.getElementById("game-exit-btn");
gotoGameBtn.addEventListener('click', () => {
  mainContent.style.display = "none";
  gameContent.style.display = "";
  setTimeout(() => {
    canvas = document.getElementById("virus-game-canvas");
    ctx = canvas.getContext("2d");
    updateCanvasRect();
    setupVulnGameCanvasEvents();
    startVulnGame();
  }, 60);
});
gameExitBtn.addEventListener('click', () => {
  gameContent.style.display = "none";
  mainContent.style.display = "";
  vulnGameRunning = false;
  clearInterval(vulnTimerId);
});