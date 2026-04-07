class HUD {
    constructor(scene) {
        this.scene = scene;
        this.elements = {};
        this.create();
    }

    create() {
        const s = this.scene;

        // Health bar backgrounds
        this.elements.p1BarBg = s.add.rectangle(200, 30, 300, 20, 0x333333).setDepth(20);
        this.elements.p2BarBg = s.add.rectangle(600, 30, 300, 20, 0x333333).setDepth(20);

        // Health bars
        this.elements.p1Bar = s.add.rectangle(200, 30, 296, 16, 0x00cc00).setDepth(21);
        this.elements.p2Bar = s.add.rectangle(600, 30, 296, 16, 0x00cc00).setDepth(21);

        // Health bar borders
        s.add.rectangle(200, 30, 300, 20).setStrokeStyle(2, 0xffffff).setDepth(22).setFillStyle();
        s.add.rectangle(600, 30, 300, 20).setStrokeStyle(2, 0xffffff).setDepth(22).setFillStyle();

        // Player names
        this.elements.p1Name = s.add.text(55, 18, 'P1', {
            fontSize: '14px', fontFamily: 'monospace', color: '#fff', fontStyle: 'bold'
        }).setDepth(22);
        this.elements.p2Name = s.add.text(745, 18, 'P2', {
            fontSize: '14px', fontFamily: 'monospace', color: '#fff', fontStyle: 'bold'
        }).setOrigin(1, 0).setDepth(22);

        // Character portraits (sprite frame 0)
        this.elements.p1PortraitBg = s.add.rectangle(28, 30, 40, 40, 0x222244).setDepth(20);
        this.elements.p2PortraitBg = s.add.rectangle(772, 30, 40, 40, 0x222244).setDepth(20);
        this.elements.p1Portrait = s.add.sprite(28, 30, 'doomguy', 0).setDepth(21).setScale(0.6);
        this.elements.p2Portrait = s.add.sprite(772, 30, 'doomguy', 0).setDepth(21).setScale(0.6);

        // Timer
        this.elements.timer = s.add.text(400, 10, '99', {
            fontSize: '28px', fontFamily: 'monospace', color: '#fff', fontStyle: 'bold'
        }).setOrigin(0.5, 0).setDepth(22);

        // Round text
        this.elements.roundText = s.add.text(400, 42, 'ROUND 1', {
            fontSize: '10px', fontFamily: 'monospace', color: '#aaa'
        }).setOrigin(0.5, 0).setDepth(22);

        // Round indicators
        this.roundIndicators = { p1: [], p2: [] };
        for (let i = 0; i < 2; i++) {
            const p1Dot = s.add.circle(60 + i * 18, 52, 5, 0x333333).setDepth(22);
            const p2Dot = s.add.circle(740 - i * 18, 52, 5, 0x333333).setDepth(22);
            p1Dot.setStrokeStyle(1, 0x888888);
            p2Dot.setStrokeStyle(1, 0x888888);
            this.roundIndicators.p1.push(p1Dot);
            this.roundIndicators.p2.push(p2Dot);
        }

        // Announcement text (centered, for "ROUND 1", "FIGHT!", "KO!")
        this.elements.announcement = s.add.text(400, 200, '', {
            fontSize: '48px', fontFamily: 'monospace', color: '#fff', fontStyle: 'bold',
            stroke: '#000', strokeThickness: 6
        }).setOrigin(0.5).setDepth(50).setAlpha(0);
    }

    updateHealth(p1Health, p1Max, p2Health, p2Max) {
        const p1Ratio = Math.max(0, p1Health / p1Max);
        const p2Ratio = Math.max(0, p2Health / p2Max);

        this.elements.p1Bar.setSize(296 * p1Ratio, 16);
        this.elements.p1Bar.setX(52 + 296 * p1Ratio / 2);
        this.elements.p2Bar.setSize(296 * p2Ratio, 16);
        this.elements.p2Bar.setX(748 - 296 * p2Ratio / 2);

        // Color based on health
        this.elements.p1Bar.setFillStyle(this.getHealthColor(p1Ratio));
        this.elements.p2Bar.setFillStyle(this.getHealthColor(p2Ratio));
    }

    getHealthColor(ratio) {
        if (ratio > 0.5) return 0x00cc00;
        if (ratio > 0.25) return 0xcccc00;
        return 0xcc0000;
    }

    updateTimer(seconds) {
        this.elements.timer.setText(Math.ceil(seconds).toString().padStart(2, '0'));
        if (seconds <= 10) {
            this.elements.timer.setColor('#ff4444');
        } else {
            this.elements.timer.setColor('#ffffff');
        }
    }

    updateRound(roundNum) {
        this.elements.roundText.setText(`ROUND ${roundNum}`);
    }

    updateRoundWins(p1Wins, p2Wins) {
        for (let i = 0; i < 2; i++) {
            this.roundIndicators.p1[i].setFillStyle(i < p1Wins ? 0xffcc00 : 0x333333);
            this.roundIndicators.p2[i].setFillStyle(i < p2Wins ? 0xffcc00 : 0x333333);
        }
    }

    setCharacters(p1Key, p2Key) {
        const c1 = CHARACTERS[p1Key];
        const c2 = CHARACTERS[p2Key];
        this.elements.p1Name.setText(c1.name);
        this.elements.p2Name.setText(c2.name);
        this.elements.p1Portrait.setTexture(p1Key, 0);
        this.elements.p2Portrait.setTexture(p2Key, 0).setFlipX(true);
    }

    showAnnouncement(text, duration, callback) {
        const ann = this.elements.announcement;
        ann.setText(text);
        ann.setAlpha(1).setScale(2);
        this.scene.tweens.add({
            targets: ann,
            scaleX: 1, scaleY: 1,
            duration: 200,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.scene.time.delayedCall(duration, () => {
                    this.scene.tweens.add({
                        targets: ann,
                        alpha: 0,
                        duration: 300,
                        onComplete: callback
                    });
                });
            }
        });
    }

    destroy() {
        Object.values(this.elements).forEach(el => el.destroy());
        this.roundIndicators.p1.forEach(d => d.destroy());
        this.roundIndicators.p2.forEach(d => d.destroy());
    }
}
