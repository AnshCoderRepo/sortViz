"use strict";
let globalCancelRef = { cancelled: false };

const setControlsRunning = (isRunning) => {
  const startBtn = document.querySelector(".start");
  const cancelBtn = document.querySelector(".cancel");
  const selects = document.querySelectorAll(".algo-menu, .size-menu, .speed-menu");
  if (isRunning) {
    startBtn.style.display = "none";
    cancelBtn.style.display = "inline-block";
    selects.forEach(s => s.setAttribute("disabled", "true"));
    document.querySelector("#random").setAttribute("disabled", "true");
  } else {
    startBtn.style.display = "inline-block";
    cancelBtn.style.display = "none";
    selects.forEach(s => s.removeAttribute("disabled"));
    document.querySelector("#random").removeAttribute("disabled");
  }
}

const start = async () => {
  // ensure single view is visible when sorting
  const container = document.querySelector(".compare-container");
  const center = document.querySelector(".center");
  if (container && center) {
    container.style.display = "none";
    center.style.display = "block";
    const singleCx = document.querySelector(".complexity-single");
    if (singleCx) {
      singleCx.style.display = "block";
    }
  }
  let algoValue = Number(document.querySelector(".algo-menu").value);
  let speedValue = Number(document.querySelector(".speed-menu").value);

  if (speedValue === 0) {
    speedValue = 1;
  }
  if (algoValue === 0) {
    alert("No Algorithm Selected");
    return;
  }

  setControlsRunning(true);
  globalCancelRef = { cancelled: false };
  // show complexity for selected algo below single view
  const singleComplexityEl = document.querySelector(".complexity-single");
  if (singleComplexityEl && algoNames[algoValue]) {
    const meta = algoNames[algoValue];
    singleComplexityEl.textContent = `${meta.name} — Time: Avg ${meta.c}, Worst ${meta.w}; Space: ${meta.s}`;
  }
  try {
    let algorithm = new sortAlgorithms(speedValue, document, globalCancelRef);
    if (algoValue === 1) await algorithm.BubbleSort();
    if (algoValue === 2) await algorithm.SelectionSort();
    if (algoValue === 3) await algorithm.InsertionSort();
    if (algoValue === 4) await algorithm.MergeSort();
    if (algoValue === 5) await algorithm.QuickSort();
  } catch (e) {
    // cancelled or error
  } finally {
    setControlsRunning(false);
  }
};

const RenderScreen = async () => {
  let algoValue = Number(document.querySelector(".algo-menu").value);
  await RenderList();
};

const RenderList = async () => {
  let sizeValue = Number(document.querySelector(".size-menu").value);
  await clearScreen();

  let list = await randomList(sizeValue);
  const arrayNode = document.querySelector(".array");
  for (const element of list) {
    const node = document.createElement("div");
    node.className = "cell";
    node.setAttribute("value", String(element));
    node.style.height = `${3.8 * element}px`;
    arrayNode.appendChild(node);
  }
};

const RenderArray = async (sorted) => {
  let sizeValue = Number(document.querySelector(".size-menu").value);
  await clearScreen();

  let list = await randomList(sizeValue);
  if (sorted) list.sort((a, b) => a - b);

  const arrayNode = document.querySelector(".array");
  const divnode = document.createElement("div");
  divnode.className = "s-array";

  for (const element of list) {
    const dnode = document.createElement("div");
    dnode.className = "s-cell";
    dnode.innerText = element;
    divnode.appendChild(dnode);
  }
  arrayNode.appendChild(divnode);
};

const randomList = async (Length) => {
  let list = new Array();
  let lowerBound = 1;
  let upperBound = 100;

  for (let counter = 0; counter < Length; ++counter) {
    let randomNumber = Math.floor(
      Math.random() * (upperBound - lowerBound + 1) + lowerBound
    );
    list.push(parseInt(randomNumber));
  }
  return list;
};

const clearScreen = async () => {
  document.querySelector(".array").innerHTML = "";
};

const response = () => {
  let Navbar = document.querySelector(".navbar");
  if (Navbar.className === "navbar") {
    Navbar.className += " responsive";
  } else {
    Navbar.className = "navbar";
  }
};

document.querySelector(".icon").addEventListener("click", response);
document.querySelector(".start").addEventListener("click", start);
document.querySelector(".cancel").addEventListener("click", () => {
  globalCancelRef.cancelled = true;
});

// Compare mode
const algoNames = {
  1: { name: "Bubble Sort", c: "O(n^2)", s: "O(1)", w: "O(n^2)" },
  2: { name: "Selection Sort", c: "O(n^2)", s: "O(1)", w: "O(n^2)" },
  3: { name: "Insertion Sort", c: "O(n^2)", s: "O(1)", w: "O(n^2)" },
  4: { name: "Merge Sort", c: "O(n log n)", s: "O(n)", w: "O(n log n)" },
  5: { name: "Quick Sort", c: "O(n log n)", s: "O(log n)", w: "O(n^2)" },
};

