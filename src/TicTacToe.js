import React, { useState, useEffect, useCallback } from 'react';
import { User } from 'lucide-react';
import SpaceParticles from './components/SpaceParticles';

const Cell = ({ value, onClick, disabled, isWinningCell }) => (
  <button
    className={`w-full h-full aspect-square flex items-center justify-center text-4xl font-bold transition-all duration-200 border border-gray-600
      ${disabled 
        ? 'bg-gray-800 cursor-default' 
        : 'bg-gray-800 hover:bg-gray-700 hover:shadow-inner active:bg-gray-900 active:shadow-none'
      }
      ${isWinningCell && value === 'X' ? 'text-purple-400' : ''}
      ${isWinningCell && value === 'O' ? 'text-teal-400' : ''}
      ${!isWinningCell ? 'text-gray-400' : ''}
    `}
    onClick={onClick}
    disabled={disabled}
  >
    {value}
  </button>
);

const Board = ({ squares, onClick, isComputerTurn, isTwoPlayerMode, winningLine }) => (
  <div className="grid grid-cols-3 gap-1 w-full max-w-xs mx-auto bg-gray-900 p-1">
    {squares.map((square, i) => (
      <Cell 
        key={i} 
        value={square} 
        onClick={() => onClick(i)} 
        disabled={(isComputerTurn && !isTwoPlayerMode) || square !== null}
        isWinningCell={winningLine && winningLine.includes(i)}
      />
    ))}
  </div>
);

const ScoreBoard = ({ scores, currentPlayer, isTwoPlayerMode, winner, toggleMode }) => (
  <div className="flex justify-between text-gray-400 mt-4 text-sm">
    <div className={`transition-all duration-300 ${
      winner === 'X' ? 'text-purple-400' : 
      (currentPlayer === 'X' && !winner) ? 'text-purple-400 glow' : ''
    }`}>
      PLAYER 1 (X)<br/>{scores.player1}
    </div>
    <div>
      TIE<br/>
      {isTwoPlayerMode ? scores.tieTwoPlayer : scores.tieVsComputer}
    </div>
    <div className={`transition-all duration-300 ${
      winner === 'O' ? 'text-teal-400' : 
      (currentPlayer === 'O' && !winner) ? 'text-teal-400 glow' : ''
    }`}>
      {isTwoPlayerMode ? 'PLAYER 2' : 'COMPUTER'} (O)<br/>
      {isTwoPlayerMode ? scores.player2 : scores.computer}
    </div>
    <div className="flex items-center cursor-pointer" onClick={toggleMode}>
      <User size={20} />
      <span className="ml-1">{isTwoPlayerMode ? '2P' : '1P'}</span>
    </div>
  </div>
);

const calculateWinner = (squares) => {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: lines[i] };
    }
  }
  return { winner: null, line: null };
};

const minimax = (newSquares, depth, isMaximizing) => {
  const { winner } = calculateWinner(newSquares);

  if (winner === 'O') return 10 - depth;
  if (winner === 'X') return depth - 10;
  if (newSquares.every(Boolean)) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < newSquares.length; i++) {
      if (newSquares[i] === null) {
        newSquares[i] = 'O';
        const score = minimax(newSquares, depth + 1, false);
        newSquares[i] = null;
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < newSquares.length; i++) {
      if (newSquares[i] === null) {
        newSquares[i] = 'X';
        const score = minimax(newSquares, depth + 1, true);
        newSquares[i] = null;
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
};

const computerMove = (squares) => {
  let bestScore = -Infinity;
  let move = null;

  for (let i = 0; i < squares.length; i++) {
    if (squares[i] === null) {
      squares[i] = 'O';
      const score = minimax(squares, 0, false);
      squares[i] = null;
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }

  return move;
};

const TicTacToe = () => {
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [scores, setScores] = useState({
    player1: 0,
    player2: 0,
    computer: 0,
    tieVsComputer: 0,
    tieTwoPlayer: 0
  });
  const [gameOver, setGameOver] = useState(false);
  const [isComputerTurn, setIsComputerTurn] = useState(false);
  const [winner, setWinner] = useState(null);
  const [winningLine, setWinningLine] = useState(null);
  const [isTwoPlayerMode, setIsTwoPlayerMode] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState('X');

  const toggleMode = () => {
    setIsTwoPlayerMode(!isTwoPlayerMode);
    resetGame();
  };

  const updateScores = useCallback((newWinner) => {
    setScores(prevScores => {
      if (isTwoPlayerMode) {
        return {
          ...prevScores,
          player1: prevScores.player1 + (newWinner === 'X' ? 1 : 0),
          player2: prevScores.player2 + (newWinner === 'O' ? 1 : 0),
          tieTwoPlayer: prevScores.tieTwoPlayer + (newWinner === null ? 1 : 0)
        };
      } else {
        return {
          ...prevScores,
          player1: prevScores.player1 + (newWinner === 'X' ? 1 : 0),
          computer: prevScores.computer + (newWinner === 'O' ? 1 : 0),
          tieVsComputer: prevScores.tieVsComputer + (newWinner === null ? 1 : 0)
        };
      }
    });
    setWinner(newWinner);
  }, [isTwoPlayerMode]);

  const checkGameState = useCallback((newSquares) => {
    const { winner: newWinner, line } = calculateWinner(newSquares);
    if (newWinner) {
      setGameOver(true);
      updateScores(newWinner);
      setWinningLine(line);
    } else if (newSquares.every(Boolean)) {
      setGameOver(true);
      updateScores(null);
    } else {
      if (isTwoPlayerMode) {
        setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
      } else {
        setIsComputerTurn(currentPlayer === 'X');
      }
    }
  }, [updateScores, isTwoPlayerMode, currentPlayer]);

  const makeMove = useCallback((i) => {
    if (gameOver || squares[i] || (!isTwoPlayerMode && isComputerTurn)) return;

    const newSquares = [...squares];
    newSquares[i] = currentPlayer;
    setSquares(newSquares);

    checkGameState(newSquares);
  }, [squares, gameOver, isComputerTurn, isTwoPlayerMode, checkGameState, currentPlayer]);

  useEffect(() => {
    if (isComputerTurn && !gameOver && !isTwoPlayerMode) {
      const timer = setTimeout(() => {
        const moveIndex = computerMove(squares);
        if (moveIndex !== null) {
          const newSquares = [...squares];
          newSquares[moveIndex] = 'O';
          setSquares(newSquares);
          checkGameState(newSquares);
          setIsComputerTurn(false);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isComputerTurn, gameOver, squares, isTwoPlayerMode, checkGameState]);

  const resetGame = () => {
    setSquares(Array(9).fill(null));
    setGameOver(false);
    setIsComputerTurn(false);
    setWinner(null);
    setWinningLine(null);
    setCurrentPlayer('X');
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-black p-4">
      <SpaceParticles />
      <div className="relative z-10 w-full max-w-md">
        <Board 
          squares={squares} 
          onClick={makeMove} 
          isComputerTurn={isComputerTurn || gameOver}
          isTwoPlayerMode={isTwoPlayerMode}
          winningLine={winningLine}
        />
        <ScoreBoard 
          scores={scores} 
          currentPlayer={currentPlayer}
          isTwoPlayerMode={isTwoPlayerMode} 
          winner={winner} 
          toggleMode={toggleMode} 
        />
        {gameOver && (
          <button
            className="w-full mt-4 px-4 py-2 text-gray-300 bg-gray-800 rounded hover:bg-gray-700 transition-colors duration-200"
            onClick={resetGame}
          >
            New Game
          </button>
        )}
      </div>
    </div>
  );
};

export default TicTacToe;