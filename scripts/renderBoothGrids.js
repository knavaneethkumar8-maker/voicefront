export const akshars = [
{ char:"म", start:0,  end:20 },
  { char:"ै", start:21, end:35 },
  { char:"ं", start:36, end:55 },
  { char:"व", start:60, end:90 },
  { char:"ि", start:91, end:110 },
  { char:"द", start:111, end:140 },
  { char:"य", start:141, end:170 },
  { char:"ा", start:171, end:200 },
  { char:"ज", start:210, end:240 },
  { char:"ा", start:241, end:270 },
  { char:"त", start:271, end:300 },
  { char:"ा", start:301, end:330 }
]


function collectChars(start9, end9) {
  const chars = [];
  for (let t = start9; t < end9; t += 3) {
    const a = akshars.find(x => t >= x.start && t < x.end);
    if (a && !chars.includes(a.char)) chars.push(a.char);
  }
  return chars.join("");
}

const gridTimeLine = document.querySelector('.js-grid-timeline');

function renderGrid() {
  const gridHTML = `
  
  `
}


