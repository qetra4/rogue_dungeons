const WIDTH = 40;
const HEIGHT = 24;
const TILE_SIZE = 24;
const field = document.querySelector('.field');
let map = [];
let horizontalPassages = [];
let verticalPassages = [];

function generateMap() {
    for (let y = 0; y < HEIGHT; y++) {
        map[y] = [];
        for (let x = 0; x < WIDTH; x++) {
            map[y][x] = { type: 'wall' };
        }
    }
}

function isRoomAreaValid(x, y, width, height) {
    const expandedX = x - 2;
    const expandedY = y - 2;
    const expandedWidth = width + 4;
    const expandedHeight = height + 4;

    if (
        expandedX < 0 ||
        expandedY < 0 ||
        expandedX + expandedWidth >= WIDTH ||
        expandedY + expandedHeight >= HEIGHT
    ) {
        return false;
    }

    for (let dy = 0; dy < expandedHeight; dy++) {
        for (let dx = 0; dx < expandedWidth; dx++) {
            if (map[expandedY + dy][expandedX + dx].type !== 'wall') {
                return false;
            }
        }
    }

    return true;
}

function generateRooms() {
    const numRooms = Math.floor(Math.random() * 6) + 5;
    let roomsCreated = 0;
    let attempts = 0;
    const maxAttempts = 100;
    let rooms = window.rooms = [];

    while (roomsCreated < numRooms && attempts < maxAttempts) {
        let roomWidth = Math.floor(Math.random() * 6) + 3; 
        let roomHeight = Math.floor(Math.random() * 6) + 3;
        let x = Math.floor(Math.random() * (WIDTH - roomWidth - 4)) + 2;
        let y = Math.floor(Math.random() * (HEIGHT - roomHeight - 4)) + 2;

        if (isRoomAreaValid(x, y, roomWidth, roomHeight)) {
            for (let dy = 0; dy < roomHeight; dy++) {
                for (let dx = 0; dx < roomWidth; dx++) {
                    map[y + dy][x + dx] = { type: 'empty' };
                }
            }
            rooms.push({ x, y, width: roomWidth, height: roomHeight });
            roomsCreated++;
        }
        attempts++;
    }
    // Условие ниже пригождается где-то 1 раз к 30, если комант получилось много и они законфликтовали
    if (roomsCreated < numRooms) {
        console.warn(`Не удалось создать все комнаты. Создано ${roomsCreated} из ${numRooms}`);
    }
}

function generatePassages() {
    const numHorizontalPassages = Math.floor(Math.random() * 3) + 3;
    const numVerticalPassages = Math.floor(Math.random() * 3) + 3;
    let horizontalPassageCount = 0;
    let verticalPassageCount = 0;

    for (let i = 0; i < rooms.length; i++) {
        const room = rooms[i];
        let xBuffer = [];
        let yBuffer = [];

        for (let x = room.x; x < room.x + room.width; x++) {
            if (horizontalPassages.includes(x)) {
                xBuffer.push(x);
            }
        }

        for (let y = room.y; y < room.y + room.height; y++) {
            if (verticalPassages.includes(y)) {
                yBuffer.push(y);
            }
        }

        if (xBuffer.length === 0 && yBuffer.length === 0) {
            if (horizontalPassageCount < numHorizontalPassages) {
                let x = Math.floor(Math.random() * room.width) + room.x;
                horizontalPassages.push(x);
                for (let y = 0; y < HEIGHT; y++) {
                    map[y][x] = { type: 'empty' }
                }
                horizontalPassageCount++;
            } else if (verticalPassageCount < numVerticalPassages) {
                let y = Math.floor(Math.random() * room.height) + room.y;
                verticalPassages.push(y);
                for (let x = 0; x < WIDTH; x++) {
                    map[y][x] = { type: 'empty' }
                }
                verticalPassageCount++;
            }
        }

        if (horizontalPassageCount >= numHorizontalPassages && verticalPassageCount >= numVerticalPassages) {
            break;
        }
    }

    while (horizontalPassageCount < numHorizontalPassages) {
        let x = Math.floor(Math.random() * WIDTH);
        let isValid = true;

        for (let passage of horizontalPassages) {
            if (Math.abs(passage - x) <= 1) {
                isValid = false;
                break;
            }
        }

        if (isValid) {
            horizontalPassages.push(x);
            for (let y = 0; y < HEIGHT; y++) {
                map[y][x] = { type: 'empty' }
            }
            horizontalPassageCount++;
        }
    }

    while (verticalPassageCount < numVerticalPassages) {
        let y = Math.floor(Math.random() * HEIGHT);
        let isValid = true;

        for (let passage of verticalPassages) {
            if (Math.abs(passage - y) <= 1) {
                isValid = false;
                break;
            }
        }

        if (isValid) {
            verticalPassages.push(y);
            for (let x = 0; x < WIDTH; x++) {
                map[y][x] = { type: 'empty' }
            }
            verticalPassageCount++;
        }
    }
}

function getRandomEmptyTile() {
    let emptyTiles = [];
    for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
            if (map[y][x].type === 'empty') {
                emptyTiles.push({ x, y });
            }
        }
    }
    return emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
}

function placeSwords(count) {
    for (let i = 0; i < count; i++) {
        let tile = getRandomEmptyTile();
        if (tile) {
            map[tile.y][tile.x] = { type: 'sword' };
        }
    }
}

function placeHealthPotions(count) {
    for (let i = 0; i < count; i++) {
        let tile = getRandomEmptyTile();
        if (tile) {
            map[tile.y][tile.x] = { type: 'health-potion' };
        }
    }
}

function placeHero() {
    let tile = getRandomEmptyTile();
    if (tile) {
        window.heroPosition = {y: tile.y, x: tile.x };
        map[tile.y][tile.x] = { type: 'person' };
    }
}

function placeEnemies(count) {
    let enemyCounter = 0;
    for (let i = 0; i < count; i++) {
        let tile = getRandomEmptyTile();
        if (tile) {
            enemyCounter++; 
            const enemyId = `enemy-${enemyCounter}`;
            map[tile.y][tile.x] = {
                type: 'enemy',
                id: enemyId,
                health: 100,
                healthBar: null
            };
        }
    }
}

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
            } else if (map[y][x].type === 'enemy') {
                tile.classList.add('tileE');
            }
            field.appendChild(tile);
        }
    }
}

generateMap();
generateRooms();
generatePassages();
placeSwords(2);
placeHealthPotions(10);
placeHero();
placeEnemies(10);
renderMap();

const mapReadyEvent = new Event('mapReady');
document.dispatchEvent(mapReadyEvent);
