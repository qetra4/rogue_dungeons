
let heroHealth = 100; 
let heroAttackPower = 50; 

$(document).ready(function() {
    let map = window.map;
    let heroPosition = window.heroPosition;

    $(document).keydown(function(event) {
        console.log(`Key pressed: ${event.key}`);
        switch (event.key) {
            case 'a':
                updateHeroPosition(heroPosition.x - 1, heroPosition.y);
                break;
            case 'd':
                updateHeroPosition(heroPosition.x + 1, heroPosition.y);
                break;
            case 'w':
                updateHeroPosition(heroPosition.x, heroPosition.y - 1);
                break;
            case 's':
                updateHeroPosition(heroPosition.x, heroPosition.y + 1);
                break;
            case ' ': 
                attackEnemies();
                break;
        }
    });

    function updateHeroPosition(newX, newY) {
        if (newX >= 0 && newX < WIDTH && newY >= 0 && newY < HEIGHT && map[newY][newX].type !== 'wall' && map[newY][newX].type !== 'enemy') {
            if (map[newY][newX].type === 'health-potion') {
                heroHealth = 100;
                console.log(`Hero's health restored. Current health: ${heroHealth}`);
                map[newY][newX].type = 'empty'; 
            }

            if (map[newY][newX].type === 'sword') {
                heroAttackPower += 50; 
                console.log(`Hero's attack power increased. Current attack power: ${heroAttackPower}`);
                map[newY][newX].type = 'empty'; 
            }
            map[heroPosition.y][heroPosition.x].type = 'empty';
            heroPosition.x = newX;
            heroPosition.y = newY;
            map[heroPosition.y][heroPosition.x].type = 'person';
            renderMap();
            moveEnemies(); 
        }
    }

    function attackEnemies() {
        const directions = [
            { x: -1, y: 0 }, 
            { x: 1, y: 0 },
            { x: 0, y: -1 },
            { x: 0, y: 1 },
            { x: -1, y: -1 },
            { x: 1, y: 1 }, 
            { x: -1, y: 1 }, 
            { x: 1, y: -1 } 
        ];
    
        directions.forEach(dir => {
            const newX = heroPosition.x + dir.x;
            const newY = heroPosition.y + dir.y;
            if (
                newX >= 0 && newX < WIDTH &&
                newY >= 0 && newY < HEIGHT &&
                map[newY][newX].type === 'enemy'
            ) {
                updateEnemyHealth(newX, newY, heroAttackPower);
            }
        });
    
        moveEnemies();
    }

    function updateEnemyHealth(x, y, damage) {
        const enemy = map[y][x];
        if (enemy && enemy.type === 'enemy') {
            enemy.health -= damage;
            console.log(`Враг получил урон: ${damage}. Здоровье врага: ${enemy.health}`);
    
            if (enemy.health <= 0) {
                map[y][x] = { type: 'empty' }; 
                console.log('Враг уничтожен!');
            }
    
            const enemyTile = document.querySelector(
                `.field .tile[style="left: ${x * TILE_SIZE}px; top: ${y * TILE_SIZE}px;"]`
            );
    
            if (enemyTile) {
                const healthBar = enemyTile.querySelector('.health');
                if (healthBar) {
                    const healthPercentage = (enemy.health / 100) * 100;
                    healthBar.style.width = `${healthPercentage}%`;
                }
            }
        }
    }

    function moveEnemies() {
        const directions = [
            { x: -1, y: 0 },
            { x: 1, y: 0 }, 
            { x: 0, y: -1 },
            { x: 0, y: 1 }
        ];
    
        const newEnemyPositions = [];
    
        for (let y = 0; y < HEIGHT; y++) {
            for (let x = 0; x < WIDTH; x++) {
                if (map[y][x].type === 'enemy') {
                    const dir = directions[Math.floor(Math.random() * directions.length)];
                    const newX = x + dir.x;
                    const newY = y + dir.y;
    
                    if (
                        newX >= 0 && newX < WIDTH &&
                        newY >= 0 && newY < HEIGHT &&
                        map[newY][newX].type === 'empty'
                    ) {
                        newEnemyPositions.push({
                            oldX: x,
                            oldY: y,
                            newX: newX,
                            newY: newY,
                            health: map[y][x].health 
                        });
                    }

                    checkAndAttackHero(x, y);
                }
            }
        }
    
        newEnemyPositions.forEach(pos => {
            map[pos.oldY][pos.oldX] = { type: 'empty' };
            map[pos.newY][pos.newX] = { type: 'enemy', health: pos.health, healthBar: null };
        });
    
        renderMap();
    }
        
    function checkAndAttackHero(x, y) {
        const directions = [
            { x: -1, y: 0 },
            { x: 1, y: 0 },
            { x: 0, y: -1 },
            { x: 0, y: 1 } 
        ];

        const damage = 10;

        for (const dir of directions) {
            const newX = x + dir.x;
            const newY = y + dir.y;

            if (
                newX >= 0 && newX < WIDTH &&
                newY >= 0 && newY < HEIGHT &&
                map[newY][newX].type === 'person'
            ) {

                heroHealth -= damage;
                console.log(`Герой атакован! Здоровье героя: ${heroHealth}`);

                if (heroHealth <= 0) {
                    heroHealth = 0;
                }

                updateHeroHealth(heroHealth);
            }
        }
    }
    
    function updateHeroHealth(newHealth) {
        heroHealth = newHealth;
        if (heroHealth < 0) heroHealth = 0;

        const heroTile = document.querySelector('.field .tileP');
        if (heroTile) {
            const healthBar = heroTile.querySelector('.health');
            if (healthBar) {
                const healthPercentage = (heroHealth / 100) * 100;
                healthBar.style.width = `${healthPercentage}%`;
            }
        }
    }

    document.addEventListener('mapReady', function() {
        if (window.initialMap) {
            initializeMap(window.initialMap);
        } else {
        }
    });
});


function renderMap() {
    field.innerHTML = '';
    window.map = map;
    for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
            let tile = document.createElement('div');
            tile.classList.add('tile');
            tile.style.left = `${x * TILE_SIZE}px`;
            tile.style.top = `${y * TILE_SIZE}px`;

            if (map[y][x].type === 'empty') {
                tile.classList.add('tileN');
            } else if (map[y][x].type === 'sword') {
                tile.classList.add('tileSW');
            } else if (map[y][x].type === 'health-potion') {
                tile.classList.add('tileHP');
            } else if (map[y][x].type === 'person') {
                tile.classList.add('tileP');
                let healthBar = tile.querySelector('.health');
                if (!healthBar) {
                    healthBar = document.createElement('div');
                    healthBar.classList.add('health');
                    tile.appendChild(healthBar);
                }
                healthBar.style.width = `${heroHealth}%`;
            } else if (map[y][x].type === 'enemy') {
                tile.classList.add('tileE')
                const enemy = map[y][x];
                let healthBar = document.createElement('div');
                healthBar.classList.add('health');
                healthBar.id = `${enemy.id}-health`;
                healthBar.style.width = `${enemy.health}%`;
                healthBar.style.backgroundColor = '#00ff00';
                tile.appendChild(healthBar);
            }

            field.appendChild(tile);
        }
    }
}
