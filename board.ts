// Based on the work of Daniel Shiffman, http://codingtra.in, https://youtu.be/CKeyIbT3vXI
import p5 from "p5";

export class Board {
  public columns: number;
  public rows: number;
  public winner: number = 0;
  public winnerFields: { col: number; row: number }[] = [];
  public level: number = 1;

  public onWin?: () => void;
  public onLose?: () => void;

  private fields: number[][];

  constructor(columns: number, rows: number) {
    this.columns = columns;
    this.rows = rows;

    this.reset();
  }

  public reset() {
    this.winner = 0;
    this.winnerFields = [];

    this.fields = new Array(this.columns);
    for (let col = 0; col < this.columns; col++) {
      this.fields[col] = new Array(this.rows);
      this.fields[col].fill(0);
    }
  }

  public addDisc(column: number): boolean {
    if (!this.winner) {
      let row = this.getEmptyRow(column);
      if (row > -1) {
        this.fields[column][row] = 1;
        this.evaluate();

        if (this.winner) {
          if (this.onWin) {
            this.onWin();
          }
        } else {
          this.addDiscComputerPlayer();

          if (this.winner && this.onLose) {
            this.onLose();
          }
        }

        return true;
      } else {
        return false;
      }
    }
  }

  public getStatus(column: number, row: number) {
    return this.fields[column][row];
  }

  private getEmptyRow(column: number): number {
    let freeRow = -1;

    for (let row = this.rows - 1; row >= 0 && freeRow == -1; row--) {
      if (this.fields[column][row] == 0) {
        freeRow = row;
      }
    }

    return freeRow;
  }

  private addDiscComputerPlayer() {
    if (!this.winner) {
      // take first available field
      // let done = false;

      // for (let col = 0; col < this.fields.length && !done; col++) {
      //   let row = this.getEmptyRow(col);
      //   if (row >= 0) {
      //     this.fields[col][row] = 2;
      //     done = true;
      //   }
      // }

      // TODO: check if there are free fields

      // check two moves ahead
      console.log("---MINIMAX---");

      // next move computer player (player 2)
      const score = this.evaluateNextMoves(1, this.level, true);
      let maxScore = Math.max(...score);
      let possibleFields: number[] = [];
      for (let col = 0; col < this.fields.length; col++) {
        if (score[col] == maxScore && this.getEmptyRow(col) >= 0) {
          possibleFields.push(col);
        }
      }

      let randomCol =
        possibleFields[Math.floor(Math.random() * possibleFields.length)];
      console.log("score", score, maxScore, possibleFields, randomCol);

      let row = this.getEmptyRow(randomCol);
      this.fields[randomCol][row] = 2;

      this.evaluate();
    }
  }

  private evaluateNextMoves(
    level: number,
    maxLevel: number,
    computerPlayer: boolean
  ): number[] {
    let score: number[] = new Array(this.fields.length).fill(
      computerPlayer ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER
    );
    for (let col = 0; col < this.fields.length; col++) {
      let row = this.getEmptyRow(col);

      if (row >= 0) {
        this.fields[col][row] = computerPlayer ? 2 : 1;
        score[col] = this.evaluate(level);

        if (!this.winner && level < maxLevel) {
          const scoreNextMoves = this.evaluateNextMoves(
            level + 1,
            maxLevel,
            !computerPlayer
          );
          if (computerPlayer) {
            score[col] = Math.min(...scoreNextMoves);
          } else {
            score[col] = Math.max(...scoreNextMoves);
          }
        }

        this.fields[col][row] = 0;
      }

      if (level < 2) {
        console.log("Level " + level + ": " + score.join(","));
      }
    }

    return score;
  }

  private evaluate(level = 1): number {
    this.winnerFields = [];
    this.winner = 0;
    let discs = 0;
    let score = 0;

    for (let col = 0; col < this.fields.length; col++) {
      for (let row = 0; row < this.fields[col].length; row++) {
        // horizontal
        if (col < this.fields.length - 3) {
          discs = this.countDiscs(col, row, 1, 0, 1);
          score -= 10 ** discs;

          discs = this.countDiscs(col, row, 1, 0, 2);
          score += 10 ** discs;
        }

        // vertical
        if (row < this.fields[0].length - 3) {
          discs = this.countDiscs(col, row, 0, 1, 1);
          score -= 10 ** discs;

          discs = this.countDiscs(col, row, 0, 1, 2);
          score += 10 ** discs;
        }

        // diagonal right down
        if (col < this.fields.length - 3 && row < this.fields[0].length - 3) {
          discs = this.countDiscs(col, row, 1, 1, 1);
          score -= 10 ** discs;

          discs = this.countDiscs(col, row, 1, 1, 2);
          score += 10 ** discs;
        }

        // diagonal right up
        if (col < this.fields.length - 3 && row > 3) {
          discs = this.countDiscs(col, row, 1, -1, 1);
          score -= 10 ** discs;

          discs = this.countDiscs(col, row, 1, -1, 2);
          score += 10 ** discs;
        }
      }
    }

    if (this.winner == 1) {
      score = Number.MIN_SAFE_INTEGER / level;
    } else if (this.winner == 2) {
      score = Number.MAX_SAFE_INTEGER / level;
    }

    return score;
  }

  private countDiscs(
    startCol: number,
    startRow: number,
    colDiff: number,
    rowDiff: number,
    player: number
  ): number {
    let result = 0;
    let col = startCol;
    let row = startRow;

    for (let i = 0; i < 4 && result > -1; i++) {
      if (this.fields[col][row] == player) {
        result++;
      } else if (this.fields[col][row] != 0) {
        result = -1;
      }

      col += colDiff;
      row += rowDiff;
    }

    // set winner
    if (result == 4) {
      this.winner = player;

      // set winner discs
      let col = startCol;
      let row = startRow;
      for (let i = 0; i < 4; i++) {
        this.winnerFields.push({ col: col, row: row });
        col += colDiff;
        row += rowDiff;
      }
    }

    if (result == -1) {
      result = 0;
    }

    return result;
  }
}
