class CharacterSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CharacterSelectScene' });
    }

    create() {
        this.cameras.main.setBackgroundColor('#0a0a1a');

        // Logo
        this.createLogo();

        // Character cards
        this.p1Selection = 0;
        this.p2Selection = 1;
        this.p1Confirmed = false;
        this.p2Confirmed = false;

        this.cards = [];
        const count = CHARACTER_KEYS.length;
        const spacing = Math.min(130, 760 / count);
        const totalWidth = spacing * (count - 1);
        const startX = 400 - totalWidth / 2;

        CHARACTER_KEYS.forEach((key, i) => {
            const char = CHARACTERS[key];
            const x = startX + i * spacing;
            const y = 185;

            const bg = this.add.rectangle(x, y, spacing - 10, 140, 0x1a1a3e);
            bg.setStrokeStyle(2, 0x333366);

            const preview = this.add.sprite(x, y - 15, key, 0).setScale(1.3);
            preview.play(`${key}_idle`);

            const name = this.add.text(x, y + 45, char.name, {
                fontSize: '9px', fontFamily: 'monospace', color: '#fff', fontStyle: 'bold'
            }).setOrigin(0.5);

            this.add.text(x, y + 57, char.game, {
                fontSize: '7px', fontFamily: 'monospace', color: '#666'
            }).setOrigin(0.5);

            this.cards.push({ bg, preview, name, x, y });
        });

        // Selection cursors
        this.p1Cursor = this.add.triangle(0, 0, 0, 15, 8, 0, 16, 15, 0x4488ff);
        this.p2Cursor = this.add.triangle(0, 0, 0, 15, 8, 0, 16, 15, 0xff4444);

        this.p1Label = this.add.text(0, 0, 'P1', {
            fontSize: '12px', fontFamily: 'monospace', color: '#4488ff', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.p2Label = this.add.text(0, 0, 'P2', {
            fontSize: '12px', fontFamily: 'monospace', color: '#ff4444', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Controls display
        const ctrlY = 300;
        const ctrlStyle = { fontSize: '9px', fontFamily: 'monospace', color: '#555' };
        const p1Style = { fontSize: '10px', fontFamily: 'monospace', color: '#4488ff' };
        const p2Style = { fontSize: '10px', fontFamily: 'monospace', color: '#ff4444' };

        // P1 controls (left side)
        this.add.text(150, ctrlY, '-- P1 Controls --', p1Style).setOrigin(0.5);
        this.add.text(150, ctrlY + 16, 'Move:  Arrow Keys', ctrlStyle).setOrigin(0.5);
        this.add.text(150, ctrlY + 28, 'Punch: Z    Kick: X', ctrlStyle).setOrigin(0.5);
        this.add.text(150, ctrlY + 40, 'Special: C  (+ Down = Alt)', ctrlStyle).setOrigin(0.5);
        this.add.text(150, ctrlY + 52, 'Block: Back + Down', ctrlStyle).setOrigin(0.5);

        // P2 controls (right side)
        this.add.text(650, ctrlY, '-- P2 Controls --', p2Style).setOrigin(0.5);
        this.add.text(650, ctrlY + 16, 'Move:  W A S D', ctrlStyle).setOrigin(0.5);
        this.add.text(650, ctrlY + 28, 'Punch: F    Kick: G', ctrlStyle).setOrigin(0.5);
        this.add.text(650, ctrlY + 40, 'Special: H  (+ S = Alt)', ctrlStyle).setOrigin(0.5);
        this.add.text(650, ctrlY + 52, 'Block: Back + S', ctrlStyle).setOrigin(0.5);

        // Select instructions
        this.add.text(400, ctrlY + 6, 'Select:', { fontSize: '10px', fontFamily: 'monospace', color: '#aaa' }).setOrigin(0.5);
        this.add.text(400, ctrlY + 20, 'P1: Arrows + SPACE', p1Style).setOrigin(0.5);
        this.add.text(400, ctrlY + 34, 'P2: A/D + ENTER', p2Style).setOrigin(0.5);

        // Character stats display
        this.p1Stats = this.add.text(150, ctrlY + 70, '', {
            fontSize: '9px', fontFamily: 'monospace', color: '#4488ff'
        }).setOrigin(0.5);
        this.p2Stats = this.add.text(650, ctrlY + 70, '', {
            fontSize: '9px', fontFamily: 'monospace', color: '#ff4444'
        }).setOrigin(0.5);

        // Ready text
        this.readyText = this.add.text(400, 420, '', {
            fontSize: '16px', fontFamily: 'monospace', color: '#ffcc00', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Input - P1: arrows + SPACE, P2: A/D + ENTER
        this.keys = {
            p1Left: this.input.keyboard.addKey('LEFT'),
            p1Right: this.input.keyboard.addKey('RIGHT'),
            p1Confirm: this.input.keyboard.addKey('SPACE'),
            p2Left: this.input.keyboard.addKey('A'),
            p2Right: this.input.keyboard.addKey('D'),
            p2Confirm: this.input.keyboard.addKey('ENTER')
        };

        this.input.keyboard.addCapture(['LEFT', 'RIGHT', 'A', 'D', 'SPACE', 'ENTER']);

        this.updateCursors();
    }

    update() {
        if (!this.p1Confirmed) {
            if (Phaser.Input.Keyboard.JustDown(this.keys.p1Left)) {
                this.p1Selection = (this.p1Selection - 1 + CHARACTER_KEYS.length) % CHARACTER_KEYS.length;
                this.updateCursors();
            }
            if (Phaser.Input.Keyboard.JustDown(this.keys.p1Right)) {
                this.p1Selection = (this.p1Selection + 1) % CHARACTER_KEYS.length;
                this.updateCursors();
            }
            if (Phaser.Input.Keyboard.JustDown(this.keys.p1Confirm)) {
                this.p1Confirmed = true;
                this.updateCursors();
            }
        }

        if (!this.p2Confirmed) {
            if (Phaser.Input.Keyboard.JustDown(this.keys.p2Left)) {
                this.p2Selection = (this.p2Selection - 1 + CHARACTER_KEYS.length) % CHARACTER_KEYS.length;
                this.updateCursors();
            }
            if (Phaser.Input.Keyboard.JustDown(this.keys.p2Right)) {
                this.p2Selection = (this.p2Selection + 1) % CHARACTER_KEYS.length;
                this.updateCursors();
            }
            if (Phaser.Input.Keyboard.JustDown(this.keys.p2Confirm)) {
                this.p2Confirmed = true;
                this.updateCursors();
            }
        }

        if (this.p1Confirmed === true && this.p2Confirmed === true) {
            this.readyText.setText('FIGHT!');
            this.time.delayedCall(800, () => {
                this.scene.start('FightScene', {
                    p1: CHARACTER_KEYS[this.p1Selection],
                    p2: CHARACTER_KEYS[this.p2Selection]
                });
            });
            this.p1Confirmed = 'started';
            this.p2Confirmed = 'started';
        }
    }

    createLogo() {
        const cx = 400, cy = 36;

        // Shadow layer
        this.add.text(cx + 2, cy + 2, 'STREET FIGHT', {
            fontSize: '40px', fontFamily: 'monospace', color: '#000000', fontStyle: 'bold'
        }).setOrigin(0.5).setAlpha(0.6);

        // Main text
        const logo = this.add.text(cx, cy, 'STREET FIGHT', {
            fontSize: '40px', fontFamily: 'monospace', color: '#ff3300', fontStyle: 'bold',
            stroke: '#ffcc00', strokeThickness: 2
        }).setOrigin(0.5);

        // Subtitle
        this.add.text(cx, cy + 30, '— CLASSIC PC GAME CHARACTERS —', {
            fontSize: '10px', fontFamily: 'monospace', color: '#886644'
        }).setOrigin(0.5);

        // Subtle flicker
        let flickerCount = 0;
        const flicker = () => {
            flickerCount++;
            logo.setAlpha(flickerCount % 2 === 0 ? 0.75 : 1);
            const next = flickerCount < 4 ? 60 : 3000 + Math.random() * 5000;
            if (flickerCount >= 4) flickerCount = 0;
            this.time.delayedCall(next, flicker);
        };
        this.time.delayedCall(2500, flicker);
    }

    updateCursors() {
        const p1Card = this.cards[this.p1Selection];
        const p2Card = this.cards[this.p2Selection];

        this.p1Cursor.setPosition(p1Card.x - 8, p1Card.y - 100);
        this.p2Cursor.setPosition(p2Card.x - 8, p2Card.y + 95);
        this.p1Label.setPosition(p1Card.x, p1Card.y - 110);
        this.p2Label.setPosition(p2Card.x, p2Card.y + 110);

        this.cards.forEach((card, i) => {
            let strokeColor = 0x333366;
            let strokeWidth = 2;
            if (i === this.p1Selection) { strokeColor = 0x4488ff; strokeWidth = this.p1Confirmed ? 3 : 2; }
            if (i === this.p2Selection) { strokeColor = 0xff4444; strokeWidth = this.p2Confirmed ? 3 : 2; }
            if (i === this.p1Selection && i === this.p2Selection) { strokeColor = 0xff88ff; strokeWidth = 3; }
            card.bg.setStrokeStyle(strokeWidth, strokeColor);
        });

        const c1 = CHARACTERS[CHARACTER_KEYS[this.p1Selection]];
        const c2 = CHARACTERS[CHARACTER_KEYS[this.p2Selection]];
        this.p1Stats.setText(`HP:${c1.health} SPD:${c1.speed} | ${c1.moves.special1.name} / ${c1.moves.special2.name}`);
        this.p2Stats.setText(`HP:${c2.health} SPD:${c2.speed} | ${c2.moves.special1.name} / ${c2.moves.special2.name}`);

        let ready = '';
        if (this.p1Confirmed === true) ready += 'P1 READY! ';
        if (this.p2Confirmed === true) ready += 'P2 READY!';
        this.readyText.setText(ready);
    }
}
