// Конфигурация города
export const cityConfig = {
  size: 200, // Размер города в единицах
  groundColor: 0x2a2a2a,
  gridColor: 0x444444,
  gridDivisions: 20,
  
  // Позиции зданий (будут добавлены позже)
  buildingPositions: {
    rsaTower: { x: 0, z: 0 },
    hashFactory: { x: 30, z: 30 },
    gameArena: { x: -30, z: 30 },
    library: { x: 30, z: -30 },
    aliceBob: { x: -30, z: -30 },
    powerPlant: { x: 0, z: 40 }
  },
  
  // Цвета
  colors: {
    rsaTower: 0x4a90e2,
    hashFactory: 0xe24a4a,
    gameArena: 0x4ae24a,
    library: 0xe2e24a,
    aliceBob: 0xe24ae2,
    powerPlant: 0xe2a04a
  }
};

