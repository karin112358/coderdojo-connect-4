import "./style.css";
import p5 from "p5";
import { Board } from "./board";

declare let loadSound: any;

let board: Board;
let fieldSize = 40;
let margin = 20;
let dropSound: HTMLAudioElement;
let winSound: HTMLAudioElement;
let loseSound: HTMLAudioElement;

function setup(p: p5) {
  board = new Board(7, 6);

  board.onWin = () => {
    playSound(winSound);
  };
  board.onLose = () => {
    playSound(loseSound);
  };

  p.createCanvas(
    margin * 2 + board.columns * fieldSize,
    margin * 2 + (board.rows + 1) * fieldSize + 30
  );

  var levelSelect = <any>p.createSelect();
  levelSelect.position(margin, margin * 2 + (board.rows + 1) * fieldSize + 50);
  for (let i = 1; i <= 7; i++) {
    levelSelect.option("Level " + i.toString(), i);
  }
  levelSelect.changed(event => {
    board.level = parseInt(levelSelect.value());
  });
}

function playSound(sound: HTMLAudioElement) {
  setTimeout(() => {
    sound.play();
  }, 300);
}

function preload(p: p5) {
  dropSound = new Audio(
    "https://linz.coderdojo.net/uebungsanleitungen/programmieren/web/vier-gewinnt-p5js/source/assets/drop.wav"
  );

  winSound = new Audio(
    "https://linz.coderdojo.net/uebungsanleitungen/programmieren/web/vier-gewinnt-p5js/source/assets/win.wav"
  );

  loseSound = new Audio(
    "https://linz.coderdojo.net/uebungsanleitungen/programmieren/web/vier-gewinnt-p5js/source/assets/lose.wav"
  );
}

function mouseClicked(p: p5) {
  if (
    p.mouseX >= p.width / 2 - 50 &&
    p.mouseX <= p.width / 2 + 50 &&
    p.mouseY >= p.height - margin &&
    p.mouseY <= p.height - margin + 20
  ) {
    board.reset();
  } else if (p.mouseY <= margin + (board.rows + 1) * fieldSize) {
    if (board.addDisc(getColumnFromMousePosition())) {
      dropSound.play();
    }
  }
}

function draw(p: p5) {
  p.background("white");
  p.stroke("black");

  // reset button
  p.textSize(11);
  p.fill("lime");
  p.rect(p.width / 2 - 50, p.height - margin, 100, 20, 3);

  p.fill("black");
  p.textAlign(p.CENTER, p.CENTER);
  p.text("RESTART", p.width / 2, p.height - margin + 10);

  // resetButton.mouseClicked(() => {
  //   board = new Board(7, 6);
  // });

  // draw board
  p.fill("yellow");
  p.rect(
    margin,
    margin + fieldSize,
    board.columns * fieldSize,
    board.rows * fieldSize,
    5
  );

  for (let row = 0; row < board.rows; row++) {
    for (let col = 0; col < board.columns; col++) {
      let color = "white";

      let status = board.getStatus(col, row);
      if (status == 1) {
        color = "blue";
      } else if (status == 2) {
        color = "red";
      }

      p.fill(color);
      p.circle(
        margin + col * fieldSize + fieldSize / 2,
        margin + row * fieldSize + fieldSize + fieldSize / 2,
        fieldSize * 0.6
      );
    }
  }

  // draw player 1 disc
  if (board.winner) {
    // highlight fields
    p.noFill();
    p.stroke("lime");
    p.strokeWeight(3);
    for (let field of board.winnerFields) {
      p.circle(
        margin + field.col * fieldSize + fieldSize / 2,
        margin + field.row * fieldSize + fieldSize + fieldSize / 2,
        fieldSize * 0.6
      );
    }
    p.strokeWeight(1);
    p.stroke("black");

    // show winner
    p.fill("black");
    p.textAlign(p.CENTER, p.BOTTOM);
    p.textSize(20);
    if (board.winner == 1) {
      p.text("YOU WON", p.width / 2, margin + fieldSize * 0.9);
    } else {
      p.text("COMPUTER WON", p.width / 2, margin + fieldSize * 0.9);
    }
  } else {
    let col = getColumnFromMousePosition();

    p.fill("blue");
    p.circle(
      margin + col * fieldSize + fieldSize / 2,
      margin + fieldSize / 2,
      fieldSize * 0.6
    );
  }
}

function getColumnFromMousePosition(): number {
  let col = Math.round((p.mouseX - margin - fieldSize / 2) / fieldSize);
  col = Math.min(col, board.columns - 1);
  col = Math.max(col, 0);
  return col;
}

const p = new p5((p: p5) => {
  p.preload = () => preload(p);
  p.setup = () => setup(p);
  p.draw = () => draw(p);
  p.mouseClicked = () => mouseClicked(p);
  return p;
});
