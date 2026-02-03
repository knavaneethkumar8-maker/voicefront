import { enableDropForCells} from "./dragLetters.js";


export const akshars = [
{ char:"", start:0,  end:20 },
  { char:"", start:21, end:35 },
  { char:"", start:36, end:55 },
  { char:"", start:60, end:90 },
  { char:"", start:91, end:110 },
  { char:"", start:111, end:140 },
  { char:"", start:141, end:170 },
  { char:"", start:171, end:200 },
  { char:"", start:210, end:240 },
  { char:"", start:241, end:270 },
  { char:"", start:271, end:300 },
  { char:"", start:301, end:330 }
];

let gridObject = {};


const bioesTime = 9;
const fileName = 'voice1';
let audioLength = 10*1000 ;
const total9ms = Math.ceil(audioLength / bioesTime);
const gridsCount = Math.ceil(330/(24*bioesTime));
const GRID_WIDTH = 480;
const timeLineLength = gridsCount*GRID_WIDTH;

export function getAksharWidth() {
  const width = timeLineLength/akshars.length;
  return width;
}


function collectChars(start9, end9) {
  const chars = [];
  for (let t = start9; t < end9; t += 3) {
    const a = akshars.find(x => t >= x.start && t < x.end);
    if (a && !chars.includes(a.char)) chars.push(a.char);
  }
  return chars.join("");
}

const gridTimeLine = document.querySelector('.js-grid-timeline');

function renderGrid(gridNum, fileName, gridTimeLine, row) {
  const startTime = gridNum * 24 * bioesTime;
  const gridEndTime = startTime + (24 * bioesTime);

  const gridHTML = `
  <div class="booth-grid"
      id=${fileName + "_" + gridNum}
      contenteditable="false">

    <div class="lock js-lock"
        data-id=${fileName + "_" + gridNum}
        contenteditable="false">🔓</div>

    <!-- AKASH -->
    <div class="akash-tier" contenteditable="false">
      <div class="akash-cell cell"
          contenteditable="true"
          id=${fileName + "_" + gridNum + "_" + 1}>
        <span class="cell-dot" contenteditable="false"></span>
        <span contenteditable="false" class="cell-text">${getAkashCellLabel(gridNum)}</span>
        <button class="cell-lock js-cell-lock"
                contenteditable="false"></button>
      </div>
    </div>

    <!-- AGNI -->
    <div class="agni-tier flex-display" contenteditable="false">
      <div class="agni-cell cell"
          contenteditable="true"
          id=${fileName + "_" + gridNum + "_" + 2}>
        <span class="cell-dot" contenteditable="false"></span>
        <span contenteditable="false" class="cell-text">${getAgniCellLabel(gridNum,0)}</span>
        <button class="cell-lock js-cell-lock"
                contenteditable="false"></button>
      </div>

      <div class="agni-cell cell"
          contenteditable="true"
          id=${fileName + "_" + gridNum + "_" + 3}>
        <span class="cell-dot" contenteditable="false"></span>
        <span contenteditable="false" class="cell-text">${getAgniCellLabel(gridNum,1)}</span>
        <button class="cell-lock js-cell-lock"
                contenteditable="false"></button>
      </div>
    </div>

    <!-- VAYU -->
    <div class="vayu-tier flex-display" contenteditable="false">
      ${[0,1,2,3].map(i => `
        <div class="vayu-cell cell"
            contenteditable="true"
            id=${fileName + "_" + gridNum + "_" + (4+i)}>
          <span class="cell-dot" contenteditable="false"></span>
          <span contenteditable="false" class="cell-text">${getAyuvCellLabel(gridNum,i)}</span>
          <button class="cell-lock js-cell-lock"
                  contenteditable="false"></button>
        </div>
      `).join("")}
    </div>

    <!-- JAL -->
    <div class="jal-tier flex-display" contenteditable="false">
      ${[...Array(8)].map((_, i) => `
        <div class="jal-cell cell"
            contenteditable="true"
            id=${fileName + "_" + gridNum + "_" + (8+i)}>
          <span class="cell-dot" contenteditable="false"></span>
          <span contenteditable="false" class="cell-text">${getJalCellLabel(gridNum,i)}</span>
          <button class="cell-lock js-cell-lock"
                  contenteditable="false"></button>
        </div>
      `).join("")}
    </div>

    <!-- PRITHVI (NOT EDITABLE) -->
    <div class="prithvi-tier flex-display" contenteditable="false">
      ${[...Array(24)].map((_, i) => `
        <div class="prithvi-cell"
            contenteditable="false"
            id=${fileName + "_" + gridNum + "_" + (16+i)}>
        </div>
      `).join("")}
    </div>

  </div>
  `;


  gridTimeLine.innerHTML += gridHTML;
  //enableDropForCells(".cell", row);
}



