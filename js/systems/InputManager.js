class InputManager {
    constructor(scene) {
        this.scene = scene;
        this.keys = {};
        this.setupKeys();
    }

    setupKeys() {
        const kb = this.scene.input.keyboard;

        this.keys.p1 = {
            left: kb.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
            right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
            up: kb.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
            down: kb.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
            punch: kb.addKey(Phaser.Input.Keyboard.KeyCodes.Z),
            kick: kb.addKey(Phaser.Input.Keyboard.KeyCodes.X),
            special: kb.addKey(Phaser.Input.Keyboard.KeyCodes.C)
        };

        this.keys.p2 = {
            left: kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            up: kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down: kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            punch: kb.addKey(Phaser.Input.Keyboard.KeyCodes.F),
            kick: kb.addKey(Phaser.Input.Keyboard.KeyCodes.G),
            special: kb.addKey(Phaser.Input.Keyboard.KeyCodes.H)
        };

        kb.addCapture([
            'LEFT', 'RIGHT', 'UP', 'DOWN',
            'W', 'A', 'S', 'D',
            'Z', 'X', 'C', 'F', 'G', 'H',
            'SPACE', 'ENTER'
        ]);
    }

    getInput(player) {
        const k = this.keys[player];
        const t = (window.TouchInput && window.TouchInput[player]) || null;

        const touchLeft = !!(t && t.left);
        const touchRight = !!(t && t.right);
        const touchDown = !!(t && t.down);
        const touchBlock = !!(t && t.block);

        const consume = (name) => {
            if (t && t[name]) { t[name] = false; return true; }
            return false;
        };

        return {
            left: k.left.isDown || touchLeft,
            right: k.right.isDown || touchRight,
            up: Phaser.Input.Keyboard.JustDown(k.up) || consume('upTap'),
            down: k.down.isDown || touchDown,
            punch: Phaser.Input.Keyboard.JustDown(k.punch) || consume('punchTap'),
            kick: Phaser.Input.Keyboard.JustDown(k.kick) || consume('kickTap'),
            special: Phaser.Input.Keyboard.JustDown(k.special) || consume('specialTap'),
            holdLeft: k.left.isDown || touchLeft,
            holdRight: k.right.isDown || touchRight,
            block: touchBlock
        };
    }

    destroy() {
        this.scene.input.keyboard.removeAllKeys(true);
    }
}
