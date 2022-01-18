export const baseSettings = {
    linesCount: 4,
    visibilityInMetres: 30,
    speed: {
        min: 0.075,
        max: 0.2
    },
    probability: {
        min: 0.1,
        max: 1
    },
    blocksInLine: {
        min: 1,
        max: 20
    },
    secondsToMax: 30,
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
            width: 0.75,
            height: 0.75,
            depth: 0.75,
        }
    },
    hero: {
        size: {
            width: 0.8,
            height: 0.8,
            depth: 0.8,
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

