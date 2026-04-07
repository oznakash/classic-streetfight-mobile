const CHARACTERS = {
    doomguy: {
        name: 'Doomguy',
        game: 'Doom',
        color: 0x4a8c3f,
        accentColor: 0x8b4513,
        speed: 140,
        jumpForce: -380,
        health: 110,
        moves: {
            punch: {
                damage: 10,
                knockback: 150,
                hitstun: 12,
                startup: 3,
                active: 3,
                recovery: 6,
                hitbox: { x: 30, y: -10, w: 30, h: 20 }
            },
            kick: {
                damage: 14,
                knockback: 200,
                hitstun: 16,
                startup: 5,
                active: 4,
                recovery: 8,
                hitbox: { x: 25, y: 0, w: 35, h: 25 }
            },
            special1: {
                name: 'Shotgun Blast',
                damage: 20,
                knockback: 300,
                hitstun: 20,
                startup: 6,
                active: 5,
                recovery: 14,
                hitbox: { x: 20, y: -5, w: 50, h: 30 }
            },
            special2: {
                name: 'BFG',
                damage: 25,
                knockback: 250,
                hitstun: 22,
                startup: 10,
                active: 7,
                recovery: 16,
                isProjectile: true,
                projectileSpeed: 300,
                projectileColor: 0x00ff00,
                projectileSize: 10,
                projectileSprite: 'proj_bfg'
            }
        }
    },
    guybrush: {
        name: 'Guybrush',
        game: 'Monkey Island',
        color: 0xf5f5dc,
        accentColor: 0x8b6914,
        speed: 160,
        jumpForce: -360,
        health: 90,
        moves: {
            punch: {
                damage: 8,
                knockback: 120,
                hitstun: 10,
                startup: 3,
                active: 3,
                recovery: 5,
                hitbox: { x: 25, y: -10, w: 35, h: 20 }
            },
            kick: {
                damage: 12,
                knockback: 180,
                hitstun: 14,
                startup: 4,
                active: 4,
                recovery: 7,
                hitbox: { x: 20, y: 0, w: 35, h: 25 }
            },
            special1: {
                name: 'Insult',
                damage: 5,
                knockback: 50,
                hitstun: 30,
                startup: 8,
                active: 5,
                recovery: 10,
                hitbox: { x: 15, y: -20, w: 60, h: 40 }
            },
            special2: {
                name: 'Rubber Chicken',
                damage: 18,
                knockback: 200,
                hitstun: 18,
                startup: 8,
                active: 7,
                recovery: 12,
                isProjectile: true,
                projectileSpeed: 250,
                projectileColor: 0xffff00,
                projectileSize: 8,
                projectileSprite: 'proj_chicken',
                arc: true
            }
        }
    },
    keen: {
        name: 'Cmdr Keen',
        game: 'Commander Keen',
        color: 0x9b30ff,
        accentColor: 0xffd700,
        speed: 180,
        jumpForce: -400,
        health: 90,
        moves: {
            punch: {
                damage: 8,
                knockback: 130,
                hitstun: 10,
                startup: 2,
                active: 3,
                recovery: 4,
                hitbox: { x: 25, y: -10, w: 28, h: 20 }
            },
            kick: {
                damage: 11,
                knockback: 170,
                hitstun: 13,
                startup: 3,
                active: 4,
                recovery: 6,
                hitbox: { x: 20, y: 5, w: 30, h: 25 }
            },
            special1: {
                name: 'Pogo Bounce',
                damage: 22,
                knockback: 200,
                hitstun: 18,
                startup: 4,
                active: 5,
                recovery: 10,
                hitbox: { x: -10, y: 20, w: 40, h: 30 },
                isDive: true,
                diveVelocityX: 100,
                diveVelocityY: -350
            },
            special2: {
                name: 'Ray Gun',
                damage: 15,
                knockback: 180,
                hitstun: 16,
                startup: 5,
                active: 7,
                recovery: 10,
                isProjectile: true,
                projectileSpeed: 350,
                projectileColor: 0xff4444,
                projectileSize: 6,
                projectileSprite: 'proj_raygun'
            }
        }
    },
    mario: {
        name: 'Mario',
        game: 'Super Mario',
        color: 0xff0000,
        accentColor: 0x0000ff,
        speed: 155,
        jumpForce: -390,
        health: 100,
        moves: {
            punch: {
                damage: 9,
                knockback: 140,
                hitstun: 11,
                startup: 3,
                active: 3,
                recovery: 5,
                hitbox: { x: 28, y: -8, w: 30, h: 20 }
            },
            kick: {
                damage: 13,
                knockback: 190,
                hitstun: 15,
                startup: 4,
                active: 4,
                recovery: 7,
                hitbox: { x: 22, y: 2, w: 35, h: 25 }
            },
            special1: {
                name: 'Fireball',
                damage: 14,
                knockback: 150,
                hitstun: 14,
                startup: 5,
                active: 5,
                recovery: 10,
                isProjectile: true,
                projectileSpeed: 270,
                projectileColor: 0xff6600,
                projectileSize: 8,
                projectileSprite: 'proj_fireball',
                bounce: true
            },
            special2: {
                name: 'Stomp',
                damage: 24,
                knockback: 280,
                hitstun: 20,
                startup: 6,
                active: 7,
                recovery: 14,
                hitbox: { x: -8, y: 20, w: 36, h: 30 },
                isDive: true,
                diveVelocityX: 60,
                diveVelocityY: -420
            }
        }
    },
    lara: {
        name: 'Lara Croft',
        game: 'Tomb Raider',
        color: 0x008080,
        accentColor: 0x8b4513,
        speed: 175,
        jumpForce: -410,
        health: 90,
        moves: {
            punch: {
                damage: 8,
                knockback: 130,
                hitstun: 10,
                startup: 2,
                active: 3,
                recovery: 4,
                hitbox: { x: 25, y: -8, w: 28, h: 18 }
            },
            kick: {
                damage: 12,
                knockback: 180,
                hitstun: 14,
                startup: 3,
                active: 4,
                recovery: 6,
                hitbox: { x: 22, y: 2, w: 35, h: 22 }
            },
            special1: {
                name: 'Dual Pistols',
                damage: 12,
                knockback: 140,
                hitstun: 12,
                startup: 4,
                active: 5,
                recovery: 8,
                isProjectile: true,
                projectileSpeed: 380,
                projectileColor: 0xffdd44,
                projectileSize: 5,
                projectileSprite: 'proj_bullet'
            },
            special2: {
                name: 'Grapple Hook',
                damage: 18,
                knockback: -200,
                hitstun: 20,
                startup: 6,
                active: 7,
                recovery: 12,
                hitbox: { x: 20, y: -5, w: 70, h: 25 }
            }
        }
    },
    prince: {
        name: 'Prince',
        game: 'Prince of Persia',
        color: 0xf5deb3,
        accentColor: 0xdaa520,
        speed: 170,
        jumpForce: -400,
        health: 95,
        moves: {
            punch: {
                damage: 10,
                knockback: 140,
                hitstun: 12,
                startup: 3,
                active: 3,
                recovery: 5,
                hitbox: { x: 28, y: -8, w: 32, h: 20 }
            },
            kick: {
                damage: 13,
                knockback: 185,
                hitstun: 14,
                startup: 4,
                active: 4,
                recovery: 7,
                hitbox: { x: 24, y: 2, w: 34, h: 24 }
            },
            special1: {
                name: 'Sword Dash',
                damage: 20,
                knockback: 250,
                hitstun: 18,
                startup: 5,
                active: 5,
                recovery: 12,
                hitbox: { x: 15, y: -5, w: 55, h: 30 },
                isDive: true,
                diveVelocityX: 250,
                diveVelocityY: -50
            },
            special2: {
                name: 'Sand Rewind',
                damage: 16,
                knockback: 160,
                hitstun: 24,
                startup: 8,
                active: 7,
                recovery: 14,
                isProjectile: true,
                projectileSpeed: 260,
                projectileColor: 0xdaa520,
                projectileSize: 9,
                projectileSprite: 'proj_sand'
            }
        }
    }
};

const CHARACTER_KEYS = Object.keys(CHARACTERS);