export function renderAllGrids(gridsCount, fileName, gridTimeLine, row) {
  console.log(gridsCount);
  const fileLabel = document.querySelector('.js-rendered-filename');
  fileLabel.innerText = fileName;
  gridTimeLine.innerHTML = '';
  for(let i =0; i < gridsCount ; i++) {
    renderGrid(i, fileName, gridTimeLine, row);
  }
}

function getAkashCellLabel(gridNum) {
  const start9 = gridNum*24*bioesTime;
  const end9 = start9 + 24*bioesTime;
  return collectChars(start9, end9);
}

function getAgniCellLabel(gridNum, cellNo) {
  const start9 = gridNum*24*bioesTime + cellNo*12*bioesTime;
  const end9 = start9 + 12*bioesTime;
  return collectChars(start9, end9);
}

function getAyuvCellLabel(gridNum, cellNo) {
  const start9 = gridNum*24*bioesTime + cellNo*6*bioesTime;
  const end9 = start9 + 6*bioesTime;
  return collectChars(start9, end9);
}

function getJalCellLabel(gridNum, cellNo) {
  const start9 = gridNum*24*bioesTime + cellNo*3*bioesTime;
  const end9 = start9 + 3*bioesTime;
  return collectChars(start9, end9);
}

export function updateAllGridLabels(fileName) {
  for (let gridNum = 0; gridNum < gridsCount; gridNum++) {

    // 🔒 skip if this grid is locked
    const gridEl = document.getElementById(`${fileName}_${gridNum}`);
    if (gridEl && gridEl.classList.contains('locked')) {
      continue;
    }

    // -------- AKASH (1 cell) --------
    const akashCell = document.getElementById(
      `${fileName}_${gridNum}_1`
    );
    if (akashCell) {
      akashCell.textContent = getAkashCellLabel(gridNum);
    }

    // -------- AGNI (2 cells) --------
    for (let i = 0; i < 2; i++) {
      const agniCell = document.getElementById(
        `${fileName}_${gridNum}_${2 + i}`
      );
      if (agniCell) {
        agniCell.textContent = getAgniCellLabel(gridNum, i);
      }
    }

    // -------- VAYU (4 cells) --------
    for (let i = 0; i < 4; i++) {
      const vayuCell = document.getElementById(
        `${fileName}_${gridNum}_${4 + i}`
      );
      if (vayuCell) {
        vayuCell.textContent = getAyuvCellLabel(gridNum, i);
      }
    }

    // -------- JAL (8 cells) --------
    for (let i = 0; i < 8; i++) {
      const jalCell = document.getElementById(
        `${fileName}_${gridNum}_${8 + i}`
      );
      if (jalCell) {
        jalCell.textContent = getJalCellLabel(gridNum, i);
      }
    }
  }
}

