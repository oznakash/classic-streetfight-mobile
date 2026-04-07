const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 450,
    pixelArt: true,
    backgroundColor: '#1a1a2e',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
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
