const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 450,
    pixelArt: true,
    backgroundColor: '#1a1a2e',
    parent: 'game-wrap',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 450
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 900 },
            debug: false
        }
    },
    scene: [BootScene, CharacterSelectScene, FightScene, VictoryScene]
};

const game = new Phaser.Game(config);

// Re-fit on iOS Safari URL bar collapse / rotation
window.addEventListener('resize', () => game.scale.refresh());
window.addEventListener('orientationchange', () => setTimeout(() => game.scale.refresh(), 150));
