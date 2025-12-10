// 5x5 Tic Tac Toe with CPU AI
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing game...');
    
    const cells = document.querySelectorAll('[data-cell-index]');
    const rowLabels = document.querySelectorAll('.row-label');
    const restartButton = document.getElementById('restart-button');
    const shiftButton = document.getElementById('shift-row-button');
    const gameBoard = document.getElementById('game-board');
    const pvpButton = document.getElementById('pvp-button');
    const pvcButton = document.getElementById('pvc-button');
    const cpuDifficultyDiv = document.getElementById('cpu-difficulty');
    const difficultySelect = document.getElementById('difficulty-select');
    
    console.log('DOM elements found:');
    console.log('cells:', cells.length);
    console.log('rowLabels:', rowLabels.length);
    console.log('restartButton:', !!restartButton);
    console.log('shiftButton:', !!shiftButton);
    console.log('pvpButton:', !!pvpButton);
    console.log('pvcButton:', !!pvcButton);
    
    let gameActive = true;
    let currentPlayer = 'X';
    let gameState = new Array(25).fill('');
    let selectedRow = null;
    let gameMode = 'pvp'; // 'pvp' or 'pvc'
    let cpuDifficulty = 'medium';
    let isThinking = false;

    // Winning conditions for 5x5 tic tac toe (need 4 in a row)
    const winningConditions = [
        // Horizontal lines (4 in a row)
        [0, 1, 2, 3], [1, 2, 3, 4],
        [5, 6, 7, 8], [6, 7, 8, 9],
        [10, 11, 12, 13], [11, 12, 13, 14],
        [15, 16, 17, 18], [16, 17, 18, 19],
        [20, 21, 22, 23], [21, 22, 23, 24],
        
        // Vertical lines (4 in a row)
        [0, 5, 10, 15], [5, 10, 15, 20],
        [1, 6, 11, 16], [6, 11, 16, 21],
        [2, 7, 12, 17], [7, 12, 17, 22],
        [3, 8, 13, 18], [8, 13, 18, 23],
        [4, 9, 14, 19], [9, 14, 19, 24],
        
        // Diagonal lines (4 in a row)
        [0, 6, 12, 18], [6, 12, 18, 24],
        [1, 7, 13, 19], [5, 11, 17, 23],
        [4, 8, 12, 16], [8, 12, 16, 20],
        [3, 7, 11, 15], [9, 13, 17, 21]
    ];

    // CPU AI Functions
    function evaluatePosition(state, player) {
        let score = 0;
        
        for (const condition of winningConditions) {
            const line = condition.map(i => state[i]);
            const playerCount = line.filter(cell => cell === player).length;
            const opponentCount = line.filter(cell => cell === (player === 'X' ? 'O' : 'X')).length;
            const emptyCount = line.filter(cell => cell === '').length;
            
            if (playerCount === 4) score += 1000; // Winning
            else if (playerCount === 3 && emptyCount === 1) score += 100; // 3 in a row
            else if (playerCount === 2 && emptyCount === 2) score += 10; // 2 in a row
            else if (playerCount === 1 && emptyCount === 3) score += 1; // 1 in a row
            
            if (opponentCount === 4) score -= 1000; // Opponent winning
            else if (opponentCount === 3 && emptyCount === 1) score -= 150; // Block opponent
            else if (opponentCount === 2 && emptyCount === 2) score -= 15; // Block 2 in a row
        }
        
        return score;
    }

    function getEmptyCells(state) {
        return state.map((cell, index) => cell === '' ? index : null).filter(i => i !== null);
    }

    function countThreats(state, player) {
        let threats = 0;
        const threatDetails = [];
        
        for (let i = 0; i < winningConditions.length; i++) {
            const condition = winningConditions[i];
            const line = condition.map(index => state[index]);
            const playerCount = line.filter(cell => cell === player).length;
            const emptyCount = line.filter(cell => cell === '').length;
            
            // A threat is 3 pieces in a line with 1 empty space (immediate win threat)
            if (playerCount === 3 && emptyCount === 1) {
                threats++;
                threatDetails.push({
                    condition: i,
                    positions: condition,
                    line: line,
                    emptyPosition: condition[line.indexOf('')]
                });
            }
        }
        
        if (threats > 0) {
            console.log(`Found ${threats} threats for player ${player}:`, threatDetails);
        }
        
        return threats;
    }

    function minimax(state, depth, isMaximizing, alpha, beta, maxDepth) {
        const cpuPlayer = 'O';
        const humanPlayer = 'X';
        
        if (depth === maxDepth) {
            return evaluatePosition(state, cpuPlayer);
        }
        
        const winner = checkWinCondition(state);
        if (winner === cpuPlayer) return 1000 - depth;
        if (winner === humanPlayer) return -1000 + depth;
        if (!state.includes('')) return 0;
        
        if (isMaximizing) {
            let maxEval = -Infinity;
            const emptyCells = getEmptyCells(state);
            
            for (const cellIndex of emptyCells) {
                const newState = [...state];
                newState[cellIndex] = cpuPlayer;
                const eval1 = minimax(newState, depth + 1, false, alpha, beta, maxDepth);
                maxEval = Math.max(maxEval, eval1);
                alpha = Math.max(alpha, eval1);
                if (beta <= alpha) break;
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            const emptyCells = getEmptyCells(state);
            
            for (const cellIndex of emptyCells) {
                const newState = [...state];
                newState[cellIndex] = humanPlayer;
                const eval1 = minimax(newState, depth + 1, true, alpha, beta, maxDepth);
                minEval = Math.min(minEval, eval1);
                beta = Math.min(beta, eval1);
                if (beta <= alpha) break;
            }
            return minEval;
        }
    }

    function analyzeAllThreats(state, player) {
        const analysis = {
            immediate: 0,     // 3 pieces + 1 empty (immediate threat)
            strong: 0,        // 2 pieces + 2 empty in a row
            weak: 0,          // 1 piece + 3 empty in a row
            details: []
        };
        
        for (let i = 0; i < winningConditions.length; i++) {
            const condition = winningConditions[i];
            const line = condition.map(index => state[index]);
            const playerCount = line.filter(cell => cell === player).length;
            const opponentCount = line.filter(cell => cell === (player === 'X' ? 'O' : 'X')).length;
            const emptyCount = line.filter(cell => cell === '').length;
            
            // Only count lines that aren't blocked by opponent
            if (opponentCount === 0) {
                if (playerCount === 3 && emptyCount === 1) {
                    analysis.immediate++;
                    analysis.details.push({
                        type: 'immediate',
                        condition: i,
                        positions: condition,
                        line: line,
                        emptyPosition: condition[line.indexOf('')]
                    });
                } else if (playerCount === 2 && emptyCount === 2) {
                    analysis.strong++;
                    analysis.details.push({
                        type: 'strong',
                        condition: i,
                        positions: condition,
                        line: line
                    });
                } else if (playerCount === 1 && emptyCount === 3) {
                    analysis.weak++;
                    analysis.details.push({
                        type: 'weak',
                        condition: i,
                        positions: condition,
                        line: line
                    });
                }
            }
        }
        
        return analysis;
    }

    function getBestMove() {
        console.log('getBestMove called, gameState:', gameState);
        console.log('\n=== CPU MOVE ANALYSIS START ===');
        visualizeBoard(gameState, "Current Board State");
        
        const cpuPlayer = 'O';
        const humanPlayer = 'X';
        let bestScore = -Infinity;
        let bestMove = null;
        let bestAction = 'place';
        
        // Initial threat analysis - PRIORITY CHECK
        const currentHumanAnalysis = analyzeAllThreats(gameState, humanPlayer);
        console.log('Current human threats:', currentHumanAnalysis);
        
        // IMMEDIATE PRIORITY: If human has ANY immediate threats, focus on disrupting them
        if (currentHumanAnalysis.immediate > 0) {
            console.log('*** HUMAN HAS IMMEDIATE THREATS - ENTERING DEFENSIVE MODE ***');
            console.log(`Detected ${currentHumanAnalysis.immediate} immediate threats that need blocking!`);
            
            // First, try to block by placing a piece in the threat position
            for (const threat of currentHumanAnalysis.details.filter(d => d.type === 'immediate')) {
                const emptyPos = threat.emptyPosition;
                if (emptyPos !== undefined && gameState[emptyPos] === '') {
                    console.log('CRITICAL BLOCK: Placing piece at position', emptyPos, 'to block immediate threat');
                    return { action: 'place', move: emptyPos };
                }
            }
            
            // If we can't block directly, try row shifting to disrupt threats
            for (let row = 0; row < 5; row++) {
                const rowStart = row * 5;
                const rowState = gameState.slice(rowStart, rowStart + 5);
                
                if (rowState.some(cell => cell !== '')) {
                    const shiftedState = simulateRowShift(gameState, row);
                    const shiftedAnalysis = analyzeAllThreats(shiftedState, humanPlayer);
                    const threatsReduced = currentHumanAnalysis.immediate - shiftedAnalysis.immediate;
                    
                    if (threatsReduced > 0) {
                        console.log('*** EMERGENCY DEFENSIVE SHIFT ***');
                        console.log(`Row ${row} shift reduces ${threatsReduced} immediate threats`);
                        console.log('Current threats:', currentHumanAnalysis.details.filter(d => d.type === 'immediate'));
                        console.log('After shift threats:', shiftedAnalysis.details.filter(d => d.type === 'immediate'));
                        visualizeBoard(shiftedState, `Emergency defensive shift row ${row}`);
                        return { action: 'shift', move: row };
                    }
                }
            }
        }
        
        // Reduce search depth for better performance
        const maxDepth = cpuDifficulty === 'easy' ? 1 : cpuDifficulty === 'medium' ? 2 : 3;
        
        // Quick win/block check first (much faster)
        const emptyCells = getEmptyCells(gameState);
        console.log('Empty cells:', emptyCells);
        
        // Check for immediate wins or blocks with AGGRESSIVE blocking
        for (const cellIndex of emptyCells) {
            // Check if CPU can win
            const testState = [...gameState];
            testState[cellIndex] = cpuPlayer;
            if (checkWinCondition(testState) === cpuPlayer) {
                console.log('Found winning move at cell:', cellIndex);
                return { action: 'place', move: cellIndex };
            }
            
            // AGGRESSIVE: Check if need to block human win - HIGHEST PRIORITY
            testState[cellIndex] = humanPlayer;
            if (checkWinCondition(testState) === humanPlayer) {
                console.log('*** CRITICAL BLOCK *** Found blocking move at cell:', cellIndex);
                return { action: 'place', move: cellIndex };
            }
            
            // AGGRESSIVE: Also check if placing here prevents human from getting 3-in-a-row
            const humanAnalysisAfterPlace = analyzeAllThreats(testState, humanPlayer);
            const currentHumanAnalysis = analyzeAllThreats(gameState, humanPlayer);
            
            if (humanAnalysisAfterPlace.immediate > currentHumanAnalysis.immediate) {
                console.log('*** PREVENTIVE BLOCK *** Cell', cellIndex, 'would create new human threats - considering blocking');
                // Don't return immediately, but score this highly in the evaluation
            }
        }
        
        // IMPROVED: Check row shifts for immediate wins/blocks BEFORE evaluating placements
        if (gameState.some(cell => cell !== '')) {
            console.log('\n=== ANALYZING ROW SHIFTS ===');
            visualizeBoard(gameState, "Current Board");
            
            for (let row = 0; row < 5; row++) {
                const rowStart = row * 5;
                const rowState = gameState.slice(rowStart, rowStart + 5);
                
                // Only consider shifting if there are pieces in the row
                if (rowState.some(cell => cell !== '')) {
                    const shiftedState = simulateRowShift(gameState, row);
                    
                    // CHECK FOR IMMEDIATE WIN FIRST!
                    if (checkWinCondition(shiftedState) === cpuPlayer) {
                        console.log('Found WINNING row shift at row:', row);
                        visualizeBoard(shiftedState, `After winning shift row ${row}`);
                        return { action: 'shift', move: row };
                    }
                    
                    // Check if shift blocks opponent win
                    if (checkWinCondition(shiftedState) === humanPlayer) {
                        // This shift would let opponent win, skip it unless current state already loses
                        if (checkWinCondition(gameState) !== humanPlayer) {
                            console.log('SKIPPING row shift', row, '- would let opponent win immediately');
                            continue; // Don't make moves that let opponent win
                        }
                    }
                    
                    // ENHANCED: Use comprehensive threat analysis with AGGRESSIVE blocking
                    const currentAnalysis = analyzeAllThreats(gameState, humanPlayer);
                    const shiftedAnalysis = analyzeAllThreats(shiftedState, humanPlayer);
                    
                    console.log(`Row ${row} threat analysis (AGGRESSIVE MODE):`, {
                        current: currentAnalysis,
                        shifted: shiftedAnalysis,
                        immediateThreatReduction: currentAnalysis.immediate - shiftedAnalysis.immediate,
                        strongThreatReduction: currentAnalysis.strong - shiftedAnalysis.strong
                    });
                    
                    // HIGHEST PRIORITY: Block any shift that creates immediate threats
                    if (shiftedAnalysis.immediate > currentAnalysis.immediate) {
                        console.log('BLOCKING row shift', row, '- creates new immediate threats');
                        continue;
                    }
                    
                    // VERY HIGH PRIORITY: Any shift that reduces immediate threats
                    if (currentAnalysis.immediate > 0 && shiftedAnalysis.immediate < currentAnalysis.immediate) {
                        const threatsRemoved = currentAnalysis.immediate - shiftedAnalysis.immediate;
                        console.log('*** FOUND THREAT-DISRUPTING ROW SHIFT ***');
                        console.log(`Row ${row} shift eliminates ${threatsRemoved} immediate threats`);
                        console.log('Current immediate threats:', currentAnalysis.details.filter(d => d.type === 'immediate'));
                        console.log('After shift immediate threats:', shiftedAnalysis.details.filter(d => d.type === 'immediate'));
                        visualizeBoard(shiftedState, `Threat-disrupting shift row ${row}`);
                        return { action: 'shift', move: row };
                    }
                    
                    // HIGH PRIORITY: Prevent strong threats from becoming immediate threats
                    if (currentAnalysis.strong > 0 && shiftedAnalysis.strong < currentAnalysis.strong) {
                        const strongThreatsReduced = currentAnalysis.strong - shiftedAnalysis.strong;
                        console.log(`Row ${row} shift reduces ${strongThreatsReduced} strong threats (preventing escalation)`);
                        // Don't return immediately, but give this high priority in scoring later
                    }
                    
                    // Check if current position has opponent about to win, and shift prevents it
                    const currentScore = evaluatePosition(gameState, humanPlayer);
                    const shiftedScore = evaluatePosition(shiftedState, humanPlayer);
                    if (currentScore >= 100 && shiftedScore < 100) { // Opponent had 3-in-a-row, now doesn't
                        console.log('Found CRITICAL BLOCKING row shift at row:', row);
                        visualizeBoard(shiftedState, `After blocking shift row ${row}`);
                        return { action: 'shift', move: row };
                    }
                    
                    // PRIORITY: Check if shift DISRUPTS existing opponent immediate threats
                    if (currentAnalysis.immediate > 0 && shiftedAnalysis.immediate < currentAnalysis.immediate) {
                        const threatsRemoved = currentAnalysis.immediate - shiftedAnalysis.immediate;
                        console.log('*** FOUND DISRUPTIVE ROW SHIFT ***');
                        console.log(`Row ${row} shift breaks up ${threatsRemoved} immediate threats`);
                        console.log('Current threats:', currentAnalysis.details.filter(d => d.type === 'immediate'));
                        console.log('After shift threats:', shiftedAnalysis.details.filter(d => d.type === 'immediate'));
                        visualizeBoard(shiftedState, `After disruptive shift row ${row}`);
                        return { action: 'shift', move: row };
                    }
                }
            }
        }
        
        // AGGRESSIVE evaluation for placing pieces - prioritize blocking
        console.log('\n=== AGGRESSIVE PLACEMENT EVALUATION ===');
        const cellsToCheck = emptyCells.slice(0, Math.min(15, emptyCells.length)); // Check more cells
        
        for (const cellIndex of cellsToCheck) {
            const newState = [...gameState];
            newState[cellIndex] = cpuPlayer;
            
            // Standard evaluation
            const score = evaluatePosition(newState, cpuPlayer);
            
            // AGGRESSIVE: Check what happens if human plays here instead
            const humanTestState = [...gameState];
            humanTestState[cellIndex] = humanPlayer;
            const humanAnalysisAfter = analyzeAllThreats(humanTestState, humanPlayer);
            const currentHumanAnalysis = analyzeAllThreats(gameState, humanPlayer);
            
            const newImmediateThreats = humanAnalysisAfter.immediate - currentHumanAnalysis.immediate;
            const newStrongThreats = humanAnalysisAfter.strong - currentHumanAnalysis.strong;
            
            // Penalty/bonus system for blocking
            let blockingBonus = 0;
            if (newImmediateThreats > 0) {
                blockingBonus += newImmediateThreats * 500; // Massive bonus for preventing immediate threats
                console.log(`Cell ${cellIndex} BLOCKS ${newImmediateThreats} immediate threats - MEGA BONUS: ${newImmediateThreats * 500}`);
            }
            if (newStrongThreats > 0) {
                blockingBonus += newStrongThreats * 100; // Good bonus for preventing strong threats
                console.log(`Cell ${cellIndex} blocks ${newStrongThreats} strong threats - bonus: ${newStrongThreats * 100}`);
            }
            
            const adjustedScore = score + blockingBonus;
            
            console.log(`Cell ${cellIndex} analysis:`, {
                baseScore: score,
                blockingBonus: blockingBonus,
                finalScore: adjustedScore,
                preventsImmediateThreats: newImmediateThreats,
                preventsStrongThreats: newStrongThreats
            });
            
            if (adjustedScore > bestScore) {
                bestScore = adjustedScore;
                bestMove = cellIndex;
                bestAction = 'place';
                console.log('New best placement:', cellIndex, 'adjusted score:', adjustedScore);
            }
        }
        
        // Re-evaluate row shifts for general improvement (non-critical moves)
        if (gameState.some(cell => cell !== '')) {
            for (let row = 0; row < 5; row++) {
                const rowStart = row * 5;
                const rowState = gameState.slice(rowStart, rowStart + 5);
                
                // Only consider shifting if there are pieces in the row
                if (rowState.some(cell => cell !== '')) {
                    const shiftedState = simulateRowShift(gameState, row);
                    
                    // Evaluate improvement independently - not relative to bestScore
                    const currentPositionScore = evaluatePosition(gameState, cpuPlayer);
                    const shiftedPositionScore = evaluatePosition(shiftedState, cpuPlayer);
                    const improvement = shiftedPositionScore - currentPositionScore;
                    
                    // AGGRESSIVE THREAT ANALYSIS: Check all threat types
                    const currentOpponentThreats = countThreats(gameState, humanPlayer);
                    const shiftedOpponentThreats = countThreats(shiftedState, humanPlayer);
                    const currentAnalysis = analyzeAllThreats(gameState, humanPlayer);
                    const shiftedAnalysis = analyzeAllThreats(shiftedState, humanPlayer);
                    
                    const threatIncrease = shiftedOpponentThreats - currentOpponentThreats;
                    const immediateThreatReduction = currentAnalysis.immediate - shiftedAnalysis.immediate;
                    const strongThreatReduction = currentAnalysis.strong - shiftedAnalysis.strong;
                    
                    console.log(`Row ${row} AGGRESSIVE shift analysis:`, {
                        current: currentPositionScore,
                        shifted: shiftedPositionScore,
                        improvement: improvement,
                        currentBestScore: bestScore,
                        threats: {
                            immediate: {
                                before: currentAnalysis.immediate,
                                after: shiftedAnalysis.immediate,
                                reduction: immediateThreatReduction
                            },
                            strong: {
                                before: currentAnalysis.strong,
                                after: shiftedAnalysis.strong,
                                reduction: strongThreatReduction
                            },
                            totalBefore: currentOpponentThreats,
                            totalAfter: shiftedOpponentThreats,
                            increase: threatIncrease
                        }
                    });
                    
                    // NEVER make shifts that create immediate threats
                    if (shiftedAnalysis.immediate > currentAnalysis.immediate) {
                        console.log('REJECTING row shift', row, '- creates immediate threats (FORBIDDEN)');
                        continue;
                    }
                    
                    // NEVER make shifts that create new threats unless it's absolutely necessary
                    if (threatIncrease > 0 && bestScore > -50) {
                        console.log('REJECTING row shift', row, '- creates', threatIncrease, 'new threats');
                        continue;
                    }
                    
                    // MASSIVE PRIORITY: Shifts that disrupt immediate threats
                    if (immediateThreatReduction > 0) {
                        console.log('*** PRIORITIZING IMMEDIATE THREAT DISRUPTION ***');
                        console.log(`Row shift ${row} disrupts ${immediateThreatReduction} immediate threats`);
                        const megaBonus = immediateThreatReduction * 1000; // Extremely high priority
                        const adjustedScore = shiftedPositionScore + megaBonus;
                        
                        bestScore = adjustedScore;
                        bestMove = row;
                        bestAction = 'shift';
                        console.log('Selected MEGA-PRIORITY threat disruption shift:', row, 'score:', adjustedScore);
                        continue;
                    }
                    
                    // HIGH PRIORITY: Shifts that disrupt strong threats (preventing them from becoming immediate)
                    if (strongThreatReduction > 0) {
                        console.log('PRIORITIZING strong threat disruption');
                        console.log(`Row shift ${row} disrupts ${strongThreatReduction} strong threats`);
                        const strongBonus = strongThreatReduction * 300; // High priority
                        const adjustedScore = shiftedPositionScore + strongBonus;
                        
                        if (adjustedScore > bestScore) {
                            bestScore = adjustedScore;
                            bestMove = row;
                            bestAction = 'shift';
                            console.log('Selected strong threat disruption shift:', row, 'score:', adjustedScore);
                        }
                        continue;
                    }
                    
                    // Consider row shift if it provides ANY positive improvement
                    // OR if current best move is weak (score < 20)
                    if (improvement > 0 || (bestScore < 20 && improvement >= -5)) {
                        // Use absolute shifted score for comparison, not just improvement
                        const shiftScore = shiftedPositionScore;
                        if (shiftScore > bestScore || (shiftScore >= bestScore - 15 && improvement > 0)) {
                            bestScore = shiftScore;
                            bestMove = row;
                            bestAction = 'shift';
                            console.log('Selected row shift:', row, 'with score:', shiftScore, 'improvement:', improvement);
                        }
                    }
                }
            }
        }
        
        // Add some randomness for easier difficulties
        if (cpuDifficulty === 'easy' && Math.random() < 0.4) {
            const randomActions = [];
            if (emptyCells.length > 0) randomActions.push('place');
            if (gameState.some(cell => cell !== '')) randomActions.push('shift');
            
            if (randomActions.length > 0) {
                bestAction = randomActions[Math.floor(Math.random() * randomActions.length)];
                if (bestAction === 'place') {
                    bestMove = emptyCells[Math.floor(Math.random() * emptyCells.length)];
                } else {
                    bestMove = Math.floor(Math.random() * 5);
                }
            }
        }
        
        // Fallback: ensure we always have a valid move
        if (bestMove === null) {
            console.log('No best move found, using fallback');
            if (emptyCells.length > 0) {
                bestMove = emptyCells[0];
                bestAction = 'place';
                console.log('Fallback: placing at first empty cell:', bestMove);
            } else {
                // If no empty cells, try random row shift
                bestMove = Math.floor(Math.random() * 5);
                bestAction = 'shift';
                console.log('Fallback: random row shift:', bestMove);
            }
        }
        
        console.log('\n=== CPU MOVE DECISION ===');
        console.log('Final choice:', { action: bestAction, move: bestMove, score: bestScore });
        console.log('=== CPU MOVE ANALYSIS END ===\n');
        
        return { action: bestAction, move: bestMove };
    }

    function executeCPUMove() {
        console.log('executeCPUMove called - gameActive:', gameActive, 'currentPlayer:', currentPlayer, 'gameMode:', gameMode, 'isThinking:', isThinking);
        
        if (!gameActive || currentPlayer !== 'O' || gameMode === 'pvp' || isThinking) {
            console.log('Exiting executeCPUMove - conditions not met');
            return;
        }
        
        console.log('CPU starting move...');
        isThinking = true;
        displayMessage("CPU is thinking... 🤖");
        
        // Safety timeout to prevent getting stuck (reduced to 3 seconds)
        const safetyTimeout = setTimeout(() => {
            if (isThinking) {
                console.warn('CPU move took too long, resetting...');
                isThinking = false;
                // Try a simple fallback move
                const emptyCells = getEmptyCells(gameState);
                if (emptyCells.length > 0 && gameActive && currentPlayer === 'O') {
                    console.log('Safety timeout - making fallback move');
                    cells[emptyCells[0]].click();
                }
            }
        }, 3000); // Reduced to 3 second safety timeout
        
        // Reduced thinking delays for faster gameplay
        const thinkingTime = cpuDifficulty === 'easy' ? 200 : cpuDifficulty === 'medium' ? 400 : 600;
        console.log('CPU thinking time:', thinkingTime);
        
        setTimeout(() => {
            if (!isThinking) {
                console.log('CPU move cancelled - thinking already stopped');
                clearTimeout(safetyTimeout);
                return; // Already handled by safety timeout
            }
            
            try {
                console.log('Getting best move...');
                const bestMove = getBestMove();
                console.log('Best move result:', bestMove);
                
                if (bestMove.action === 'place' && bestMove.move !== null) {
                    const cell = cells[bestMove.move];
                    console.log('Placing piece at cell:', bestMove.move, 'cell exists:', !!cell, 'cell empty:', gameState[bestMove.move] === '');
                    if (cell && gameState[bestMove.move] === '') {
                        cell.click();
                        isThinking = false; // Reset thinking state after placing
                        console.log('CPU placed piece successfully');
                    } else {
                        // Fallback: find any empty cell if the chosen one is invalid
                        const emptyCells = getEmptyCells(gameState);
                        console.log('Fallback needed, empty cells:', emptyCells.length);
                        if (emptyCells.length > 0) {
                            cells[emptyCells[0]].click();
                        }
                        isThinking = false;
                    }
                } else if (bestMove.action === 'shift' && bestMove.move !== null) {
                    console.log('CPU choosing to shift row:', bestMove.move);
                    // Select row and shift
                    selectedRow = bestMove.move;
                    rowLabels[bestMove.move].classList.add('selected');
                    shiftButton.disabled = false;
                    
                    setTimeout(() => {
                        handleRowShift();
                        // isThinking will be reset in handleRowShift completion
                    }, 100); // Reduced from 300ms to 100ms
                } else {
                    // Fallback: if no valid move found, try to place anywhere
                    console.log('No valid move found, using fallback');
                    const emptyCells = getEmptyCells(gameState);
                    if (emptyCells.length > 0) {
                        cells[emptyCells[0]].click();
                    }
                    isThinking = false;
                }
            } catch (error) {
                console.error('Error in CPU move:', error);
                // Emergency fallback
                const emptyCells = getEmptyCells(gameState);
                if (emptyCells.length > 0) {
                    cells[emptyCells[0]].click();
                }
                isThinking = false;
            }
            
            clearTimeout(safetyTimeout);
        }, thinkingTime);
    }

    // Game mode functions
    function setGameMode(mode) {
        console.log('Setting game mode to:', mode);
        gameMode = mode;
        
        pvpButton.classList.toggle('active', mode === 'pvp');
        pvcButton.classList.toggle('active', mode === 'pvc');
        cpuDifficultyDiv.style.display = mode === 'pvc' ? 'flex' : 'none';
        
        console.log('Game mode set, restarting game...');
        restartGame();
    }

    function checkWinCondition(state) {
        for (const condition of winningConditions) {
            const [a, b, c, d] = condition;
            if (state[a] && state[a] === state[b] && 
                state[a] === state[c] && state[a] === state[d]) {
                return state[a];
            }
        }
        return null;
    }

    // Message display function
    function displayMessage(message) {
        let messageElement = document.getElementById('game-message');
        if (!messageElement) {
            messageElement = document.createElement('div');
            messageElement.id = 'game-message';
            messageElement.className = 'game-message';
            gameBoard.parentNode.insertBefore(messageElement, gameBoard);
        }
        messageElement.textContent = message;
        
        if (message.includes('won')) {
            messageElement.className = 'game-message win-message';
        } else if (message.includes('Tie')) {
            messageElement.className = 'game-message tie-message';
        } else {
            messageElement.className = 'game-message';
        }
    }

    // Handle cell click
    function handleCellClick(event) {
        const clickedCell = event.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-cell-index'));

        console.log('handleCellClick called - cell:', clickedCellIndex, 'currentPlayer:', currentPlayer, 'gameMode:', gameMode, 'isThinking:', isThinking);

        if (gameState[clickedCellIndex] !== '' || !gameActive) {
            console.log('Cell click rejected - cell occupied or game not active');
            return;
        }

        // In PvC mode, only allow human (X) to click directly, but allow CPU (O) programmatic clicks
        if (gameMode === 'pvc' && currentPlayer === 'O' && !isThinking) {
            console.log('Cell click rejected - CPU turn but not thinking (human clicked)');
            return;
        }

        console.log('Cell click accepted, updating game state...');

        // Update game state and cell display
        gameState[clickedCellIndex] = currentPlayer;
        clickedCell.textContent = currentPlayer;
        
        // Force the styling immediately
        if (currentPlayer === 'X') {
            clickedCell.className = 'cell player-x';
            clickedCell.style.color = '#00DDFF';
            clickedCell.style.fontSize = '4rem';
            clickedCell.style.fontWeight = '900';
            clickedCell.style.textShadow = '0 0 5px #ffffff, 0 0 10px #00DDFF, 0 0 20px #00DDFF, 0 0 30px #00DDFF';
        } else {
            clickedCell.className = 'cell player-o';
            clickedCell.style.color = '#FF0080';
            clickedCell.style.fontSize = '4rem';
            clickedCell.style.fontWeight = '900';
            clickedCell.style.textShadow = '0 0 5px #ffffff, 0 0 10px #FF0080, 0 0 20px #FF0080, 0 0 30px #FF0080';
        }

        // Add placement animation
        clickedCell.classList.add('cell-placed');
        setTimeout(() => {
            clickedCell.classList.remove('cell-placed');
        }, 300);

        console.log('Game state updated, checking results...');
        checkGameResult();
    }

    // Check for win or tie
    function checkGameResult() {
        const winner = checkWinCondition(gameState);
        
        if (winner) {
            const winnerName = gameMode === 'pvc' && winner === 'O' ? 'CPU' : `Player ${winner}`;
            displayMessage(`${winnerName} won with 4 in a row! 🎉`);
            gameActive = false;
            
            // Highlight winning cells
            for (const condition of winningConditions) {
                const [a, b, c, d] = condition;
                if (gameState[a] === winner && gameState[a] === gameState[b] && 
                    gameState[a] === gameState[c] && gameState[a] === gameState[d]) {
                    [a, b, c, d].forEach(index => {
                        cells[index].classList.add('winning-cell');
                    });
                    break;
                }
            }
            
            gameBoard.classList.add('game-won');
            setTimeout(() => {
                gameBoard.classList.remove('game-won');
            }, 1000);
            
            return;
        }

        // Check for tie
        if (!gameState.includes('')) {
            displayMessage("It's a tie! 🤝");
            gameActive = false;
            gameBoard.classList.add('game-tie');
            setTimeout(() => {
                gameBoard.classList.remove('game-tie');
            }, 1000);
            return;
        }

        // Switch players
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        const playerName = gameMode === 'pvc' && currentPlayer === 'O' ? 'CPU' : `Player ${currentPlayer}`;
        displayMessage(`${playerName}'s turn`);
        
        console.log('Player switched to:', currentPlayer, 'gameMode:', gameMode);
        
        // Trigger CPU move if it's CPU's turn
        if (gameMode === 'pvc' && currentPlayer === 'O') {
            console.log('Triggering CPU move in 200ms...');
            setTimeout(executeCPUMove, 200); // Reduced delay
        }
    }

    // Handle row selection
    function handleRowClick(event) {
        if (!gameActive || isThinking) return;
        
        // In PvC mode, only allow human (X) to select rows
        if (gameMode === 'pvc' && currentPlayer === 'O') {
            return;
        }
        
        // Clear previous selection
        rowLabels.forEach(label => label.classList.remove('selected'));
        selectedRow = null;
        
        // Select clicked row
        event.target.classList.add('selected');
        selectedRow = parseInt(event.target.textContent) - 1;
        
        // Enable shift button
        shiftButton.disabled = false;
        const playerName = gameMode === 'pvc' && currentPlayer === 'O' ? 'CPU' : `Player ${currentPlayer}`;
        displayMessage(`Row ${selectedRow + 1} selected. Click "Shift Row" to move pieces right!`);
    }

    // Handle row shifting
    function handleRowShift() {
        console.log('handleRowShift called - selectedRow:', selectedRow, 'gameActive:', gameActive, 'isThinking:', isThinking, 'currentPlayer:', currentPlayer);
        
        if (selectedRow === null || !gameActive) {
            console.log('Row shift rejected - no row selected or game not active');
            return;
        }
        
        // Allow row shifts during CPU thinking (for programmatic CPU moves)
        // But block human interaction during CPU thinking
        if (isThinking && gameMode === 'pvc' && currentPlayer === 'X') {
            console.log('Row shift rejected - CPU is thinking and human trying to shift');
            return;
        }
        
        console.log('Row shift accepted, processing...');
        
        // Get the row's game state
        const rowStart = selectedRow * 5;
        const rowEnd = rowStart + 5;
        const rowState = gameState.slice(rowStart, rowEnd);
        
        // Shift row right (last element goes to first)
        const lastElement = rowState.pop();
        rowState.unshift(lastElement);
        
        // Update game state
        for (let i = 0; i < 5; i++) {
            gameState[rowStart + i] = rowState[i];
        }
        
        // Update visual display with animation
        const rowCells = Array.from(cells).slice(rowStart, rowEnd);
        rowCells.forEach(cell => {
            cell.classList.add('cell-shifting');
            cell.style.animation = 'row-shift 0.5s ease-in-out';
        });
        
        setTimeout(() => {
            // Update cell contents and styling
            for (let i = 0; i < 5; i++) {
                const cell = rowCells[i];
                const content = rowState[i];
                
                cell.textContent = content;
                cell.className = 'cell';
                
                if (content === 'X') {
                    cell.className = 'cell player-x';
                    cell.style.color = '#00DDFF';
                    cell.style.fontSize = '4rem';
                    cell.style.fontWeight = '900';
                    cell.style.textShadow = '0 0 5px #ffffff, 0 0 10px #00DDFF, 0 0 20px #00DDFF, 0 0 30px #00DDFF';
                } else if (content === 'O') {
                    cell.className = 'cell player-o';
                    cell.style.color = '#FF0080';
                    cell.style.fontSize = '4rem';
                    cell.style.fontWeight = '900';
                    cell.style.textShadow = '0 0 5px #ffffff, 0 0 10px #FF0080, 0 0 20px #FF0080, 0 0 30px #FF0080';
                }
                
                cell.classList.remove('cell-shifting');
                cell.style.animation = '';
            }
            
            // Clear selection and check for wins
            rowLabels.forEach(label => label.classList.remove('selected'));
            selectedRow = null;
            shiftButton.disabled = true;
            
            // Reset CPU thinking state if it was a CPU move
            if (gameMode === 'pvc' && currentPlayer === 'O') {
                isThinking = false;
            }
            
            checkGameResult();
        }, 250);
    }

    // Restart game
    function restartGame() {
        gameActive = true;
        currentPlayer = 'X';
        gameState = new Array(25).fill('');
        selectedRow = null;
        isThinking = false; // Always reset thinking state
        
        const messageElement = document.getElementById('game-message');
        if (messageElement) {
            const playerName = gameMode === 'pvc' ? 'Player X' : 'Player X';
            messageElement.textContent = `${playerName}'s turn`;
            messageElement.className = 'game-message';
        }
        
        cells.forEach(cell => {
            cell.textContent = '';
            cell.className = 'cell';
            cell.style.color = '';
            cell.style.fontSize = '';
            cell.style.fontWeight = '';
            cell.style.textShadow = '';
        });
        
        rowLabels.forEach(label => label.classList.remove('selected'));
        shiftButton.disabled = true;
        gameBoard.classList.remove('game-won', 'game-tie');
        
        gameBoard.classList.add('game-restart');
        setTimeout(() => {
            gameBoard.classList.remove('game-restart');
        }, 500);
    }

    // Force reset CPU state (emergency function)
    function forceResetCPU() {
        isThinking = false;
        rowLabels.forEach(label => label.classList.remove('selected'));
        selectedRow = null;
        shiftButton.disabled = true;
        
        if (gameActive && currentPlayer === 'O' && gameMode === 'pvc') {
            displayMessage(`CPU's turn - Click restart if stuck`);
        }
    }

    // Debug function to manually set board state
    function setBoardState(stateArray) {
        if (stateArray.length !== 25) {
            console.error('Board state must have exactly 25 elements');
            return;
        }
        
        gameState = [...stateArray];
        
        // Update visual board
        for (let i = 0; i < 25; i++) {
            const cell = cells[i];
            const content = gameState[i];
            
            cell.textContent = content;
            cell.className = 'cell';
            
            if (content === 'X') {
                cell.className = 'cell player-x';
                cell.style.color = '#00DDFF';
                cell.style.fontSize = '4rem';
                cell.style.fontWeight = '900';
                cell.style.textShadow = '0 0 5px #ffffff, 0 0 10px #00DDFF, 0 0 20px #00DDFF, 0 0 30px #00DDFF';
            } else if (content === 'O') {
                cell.className = 'cell player-o';
                cell.style.color = '#FF0080';
                cell.style.fontSize = '4rem';
                cell.style.fontWeight = '900';
                cell.style.textShadow = '0 0 5px #ffffff, 0 0 10px #FF0080, 0 0 20px #FF0080, 0 0 30px #FF0080';
            } else {
                cell.style.color = '';
                cell.style.fontSize = '';
                cell.style.fontWeight = '';
                cell.style.textShadow = '';
            }
        }
        
        visualizeBoard(gameState, "Manually Set Board State");
        
        const humanAnalysis = analyzeAllThreats(gameState, 'X');
        const cpuAnalysis = analyzeAllThreats(gameState, 'O');
        
        console.log('Human threats:', humanAnalysis);
        console.log('CPU threats:', cpuAnalysis);
        
        return { human: humanAnalysis, cpu: cpuAnalysis };
    }

    // Make debug function globally available
    window.setBoardState = setBoardState;

    // Add event listeners
    cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });
    
    rowLabels.forEach(label => {
        label.addEventListener('click', handleRowClick);
    });
    
    restartButton.addEventListener('click', restartGame);
    restartButton.addEventListener('dblclick', forceResetCPU); // Double-click to force reset CPU
    shiftButton.addEventListener('click', handleRowShift);
    
    pvpButton.addEventListener('click', () => setGameMode('pvp'));
    pvcButton.addEventListener('click', () => setGameMode('pvc'));
    
    difficultySelect.addEventListener('change', (e) => {
        cpuDifficulty = e.target.value;
        restartGame();
    });

    // Initialize game
    shiftButton.disabled = true;
    displayMessage(`Player ${currentPlayer}'s turn`);

    // Add hover effects for empty cells
    cells.forEach(cell => {
        cell.addEventListener('mouseenter', function() {
            if (this.textContent === '' && gameActive && !isThinking) {
                // In PvC mode, only show hover for human player
                if (gameMode === 'pvc' && currentPlayer === 'O') return;
                
                this.classList.add('cell-hover');
                this.textContent = currentPlayer;
                this.style.opacity = '0.8';
                this.style.fontSize = '3rem';
                this.style.fontWeight = '900';
                
                if (currentPlayer === 'X') {
                    this.style.color = '#00DDFF';
                    this.style.textShadow = '0 0 5px #ffffff, 0 0 15px #00DDFF, 0 0 25px #00DDFF';
                    this.style.borderColor = '#00DDFF';
                } else {
                    this.style.color = '#FF0080';
                    this.style.textShadow = '0 0 5px #ffffff, 0 0 15px #FF0080, 0 0 25px #FF0080';
                    this.style.borderColor = '#FF0080';
                }
            }
        });

        cell.addEventListener('mouseleave', function() {
            if (this.classList.contains('cell-hover')) {
                this.classList.remove('cell-hover');
                this.textContent = '';
                this.style.opacity = '1';
                this.style.color = '';
                this.style.textShadow = '';
                this.style.fontSize = '';
                this.style.fontWeight = '';
                this.style.borderColor = '';
            }
        });
    });
    
    function visualizeBoard(state, title = "Board State") {
        console.log(`\n=== ${title} ===`);
        for (let row = 0; row < 5; row++) {
            const rowStart = row * 5;
            const rowCells = state.slice(rowStart, rowStart + 5);
            const rowDisplay = rowCells.map(cell => cell || '_').join(' ');
            console.log(`Row ${row}: ${rowDisplay}`);
        }
        console.log("==================\n");
    }
    
    // Testing function - can be called from browser console
    function testThreatDetection() {
        console.log('=== TESTING THREAT DETECTION ===');
        
        // Test scenario: Human has 3 X's in a row with one empty space
        const testState = [
            'X', 'X', 'X', '', 'O',  // Row 0: Human threat here (position 3)
            '', '', '', '', '',       // Row 1
            '', '', '', '', '',       // Row 2
            '', '', '', '', '',       // Row 3
            '', '', '', '', ''        // Row 4
        ];
        
        console.log('Test scenario - Human threat in row 0:');
        visualizeBoard(testState, "Test Board");
        
        const humanThreats = countThreats(testState, 'X');
        const cpuThreats = countThreats(testState, 'O');
        
        console.log('Human threats detected:', humanThreats);
        console.log('CPU threats detected:', cpuThreats);
        
        // Test row shifting to disrupt threat
        const shiftedState = simulateRowShift(testState, 0);
        
        console.log('After shifting row 0:');
        visualizeBoard(shiftedState, "After Row 0 Shift");
        
        const humanThreatsAfter = countThreats(shiftedState, 'X');
        console.log('Human threats after shift:', humanThreatsAfter);
        console.log('Threats reduced:', humanThreats - humanThreatsAfter);
        
        return {
            before: humanThreats,
            after: humanThreatsAfter,
            reduced: humanThreats - humanThreatsAfter
        };
    }

    // Make test function globally available
    window.testThreatDetection = testThreatDetection;
    
    // Manual test setup - can be called from browser console
    function setupTestScenario() {
        console.log('Setting up test scenario...');
        
        // Clear the board first
        restartGame();
        
        // Set up a scenario where human has 3 X's in a row that can be disrupted by shifting
        // Row 0: X, X, X, _, O (Human threat at position 3)
        setTimeout(() => {
            gameState[0] = 'X'; cells[0].textContent = 'X'; cells[0].className = 'cell player-x';
            gameState[1] = 'X'; cells[1].textContent = 'X'; cells[1].className = 'cell player-x';
            gameState[2] = 'X'; cells[2].textContent = 'X'; cells[2].className = 'cell player-x';
            gameState[4] = 'O'; cells[4].textContent = 'O'; cells[4].className = 'cell player-o';
            
            // Apply styling
            [0, 1, 2].forEach(i => {
                cells[i].style.color = '#00DDFF';
                cells[i].style.fontSize = '4rem';
                cells[i].style.fontWeight = '900';
                cells[i].style.fontWeight = '900';
                cells[i].style.textShadow = '0 0 5px #ffffff, 0 0 10px #00DDFF, 0 0 20px #00DDFF, 0 0 30px #00DDFF';
            });
            
            [1, 7].forEach(i => {
                cells[i].style.color = '#FF0080';
                cells[i].style.fontSize = '4rem';
                cells[i].style.fontWeight = '900';
                cells[i].style.textShadow = '0 0 5px #ffffff, 0 0 10px #FF0080, 0 0 20px #FF0080, 0 0 30px #FF0080';
            });
            
            // Set it to CPU's turn
            currentPlayer = 'O';
            gameMode = 'pvc';
            
            console.log('Diagonal test scenario ready! Human has diagonal threat (0,6,12 -> 18).');
            console.log('Call executeCPUMove() to test the CPU response.');
            
            visualizeBoard(gameState, "Diagonal Test Scenario Setup");
            
            const humanAnalysis = analyzeAllThreats(gameState, 'X');
            console.log('Human threat analysis:', humanAnalysis);
            
            // Test if shifting rows can disrupt this diagonal
            console.log('\nTesting row shifts for diagonal disruption:');
            for (let row = 0; row < 5; row++) {
                const testState = simulateRowShift(gameState, row);
                const rowStart = row * 5;
                const rowState = gameState.slice(rowStart, rowStart + 5);
                
                if (rowState.some(cell => cell !== '')) {
                    const shiftedAnalysis = analyzeAllThreats(testState, 'X');
                    const threatsReduced = humanAnalysis.immediate - shiftedAnalysis.immediate;
                    
                    if (threatsReduced > 0) {
                        console.log(`Row ${row} shift would reduce ${threatsReduced} immediate threats`);
                        visualizeBoard(testState, `After shifting row ${row}`);
                    }
                }
            }
            
        }, 100);
    }

    // Make test functions globally available
    window.setupDiagonalTestScenario = setupDiagonalTestScenario;

    function simulateRowShift(state, rowIndex) {
        const shiftedState = [...state];
        const rowStart = rowIndex * 5;
        const rowState = state.slice(rowStart, rowStart + 5);
        
        // Shift row right (wrap around): last element goes to first position
        const lastElement = rowState[4]; // Get the rightmost element
        const shiftedRow = [lastElement, ...rowState.slice(0, 4)]; // Move it to front
        
        // Update the shifted state
        for (let i = 0; i < 5; i++) {
            shiftedState[rowStart + i] = shiftedRow[i];
        }
        
        return shiftedState;
    }

    // Test the row shift simulation
    function testRowShiftSimulation() {
        console.log('=== TESTING ROW SHIFT SIMULATION ===');
        
        // Initial state: Row 0 has 3 X's and a gap, Row 1 has O's
        const testState = [
            'X', 'X', 'X', '', 'O',  // Row 0: Human threat here (position 3)
            'O', 'O', 'O', 'O', 'O', // Row 1: Full row of O's
            '', '', '', '', '',       // Row 2
            '', '', '', '', '',       // Row 3
            '', '', '', '', ''        // Row 4
        ];
        
        console.log('Before shift:');
        visualizeBoard(testState, "Test Row Shift");
        
        // Simulate shifting row 0
        const shiftedState = simulateRowShift(testState, 0);
        
        console.log('After shifting row 0:');
        visualizeBoard(shiftedState, "Test Row Shift After");
        
        // Check specific cell states
        console.log('Cell states after shift:', {
            0: shiftedState[0],
            1: shiftedState[1],
            2: shiftedState[2],
            3: shiftedState[3],
            4: shiftedState[4],
            5: shiftedState[5],
            6: shiftedState[6],
            7: shiftedState[7],
            8: shiftedState[8],
            9: shiftedState[9]
        });
        
        return shiftedState;
    }

    // Make test function globally available
    window.testRowShiftSimulation = testRowShiftSimulation;

    // Test wrap-around logic
    function testWrapAround() {
        console.log('=== TESTING WRAP-AROUND LOGIC ===');
        
        const testBoard = [
            'X', 'O', '', 'X', 'O',  // Row 0
            '', '', '', '', '',       // Row 1
            '', '', '', '', '',       // Row 2
            '', '', '', '', '',       // Row 3
            '', '', '', '', ''        // Row 4
        ];
        
        console.log('Original board:');
        visualizeBoard(testBoard, "Before Row 0 Shift");
        
        const shiftedBoard = simulateRowShift(testBoard, 0);
        console.log('After shifting row 0 (should wrap O from position 4 to position 0):');
        visualizeBoard(shiftedBoard, "After Row 0 Shift");
        
        // Verify the shift worked correctly
        const expectedRow = ['O', 'X', 'O', '', 'X']; // O wraps to front
        const actualRow = shiftedBoard.slice(0, 5);
        
        console.log('Expected row 0:', expectedRow);
        console.log('Actual row 0:', actualRow);
        
        const isCorrect = expectedRow.every((val, i) => val === actualRow[i]);
        console.log('Wrap-around working correctly:', isCorrect);
        
        return { expected: expectedRow, actual: actualRow, correct: isCorrect };
    }

    // Make test function globally available
    window.testWrapAround = testWrapAround;
});
