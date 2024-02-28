import React, { useCallback, useState, useRef } from "react";
import { produce } from "immer";
import "./App.css";

const numRows = 30;
const numCols = 30;

const operations = [
  [0, 1],
  [0, -1],
  [1, 0],
  [1, 1],
  [1, -1],
  [-1, 0],
  [-1, 1],
  [-1, -1],
];

const CreateClearGrid = () => {
  const rows = [];
  for (let i = 0; i < numRows; i++) {
    rows.push(Array.from(Array(numCols), () => 0));
  }
  return rows;
};

const CreateRandomGrid = () => {
  const rows = [];
  for (let i = 0; i < numRows; i++) {
    rows.push(
      Array.from(Array(numCols), () =>
        Math.random() > 0.5 ? 0 : Math.random() < 0.5 ? 1 : -1
      )
    );
  }
  return rows;
};

const CreateEnemyGrid = () => {
  const rows = [];
  for (let i = 0; i < numRows; i++) {
    rows.push(
      Array.from(Array(numCols), () =>
        Math.random() > 0.8 ? -1 : 0
      )
    );
  }
  return rows;
};

const CountRows = (rows: any[][]) => {
  let count = 0
  for (let i = 0; i < numRows; i++) {
    for (let k = 0; k < numCols; k++) {
      count += rows[i][k]
    }
  }
  return count
}

const App: React.FC = () => {
  const [grid, setGrid] = useState(() => {
    return CreateClearGrid();
  });

  const [running, setRunning] = useState(false);

  const [score, setScore] = useState(0);

  const [count, setCount] = useState(0);

  const runningRef = useRef(running);
  runningRef.current = running;

  const runSimulation = useCallback(() => {
    if (!runningRef.current) {
      return;
    }
    setCount((count) => {return count + 1})
    // simulate
    setGrid((grid) => {
      return produce(grid, (gridCopy) => {
        let score_sum = 0;
        for (let i = 0; i < numRows; i++) {
          for (let k = 0; k < numCols; k++) {
            // 隣接するセルの01を確認
            let pink_neighbors = 0;
            let blue_neighbors = 0;

            operations.forEach(([x, y]) => {
              let newI = i + x;
              let newK = k + y;

              if (newI < 0) {
                newI = numRows + x;
              } else if (newI >= numRows) {
                newI = 0;
              }

              if (newK < 0) {
                newK = numCols + y;
              } else if (newK >= numCols) {
                newK = 0;
              }

              if (grid[newI][newK] === 1) {
                pink_neighbors += 1;
              } else if (grid[newI][newK] === -1) {
                blue_neighbors += 1;
              }
            });
            // 生死の条件
            // pink
            if (grid[i][k] === 1) {
              if (pink_neighbors < 2 || pink_neighbors > 3) {
                gridCopy[i][k] = 0;
              } else if (pink_neighbors < blue_neighbors) {
                gridCopy[i][k] = -1;
              }
              // blue
            } else if (grid[i][k] === -1) {
              if (blue_neighbors < 2 || blue_neighbors > 3) {
                gridCopy[i][k] = 0;
              } else if (blue_neighbors < pink_neighbors) {
                gridCopy[i][k] = 1;
              }
            } else if (grid[i][k] === 0) {
              if (pink_neighbors === 3 && pink_neighbors > blue_neighbors) {
                gridCopy[i][k] = 1;
              }
              if (blue_neighbors === 3 && blue_neighbors > pink_neighbors) {
                gridCopy[i][k] = -1;
              }
            }
            score_sum += gridCopy[i][k]
          }
        }
        setScore(score_sum);
      });
    });
    
    setTimeout(runSimulation, 500);
  }, []);

  return (
    <>
      <button
        onClick={() => {
          setRunning(!running);
          if (!running) {
            runningRef.current = true;
            runSimulation();
          }
        }}
      >
        {running ? "stop" : "start"}
      </button>
      <button
        onClick={() => {
          let rows = CreateClearGrid()
          setGrid(rows);
          setCount(0);
          setScore(CountRows(rows))
        }}
      >
        clear
      </button>
      <button
        onClick={() => {
          let rows = CreateRandomGrid()
          setGrid(rows);
          setCount(0);
          setScore(CountRows(rows))
        }}
      >
        random
      </button>
      <button
        onClick={() => {
          let rows = CreateEnemyGrid()
          setGrid(rows);
          setCount(0);
          setScore(CountRows(rows))
        }}
      >
        enemy
      </button>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${numCols}, 20px)`,
        }}
      >
        {grid.map((rows, i) =>
          rows.map((col, k) => (
            <div
              key={`${i}-${k}`}
              onClick={() => {
                const newGrid = produce(grid, (gridCopy) => {
                  gridCopy[i][k] = grid[i][k] ? 0 : 1;
                });
                setGrid(newGrid);
              }}
              style={{
                width: 20,
                height: 20,
                // 0の場合は　空白　1の場合はピンク　それ以外はブルー
                backgroundColor:
                  grid[i][k] === 0
                    ? undefined
                    : grid[i][k] === 1
                    ? "pink"
                    : "skyblue",
                border: "solid 1px black",
              }}
            />
          ))
        )}
      </div>
      <output>スコア：{score}</output>
      <output>カウント：{count}</output>
    </>
  );
};

export default App;
