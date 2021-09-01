let canvas;
let ctx;
let array_length = 20;

let minN = 1;
let maxN = 13;
let colWidth = 1;
let colWidthC = 1;

var sort;

let sleepMS = 30;
let sortId = -1;

var values = [];

/* states[]
            -1 ..... Unhighlighted 
            0  ..... special Highlighted (Pivot(Quick-Sort))
            1  ..... special Highlighted (Array(Quick-Sort))
 
        */
const states = [];

let sortRunning = false;

function init() {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");

  array_length = document.getElementById("sizeRange").value * 2;
  colWidth = canvas.height / array_length;
  colWidthC = canvas.width / array_length / 2;

  let rangeSlider = document.getElementById("sizeRange");
  rangeSlider.addEventListener(
    "input",
    function () {
      if (!sortRunning) {
        resizeArray(rangeSlider.value);
      }
    },
    false
  );

  setupArray();

  draw();
}

function resizeArray(value) {
  const arr = values;

  if (value > array_length) {
    var before = values.length;
    values.length = value;

    for (let i = before; i < value; i++) {
      values[i] = getRandomNumber();
    }
  } else if (value < array_length) {
    values = [];
    for (let i = 0; i < value; i++) {
      values[i] = arr[i];
    }
  }
  array_length = value;
  updateColWidth();
  draw();
}

async function stop() {
  sortRunning = false;
  setButtonsActive();
  await sleep(100);
  neutraliseStates();
}

function setButtonsActive() {
  if (sortRunning) {
    document.getElementById("generatebutton").disabled = true;
    document.getElementById("stopbutton").disabled = false;
    document.getElementById("startbutton").disabled = true;
  } else {
    document.getElementById("generatebutton").disabled = false;
    document.getElementById("stopbutton").disabled = true;
    document.getElementById("startbutton").disabled = false;
  }
}

function start() {
  sortRunning = true;
  setButtonsActive();

  sleepMS = 100 / document.getElementById("speedRange").value;

  //setInterval(update,2000);

  var e = document.getElementById("sortingAlgo");

  if (e.options[e.selectedIndex].value == "Bubble-Sort") {
    console.log("start(): sortingStyle=Bubble-Sort");
    bubbleSort();
  }

  if (e.options[e.selectedIndex].value == "Quick-Sort") {
    console.log("start(): sortingStyle=Quick-Sort");
    startQuickSort();
  }
  draw();
}

/*------------------------------------
                        Bubble-Sort
        --------------------------------------*/
//bigger to the right
async function bubbleSort() {
  let change = true;
  while (change) {
    change = false;
    for (let i = 0; i < array_length - 1; i++) {
      states[i] = 0;
      if (values[i] > values[i + 1]) {
        states[i] = 1;
        await swap(values, i, i + 1);
        change = true;
      } else {
        await sleep(sleepMS);
      }
      states[i] = -1;

      if (!sortRunning) {
        return;
      }
    }
  }
  stop();
}

/*------------------------------------
                        Quick Sort
        QuickSort mit Pivot Point letztes Element
        --------------------------------------*/
function startQuickSort() {
  quickSort(values, 0, values.length - 1);
}

async function quickSort(arr, start, end) {
  if (start >= end || !sortRunning) {
    return;
  } else {
    let index = await partition(arr, start, end);
    states[index] = -1;

    await Promise.all([
      quickSort(arr, start, index - 1),
      quickSort(arr, index + 1, end),
    ]);
  }
}

async function partition(arr, start, end) {
  for (let i = start; i <= end; i++) {
    states[i] = 1;
  }

  let pivotIndex = start;
  let pivotValue = arr[end];
  for (let i = start; i < end; i++) {
    if (arr[i] < pivotValue) {
      await swap(arr, i, pivotIndex);
      states[pivotIndex] = -1;
      pivotIndex++;
      states[pivotIndex] = 0;
    }
    if (!sortRunning) {
      return;
    }
  }
  await swap(arr, pivotIndex, end);

  for (let i = start; i <= end; i++) {
    states[i] = -1;
  }
  return pivotIndex;
}

/*------------------------------------
                        General
        --------------------------------------*/
