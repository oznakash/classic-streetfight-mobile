class VictoryScene extends Phaser.Scene {
    constructor() {
        super({ key: 'VictoryScene' });
    }

    init(data) {
        this.winner = data.winner;
        this.characterKey = data.character;
        this.p1Char = data.p1Char;
        this.p2Char = data.p2Char;
    }

    create() {
        this.cameras.main.setBackgroundColor('#0a0a1a');

        const char = CHARACTERS[this.characterKey];

        // Winner text
        const winText = this.add.text(400, 80, `PLAYER ${this.winner} WINS!`, {
            fontSize: '36px', fontFamily: 'monospace', color: '#ffcc00', fontStyle: 'bold',
            stroke: '#000', strokeThickness: 4
        }).setOrigin(0.5).setScale(0);

        this.tweens.add({
            targets: winText,
            scaleX: 1, scaleY: 1,
            duration: 500,
            ease: 'Back.easeOut'
        });

        // Character name
        this.add.text(400, 130, char.name, {
            fontSize: '24px', fontFamily: 'monospace', color: '#fff'
        }).setOrigin(0.5);

        this.add.text(400, 155, `from ${char.game}`, {
            fontSize: '14px', fontFamily: 'monospace', color: '#888'
        }).setOrigin(0.5);

        // Victory character display
        const charSprite = this.add.sprite(400, 250, this.characterKey, 0).setScale(3);
        charSprite.play(`${this.characterKey}_victory`);

        this.tweens.add({
            targets: charSprite,
            y: '-=10',
            duration: 400,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Confetti
        for (let i = 0; i < 30; i++) {
            const px = 100 + Math.random() * 600;
            const py = -20 - Math.random() * 100;
            const colors = [0xff4444, 0x44ff44, 0x4444ff, 0xffff44, 0xff44ff, 0x44ffff];
            const p = this.add.rectangle(px, py, 6, 6, colors[Math.floor(Math.random() * colors.length)]);
            this.tweens.add({
                targets: p,
                y: 500,
                x: px + (Math.random() - 0.5) * 200,
                angle: Math.random() * 720,
                duration: 2000 + Math.random() * 2000,
                delay: Math.random() * 1000,
                repeat: -1,
                onRepeat: () => { p.setPosition(100 + Math.random() * 600, -20); }
            });
        }

        // Instructions
        this.add.text(400, 370, 'SPACE / ENTER  -  Character Select', {
            fontSize: '13px', fontFamily: 'monospace', color: '#aaa'
        }).setOrigin(0.5);

        this.add.text(400, 392, 'Z / F  -  Rematch', {
            fontSize: '13px', fontFamily: 'monospace', color: '#aaa'
        }).setOrigin(0.5);

        // Input
        this.input.keyboard.addCapture(['SPACE', 'ENTER', 'Z', 'F']);

        this.spaceKey = this.input.keyboard.addKey('SPACE');
        this.enterKey = this.input.keyboard.addKey('ENTER');
        this.zKey = this.input.keyboard.addKey('Z');
        this.fKey = this.input.keyboard.addKey('F');

        this.canProceed = false;
        this.time.delayedCall(1000, () => { this.canProceed = true; });
    }

    update() {
        if (!this.canProceed) return;

        if (Phaser.Input.Keyboard.JustDown(this.spaceKey) || Phaser.Input.Keyboard.JustDown(this.enterKey)) {
            this.scene.start('CharacterSelectScene');
        }
        if (Phaser.Input.Keyboard.JustDown(this.zKey) || Phaser.Input.Keyboard.JustDown(this.fKey)) {
            this.scene.start('FightScene', { p1: this.p1Char, p2: this.p2Char });
        }
    }
}
