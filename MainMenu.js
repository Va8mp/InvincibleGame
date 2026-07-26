class MainMenu extends Phaser.Scene {
    constructor() {
        super('MainMenu');
    }

    preload() {
        // Call your external function from Preload.js and pass 'this' scene into it
        scenePreload(this);
    }

    create() {
        // 1. Background Setup
        let bg = this.add.image(960, 540, 'menuSKY');
        bg.setTint(0x666666); // Darkens background slightly so text pops
        bg.setScale(4);

        // Only start if it's not already playing
        if (!this.sound.get('menuMusic')) {
            this.bgm = this.sound.add('menuMusic', {
                volume: 0.3,
                loop: true
            });
            this.bgm.play();
        } else {
            this.bgm = this.sound.get('menuMusic');
            if (!this.bgm.isPlaying) {
                this.bgm.play();
            }
        }

        // 2. Game Title
        this.add.text(960, 320, 'INVINCIBLE Inc.', {
            fontSize: '96px',
            fontFamily: 'Pixelated',
            fontWeight: 'bold',
            fill: '#fffb00',
        }).setOrigin(0.5);

        this.add.text(960, 430, 'CITY BRAWLER', {
            fontSize: '48px',
            fontFamily: 'Pixelated',
            fontWeight: 'bold',
            fill: '#ffcc00',
            stroke: '#000000',
            strokeThickness: 5
        }).setOrigin(0.5);

        // 3. Start Button Clickable
        let startBtn = this.add.text(960, 680, '[ START GAME ]', {
            fontSize: '42px',
            fontFamily: 'Pixelated',
            fill: '#ffffff',
            backgroundColor: '#111111',
            padding: { x: 25, y: 12 }
        }).setOrigin(0.5);

        // 3. Options Button Clickable
        let optionsBtn = this.add.text(960, 770, '[ OPTIONS ]', {
            fontSize: '42px',
            fontFamily: 'Pixelated',
            fill: '#ffffff',
            backgroundColor: '#111111',
            padding: { x: 25, y: 12 }
        }).setOrigin(0.5);

        //START BUTTON
        //----------------------------------------------------------------------------------
        // Enable mouse interaction and pointer cursor
        startBtn.setInteractive({ useHandCursor: true });

        // Hover Effect: Text scales up slightly and turns yellow when mouse enters
        startBtn.on('pointerover', () => {
            startBtn.setScale(1.1);
            startBtn.setStyle({ fill: '#ffcc00' });
        });

        // Hover Reset: Scales back and resets color when mouse leaves
        startBtn.on('pointerout', () => {
            startBtn.setScale(1.0);
            startBtn.setStyle({ fill: '#ffffff' });
        });

        // CLICK EVENT: Launches the game scene when clicked!
        startBtn.on('pointerdown', () => {
            this.scene.start('InvincibleGame');
        });

        //OPTIONS BUTTON
        //----------------------------------------------------------------------------------
        // Enable mouse interaction and pointer cursor
        optionsBtn.setInteractive({ useHandCursor: true });

        // Hover Effect: Text scales up slightly and turns yellow when mouse enters
        optionsBtn.on('pointerover', () => {
            optionsBtn.setScale(1.1);
            optionsBtn.setStyle({ fill: '#ffcc00' });
        });

        // Hover Reset: Scales back and resets color when mouse leaves
        optionsBtn.on('pointerout', () => {
            optionsBtn.setScale(1.0);
            optionsBtn.setStyle({ fill: '#ffffff' });
        });

        // CLICK EVENT: Launches the game scene when clicked!
        optionsBtn.on('pointerdown', () => {
            this.scene.start('InvincibleGame');
        });

        const startGameAction = () => {
            // Optional: Stop or fade menu music before switching scenes
            if (this.bgm) {
                this.bgm.stop(); 
            }
            this.scene.start('InvincibleGame');
        };
    }
}