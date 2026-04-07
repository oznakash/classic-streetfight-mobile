class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        const text = this.add.text(400, 225, 'Loading...', {
            fontSize: '24px', fontFamily: 'monospace', color: '#fff'
        }).setOrigin(0.5);

        // Load sprite sheets (8 cols x 6 rows, 64x64 per frame)
        CHARACTER_KEYS.forEach(key => {
            this.load.spritesheet(key, `assets/sprites/${key}.png`, {
                frameWidth: 64,
                frameHeight: 64
            });
        });

        // Background
        this.load.image('stage_bg', 'assets/backgrounds/stage.png');

        // Projectile sprites
        this.load.image('proj_fireball', 'assets/sprites/proj_fireball.png');
        this.load.image('proj_bfg', 'assets/sprites/proj_bfg.png');
        this.load.image('proj_chicken', 'assets/sprites/proj_chicken.png');
        this.load.image('proj_raygun', 'assets/sprites/proj_raygun.png');
        this.load.image('proj_bullet', 'assets/sprites/proj_bullet.png');
        this.load.image('proj_sand', 'assets/sprites/proj_sand.png');
    }

    create() {
        // Define animations for each character
        CHARACTER_KEYS.forEach(key => {
            // Row 1: idle (0-3), walk start (4-7)
            // Row 2: walk end (8-9), jump (10-12), punch (13-15)
            // Row 3: kick (16-19), special1 (20-23)
            // Row 4: special2 (24-30), blank (31)
            // Row 5: block (32), hit (33-35), ko (36-39)
            // Row 6: victory (40-45), blank (46-47)

            this.anims.create({ key: `${key}_idle`, frames: this.anims.generateFrameNumbers(key, { start: 0, end: 3 }), frameRate: 6, repeat: -1 });
            this.anims.create({ key: `${key}_walk`, frames: this.anims.generateFrameNumbers(key, { start: 4, end: 9 }), frameRate: 10, repeat: -1 });
            this.anims.create({ key: `${key}_jump`, frames: this.anims.generateFrameNumbers(key, { start: 10, end: 12 }), frameRate: 8, repeat: 0 });
            this.anims.create({ key: `${key}_punch`, frames: this.anims.generateFrameNumbers(key, { start: 13, end: 15 }), frameRate: 12, repeat: 0 });
            this.anims.create({ key: `${key}_kick`, frames: this.anims.generateFrameNumbers(key, { start: 16, end: 19 }), frameRate: 12, repeat: 0 });
            this.anims.create({ key: `${key}_special1`, frames: this.anims.generateFrameNumbers(key, { start: 20, end: 23 }), frameRate: 10, repeat: 0 });
            this.anims.create({ key: `${key}_special2`, frames: this.anims.generateFrameNumbers(key, { start: 24, end: 30 }), frameRate: 10, repeat: 0 });
            this.anims.create({ key: `${key}_block`, frames: this.anims.generateFrameNumbers(key, { start: 32, end: 32 }), frameRate: 1, repeat: -1 });
            this.anims.create({ key: `${key}_hit`, frames: this.anims.generateFrameNumbers(key, { start: 33, end: 35 }), frameRate: 10, repeat: 0 });
            this.anims.create({ key: `${key}_ko`, frames: this.anims.generateFrameNumbers(key, { start: 36, end: 39 }), frameRate: 8, repeat: 0 });
            this.anims.create({ key: `${key}_victory`, frames: this.anims.generateFrameNumbers(key, { start: 40, end: 45 }), frameRate: 8, repeat: -1 });
        });

        this.scene.start('CharacterSelectScene');
    }
}
