// -----------------------------
// Interface logic
// -----------------------------
const inputBox = document.querySelector(".show-pawn-input");
const buttons = document.querySelectorAll(".pawn input");
const controlButtons = document.querySelectorAll(".control input");
const lockContainer = document.getElementById("lockContainer");
const addLockBtn = document.getElementById("addLock");
const solutionsContainer = document.getElementById("solutionsContainer");

const mode1Btn = document.getElementById("mode1");
const mode2Btn = document.getElementById("mode2");

let filled = [];
let maxFilled = 9;
let currentTarget = "top";
let mode = "mode1";
let solutions = [];
let shownCount = 0;

// -----------------------------
// Render top pawns + locked
// -----------------------------
function render() {
  inputBox.innerHTML = "";
  filled.forEach(v => {
    const div = document.createElement("div");
    div.className = "pawn-slot";
    div.textContent = v;
    inputBox.appendChild(div);
  });


  // Highlight locked pawn
  document.querySelectorAll(".lock-pair").forEach(pair => {
    const pos = parseInt(pair.querySelector(".lock-pos").value) - 1;
    const valDiv = pair.querySelector(".lock-val .pawn-slot");
    const val = valDiv ? valDiv.textContent : "";

    if (!isNaN(pos) && val !== "" && filled[pos] == val) {
      const div = inputBox.children[pos];
      if (div) div.classList.add("locked");
    }
  });
}

// -----------------------------
// ตั้งค่า event ของปุ่ม pawn แค่ครั้งเดียว
// -----------------------------
buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    if (currentTarget === "top") {
      if (filled.length < maxFilled) {
        filled.push(btn.value);
        render();
      } else {
        alert("ใส่เบี้ยครบแล้ว!");
      }
    } else {
      // currentTarget เป็น lock-val div
      currentTarget.innerHTML = "";
      const div = document.createElement("div");
      div.className = "pawn-slot";
      div.textContent = btn.value;
      currentTarget.appendChild(div);
    }
  });
});

// -----------------------------
// Pawn click (top pawn fill)
// -----------------------------
function selectSlotTopPawn() {
  currentTarget = "top";
}

// -----------------------------
// Pawn click (lock pawn fill)
// -----------------------------
function selectSlotLockPawn(targetDiv) {
  currentTarget = targetDiv;
}

// -----------------------------
// Control buttons
// -----------------------------
controlButtons.forEach(ctrl => {
  ctrl.addEventListener("click", () => {
    if (ctrl.value === "Back") {
      filled.pop();
      render();
    } else if (ctrl.value === "Clear") {
      filled = [];
      lockContainer.innerHTML = "";
      solutionsContainer.innerHTML = "";
      solutions = [];
      shownCount = 0;
      render();
    } else if (ctrl.value === "Submit") {
      runAMath();
    }
  });
});

// -----------------------------
// Mode switch
// -----------------------------
mode1Btn.addEventListener("click", () => {
  mode = "mode1";
  mode1Btn.classList.add("active");
  mode2Btn.classList.remove("active");
  addLockBtn.style.display = "none";
  lockContainer.innerHTML = "";
  render();
});

mode2Btn.addEventListener("click", () => {
  mode = "mode2";
  mode2Btn.classList.add("active");
  mode1Btn.classList.remove("active");
  addLockBtn.style.display = "inline-block";
  if (lockContainer.children.length === 0) addLock();
  render();
});

// -----------------------------
// Add locked pawn
// -----------------------------
function addLock() {
  const pairDiv = document.createElement("div");
  pairDiv.className = "lock-pair";

  const posInput = document.createElement("input");
  posInput.type = "number";
  posInput.min = 1;
  posInput.value = 1;
  posInput.className = "lock-pos";
  posInput.addEventListener("focus", () => {
    const currentLocks = lockContainer.querySelectorAll(".lock-pair").length;
    posInput.max = 9 + currentLocks;
  });

  const valInput = document.createElement("div");
  valInput.className = "lock-val";
  valInput.onclick = () => selectSlotLockPawn(valInput);

  const removeBtn = document.createElement("button");
  removeBtn.className = "lock-remove";
  removeBtn.textContent = "−";
  removeBtn.addEventListener("click", () => {
    pairDiv.remove();
    render();
  });

  pairDiv.appendChild(posInput);
  pairDiv.appendChild(valInput);
  pairDiv.appendChild(removeBtn);
  lockContainer.appendChild(pairDiv);

  render();
}
addLockBtn.addEventListener("click", addLock);

