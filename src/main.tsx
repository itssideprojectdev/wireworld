import gameBoard from './wireworld.txt?raw';

/*
 * have some class to manage state
 * have some thing to manage drawing
 * */

function main() {
  const scale = 3;
  let lines = gameBoard.split('\r\n');
  const width = Math.max(...lines.map((e) => e.length));
  const height = lines.length;

  const boardWidth = width * scale;
  const boardHeight = height * scale;
  const canvas = document.createElement('canvas');
  canvas.width = boardWidth;
  canvas.height = boardHeight;
  document.getElementById('root')!.appendChild(canvas);
  const context = canvas.getContext('2d')!;
  context.fillStyle = '#000000';
  context.fillRect(0, 0, boardWidth, boardHeight);

  const wireworld = new WireWorld(width, height, scale);

  for (let y = 0; y < lines.length; y++) {
    const line = lines[y].split('');
    for (let x = 0; x < line.length; x++) {
      switch (line[x]) {
        case ' ':
          wireworld.set(x, y, 0);
          break;
        case '@':
          wireworld.set(x, y, 1);
          break;
        case '~':
          wireworld.set(x, y, 2);
          break;
        case '#':
          wireworld.set(x, y, 3);
          break;
      }
    }
  }

  setInterval(() => {
    wireworld.draw(context);
    console.time('draw');
    for (let ticks = 0; ticks < 10; ticks++) {
      wireworld.tick();
    }
    console.timeEnd('draw');
  }, 0);
}

class WireWorld {
  private grid: TwoDArray<WireWorldState>;
  constructor(
    public width: number,
    public height: number,
    public drawingScale: number
  ) {
    this.grid = new TwoDArray(width, height);

    this.grid.setAll(0);
  }
  get(x: number, y: number): WireWorldState {
    return this.grid.get(x, y);
  }
  set(x: number, y: number, value: WireWorldState) {
    this.grid.set(x, y, value);
  }
  draw(context: CanvasRenderingContext2D) {
    context.fillStyle = '#000000';
    context.fillRect(0, 0, this.grid.width * this.drawingScale, this.grid.height * this.drawingScale);
    for (let x = 0; x < this.grid.width; x++) {
      for (let y = 0; y < this.grid.height; y++) {
        const state = this.get(x, y);
        switch (state) {
          case 0:
            // context.fillStyle = '#000000';
            break;
          case 1:
            context.fillStyle = '#FFF59B';
            context.fillRect(x * this.drawingScale, y * this.drawingScale, this.drawingScale, this.drawingScale);
            break;
          case 2:
            context.fillStyle = '#89D2FF';
            context.fillRect(x * this.drawingScale, y * this.drawingScale, this.drawingScale, this.drawingScale);
            break;
          case 3:
            context.fillStyle = '#a699ff';
            context.fillRect(x * this.drawingScale, y * this.drawingScale, this.drawingScale, this.drawingScale);
            break;
        }
      }
    }
  }

  tick() {
    const nextGrid = this.grid.clone();
    for (let x = 0; x < this.grid.width; x++) {
      for (let y = 0; y < this.grid.height; y++) {
        const cell = this.grid.get(x, y);
        switch (cell) {
          case 0:
            // do nothing
            // nextGrid.set(x, y, 0);
            break;
          case 1:
            nextGrid.set(x, y, 2);
            break;
          case 2:
            nextGrid.set(x, y, 3);
            break;
          case 3:
            const neighbors = this.countNeighbors(x, y);
            if (neighbors === 1 || neighbors === 2) {
              nextGrid.set(x, y, 1);
            } else {
              nextGrid.set(x, y, 3);
            }
            break;
        }
      }
    }
    this.grid = nextGrid;
  }

  private countNeighbors(xx: number, yy: number) {
    const minX = Math.max(xx - 1, 0);
    const maxX = Math.min(xx + 1, this.grid.width - 1);
    const minY = Math.max(yy - 1, 0);
    const maxY = Math.min(yy + 1, this.grid.height - 1);
    let count = 0;
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        if (x === xx && y === yy) {
          continue;
        }
        count += this.grid.get(x, y) === 1 ? 1 : 0;
      }
    }
    return count;
  }
}

type WireWorldState = 0 | 1 | 2 | 3;

// 0 is empty
// 1 is head
// 2 is tail
// 3 is copper

class TwoDArray<T extends number> {
  grid: Uint8Array;
  constructor(
    public width: number,
    public height: number
  ) {
    this.grid = new Uint8Array(width * height);
  }
  get(x: number, y: number): T {
    return this.grid[x + y * this.width] as T;
  }
  set(x: number, y: number, value: T) {
    this.grid[x + y * this.width] = value;
  }

  setAll(value: T) {
    this.grid.fill(value);
  }

  clone() {
    const twoDArray = new TwoDArray<T>(this.width, this.height);
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        twoDArray.set(x, y, this.get(x, y));
      }
    }
    return twoDArray;
  }
}

main();
