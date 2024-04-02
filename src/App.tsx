import React, { useCallback, useState, useRef, useEffect } from "react";
import { produce } from "immer";
import { Button, Typography, Grid } from "@mui/material";
import PlayCircleFilledWhiteIcon from "@mui/icons-material/PlayCircleFilledWhite";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import ShuffleOnIcon from "@mui/icons-material/ShuffleOn";
import AndroidIcon from "@mui/icons-material/Android";
import "@fontsource/roboto/300.css";
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
    rows.push(Array.from(Array(numCols), () => (Math.random() > 0.8 ? -1 : 0)));
  }
  return rows;
};

const CountRows = (rows: any[][]) => {
  let count = 0;
  for (let i = 0; i < numRows; i++) {
    for (let k = 0; k < numCols; k++) {
      count += rows[i][k];
    }
  }
  return count;
};

const App: React.FC = () => {
  const [grid, setGrid] = useState(() => {
    return CreateClearGrid();
  });

  const [running, setRunning] = useState(false);

  const [score, setScore] = useState(0);

  const [count, setCount] = useState(0);
  const maxCount = 50;

  const runningRef = useRef(running);
  runningRef.current = running;

  const runSimulation = useCallback(() => {
    if (!runningRef.current) {
      return;
    }
    setCount((count) => {
      return count + 1;
    });
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
            // ピンク陣営
            if (grid[i][k] === 1) {
              if (pink_neighbors < 2 || pink_neighbors > 3) {
                gridCopy[i][k] = 0;
              } else if (pink_neighbors < blue_neighbors) {
                gridCopy[i][k] = -1;
              }
              // ブルー陣営
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
            score_sum += gridCopy[i][k];
          }
        }
        setScore(score_sum);
      });
    });
    setTimeout(runSimulation, 200);
  }, []);

  useEffect(() => {
    if (count > maxCount - 1) {
      // terminate simulation
      setRunning(false);
    }
    console.log("Count:", count);
  }, [count]);

  return (
    <>
      <Grid
        container
        alignItems="center"
        justifyContent="center"
        direction="column"
      >
        <Grid item>
          <Typography variant="h2" gutterBottom>
            Game of 2 Life
          </Typography>
        </Grid>
      </Grid>
      <Grid
        container
        alignItems="center"
        justifyContent="center"
        direction="column"
      >
        <Grid item>
          <Typography variant="h5" gutterBottom>
            50カウント後より繫栄する植生を探索しましょう。
          </Typography>
        </Grid>
        <Grid item>
          <Typography variant="h6" gutterBottom>
            <PlayCircleFilledWhiteIcon />
            START : シミュレーションを開始します。
            <br />
            <DeleteForeverIcon />
            CLEAR : シミュレーションをリセットします。
            <br />
            <ShuffleOnIcon />
            SHUFFLE : ２つの種族をランダムに配置します。
            <br />
            <AndroidIcon />
            ENEMY : 敵対種族のみをランダムに配置します。
            <br />
            SCORE:スコアを表示します。
            <br />
            COUNT:経過した世代数を表示します。
          </Typography>
        </Grid>
        <Grid item>
          <Typography variant="h5" gutterBottom></Typography>
        </Grid>
      </Grid>
      <Grid
        container
        alignItems="center"
        justifyContent="center"
        direction="row"
        sx={{ marginTop: "15px" }}
      >
        <Grid item>
          <Typography variant="h5" gutterBottom>
            COUNT: {count}
          </Typography>
        </Grid>
        <Grid item sx={{ marginLeft: "15px" }}>
          <Typography variant="h5" gutterBottom>
            SCORE: {score}
          </Typography>
        </Grid>
      </Grid>

      {/*グリッド*/}
      <Grid
        container
        alignItems="center"
        justifyContent="center"
        direction="column"
      >
        <Grid item>
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
        </Grid>
      </Grid>

      <Grid
        container
        justifyContent="center"
        sx={{ marginTop: "15px" }}
        spacing={1}
      >
        {/*スタート&ストップボタン*/}
        <Grid item>
          <Button
            variant="contained"
            size="large"
            onClick={() => {
              if(count < maxCount - 1){
                setRunning(!running);
                if (!running) {
                  runningRef.current = true;
                  runSimulation();
                }
            }
            }}
          >
            {running ? <StopCircleIcon /> : <PlayCircleFilledWhiteIcon />}
            {running ? "Stop" : "Start"}
          </Button>
        </Grid>

        <Grid item>
          {/*クリアボタン*/}
          <Button
            variant="contained"
            size="large"
            onClick={() => {
              let rows = CreateClearGrid();
              setGrid(rows);
              setCount(0);
              setScore(CountRows(rows));
              setRunning(false);
            }}
          >
            <DeleteForeverIcon />
            Clear
          </Button>
        </Grid>

        <Grid item>
          {/*シャッフルボタン*/}
          <Button
            variant="contained"
            size="large"
            onClick={() => {
              let rows = CreateRandomGrid();
              setGrid(rows);
              setCount(0);
              setScore(CountRows(rows));
              setRunning(false);
            }}
          >
            <ShuffleOnIcon />
            Shuffle
          </Button>
        </Grid>

        <Grid item>
          {/*エネミーボタン*/}
          <Button
            variant="contained"
            size="large"
            onClick={() => {
              let rows = CreateEnemyGrid();
              setGrid(rows);
              setCount(0);
              setScore(CountRows(rows));
              setRunning(false);
            }}
          >
            <AndroidIcon />
            Enemy
          </Button>
        </Grid>
      </Grid>
    </>
  );
};

export default App;