// -----------------------------
// A-Math logic
// -----------------------------
function Expanded(pawn) {
  const special_map = {
    '+/-': ['+', '-'],
    'x/÷': ['*', '/'],
    'x': ['*'],
    '÷': ['/'],
    '?': ['0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','+','-','*','/','=']
  };

  let result = [[]];
  for (const token of pawn) {
    if (token in special_map) {
      result = result.flatMap(r => special_map[token].map(op => [...r, op]));
    } else {
      result = result.map(r => [...r, token]);
    }
  }
  return result;
}

function add_pawn_js(pawn_in_rack, pawn_on_board) {
  const pawn_on_board_zero = {};
  for (const pair of pawn_on_board) {
    pawn_on_board_zero[pair.position - 1] = pair.value;
  }
  const final_length = pawn_in_rack.length + pawn_on_board.length;
  const final_arr = Array(final_length).fill(null);
  for (const pos in pawn_on_board_zero) {
    final_arr[pos] = pawn_on_board_zero[pos];
  }
  let idx = 0;
  for (let i = 0; i < final_length; i++) {
    if (final_arr[i] === null) final_arr[i] = pawn_in_rack[idx++];
  }
  return final_arr;
}

function Permutations(arr) {
  if (arr.length <= 1) return [arr];
  const result = [];
  const used = new Set();
  for (let i = 0; i < arr.length; i++) {
    if (used.has(arr[i])) continue;
    used.add(arr[i]);
    const rest = arr.slice(0, i).concat(arr.slice(i + 1));
    for (const perm of Permutations(rest)) {
      result.push([arr[i], ...perm]);
    }
  }
  return result;
}

function Condition(set_condition) {
  const define_marks=new Set(['=','+','-','*','/']);
  const define_number_unitdigit=new Set(['0','1','2','3','4','5','6','7','8','9']);
  const define_number_tensdigit=new Set(['10','11','12','13','14','15','16','17','18','19','20']);
  if(!set_condition.includes('=')) return false;
  for(let i=0;i<set_condition.length-1;i++){ const a=set_condition[i], b=set_condition[i+1]; if(define_marks.has(a)&&define_marks.has(b)&&!(a=='='&&b=='-')) return false; }
  for(let i=0;i<set_condition.length-1;i++){ const a=set_condition[i], b=set_condition[i+1]; if(define_number_tensdigit.has(a)&&define_number_tensdigit.has(b)) return false; }
  for(let i=0;i<set_condition.length-1;i++){ const a=set_condition[i], b=set_condition[i+1]; if(define_number_unitdigit.has(a)&&define_number_tensdigit.has(b)) return false; if(define_number_tensdigit.has(a)&&define_number_unitdigit.has(b)) return false; }
  let count=0; for(const x of set_condition){ if(define_number_unitdigit.has(x)) count++; else count=0; if(count>3) return false; }
  let numbers=[]; let temp="";
  for(const x of set_condition){ if(!define_marks.has(x)) temp+=x; else{ if(temp){ numbers.push(temp); temp=""; } } }
  if(temp) numbers.push(temp);
  for(const num of numbers){ if(num.length>=2 && num[0]=='0') return false; }
  for(let i=0;i<set_condition.length-1;i++){ if(set_condition[i]=='/' && set_condition[i+1]=='0') return false; }
  for(let i=0;i<set_condition.length-1;i++){ if(set_condition[i]=='-' && set_condition[i+1]=='0') return false; }
  if((define_marks.has(set_condition[0])&&set_condition[0]!='-') || define_marks.has(set_condition[set_condition.length-1])) return false;
  return true;
}