async function swap(arr, a, b) {
  await sleep(sleepMS);

  let temp = arr[a];
  arr[a] = arr[b];
  arr[b] = temp;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRandomNumber() {
  return Math.floor(Math.random() * (maxN - minN + 1) + minN);
}

function updateColWidth() {
  colWidth = canvas.height / array_length;
  colWidthC = canvas.width / array_length / 2;
}

function setupArray() {
  for (let i = 0; i < array_length; i++) {
    //values[i] = i;
    values[i] = getRandomNumber();
    states[i] = -1;
  }
  updateColWidth();
}

function neutraliseStates() {
  for (let i = 0; i < array_length; i++) {
    states[i] = -1;
  }
}

function setColor(state) {
  switch (state) {
    case -1:
      ctx.strokeStyle = "#7d7d7d"; //grey
      ctx.fillStyle = "#7d7d7d";
      break;
    case 0:
      ctx.strokeStyle = "#E0777D"; //red
      ctx.fillStyle = "#E0777D";
      break;
    case 1:
      ctx.strokeStyle = "#D6FFB7"; //green
      ctx.fillStyle = "#D6FFB7";
      break;

    default:
      console.log("setColor(): default in Switch!!! state:" + state);
  }
}

/*------------------------------------
                        Drawing
        --------------------------------------*/

function drawNoteLines() {
  ctx.setColor = "black";
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2 - i * colWidthC);
    ctx.lineTo(canvas.width, canvas.height / 2 - i * colWidthC);
    ctx.stroke();
  }
}

/*   Mod           Display-Hight + floor(value/12)
            0 = C               0
            1 = C#              0
            2 = D               1
            3 = D#              1
            4 = E               2
            5 = F               3
            6 = F#              3
            7 = G               4
            8 = G#              4
            9 = A               5
            10 = A#             5
            11 = H              6

                                7
            */
function getDisplacement(mod) {
  let dis = 0;
  //console.log("mod:"+mod);
  /*switch(mod)
            {
                case 0,1: break;
                case 2,3: dis = 1; break;
                case 4  : dis = 2; break;
                case 5,6: dis = 3; break;
                case 7,8: dis = 4; break;
                case 9,10: dis = 5; break;
                case 11: dis = 6; break;

                default: console.log("getDisplacement default case!! mod:"+mod);
            }*/

  if (mod == 0 || mod == 1) {
    dis = 0;
  } else if (mod == 2 || mod == 3) {
    dis = 1;
  } else if (mod == 4) {
    dis = 2;
  } else if (mod == 5 || mod == 6) {
    dis = 3;
  } else if (mod == 7 || mod == 8) {
    dis = 4;
  } else if (mod == 9 || mod == 10) {
    dis = 5;
  } else if (mod == 11) {
    dis = 6;
  }

  return dis;
}

function displayNotes() {
  for (let x in values) {
    let mod = values[x] % 12;
    let dis = getDisplacement(mod);
    let value = dis + Math.floor(values[x] / 12) * 7;
    console.log(
      "x: " + x + " mod:" + mod + " floor:" + Math.floor(values[x] / 12)
    );
    let tag = true;
    //without #
    if (
      mod == 0 ||
      mod == 2 ||
      mod == 4 ||
      mod == 5 ||
      mod == 7 ||
      mod == 9 ||
      mod == 11
    ) {
      tag = false;
    } //with #

    drawNote(x, value, tag);
  }
}

//tag -> boolean
function drawNote(x, value, tag) {
  //                         -colWidth = start at D
  let y = (value * colWidthC) / 2 - colWidthC;
  setColor(states[x]);
  ctx.beginPath();
  ctx.arc(
    x * colWidth + colWidthC,
    canvas.height / 2 - y,
    colWidthC / 2,
    0,
    2 * Math.PI
  );

  ctx.closePath();
  if (states[x] == -1) {
    ctx.stroke();
  } else {
    ctx.fill();
  }
  // draw #
  if (tag) {
    ctx.fillText("#", x * colWidth - 2, canvas.height / 2 - y + colWidthC / 2);
  }
}

function draw() {
  const widthMulti = document.getElementById("canvas").width / maxN;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  //ctx.stroke(0);

  drawInColumn(widthMulti);

  requestAnimationFrame(draw);
}

function drawInNotes() {
  ctx.strokeStyle = "black";
  drawNoteLines();
  displayNotes();
}

function drawInColumn(widthMulti) {
  for (let x in values) {
    setColor(states[x]);
    //ctx.fillRect(x*10,240,10,-values[x]*10);
    //ctx.fillRect(x*colWidth,canvas.height,colWidth,-values[x]*10);
    ctx.fillRect(
      0,
      x * colWidth + colWidth / 4,
      values[x] * widthMulti,
      colWidth / 2
    );
    ctx.fill();
  }
}