const gridData = {
  "audio_id": "aud_001",

  "frame_size_ms": 27,

  "grid_216": {
    "grid_index": 5,
    "grid_size_ms": 216,
    "akshar": "कvitha",
    "confidence": 0.81,

    "children_108": [
      {
        "grid_index": 10,
        "grid_size_ms": 108,
        "akshar": "क",
        "confidence": 0.83,

        "children_54": [
          {
            "grid_index": 20,
            "grid_size_ms": 54,
            "akshar": "क",
            "confidence": 0.85,

            "children_27": [
              {
                "frame_index": 40,
                "frame_size_ms": 27,
                "akshar": "क",
                "confidence": 0.88
              },
              {
                "frame_index": 41,
                "frame_size_ms": 27,
                "akshar": "क",
                "confidence": 0.82
              }
            ]
          },
          {
            "grid_index": 21,
            "grid_size_ms": 54,
            "akshar": "ख",
            "confidence": 0.64,

            "children_27": [
              {
                "frame_index": 42,
                "frame_size_ms": 27,
                "akshar": "क",
                "confidence": 0.71
              },
              {
                "frame_index": 43,
                "frame_size_ms": 27,
                "akshar": "ख",
                "confidence": 0.57
              }
            ]
          }
        ]
      },
      {
        "grid_index": 11,
        "cell_id" : 3,
        "grid_size_ms": 108,
        "akshar": "क",
        "confidence": 0.79,

        "children_54": [
          {
            "grid_index": 22,
            "grid_size_ms": 54,
            "akshar": "क",
            "confidence": 0.81,

            "children_27": [
              {
                "frame_index": 44,
                "frame_size_ms": 27,
                "akshar": "क",
                "confidence": 0.83
              },
              {
                "frame_index": 45,
                "frame_size_ms": 27,
                "akshar": "क",
                "confidence": 0.79
              }
            ]
          },
          {
            "grid_index": 23,
            "grid_size_ms": 54,
            "akshar": "शून्य",
            "confidence": 0.91,

            "children_27": [
              {
                "frame_index": 46,
                "frame_size_ms": 27,
                "akshar": "शून्य",
                "confidence": 0.93
              },
              {
                "frame_index": 47,
                "frame_size_ms": 27,
                "akshar": "शून्य",
                "confidence": 0.89
              }
            ]
          }
        ]
      }
    ]
  }


}

const gridJson = {
    "grid_index": 5,
    "grid_size_ms": 216,
    "akshar": "कvitha",
    "confidence": 0.81,

    "children_108": [
      {
        "grid_index": 10,
        "grid_size_ms": 108,
        "akshar": "क",
        "confidence": 0.83,

        "children_54": [
          {
            "grid_index": 20,
            "grid_size_ms": 54,
            "akshar": "क",
            "confidence": 0.85,

            "children_27": [
              {
                "frame_index": 40,
                "frame_size_ms": 27,
                "akshar": "क",
                "confidence": 0.88
              },
              {
                "frame_index": 41,
                "frame_size_ms": 27,
                "akshar": "क",
                "confidence": 0.82
              }
            ]
          },
          {
            "grid_index": 21,
            "grid_size_ms": 54,
            "akshar": "ख",
            "confidence": 0.64,

            "children_27": [
              {
                "frame_index": 42,
                "frame_size_ms": 27,
                "akshar": "क",
                "confidence": 0.71
              },
              {
                "frame_index": 43,
                "frame_size_ms": 27,
                "akshar": "ख",
                "confidence": 0.57
              }
            ]
          }
        ]
      },
      {
        "grid_index": 11,
        "cell_id" : 3,
        "grid_size_ms": 108,
        "akshar": "क",
        "confidence": 0.79,

        "children_54": [
          {
            "grid_index": 22,
            "grid_size_ms": 54,
            "akshar": "क",
            "confidence": 0.81,

            "children_27": [
              {
                "frame_index": 44,
                "frame_size_ms": 27,
                "akshar": "क",
                "confidence": 0.83
              },
              {
                "frame_index": 45,
                "frame_size_ms": 27,
                "akshar": "क",
                "confidence": 0.79
              }
            ]
          },
          {
            "grid_index": 23,
            "grid_size_ms": 54,
            "akshar": "शून्य",
            "confidence": 0.91,

            "children_27": [
              {
                "frame_index": 46,
                "frame_size_ms": 27,
                "akshar": "शून्य",
                "confidence": 0.93
              },
              {
                "frame_index": 47,
                "frame_size_ms": 27,
                "akshar": "शून्य",
                "confidence": 0.89
              }
            ]
          }
        ]
      }
    ]
  }