function Check_Equation(set_check_equation) {
  const parts = [];
  let temp = [];
  for(const t of set_check_equation){
    if(t=='='){parts.push(temp); temp=[];} else {temp.push(t);}
  }
  parts.push(temp);
  try {
    const values = parts.map(p => eval(p.join('')));
    const first = values[0];
    return values.every(v => Math.abs(v - first) < 1e-9); // ใช้ tolerance
  } catch {
    return false;
  }
}

// -----------------------------
// Run A-Math
// -----------------------------
function runAMath() {
  solutions = [];
  shownCount = 0;
  let locks = [];
  if (mode === 'mode2') {
    document.querySelectorAll(".lock-pair").forEach(pair => {
      const pos = parseInt(pair.querySelector(".lock-pos").value);
      const valDiv = pair.querySelector(".lock-val .pawn-slot");
      const val = valDiv ? valDiv.textContent : "";
      if(pos && val) locks.push({position: pos, value: val});
    });
  }

  // Permutations → add_pawn_js → Expanded → Condition/Check_Equation
  Permutations(filled).forEach(perm => {
    const combined = mode==='mode2' ? add_pawn_js(perm, locks) : perm;
    Expanded(combined).forEach(exp => {
      if (Condition(exp) && Check_Equation(exp)) solutions.push(exp.join(''));
    });
  });

  renderSolutions();
}

// -----------------------------
// Render solutions
// -----------------------------
function beautify(expr) {
  return expr.replace(/\*/g, "×").replace(/\//g, "÷");
}

function renderSolutions() {
  solutionsContainer.innerHTML = "";
  solutionsContainer.style.display = "flex";
  solutionsContainer.style.flexDirection = "column";
  solutionsContainer.style.gap = "10px";

  if (solutions.length === 0) {
    const div = document.createElement("div");
    div.className = "solution-item";
    div.style.color = "red";
    div.style.fontWeight = "bold";
    div.textContent = "No Solution";
    solutionsContainer.appendChild(div);
  } else {
    const maxShow = 20;
    const show = solutions.slice(0, maxShow);
    shownCount = show.length;

    show.forEach(s => {
      const div = document.createElement("div");
      div.className = "solution-item";
      div.textContent = beautify(s);
      solutionsContainer.appendChild(div);
    });
  }

  // 🔘 กล่องปุ่มด้านล่าง
  const actions = document.createElement("div");
  actions.className = "solution-actions";

  // ปุ่มดูเพิ่มเติม (เฉพาะถ้ามีมากกว่า 10)
  if (solutions.length > shownCount) {
    const moreBtn = document.createElement("button");
    moreBtn.className = "show-more-btn";
    moreBtn.textContent = "ดูเพิ่มเติม";

    moreBtn.addEventListener("click", () => {
      const more = solutions.slice(shownCount, shownCount + 10);
      shownCount += more.length;
      more.forEach(s => {
        const div = document.createElement("div");
        div.className = "solution-item";
        div.textContent = beautify(s);
        solutionsContainer.insertBefore(div, actions);
      });
      if (shownCount >= solutions.length) moreBtn.remove();
      solutionsContainer.scrollTop = solutionsContainer.scrollHeight;
    });

    actions.appendChild(moreBtn);
  }

  // ✅ ปุ่มย้อนกลับ (เฉพาะจอเล็ก)
  if (window.innerWidth < 700) {
    const backBtn = document.createElement("button");
    backBtn.className = "show-more-btn";
    backBtn.textContent = "ย้อนกลับ";
    backBtn.style.background = "#6c757d";
    backBtn.addEventListener("click", () => {
      solutionsContainer.style.display = "none"; // ซ่อน solution
      document.querySelector(".container").scrollIntoView({behavior: "smooth"});
    });
    actions.appendChild(backBtn);
  }

  // ถ้ามีปุ่มอยู่จริง → แสดงท้าย list
  if (actions.children.length > 0) {
    solutionsContainer.appendChild(actions);
  }

  solutionsContainer.scrollTop = 0;
}



// -----------------------------
selectSlotTopPawn();
render();

