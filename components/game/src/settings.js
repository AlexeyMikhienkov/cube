export const baseSettings = {
    linesCount: 4,
    visibilityInMetres: 30,
    step: 1,
    speed: {
        min: 0.075,
        max: 0.15
    },
    probability: {
        min: 1,
        max: 1
    },
    startOffset: 0,
    blocksInLine: {
        min: 1,
        max: 20
    },
    secondsToMax: 60,
    ticksPerSecond: 60,
    field: {
        offset: 0.5,
        lineSize: {
            width: 15,
            height: 1
        }
    },
    enemy: {
        size: {
            width: 1,
            height: 1,
            depth: 1
        }
    },
    hero: {
        size: {
            width: 0.8,
            height: 0.8,
            depth: 0.8
        }
    }
};

export function getDeltas() {
    const {probability, speed, blocksInLine, secondsToMax, ticksPerSecond} = baseSettings;

    return {
        probability: (probability.max - probability.min) / (secondsToMax * ticksPerSecond),
        speed: (speed.max - speed.min) / (secondsToMax * ticksPerSecond),
        blocksCounter: (blocksInLine.max - blocksInLine.min) / (secondsToMax * ticksPerSecond)
    }
}

export const enemies = {
    types: {
        small: [[1]],
        medium: [
            [1, 1],
            [1, 1]
        ],
        big: [
            [1, 1, 1],
            [1, 0, 0],
            [1, 0, 0]
        ]
    },
    get maxHeight() {
        const sizes = Object.values(this.types).map(matrix => matrix.length);

        return Math.max(...sizes);
    }
};

export function sortEnemiesDimensionsDesc() {
    const enemiesWithDimensions = Object.entries(enemies.types).map(([type, matrix]) => {
        return {
            type,
            matrix,
            dims: {
                rows: matrix.length,
                columns: matrix.reduce((x, y) => Math.max(x, y.length), 0)
            }
        }
    });

    return enemiesWithDimensions.sort((a, b) => {
        const {rows: rowsA, columns: columnsA} = a.dims;
        const {rows: rowsB, columns: columnsB} = b.dims;

        if (rowsA < rowsB)
            return 1;
        else if (rowsB < rowsA)
            return -1;
        else if (columnsA < columnsB)
            return 1;
        else return -1;
    })
}