function getConfidenceClass(confidence) {
  if (confidence > 0.9) return "ui-green";
  if (confidence > 0.75) return "ui-blue";
  if (confidence > 0.55) return "ui-yellow";
  return "ui-red";
}

//renderAllGrids(2, 'new-file-name');


const allGrids = document.querySelectorAll('.booth-grid');

function applyLabelsAndConfidence(gridJson, gridElement) {
  if (!gridJson || !gridElement) return;

  const baseId = gridElement.id;
  const COLOR_CLASSES = ["ui-green", "ui-blue", "ui-yellow", "ui-red"];

  function setCell(cellIndex, akshar, confidence) {
    const cell = gridElement.querySelector(
      `#${CSS.escape(baseId + "_" + cellIndex)}`
    );
    if (!cell) return;

    /* label */
    const label = cell.querySelector(".cell-label");
    if (label) label.textContent = akshar ?? "";

    /* dot color */
    const dot = cell.querySelector(".cell-dot");
    if (dot) {
      dot.classList.remove(...COLOR_CLASSES);
      dot.classList.add(getConfidenceClass(confidence));
    }
  }

  /* ---------- AKASH (216) ---------- */
  setCell(1, gridJson.akshar, gridJson.confidence);

  /* ---------- AGNI (108) ---------- */
  gridJson.children_108?.forEach((g108, i108) => {
    setCell(2 + i108, g108.akshar, g108.confidence);

    /* ---------- VAYU (54) ---------- */
    g108.children_54?.forEach((g54, i54) => {
      const vayuIndex = 4 + i108 * 2 + i54;
      setCell(vayuIndex, g54.akshar, g54.confidence);

      /* ---------- JAL (27) ---------- */
      g54.children_27?.forEach((g27, i27) => {
        const jalIndex =
          8 +
          (i108 * 4) + // each agni → 4 jal
          (i54 * 2) +  // each vayu → 2 jal
          i27;

        setCell(jalIndex, g27.akshar, g27.confidence);
      });
    });
  });
}

