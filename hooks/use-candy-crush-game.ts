import { useState, useEffect, useCallback } from 'react';
import { BOARD_SIZE, NUM_CANDY_TYPES, EMPTY_CANDY } from '@/data/candy-types';

type Board = number[][];
type SelectedCandy = { row: number; col: number } | null;

export function useCandyCrushGame() {
  const [board, setBoard] = useState<Board>([]);
  const [selectedCandy, setSelectedCandy] = useState<SelectedCandy>(null);
  const [score, setScore] = useState(0); // New score state

  // Helper to get a random candy type
  const getRandomCandy = useCallback(() => {
    return Math.floor(Math.random() * NUM_CANDY_TYPES) + 1;
  }, []);

  // Function to create a new board without initial matches
  const createBoard = useCallback(() => {
    const newBoard: Board = Array(BOARD_SIZE)
      .fill(0)
      .map(() => Array(BOARD_SIZE).fill(0));

    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        let candyType;
        do {
          candyType = getRandomCandy();
          newBoard[r][c] = candyType;
        } while (
          (c >= 2 &&
            newBoard[r][c] === newBoard[r][c - 1] &&
            newBoard[r][c] === newBoard[r][c - 2]) || // Check horizontal match
          (r >= 2 &&
            newBoard[r][c] === newBoard[r - 1][c] &&
            newBoard[r][c] === newBoard[r - 2][c]) // Check vertical match
        );
      }
    }
    return newBoard;
  }, [getRandomCandy]);

  // Initialize board on component mount
  useEffect(() => {
    setBoard(createBoard());
    setScore(0); // Reset score on new game
  }, [createBoard]);

  // Find all matches (horizontal and vertical)
  const findMatches = useCallback((currentBoard: Board) => {
    const matches: { row: number; col: number }[] = [];
    const matchedCells = new Set<string>(); // To avoid duplicate entries for the same cell

    // Check horizontal matches
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE - 2; c++) {
        const candy = currentBoard[r][c];
        if (candy !== EMPTY_CANDY && candy === currentBoard[r][c + 1] && candy === currentBoard[r][c + 2]) {
          let matchLength = 0;
          while (c + matchLength < BOARD_SIZE && currentBoard[r][c + matchLength] === candy) {
            matchLength++;
          }
          for (let i = 0; i < matchLength; i++) {
            const cellKey = `${r},${c + i}`;
            if (!matchedCells.has(cellKey)) {
              matches.push({ row: r, col: c + i });
              matchedCells.add(cellKey);
            }
          }
          c += matchLength - 1; // Skip already matched candies
        }
      }
    }

    // Check vertical matches
    for (let c = 0; c < BOARD_SIZE; c++) {
      for (let r = 0; r < BOARD_SIZE - 2; r++) {
        const candy = currentBoard[r][c];
        if (candy !== EMPTY_CANDY && candy === currentBoard[r + 1][c] && candy === currentBoard[r + 2][c]) {
          let matchLength = 0;
          while (r + matchLength < BOARD_SIZE && currentBoard[r + matchLength][c] === candy) {
            matchLength++;
          }
          for (let i = 0; i < matchLength; i++) {
            const cellKey = `${r + i},${c}`;
            if (!matchedCells.has(cellKey)) {
              matches.push({ row: r + i, col: c });
              matchedCells.add(cellKey);
            }
          }
          r += matchLength - 1; // Skip already matched candies
        }
      }
    }

    return matches;
  }, []);

  // Remove matched candies and return new board state
  const removeMatches = useCallback((currentBoard: Board, matches: { row: number; col: number }[]) => {
    const newBoard = currentBoard.map((row) => [...row]); // Deep copy
    matches.forEach(({ row, col }) => {
      newBoard[row][col] = EMPTY_CANDY;
    });
    return newBoard;
  }, []);

  // Apply gravity: move candies down to fill empty spaces
  const applyGravity = useCallback((currentBoard: Board) => {
    const newBoard = currentBoard.map((row) => [...row]); // Deep copy
    for (let c = 0; c < BOARD_SIZE; c++) {
      let emptyRow = BOARD_SIZE - 1;
      for (let r = BOARD_SIZE - 1; r >= 0; r--) {
        if (newBoard[r][c] !== EMPTY_CANDY) {
          if (emptyRow !== r) {
            newBoard[emptyRow][c] = newBoard[r][c];
            newBoard[r][c] = EMPTY_CANDY;
          }
          emptyRow--;
        }
      }
    }
    return newBoard;
  }, []);

  // Fill empty spaces at the top with new random candies
  const fillEmptySpaces = useCallback((currentBoard: Board) => {
    const newBoard = currentBoard.map((row) => [...row]); // Deep copy
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (newBoard[r][c] === EMPTY_CANDY) {
          newBoard[r][c] = getRandomCandy();
        }
      }
    }
    return newBoard;
  }, [getRandomCandy]);

  // Process matches recursively (cascading matches)
  const processMatches = useCallback(async (currentBoard: Board): Promise<Board> => {
    const matches = findMatches(currentBoard);
    if (matches.length === 0) {
      return currentBoard; // No more matches, stop recursion
    }

    // Award Score based on matches
    const scoreGained = matches.length * 10; // Example score calculation
    setScore(prevScore => prevScore + scoreGained); // Update score

    let nextBoard = removeMatches(currentBoard, matches);
    nextBoard = applyGravity(nextBoard);
    nextBoard = fillEmptySpaces(nextBoard);

    // Small delay to visualize the cascade
    await new Promise((resolve) => setTimeout(resolve, 200));

    return processMatches(nextBoard); // Recurse
  }, [findMatches, removeMatches, applyGravity, fillEmptySpaces]);

  // Swap two candies
  const swapCandies = useCallback((r1: number, c1: number, r2: number, c2: number) => {
    setBoard((prevBoard) => {
      const newBoard = prevBoard.map((row) => [...row]);
      [newBoard[r1][c1], newBoard[r2][c2]] = [newBoard[r2][c2], newBoard[r1][c1]];
      return newBoard;
    });
  }, []);

  // Handle candy click logic
  const handleCandyClick = useCallback(async (row: number, col: number) => {
    if (selectedCandy === null) {
      // First candy selected
      setSelectedCandy({ row, col });
    } else {
      // Second candy selected, attempt swap
      const r1 = selectedCandy.row;
      const c1 = selectedCandy.col;
      const r2 = row;
      const c2 = col;

      // Check if adjacent
      const isAdjacent =
        (Math.abs(r1 - r2) === 1 && c1 === c2) ||
        (Math.abs(c1 - c2) === 1 && r1 === r2);

      if (isAdjacent) {
        // Perform speculative swap
        const tempBoard = board.map((rowArr) => [...rowArr]);
        [tempBoard[r1][c1], tempBoard[r2][c2]] = [tempBoard[r2][c2], tempBoard[r1][c1]];

        // Check for matches after speculative swap
        const matchesAfterSwap = findMatches(tempBoard);

        if (matchesAfterSwap.length > 0) {
          // Valid swap, commit it and process matches
          setBoard(tempBoard);
          await new Promise((resolve) => setTimeout(resolve, 100)); // Small delay for swap animation
          const finalBoard = await processMatches(tempBoard);
          setBoard(finalBoard);
        } else {
          // Invalid swap, no matches, revert (or just don't commit)
          // Optionally, add a visual "shake" or "no-match" animation here
        }
      }
      // Reset selected candy regardless of swap validity
      setSelectedCandy(null);
    }
  }, [selectedCandy, board, findMatches, processMatches]);

  return { board, handleCandyClick, selectedCandy, score }; // Return score
}
