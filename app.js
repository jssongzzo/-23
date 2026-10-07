
let questions=[], state={solved:{}, wrong:{}, favorites:[], streak:0};
let currentIndex=0,currentMode="all",currentWrongId=null,deferredInstall=null;

const $=s=>document.querySelector(s);
const loadState=()=>{try{state=JSON.parse(localStorage.getItem("mathWrongState"))||state}catch(e){}};
const saveState=()=>localStorage.setItem("mathWrongState",JSON.stringify(state));
const toast=m=>{const t=$("#toast");t.textContent=m;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),1800)};
const qById=id=>questions.find(q=>q.id===id);
const solvedCount=()=>Object.keys(state.solved).length;
const wrongIds=()=>Object.keys(state.wrong).filter(id=>state.wrong[id]);
function go(view){
  document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));
  $("#"+view+"View").classList.add("active");
  document.querySelectorAll(".nav").forEach(n=>n.classList.toggle("active",n.dataset.go===view));
  if(view==="home") renderHome();
  if(view==="quiz") startQuiz();
  if(view==="wrong") renderWrong();
  if(view==="stats") renderStats();
  window.scrollTo({top:0,behavior:"smooth"});
}
function renderHome(){
  const total=solvedCount(), correct=Object.values(state.solved).filter(v=>v.correct).length;
  $("#totalSolved").textContent=total; $("#accuracy").textContent=total?Math.round(correct/total*100)+"%":"0%";
  $("#wrongCount").textContent=wrongIds().length;
  $("#progressText").textContent=`${total} / ${questions.length}`;
  $("#progressBar").style.width=(questions.length?Math.min(100,total/questions.length*100):0)+"%";
}
function startQuiz(mode="all",id=null){
  currentMode=mode; currentWrongId=id;
  $("#quizModeLabel").textContent=mode==="wrong"?"오답 다시 풀기":"기출문제";
  $("#quizTitle").textContent=mode==="wrong"?"오답 문제":"문제 풀이";
  if(mode==="wrong"){
    const ids=wrongIds(); currentIndex=Math.max(0,ids.indexOf(id));
  } else currentIndex=0;
  renderQuiz();
}
function renderQuiz(){
  let list=currentMode==="wrong"?wrongIds():questions.map(q=>q.id);
  if(!list.length){$("#quizArea").innerHTML=`<div class="empty"><strong>풀 문제가 없어요.</strong>오답노트가 비어 있습니다.</div>`;return}
  const id=list[currentIndex%list.length], q=qById(id);
  const old=state.solved[q.id];
  let selected=old?.selected??null, checked=old?.checked??false;
  $("#quizArea").innerHTML=`
  <div class="question-card">
    <div class="meta"><span class="tag primary">${q.grade}</span><span class="tag">${q.unit}</span><span class="tag">${q.difficulty}</span><span class="tag">${q.year}</span></div>
    <div class="question-no">${currentIndex+1} / ${list.length}</div>
    <div class="question">${q.question}</div>
    <div class="choices">${q.choices.map((c,i)=>{
      let cls=selected===i?"selected ":"";
      if(checked){if(i===q.answer)cls+="correct "; else if(selected===i)cls+="wrong ";}
      return `<button class="choice ${cls}${checked?"disabled":""}" data-choice="${i}"><span class="num">${String.fromCharCode(65+i)}</span><span>${c}</span></button>`
    }).join("")}</div>
    ${checked?`<div class="result ${selected===q.answer?"good":"bad"}"><b>${selected===q.answer?"정답입니다! 🎉":"아쉬워요. 오답노트에 저장했어요."}</b>${selected===q.answer?"잘 풀었어요!":"다음에는 풀이를 다시 확인해 보세요."}<div class="solution"><b>풀이</b>${q.solution}</div></div>`:""}
    ${!checked?`<button class="primary-btn" id="checkBtn" ${selected===null?"disabled":""}>정답 확인</button>`:`<button class="secondary-btn" id="nextBtn">${currentIndex+1<list.length?"다음 문제":"처음부터 다시"}</button>`}
  </div>`;
  document.querySelectorAll(".choice:not(.disabled)").forEach(b=>b.onclick=()=>{selected=+b.dataset.choice;document.querySelectorAll(".choice").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");$("#checkBtn").disabled=false});
  $("#checkBtn")?.addEventListener("click",()=>checkAnswer(q,selected));
  $("#nextBtn")?.addEventListener("click",()=>{currentIndex=(currentIndex+1)%list.length;renderQuiz()});
}
function checkAnswer(q,selected){
  const correct=selected===q.answer;
  state.solved[q.id]={selected,correct,checked:true,at:Date.now()};
  if(!correct){state.wrong[q.id]=(state.wrong[q.id]||0)+1;toast("오답노트에 저장했습니다.");}
  else {delete state.wrong[q.id];toast("정답! 잘했어요 🎉");}
  saveState();renderQuiz();
}
function renderWrong(){
  const ids=wrongIds();
  if(!ids.length){$("#wrongArea").innerHTML=`<div class="empty"><div style="font-size:45px">🎯</div><strong>오답노트가 비어 있어요.</strong>문제를 풀고 틀린 문제를 자동으로 모아보세요.</div>`;return}
  $("#wrongArea").innerHTML=`<div class="wrong-list">${ids.map(id=>{const q=qById(id);return `<div class="wrong-card"><div class="meta"><span class="tag primary">${q.grade}</span><span class="tag">${q.unit}</span><span class="tag">${q.difficulty}</span></div><div class="q">${q.question}</div><div class="meta-line">오답 횟수 ${state.wrong[id]}회 · ${q.year}</div><button class="mini-btn" data-review="${id}">다시 풀기</button></div>`}).join("")}</div>`;
  document.querySelectorAll("[data-review]").forEach(b=>b.onclick=()=>{currentIndex=0;go("quiz");setTimeout(()=>startQuiz("wrong",b.dataset.review),0)});
}
function renderStats(){
  const total=solvedCount(), correct=Object.values(state.solved).filter(v=>v.correct).length, acc=total?Math.round(correct/total*100):0;
  const units={}; questions.forEach(q=>{units[q.unit]??={t:0,c:0};if(state.solved[q.id]?.checked){units[q.unit].t++;if(state.solved[q.id].correct)units[q.unit].c++}});
  $("#statsArea").innerHTML=`<div class="stats"><div class="stat"><strong>${total}</strong><span>풀이 완료</span></div><div class="stat"><strong>${acc}%</strong><span>정답률</span></div><div class="stat"><strong>${wrongIds().length}</strong><span>오답 보관</span></div></div><div class="stat-panel" style="margin-top:12px"><b>단원별 정답률</b><div class="chart">${Object.entries(units).map(([u,v])=>{let p=v.t?Math.round(v.c/v.t*100):0;return `<div class="bar-row"><span>${u}</span><div class="bar"><i style="width:${p}%"></i></div><b>${p}%</b></div>`}).join("")}</div></div>`;
}
document.addEventListener("click",e=>{const b=e.target.closest("[data-go]");if(b)go(b.dataset.go)});
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredInstall=e;$("#installBtn").classList.remove("hidden")});
$("#installBtn").onclick=async()=>{if(deferredInstall){deferredInstall.prompt();await deferredInstall.userChoice;deferredInstall=null;$("#installBtn").classList.add("hidden")}};
window.addEventListener("appinstalled",()=>$("#installBtn").classList.add("hidden"));
async function init(){
  loadState();
  const res=await fetch("data/questions.json");questions=await res.json();
  renderHome();
  if("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js");
}
init();
