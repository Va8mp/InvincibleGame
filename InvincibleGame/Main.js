class Invincible extends Phaser.Scene {
    constructor() {
        super('Invincible');
        this.comboStage = 0;
        this.lastHitTime = 0;
        this.comboTimeout = 600; 
        this.hasCrashed = false; 
    }

    preload() {
        this.load.image('bg', 'Street Fighter 2.jpg');

        // --- EVE ---
        this.load.image('eve_idle_0', 'EveSprites/Idle/Idle_00.png');
        this.load.image('eve_idle_1', 'EveSprites/Idle/Idle_01.png');
        this.load.image('eve_walk_0', 'EveSprites/Move/Walk_00.png');
        this.load.image('eve_walk_1', 'EveSprites/Move/Walk_01.png');
        this.load.image('eve_attack_0', 'EveSprites/Hit/FirstCombo_00.png'); 
        this.load.image('eve_attack_1', 'EveSprites/Hit/FirstCombo_01.png');
        this.load.image('eve_hit_0', 'EveSprites/Down/Kd_00.png'); 

        // --- MARK ---
        this.load.image('mark_idle_0', 'MarkSprites/Idle/Idle_00.png');
        this.load.image('mark_walk_0', 'MarkSprites/Move/Walk_00.png');
        this.load.image('mark_walk_1', 'MarkSprites/Move/Walk_01.png');
        this.load.image('mark_hit_0', 'MarkSprites/Down/Kd_00.png');
        this.load.image('mark_attack_0', 'MarkSprites/Hit/FirstAttack_00.png'); 
        this.load.image('mark_attack_1', 'MarkSprites/Hit/FirstAttack_01.png');
    }

    create() {
        this.gameState = 'START'; 

        // --- WAVE COUNTERS ---
        this.marksDefeated = 0; 
        this.totalMarksToWin = 3;

        // --- BACKGROUND ---
        let bg = this.add.image(400, 300, 'bg');
        let scaleRatio = Math.max(800 / bg.width, 600 / bg.height);
        bg.setScale(scaleRatio);

        // --- CHARACTERS ---
        this.eve = this.physics.add.sprite(200, 400, 'eve_idle_0').setScale(2);
        this.mark = this.physics.add.sprite(600, 400, 'mark_idle_0').setScale(2); 

        this.eve.setCollideWorldBounds(true);
        this.mark.setCollideWorldBounds(true);

        this.eve.hp = 100;
        this.eve.isAttacking = false; 
        this.eve.isHit = false; 
        
        this.mark.hp = 100;
        this.mark.isHit = false;
        this.mark.isAttacking = false; 
        this.mark.isDead = false; 
        this.mark.lastAttackTime = 0; 

        // --- HEALTH BARS ---
        this.add.text(50, 20, 'EVE', { fontSize: '24px', fill: '#ffffff', fontStyle: 'bold' });
        this.add.rectangle(50, 60, 200, 20, 0xff0000).setOrigin(0, 0.5); 
        this.eveHealthBar = this.add.rectangle(50, 60, 200, 20, 0x00ff00).setOrigin(0, 0.5); 

        this.add.text(670, 20, 'MARK', { fontSize: '24px', fill: '#ffffff', fontStyle: 'bold' });
        this.add.rectangle(750, 60, 200, 20, 0xff0000).setOrigin(1, 0.5); 
        this.markHealthBar = this.add.rectangle(750, 60, 200, 20, 0x00ff00).setOrigin(1, 0.5); 

        this.waveText = this.add.text(400, 60, 'MARKS DEFEATED: 0 / 3', { 
            fontSize: '20px', fill: '#ffff00', fontStyle: 'bold', backgroundColor: '#000000', padding: {x: 10, y: 5} 
        }).setOrigin(0.5);

        // --- MAIN MENU UI SYSTEM ---
        this.pauseBtn = this.add.text(400, 20, ' II PAUSE ', { 
            fontSize: '20px', fill: '#ffffff', backgroundColor: '#333333', padding: {x: 10, y: 5} 
        }).setOrigin(0.5).setInteractive().setDepth(100);

        this.uiOverlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.85)
            .setInteractive()
            .setDepth(100); 

        this.menuTitle = this.add.text(400, 150, 'INVINCIBLE BRAWL', { 
            fontSize: '56px', fill: '#ff4444', fontStyle: 'bold', stroke: '#ffffff', strokeThickness: 4
        }).setOrigin(0.5).setDepth(100);

        this.menuControls = this.add.text(400, 320, 
            '--- HOW TO PLAY ---\n\n' +
            'MOVE & JUMP : [ W, A, S, D ] or [ Arrow Keys ]\n' +
            'ATTACK : [ Spacebar ] (Press 3x for Combo!)\n\n' +
            'GOAL : Survive 3 rounds against Mark to win.', { 
            fontSize: '24px', fill: '#ffffff', align: 'center', lineHeight: 2
        }).setOrigin(0.5).setDepth(100);

        this.menuAction = this.add.text(400, 500, '- CLICK ANYWHERE TO START -', { 
            fontSize: '28px', fill: '#00ff00', fontStyle: 'bold' 
        }).setOrigin(0.5).setDepth(100);

        this.tweens.add({
            targets: this.menuAction,
            alpha: 0,
            duration: 800,
            ease: 'Linear',
            yoyo: true,
            repeat: -1
        });

        // --- FREEZE GAME ---
        this.physics.pause(); 
        
        // --- BUTTON CLICKS ---
        this.pauseBtn.on('pointerdown', () => {
            if (this.gameState === 'PLAYING') {
                this.gameState = 'PAUSED';
                this.physics.pause(); 
                if (this.eve.anims.currentAnim) this.eve.anims.pause(); 
                if (this.mark.anims.currentAnim) this.mark.anims.pause();
                
                this.uiOverlay.setVisible(true);
                this.menuTitle.setText('GAME PAUSED').setFill('#ffff00').setVisible(true);
                this.menuControls.setVisible(false); 
                this.menuAction.setText('- CLICK TO RESUME -').setVisible(true);
            }
        });

        this.uiOverlay.on('pointerdown', () => {
            if (this.gameState === 'START' || this.gameState === 'PAUSED') {
                this.gameState = 'PLAYING';
                
                this.uiOverlay.setVisible(false);
                this.menuTitle.setVisible(false);
                this.menuControls.setVisible(false);
                this.menuAction.setVisible(false);
                
                this.physics.resume(); 
                if (this.eve.anims.currentAnim) this.eve.anims.resume(); 
                if (this.mark.anims.currentAnim) this.mark.anims.resume();
                
                this.mark.lastAttackTime = this.time.now; 
            } 
            else if (this.gameState === 'GAMEOVER') {
                this.scene.restart(); 
            }
        });

        // --- ANIMATIONS ---
        this.anims.create({ key: 'idleAnim', frames: [{ key: 'eve_idle_0' }, { key: 'eve_idle_1' }], frameRate: 4, repeat: -1 });
        this.anims.create({ key: 'walkAnim', frames: [{ key: 'eve_walk_0' }, { key: 'eve_walk_1' }], frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'hitAnim1', frames: [{ key: 'eve_attack_0' }], frameRate: 10, repeat: 0 }); 
        this.anims.create({ key: 'hitAnim2', frames: [{ key: 'eve_attack_1' }], frameRate: 10, repeat: 0 }); 
        this.anims.create({ key: 'hitAnim3', frames: [{ key: 'eve_attack_0' }, { key: 'eve_attack_1' }], frameRate: 12, repeat: 0 }); 
        this.anims.create({ key: 'eveHit', frames: [{ key: 'eve_hit_0' }], frameRate: 10, repeat: 0 }); 
        
        this.anims.create({ key: 'markWalk', frames: [{ key: 'mark_walk_0' }, { key: 'mark_walk_1' }], frameRate: 6, repeat: -1 });
        this.anims.create({ key: 'markHit', frames: [{ key: 'mark_hit_0' }], frameRate: 10, repeat: 0 }); 
        this.anims.create({ key: 'markAttack', frames: [{ key: 'mark_attack_0' }, { key: 'mark_attack_1' }], frameRate: 8, repeat: 0 }); 
        
        this.cursors = this.input.keyboard.createCursorKeys(); 
        this.wasd = this.input.keyboard.addKeys('W,S,A,D');    
        this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.physics.add.overlap(this.eve, this.mark, this.handleCombat, null, this);
        this.eve.anims.play('idleAnim');

        this.errorText = this.add.text(10, 10, '', { fontSize: '24px', fill: '#ff0000', backgroundColor: '#ffffff' }).setDepth(200);
    }

    update(time, delta) {
        if (this.hasCrashed) return; 
        if (this.gameState !== 'PLAYING') return; 

        try {
            // --- EVE LOGIC ---
            if (!this.eve.isHit && this.eve.hp > 0) {
                
                if (this.comboStage > 0 && time > this.lastHitTime + this.comboTimeout) {
                    this.comboStage = 0; 
                }

                if (Phaser.Input.Keyboard.JustDown(this.attackKey) && !this.eve.isAttacking) {
                    this.eve.isAttacking = true; 
                    this.eve.setVelocityX(0);    
                    
                    this.comboStage++;       
                    this.lastHitTime = time; 

                    if (this.comboStage === 1) {
                        this.eve.anims.play('hitAnim1');
                    } else if (this.comboStage === 2) {
                        this.eve.anims.play('hitAnim2');
                    } else if (this.comboStage >= 3) {
                        this.eve.anims.play('hitAnim3');
                        this.comboStage = 0; 
                    }
                    
                    this.time.delayedCall(300, () => { this.eve.isAttacking = false; });
                }

                if (!this.eve.isAttacking) {
                    const speed = 250; 
                    let isMoving = false;

                    if (this.cursors.left.isDown || this.wasd.A.isDown) {
                        this.eve.setVelocityX(-speed);
                        this.eve.setFlipX(true); 
                        isMoving = true;
                    } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
                        this.eve.setVelocityX(speed);
                        this.eve.setFlipX(false); 
                        isMoving = true;
                    } else {
                        this.eve.setVelocityX(0);
                    }

                    if ((this.cursors.up.isDown || this.wasd.W.isDown) && this.eve.body.onFloor()) {
                        this.eve.setVelocityY(-500); 
                    }

                    if (this.eve.body.onFloor()) {
                        if (isMoving) {
                            this.eve.anims.play('walkAnim', true); 
                        } else {
                            this.eve.anims.play('idleAnim', true);
                        }
                    }
                }
            }

            // --- MARK LOGIC ---
            if (!this.mark.isHit && !this.mark.isDead && !this.mark.isAttacking) {
                let distance = Math.hypot(this.mark.x - this.eve.x, this.mark.y - this.eve.y);

                if (distance > 70) {
                    if (this.mark.x > this.eve.x) {
                        this.mark.setVelocityX(-100);
                        this.mark.setFlipX(true);
                    } else {
                        this.mark.setVelocityX(100);
                        this.mark.setFlipX(false);
                    }
                    
                    if (this.mark.body.onFloor()) {
                         this.mark.anims.play('markWalk', true);
                    }
                } else {
                    this.mark.setVelocityX(0);

                    if (time > this.mark.lastAttackTime + 1500) {
                        this.mark.isAttacking = true;
                        this.mark.lastAttackTime = time;
                        this.mark.anims.play('markAttack', true);

                        this.time.delayedCall(400, () => {
                            this.mark.isAttacking = false;
                        });
                    } else {
                        if (this.mark.anims && this.mark.anims.isPlaying) {
                            this.mark.anims.stop(); 
                        }
                        this.mark.setTexture('mark_idle_0'); 
                    }
                }
            }

        } catch (error) {
            this.hasCrashed = true;
            this.errorText.setText("BUG FOUND IN UPDATE: " + error.message);
            console.error(error);
        }
    }

    // --- COMBAT LOGIC ---
    handleCombat(eveSprite, markSprite) {
        if (this.hasCrashed || this.gameState !== 'PLAYING') return;

        try {
            if (eveSprite.isAttacking && !markSprite.isHit && !markSprite.isDead) {
                markSprite.isHit = true; 
                
                let damage = (this.comboStage === 3) ? 25 : 10; 
                markSprite.hp -= damage;
                
                let markHpPercentage = Math.max(0, markSprite.hp) / 100;
                this.markHealthBar.width = 200 * markHpPercentage;
                
                let knockbackDirection = (eveSprite.x < markSprite.x) ? 1 : -1; 
                let knockbackPower = (this.comboStage === 3) ? 500 : 200; 
                
                markSprite.setVelocityX(knockbackPower * knockbackDirection);
                markSprite.setVelocityY(-200); 
                markSprite.anims.play('markHit', true); 

                if (markSprite.hp <= 0) {
                    markSprite.isDead = true; 
                    markSprite.setTint(0xff0000); 
                    markSprite.setVelocityX(0);

                    this.marksDefeated++;
                    this.waveText.setText(`MARKS DEFEATED: ${this.marksDefeated} / 3`);

                    if (this.marksDefeated >= this.totalMarksToWin) {
                        this.triggerGameOver('EVE WINS!');
                    } else {
                        this.time.delayedCall(1500, () => { this.respawnMark(); });
                    }
                } else {
                    this.time.delayedCall(400, () => { markSprite.isHit = false; });
                }
            }

            if (markSprite.isAttacking && !eveSprite.isHit && eveSprite.hp > 0 && !markSprite.isDead) {
                eveSprite.isHit = true; 
                eveSprite.hp -= 15; 

                let eveHpPercentage = Math.max(0, eveSprite.hp) / 100;
                this.eveHealthBar.width = 200 * eveHpPercentage;

                let knockbackDirection = (markSprite.x < eveSprite.x) ? 1 : -1; 
                eveSprite.setVelocityX(300 * knockbackDirection);
                eveSprite.setVelocityY(-200); 
                eveSprite.anims.play('eveHit', true); 

                if (eveSprite.hp <= 0) {
                    eveSprite.setTint(0xff0000); 
                    eveSprite.setVelocityX(0);
                    this.triggerGameOver('MARK WINS!');
                } else {
                    this.time.delayedCall(400, () => { eveSprite.isHit = false; });
                }
            }
        } catch (error) {
            this.hasCrashed = true;
            this.errorText.setText("COMBAT BUG FOUND: " + error.message);
            console.error(error);
        }
    }

    // --- GAME FLOW FUNCTIONS ---
    respawnMark() {
        if (this.gameState !== 'PLAYING') return;

        this.mark.setPosition(750, 100); 
        this.mark.hp = 100;
        this.mark.isDead = false;
        this.mark.isHit = false;
        this.mark.isAttacking = false;
        this.mark.clearTint();
        this.mark.setTexture('mark_idle_0');
        this.markHealthBar.width = 200; 
    }

    triggerGameOver(winnerText) {
        if (this.gameState === 'GAMEOVER') return; 
        
        this.gameState = 'GAMEOVER';
        this.physics.pause(); 

        this.time.delayedCall(500, () => {
            this.uiOverlay.setVisible(true);
            this.menuTitle.setText('GAME OVER').setFill('#ff0000').setVisible(true);
            this.menuControls.setText(winnerText).setVisible(true);
            this.menuAction.setText('- CLICK TO PLAY AGAIN -').setVisible(true);
        });
    }
}

// ==========================================
// THE FIX: Phaser.Scale.NONE keeps it 800x600 but perfectly centered!
// ==========================================
const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT, // This forces scaling
        autoCenter: Phaser.Scale.CENTER_BOTH, // This forces centering
        width: 800,
        height: 600
    },
    pixelArt: true, 
    scene: Invincible, 
    physics: {
        default: 'arcade',
        arcade: { 
            gravity: { y: 800 }, 
            debug: false 
        }
    }
};

const game = new Phaser.Game(config);