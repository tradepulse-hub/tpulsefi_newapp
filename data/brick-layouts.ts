import { Brick } from "@/components/brick-breaker-game";

// Define cores para os tijolos
const BRICK_COLORS = ["#FF6B6B", "#FFD166", "#06D6A0", "#118AB2", "#073B4C"]; // Red, Yellow, Green, Blue, Dark Blue

// Função auxiliar para criar um tijolo
const createBrick = (x: number, y: number, width: number, height: number, health: number, color: string): Brick => ({
  x, y, width, height, health, color, isDestroyed: false,
});

// Layouts dos níveis
export const LEVEL_LAYOUTS = [
  // Level 1
  (brickWidth: number, brickHeight: number, brickPadding: number, offsetTop: number): Brick[] => {
    const bricks: Brick[] = [];
    const BRICK_ROWS = 5;
    const BRICK_COLS = 7;
    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        bricks.push(createBrick(
          c * (brickWidth + brickPadding) + brickPadding,
          r * (brickHeight + brickPadding) + brickPadding + offsetTop,
          brickWidth,
          brickHeight,
          1,
          BRICK_COLORS[r % BRICK_COLORS.length]
        ));
      }
    }
    return bricks;
  },

  // Level 2
  (brickWidth: number, brickHeight: number, brickPadding: number, offsetTop: number): Brick[] => {
    const bricks: Brick[] = [];
    const BRICK_ROWS = 6;
    const BRICK_COLS = 6; // Fewer columns, more rows
    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        if ((r + c) % 2 === 0) { // Checkerboard pattern
          bricks.push(createBrick(
            c * (brickWidth + brickPadding) + brickPadding + (brickWidth / 2), // Shifted for visual
            r * (brickHeight + brickPadding) + brickPadding + offsetTop,
            brickWidth,
            brickHeight,
            1,
            BRICK_COLORS[(r + 1) % BRICK_COLORS.length]
          ));
        }
      }
    }
    return bricks;
  },

  // Level 3
  (brickWidth: number, brickHeight: number, brickPadding: number, offsetTop: number): Brick[] => {
    const bricks: Brick[] = [];
    const BRICK_ROWS = 7;
    const BRICK_COLS = 5;
    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        if (r === 0 || r === BRICK_ROWS - 1 || c === 0 || c === BRICK_COLS - 1) { // Border pattern
          bricks.push(createBrick(
            c * (brickWidth + brickPadding) + brickPadding + (brickWidth), // Shifted
            r * (brickHeight + brickPadding) + brickPadding + offsetTop,
            brickWidth,
            brickHeight,
            1,
            BRICK_COLORS[r % BRICK_COLORS.length]
          ));
        }
      }
    }
    return bricks;
  },
  // Adicione mais níveis aqui, se desejar
];
