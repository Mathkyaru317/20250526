let video;
let facemesh;
let predictions = [];
let handpose;
let handPredictions = [];
let gesture = ""; // "rock", "paper", "scissors"

function setup() {
  createCanvas(640, 480).position(
    (windowWidth - 640) / 2,
    (windowHeight - 480) / 2
  );
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  facemesh = ml5.facemesh(video, modelReady);
  facemesh.on('predict', results => {
    predictions = results;
  });

  handpose = ml5.handpose(video, handModelReady);
  handpose.on('predict', results => {
    handPredictions = results;
    gesture = detectGesture(handPredictions);
  });
}

function modelReady() {
  // 臉部模型載入完成
}

function handModelReady() {
  // 手勢模型載入完成
}

// 手勢辨識：簡單判斷剪刀、石頭、布
function detectGesture(hands) {
  if (hands.length === 0) return "";
  const annotations = hands[0].annotations;
  // 取得五指指尖座標
  const tips = [
    annotations.thumb[3],
    annotations.indexFinger[3],
    annotations.middleFinger[3],
    annotations.ringFinger[3],
    annotations.pinky[3]
  ];
  // 計算每指與手腕距離
  const wrist = hands[0].annotations.palmBase[0];
  let extended = tips.map(tip => dist(tip[0], tip[1], wrist[0], wrist[1]) > 60);

  // 剪刀：只有食指、中指伸直
  if (extended[1] && extended[2] && !extended[0] && !extended[3] && !extended[4]) return "scissors";
  // 石頭：全部收起
  if (!extended[0] && !extended[1] && !extended[2] && !extended[3] && !extended[4]) return "rock";
  // 布：全部伸直
  if (extended[0] && extended[1] && extended[2] && extended[3] && extended[4]) return "paper";
  return "";
}

function draw() {
  image(video, 0, 0, width, height);

  if (predictions.length > 0) {
    const keypoints = predictions[0].scaledMesh;

    let points = [];
    if (gesture === "scissors") {
      // 額頭：第10點
      points = [keypoints[10]];
    } else if (gesture === "rock") {
      // 左右眼睛：33, 263
      points = [keypoints[33], keypoints[263]];
    } else if (gesture === "paper") {
      // 左右臉頰：234, 454
      points = [keypoints[234], keypoints[454]];
    } else {
      // 預設第94點
      points = [keypoints[94]];
    }

    noFill();
    stroke(255, 0, 0);
    strokeWeight(4);
    for (let pt of points) {
      ellipse(pt[0], pt[1], 100, 100);
    }
  }
}