const gridsData = {
  "audio_id": "aud_001",
  "frame_size_ms": 27,

  "grid_0": {
      "grid_index": 0,
      "grid_size_ms": 216,
      "akshar": "क",
      "confidence": 0.81,

      "children_108": [
        {
          "grid_index": 0,
          "grid_size_ms": 108,
          "akshar": "क",
          "confidence": 0.83,

          "children_54": [
            {
              "grid_index": 0,
              "grid_size_ms": 54,
              "akshar": "क",
              "confidence": 0.85,

              "children_27": [
                { "frame_index": 0, "akshar": "क", "confidence": 0.88 },
                { "frame_index": 1, "akshar": "क", "confidence": 0.82 }
              ]
            },
            {
              "grid_index": 1,
              "grid_size_ms": 54,
              "akshar": "ख",
              "confidence": 0.64,

              "children_27": [
                { "frame_index": 2, "akshar": "क", "confidence": 0.71 },
                { "frame_index": 3, "akshar": "ख", "confidence": 0.57 }
              ]
            }
          ]
        },
        {
          "grid_index": 1,
          "grid_size_ms": 108,
          "akshar": "क",
          "confidence": 0.79,

          "children_54": [
            {
              "grid_index": 2,
              "grid_size_ms": 54,
              "akshar": "क",
              "confidence": 0.81,

              "children_27": [
                { "frame_index": 4, "akshar": "क", "confidence": 0.83 },
                { "frame_index": 5, "akshar": "क", "confidence": 0.79 }
              ]
            },
            {
              "grid_index": 3,
              "grid_size_ms": 54,
              "akshar": "शून्य",
              "confidence": 0.91,

              "children_27": [
                { "frame_index": 6, "akshar": "शून्य", "confidence": 0.93 },
                { "frame_index": 7, "akshar": "शून्य", "confidence": 0.89 }
              ]
            }
          ]
        }
      ]
    },
  "grid_1": {
      "grid_index": 0,
      "grid_size_ms": 216,
      "akshar": "क",
      "confidence": 0.81,

      "children_108": [
        {
          "grid_index": 0,
          "grid_size_ms": 108,
          "akshar": "क",
          "confidence": 0.83,

          "children_54": [
            {
              "grid_index": 0,
              "grid_size_ms": 54,
              "akshar": "क",
              "confidence": 0.85,

              "children_27": [
                { "frame_index": 0, "akshar": "क", "confidence": 0.88 },
                { "frame_index": 1, "akshar": "क", "confidence": 0.82 }
              ]
            },
            {
              "grid_index": 1,
              "grid_size_ms": 54,
              "akshar": "ख",
              "confidence": 0.64,

              "children_27": [
                { "frame_index": 2, "akshar": "क", "confidence": 0.71 },
                { "frame_index": 3, "akshar": "ख", "confidence": 0.57 }
              ]
            }
          ]
        },
        {
          "grid_index": 1,
          "grid_size_ms": 108,
          "akshar": "क",
          "confidence": 0.79,

          "children_54": [
            {
              "grid_index": 2,
              "grid_size_ms": 54,
              "akshar": "क",
              "confidence": 0.81,

              "children_27": [
                { "frame_index": 4, "akshar": "क", "confidence": 0.83 },
                { "frame_index": 5, "akshar": "क", "confidence": 0.79 }
              ]
            },
            {
              "grid_index": 3,
              "grid_size_ms": 54,
              "akshar": "शून्य",
              "confidence": 0.91,

              "children_27": [
                { "frame_index": 6, "akshar": "शून्य", "confidence": 0.93 },
                { "frame_index": 7, "akshar": "शून्य", "confidence": 0.89 }
              ]
            }
          ]
        }
      ]
    },
  "grid_2": {
      "grid_index": 0,
      "grid_size_ms": 216,
      "akshar": "क",
      "confidence": 0.81,

      "children_108": [
        {
          "grid_index": 0,
          "grid_size_ms": 108,
          "akshar": "क",
          "confidence": 0.83,

          "children_54": [
            {
              "grid_index": 0,
              "grid_size_ms": 54,
              "akshar": "क",
              "confidence": 0.85,

              "children_27": [
                { "frame_index": 0, "akshar": "क", "confidence": 0.88 },
                { "frame_index": 1, "akshar": "क", "confidence": 0.82 }
              ]
            },
            {
              "grid_index": 1,
              "grid_size_ms": 54,
              "akshar": "ख",
              "confidence": 0.64,

              "children_27": [
                { "frame_index": 2, "akshar": "क", "confidence": 0.71 },
                { "frame_index": 3, "akshar": "ख", "confidence": 0.57 }
              ]
            }
          ]
        },
        {
          "grid_index": 1,
          "grid_size_ms": 108,
          "akshar": "क",
          "confidence": 0.79,

          "children_54": [
            {
              "grid_index": 2,
              "grid_size_ms": 54,
              "akshar": "क",
              "confidence": 0.81,

              "children_27": [
                { "frame_index": 4, "akshar": "क", "confidence": 0.83 },
                { "frame_index": 5, "akshar": "क", "confidence": 0.79 }
              ]
            },
            {
              "grid_index": 3,
              "grid_size_ms": 54,
              "akshar": "शून्य",
              "confidence": 0.91,

              "children_27": [
                { "frame_index": 6, "akshar": "शून्य", "confidence": 0.93 },
                { "frame_index": 7, "akshar": "शून्य", "confidence": 0.89 }
              ]
            }
          ]
        }
      ]
    }
  
}

export function mapAllJsonToGrids(gridsJson , gridElements) {
  gridElements?.forEach((grid, index) => {
    console.log(gridsData["grid_0"]);
    applyLabelsAndConfidence(gridsJson[`grid_${index}`], grid);
  });
}

//mapAllJsonToGrids(gridsData, allGrids);












