// Game Variables
let gameState = {
    coins: 500,
    level: 1,
    farmSize: 6,
    crops: [],
    totalHarvested: 0
};

const cropTypes = {
    wheat: {
        emoji: '🌾',
        name: 'Wheat',
        cost: 50,
        growTime: 10, // seconds
        sellPrice: 75
    },
    corn: {
        emoji: '🌽',
        name: 'Corn',
        cost: 75,
        growTime: 15,
        sellPrice: 120
    },
    carrot: {
        emoji: '🥕',
        name: 'Carrot',
        cost: 100,
        growTime: 20,
        sellPrice: 150
    }
};

// Initialize the game
function initGame() {
    createFarmPlots();
    setupButtons();
    updateUI();
    // Auto-save game state
    setInterval(saveGame, 5000);
    // Load saved game if exists
    loadGame();
}

// Create farm plots
function createFarmPlots() {
    const farmArea = document.getElementById('farmArea');
    farmArea.innerHTML = '';
    
    for (let i = 0; i < gameState.farmSize; i++) {
        const plot = document.createElement('div');
        plot.className = 'farm-plot empty';
        plot.id = `plot-${i}`;
        plot.addEventListener('click', () => handlePlotClick(i));
        farmArea.appendChild(plot);
    }
}

// Handle plot click (harvest or show info)
function handlePlotClick(plotIndex) {
    const crop = gameState.crops[plotIndex];
    
    if (!crop) {
        return; // Empty plot
    }
    
    if (crop.readyToHarvest) {
        // Harvest the crop
        harvestCrop(plotIndex);
    }
}

// Plant a crop
function plantCrop(cropType) {
    const cost = cropTypes[cropType].cost;
    
    if (gameState.coins < cost) {
        alert('❌ Not enough coins!');
        return;
    }
    
    // Find empty plot
    const emptyPlotIndex = gameState.crops.findIndex(c => c === null || c === undefined);
    
    if (emptyPlotIndex === -1) {
        alert('❌ No empty plots! Upgrade your farm.');
        return;
    }
    
    // Deduct coins
    gameState.coins -= cost;
    
    // Plant the crop
    gameState.crops[emptyPlotIndex] = {
        type: cropType,
        plantedAt: Date.now(),
        readyToHarvest: false
    };
    
    updateUI();
    renderFarm();
}

// Harvest a crop
function harvestCrop(plotIndex) {
    const crop = gameState.crops[plotIndex];
    
    if (!crop || !crop.readyToHarvest) {
        return;
    }
    
    const cropType = cropTypes[crop.type];
    const earnings = cropType.sellPrice;
    
    // Add coins
    gameState.coins += earnings;
    gameState.totalHarvested++;
    
    // Remove crop
    gameState.crops[plotIndex] = null;
    
    // Level up logic
    if (gameState.totalHarvested % 5 === 0) {
        gameState.level++;
        alert(`🎉 Level Up! You are now Level ${gameState.level}!`);
    }
    
    updateUI();
    renderFarm();
}

// Upgrade farm
function upgradeFarm() {
    const upgradeCost = 200;
    
    if (gameState.coins < upgradeCost) {
        alert('❌ Not enough coins for upgrade!');
        return;
    }
    
    gameState.coins -= upgradeCost;
    gameState.farmSize += 3;
    alert(`🎉 Farm upgraded! You now have ${gameState.farmSize} plots!`);
    
    updateUI();
    createFarmPlots();
    // Re-render crops after creating new plots
    renderFarm();
}

// Render the farm
function renderFarm() {
    // Update crop timers and growth status
    gameState.crops.forEach((crop, index) => {
        const plotElement = document.getElementById(`plot-${index}`);
        
        if (!crop) {
            plotElement.className = 'farm-plot empty';
            plotElement.innerHTML = '🪨';
            return;
        }
        
        const cropType = cropTypes[crop.type];
        const elapsedTime = (Date.now() - crop.plantedAt) / 1000;
        const growTime = cropType.growTime;
        
        if (elapsedTime >= growTime) {
            crop.readyToHarvest = true;
            plotElement.className = 'farm-plot';
            plotElement.innerHTML = `<div class="ready">${cropType.emoji}</div>`;
        } else {
            plotElement.className = 'farm-plot growing';
            const remainingTime = Math.ceil(growTime - elapsedTime);
            plotElement.innerHTML = `
                <div class="crop-emoji">${cropType.emoji}</div>
                <div class="timer">${remainingTime}s</div>
            `;
        }
    });
    
    // Continue updating timers
    requestAnimationFrame(renderFarm);
}

// Update UI
function updateUI() {
    document.getElementById('coins').textContent = gameState.coins;
    document.getElementById('level').textContent = gameState.level;
    document.getElementById('cropCount').textContent = gameState.crops.filter(c => c).length;
    
    // Update button states
    const buttons = {
        buyWheat: cropTypes.wheat.cost,
        buyCorn: cropTypes.corn.cost,
        buyCarrot: cropTypes.carrot.cost,
        upgradeFarm: 200
    };
    
    for (const [id, cost] of Object.entries(buttons)) {
        document.getElementById(id).disabled = gameState.coins < cost;
    }
}

// Setup buttons
function setupButtons() {
    document.getElementById('buyWheat').addEventListener('click', () => plantCrop('wheat'));
    document.getElementById('buyCorn').addEventListener('click', () => plantCrop('corn'));
    document.getElementById('buyCarrot').addEventListener('click', () => plantCrop('carrot'));
    document.getElementById('upgradeFarm').addEventListener('click', upgradeFarm);
}

// Save game to localStorage
function saveGame() {
    localStorage.setItem('haydayGameState', JSON.stringify(gameState));
}

// Load game from localStorage
function loadGame() {
    const saved = localStorage.getItem('haydayGameState');
    if (saved) {
        gameState = JSON.parse(saved);
        updateUI();
        renderFarm();
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', initGame);