const openCompare = async () => {
  const container = document.querySelector(".compare-container");
  const center = document.querySelector(".center");
  center.style.display = "none";
  container.style.display = "flex";
  const singleCx = document.querySelector(".complexity-single");
  if (singleCx) {
    singleCx.textContent = "";
    singleCx.style.display = "none";
  }

  const left = container.querySelector(".left");
  const right = container.querySelector(".right");
  const lc = container.querySelector(".left-complexity");
  const rc = container.querySelector(".right-complexity");
  if (lc) lc.textContent = "";
  if (rc) rc.textContent = "";

  [left, right].forEach((panel) => {
    let controls = panel.querySelector(".controls");
    if (!controls) {
      controls = document.createElement("div");
      controls.className = "controls";
      const select = document.createElement("select");
      select.innerHTML = `
        <option value="0">Choose algorithm</option>
        <option value="1">Bubble Sort</option>
        <option value="2">Selection Sort</option>
        <option value="3">Insertion Sort</option>
        <option value="4">Merge Sort</option>
        <option value="5">Quick Sort</option>
      `;
      const run = document.createElement("a");
      run.textContent = "Run";
      run.setAttribute("class", "run");
      run.style.backgroundColor = "#1abc9c";
      run.style.color = "#fff";
      run.style.padding = "6px 8px";
      run.style.borderRadius = "6px";
      const stop = document.createElement("a");
      stop.textContent = "Stop";
      stop.setAttribute("class", "stop");
      stop.style.backgroundColor = "#e74c3c";
      stop.style.color = "#fff";
      stop.style.padding = "6px 8px";
      stop.style.borderRadius = "6px";
      controls.appendChild(select);
      controls.appendChild(run);
      controls.appendChild(stop);
      panel.insertBefore(controls, panel.querySelector(".array"));

      // Update complexity text when algorithm is chosen (panel-only)
      select.addEventListener("change", () => {
        const val = Number(select.value);
        const c = panel.querySelector(".complexity");
        if (algoNames[val] && c) {
          const meta = algoNames[val];
          c.innerHTML = `Time Complexity: Avg ${meta.c}, Worst ${meta.w}<br/>Space: ${meta.s}`;
        } else if (c) {
          c.textContent = "";
        }
      });

      run.addEventListener("click", async () => {
        const val = Number(select.value);
        if (!val) return alert("Choose algorithm");
        const speedValue = Number(document.querySelector(".speed-menu").value) || 1;
        const sizeValue = Number(document.querySelector(".size-menu").value) || 20;

        // Use same seed for both panels on first run to compare fairly
        let seed = container.dataset.seed;
        if (!seed) {
          seed = Date.now().toString();
          container.dataset.seed = seed;
        }
        await renderInto(panel.querySelector(".array"), sizeValue, seed);

        const cancelRef = { cancelled: false };
        panel._cancelRef = cancelRef;
        const algo = new sortAlgorithms(speedValue, panel, cancelRef);
        try {
          if (val === 1) await algo.BubbleSort();
          if (val === 2) await algo.SelectionSort();
          if (val === 3) await algo.InsertionSort();
          if (val === 4) await algo.MergeSort();
          if (val === 5) await algo.QuickSort();
        } catch(e) {}
        // complexity intentionally not shown in compare mode
      });

      stop.addEventListener("click", () => {
        if (panel._cancelRef) panel._cancelRef.cancelled = true;
      });
    }
  });
};

document.querySelector(".compare").addEventListener("click", openCompare);

const seededRandom = (seed) => {
  let t = parseInt(seed || "0", 10) || 1;
  return () => (t = (t * 1664525 + 1013904223) % 4294967296) / 4294967296;
};

const renderInto = async (arrayEl, size, seed) => {
  arrayEl.innerHTML = "";
  const rnd = seededRandom(seed);
  for (let i = 0; i < size; i++) {
    const value = Math.floor(rnd() * 100) + 1;
    const node = document.createElement("div");
    node.className = "cell";
    node.setAttribute("value", String(value));
    node.style.height = `${3.8 * value}px`;
    arrayEl.appendChild(node);
  }
};
document.querySelector(".size-menu").addEventListener("change", RenderScreen);
document.querySelector(".algo-menu").addEventListener("change", () => {
  RenderScreen();
  const algoValue = Number(document.querySelector(".algo-menu").value);
  const el = document.querySelector(".complexity-single");
  if (el && algoNames[algoValue]) {
    const meta = algoNames[algoValue];
    el.textContent = `${meta.name} — Time: Avg ${meta.c}, Worst ${meta.w}; Space: ${meta.s}`;
  } else if (el) {
    el.textContent = "";
  }
});
window.onload = RenderScreen;
