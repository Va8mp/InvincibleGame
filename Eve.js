// =============================================================================
//  Eve.js — Atom Eve: animations, movement, combat, projectile, damage
//  All functions accept (scene) and operate on scene.character
// =============================================================================

// ── Create Eve's animations ───────────────────────────────────────────────────
function createEveAnims(scene) {

    scene.anims.create({
        key: 'idleAnim',
        frames: [
            { key: 'idle1' }, { key: 'idle2' }, { key: 'idle3' },
            { key: 'idle2' }, { key: 'idle1' }
        ],
        frameRate: 4,
        repeat: -1
    });

    scene.anims.create({
        key: 'walkAnim',
        frames: [{ key: 'walk1' }, { key: 'walk2' }, { key: 'walk3' }],
        frameRate: 4,
        repeat: -1
    });

    // Light attack — stage 1 (single frame jab)
    scene.anims.create({
        key: 'hitAnim1',
        frames: [{ key: 'hit1' }],
        frameRate: 8,
        repeat: 0
    });

    // Light attack — stage 2 (follow-through)
    scene.anims.create({
        key: 'hitAnim2',
        frames: [{ key: 'hit3' }, { key: 'hit2' }, { key: 'hit4' }, { key: 'hit3' }],
        frameRate: 9,
        repeat: 0
    });

    // Heavy attack wind-up
    scene.anims.create({
        key: 'heavyAnim',
        frames: [{ key: 'heavy1' }, { key: 'heavy2' }],
        frameRate: 4,
        repeat: 0
    });

    // Activating shield animation
    scene.anims.create({
        key: 'shieldingAnim',
        frames: [{ key: 'hit3' }, { key: 'heavy1' }],
        frameRate: 3,
        repeat: 0
    });

    // Shield animation
    scene.anims.create({
        key: 'shieldAnim',
        frames: [{ key: 'shield1' }, { key: 'shield2' }, { key: 'shield3' }],
        frameRate: 3,
        repeat: -1
    });

    // Activating healing animation
    scene.anims.create({
        key: 'healingAnim',
        frames: [{ key: 'hit3' }, { key: 'heavy1' }],
        frameRate: 3,
        repeat: 0
    });

    // Healing animation
    scene.anims.create({
        key: 'healAnim',
        frames: [{ key: 'heal1' }, { key: 'heal2' }, { key: 'heal3' }],
        frameRate: 3,
        repeat: 0
    });

    // Projectile orb
    scene.anims.create({
        key: 'projectileAnim',
        frames: [{ key: 'pro1' }, { key: 'pro2' }, { key: 'pro3' }],
        frameRate: 8,
        repeat: -1
    });

    // Dodge / sprint
    scene.anims.create({
        key: 'dodgeAnim',
        frames: [{ key: 'dodge1' }, { key: 'dodge2' }, { key: 'dodge3' }],
        frameRate: 12,
        repeat: -1
    });
}

// ── Spawn Eve sprite and bind anim-complete callbacks ─────────────────────────
function createEve(scene) {
    scene.character = scene.physics.add.sprite(400, 600, 'idle1').setScale(3);
    scene.character.setDepth(10);
    scene.character.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
    scene.character.play('idleAnim');
    scene.character.setCollideWorldBounds(true);

    // Generic damage entry point — EnemyAI.js calls scene.takeDamage(dmg)
    // so it doesn't need to know which character is active.
    scene.takeDamage = (dmg) => eveTakeDamage(scene, dmg);

    // U hold-charge tracking (set when U goes down, cleared on release/fire)
    scene.heavyHoldStartTime = null;

    scene.character.on('animationcomplete', (animation) => {
        if (animation.key === 'heavyAnim') {
            scene.isHeavyAttacking = false;
            scene.isRecovering = true;
            scene.time.delayedCall(83, () => { scene.isRecovering = false; });

            if (scene.pendingDualHeavy) {
                // Hold-charge release — fire one orb each way
                scene.pendingDualHeavy = false;
                eveFireProjectileDir(scene, true);   // left
                eveFireProjectileDir(scene, false);  // right
            } else {
                // Normal tap — single orb toward facing direction
                eveFireProjectile(scene);
            }
        }
        if (animation.key === 'shieldingAnim') {
            scene.isShielding = false; // Release input lock after cast frame ends
        }
        if (animation.key === 'healingAnim') {
            scene.isHealing = false; // Release the control movement lock!
        
            // Clean up the overlay graphic safely if it exists
                if (scene.activeHealing) {
                scene.activeHealing.destroy();
            }
        }
        if (animation.key === 'hitAnim3') {
            scene.comboStage = 0;
            scene.isRecovering = true;
            scene.time.delayedCall(150, () => { scene.isRecovering = false; });
        }
    });
}

// ── Handle all Eve input — call from update() ─────────────────────────────────
function updateEve(scene, time) {

    //Tracks the position of Eve and the Shield follows her.
    if (scene.activeShield && scene.activeShield.active) {
        scene.activeShield.setPosition(scene.character.x, scene.character.y);
        scene.activeShield.setDepth(scene.character.depth + 1);
    }

    // Sustained sprint
    if (scene.isSprinting) {
        const sprintSpeed = 750;
        if (scene.sprintDirection === 'left' && !scene.keys.left.isDown) {
            scene.isSprinting = false;
            scene.character.setAlpha(1.0);
        } else if (scene.sprintDirection === 'right' && !scene.keys.right.isDown) {
            scene.isSprinting = false;
            scene.character.setAlpha(1.0);
        }
        if (scene.isSprinting) {
            scene.character.setVelocityX(scene.sprintDirection === 'left' ? -sprintSpeed : sprintSpeed);
            scene.character.setVelocityY(0);
            if (eveAnimKey(scene.character) !== 'dodgeAnim') { scene.character.play('dodgeAnim'); }
            return;
        }
    }

    if (scene.isDodging) { return; }

    // Combo timeout reset
    if (scene.comboStage > 0 && time - scene.lastHitTime > scene.comboTimeout) {
        scene.comboStage = 0;
    }

    const currentKey = eveAnimKey(scene.character);

    const lightAttacking = scene.character.anims.isPlaying &&
        (currentKey === 'hitAnim1' || currentKey === 'hitAnim2' || currentKey === 'hitAnim3');

    if (lightAttacking || scene.isHeavyAttacking || scene.isShielding || scene.isHealing) {
        scene.character.setVelocity(0);
        return;
    }

    // Double-tap A → sprint left
    if (Phaser.Input.Keyboard.JustDown(scene.keys.left)) {
        if (time - scene.lastLeftPressTime < scene.doubleTapTimeout) {
            eveTriggerSprintDodge(scene, 'left');
            scene.lastLeftPressTime = 0;
            return;
        }
        scene.lastLeftPressTime = time;
    }

    // Double-tap D → sprint right
    if (Phaser.Input.Keyboard.JustDown(scene.keys.right)) {
        if (time - scene.lastRightPressTime < scene.doubleTapTimeout) {
            eveTriggerSprintDodge(scene, 'right');
            scene.lastRightPressTime = 0;
            return;
        }
        scene.lastRightPressTime = time;
    }

    // K + W/S → lane dodge
    if (Phaser.Input.Keyboard.JustDown(scene.keys.dodge)) {
        let laneOffset = 0;
        if (scene.keys.up.isDown)        { laneOffset = -100; }
        else if (scene.keys.down.isDown) { laneOffset =  100; }
        if (laneOffset !== 0) {
            scene.isDodging = true;
            scene.character.play('dodgeAnim', true);
            scene.character.setVelocity(0);
            scene.character.setAlpha(0.6);
            scene.tweens.add({
                targets: scene.character,
                y: scene.character.y + laneOffset,
                duration: 200,
                ease: 'Quad.easeOut',
                onComplete: () => {
                    scene.isDodging = false;
                    scene.character.setAlpha(1.0);
                }
            });
            return;
        }
    }

    // U → heavy attack
    // • Tap  (hold < 600ms) → single orb toward facing direction  (costs 2 energy)
    // • Hold (hold ≥ 600ms) → dual orbs left + right              (costs 7 energy)
    if (scene.currentEnergy >= 2) {
        const heavyKey = scene.keys.heavy;

        // Record the moment U is first pressed
        if (Phaser.Input.Keyboard.JustDown(heavyKey)) {
            scene.heavyHoldStartTime = scene.time.now;
        }

        // When U is released, decide which attack to fire
        if (Phaser.Input.Keyboard.JustUp(heavyKey) && scene.heavyHoldStartTime !== null) {
            const held = scene.time.now - scene.heavyHoldStartTime;
            scene.heavyHoldStartTime = null;

            if (held >= 600 && scene.currentEnergy >= 7) {
                // ── HOLD: dual-orb burst (left + right) ──────────────────────
                scene.isHeavyAttacking = true;
                scene.character.play('heavyAnim', true);
                scene.character.setVelocity(0);
                scene.currentEnergy = Math.max(0, scene.currentEnergy - 7);
                if (scene.sdRocket) scene.sdRocket.play();

                // Fire both orbs after the wind-up plays (handled in animationcomplete
                // via the isDualHeavy flag so we don't need a new anim callback)
                scene.pendingDualHeavy = true;
            } else {
                // ── TAP: single orb toward facing direction ───────────────────
                scene.isHeavyAttacking = true;
                scene.character.play('heavyAnim', true);
                scene.character.setVelocity(0);
                if (scene.sdRocket) scene.sdRocket.play();
            }
            return;
        }
    }

    // Y → Shield if the ability is unlocked
    if (scene.hasShield == true && !scene.isShieldActive && !scene.isShielding && scene.currentEnergy >= 25) {
        if (Phaser.Input.Keyboard.JustDown(scene.keys.shield)) {
            eveTriggerShield(scene);
            return;
        }
    }

    // I → Healing if the ability is unlocked
    if (scene.hasHealing == true && !scene.isHealing && scene.currentEnergy >= 25 && scene.currentHP != 100) {
        if (Phaser.Input.Keyboard.JustDown(scene.keys.healing)) {
            eveTriggerHealing(scene);
            return;
        }
    }

    // H → light attack combo
    if (Phaser.Input.Keyboard.JustDown(scene.keys.hit)) {
        scene.lastHitTime = time;
        if (scene.comboStage === 0) {
            scene.character.play('hitAnim1', true);
            scene.comboStage = 1;
            scene.sdSound.play();
            eveCheckLightAttackHit(scene, 1);
        } else if (scene.comboStage === 1) {
            scene.character.play('hitAnim2', true);
            scene.comboStage = 2;
            eveCheckLightAttackHit(scene, 2);
        } else if (scene.comboStage === 2) {
            scene.character.play('hitAnim3', true);
            scene.comboStage = 0;
            scene.sdExplosion02.play();
            eveCheckLightAttackHit(scene, 3);
        }
        return;
    }

    // Standard movement
    scene.character.setVelocity(0);
    const speed = 400;
    let isMoving = false;

    if (scene.keys.left.isDown) {
        scene.character.setVelocityX(-speed);
        scene.character.setFlipX(true);
        isMoving = true;
    } else if (scene.keys.right.isDown) {
        scene.character.setVelocityX(speed);
        scene.character.setFlipX(false);
        isMoving = true;
    }

    if (scene.keys.up.isDown) {
        scene.character.setVelocityY(-speed);
        isMoving = true;
    } else if (scene.keys.down.isDown) {
        scene.character.setVelocityY(speed);
        isMoving = true;
    }

    if (isMoving) {
        if (currentKey !== 'walkAnim') { scene.character.play('walkAnim'); }
    } else {
        if (currentKey !== 'idleAnim') { scene.character.play('idleAnim'); }
    }
}

// ── Combat helpers ────────────────────────────────────────────────────────────

function eveTriggerShield(scene) {
    scene.isShielding = true;
    scene.isShieldActive = true;

    // Boost damage reduction (+12 so Eve's base 3 becomes 15)
    const baseDR = scene.damageReduction;
    scene.damageReduction = baseDR + 12;

    //Reduces Mana by -20
    scene.currentEnergy = scene.currentEnergy - 20;

    // Play quick casting pose
    scene.character.play('shieldingAnim', true);
    scene.character.setVelocity(0);
    if (scene.sdEnemyDie) scene.sdEnemyDie.play();

    // Spawn persistent overlay shield on top of Eve
    scene.activeShield = scene.add.sprite(scene.character.x, scene.character.y, 'shield1');
    scene.activeShield.setScale(3.5);
    scene.activeShield.setDepth(scene.character.depth + 1);
    scene.activeShield.play('shieldAnim');

    // GUARANTEED UNLOCK: Release control lock after 200ms
    scene.time.delayedCall(200, () => {
        scene.isShielding = false;
    });

    // 10-second shield duration — when it expires, burst-fire left AND right
    scene.time.delayedCall(10000, () => {
        if (scene.activeShield && scene.activeShield.active) {
            scene.activeShield.destroy();
        }
        scene.isShieldActive = false;

        // Reset damage reduction back to base amount
        scene.damageReduction = baseDR;

        // Shield-burst: fire one orb in each direction on expiry
        eveFireProjectileDir(scene, true);   // left
        eveFireProjectileDir(scene, false);  // right
    });
}

function eveTriggerHealing(scene) {
    scene.isHealing = true;

    // Boost damage reduction (Heals for 15)
    const baseHP = scene.currentHP;
    scene.currentHP = baseHP + 20;

    // Reduces Mana by -25
    scene.currentEnergy = scene.currentEnergy - 25;

    // Play quick casting pose
    scene.character.play('healingAnim', true);
    scene.character.setVelocity(0);
    if (scene.sdEnemyDie) scene.sdEnemyDie.play();

    // Spawn persistent overlay healing on top of Eve
    scene.activeHealing = scene.add.sprite(scene.character.x, scene.character.y, 'heal1');
    scene.activeHealing.setScale(3.5);
    scene.activeHealing.setDepth(scene.character.depth + 1);
    scene.activeHealing.play('healAnim');
}

function eveTriggerSprintDodge(scene, direction) {
    scene.isSprinting     = true;
    scene.sprintDirection = direction;
    scene.character.setAlpha(0.7);
    scene.character.play('dodgeAnim', true);
    scene.character.setFlipX(direction === 'left');
}

function eveFireProjectile(scene) {
    const facingLeft = scene.character.flipX;
    const orb = scene.projectiles.create(
        scene.character.x + (facingLeft ? -65 : 65),
        scene.character.y - 50
    );
    orb.setScale(5);
    orb.setDepth(10);
    orb.setVelocityX(facingLeft ? -700 : 700);
    orb.setFlipX(facingLeft);
    orb.damage = Phaser.Math.Between(20, 30); // Random damage between 20 and 30
    orb.play('projectileAnim', true);

    //Reduces Mana by -20
    scene.currentEnergy = scene.currentEnergy - 2;

    scene.physics.add.overlap(orb, scene.enemyGroup, (proj, enemy) => {
        if (!proj.active || !enemy.active) { return; }
        showImpact(scene, enemy.x, enemy.y);   // impact flash on hit
        enemyTakeHit(scene, enemy, proj.damage);
        proj.destroy();
    });
}

// Fire a single orb in an explicit direction regardless of which way Eve faces.
// facingLeft = true → fires left, false → fires right.
// Used by shield-burst expiry and hold-U dual fire.
function eveFireProjectileDir(scene, facingLeft) {
    const orb = scene.projectiles.create(
        scene.character.x + (facingLeft ? -65 : 65),
        scene.character.y - 50
    );
    orb.setScale(5);
    orb.setDepth(10);
    orb.setVelocityX(facingLeft ? -700 : 700);
    orb.setFlipX(facingLeft);
    orb.damage = Phaser.Math.Between(24, 34); // Random damage between 24 and 34
    orb.play('projectileAnim', true);

    scene.physics.add.overlap(orb, scene.enemyGroup, (proj, enemy) => {
        if (!proj.active || !enemy.active) { return; }
        showImpact(scene, enemy.x, enemy.y);   // impact flash on hit
        enemyTakeHit(scene, enemy, proj.damage);
        proj.destroy();
    });
}

function eveCheckLightAttackHit(scene, stage) {
    const reach   = 120;
    const faceDir = scene.character.flipX ? -1 : 1;
    const hbX     = scene.character.x + faceDir * (reach / 2);
    const hbY     = scene.character.y;

    scene.enemyGroup.getChildren().forEach((enemy) => {
        if (!enemy.active) { return; }
        if (Phaser.Math.Distance.Between(hbX, hbY, enemy.x, enemy.y) <= reach) {
            enemyTakeHit(scene, enemy, Phaser.Math.Between(17, 27));
        }
    });
}

// Apply damage to Eve — called from EnemyAI.js
function eveTakeDamage(scene, rawAmount) {
    if (scene.isGameOver) { return; }
    const finalDamage = Math.max(0, rawAmount - scene.damageReduction);
    scene.currentHP   = Math.max(0, scene.currentHP - finalDamage);

    // Flash red on hit
    scene.character.setTint(0xff0000);
    scene.time.delayedCall(150, () => {
        if (scene.character.active) { scene.character.clearTint(); }
    });

    if (scene.currentHP <= 0) { triggerGameOver(scene); } // shared — see InvincibleGame.js
}

// ── Volume controls ───────────────────────────────────────────────────────────

function eveSetVolume(scene, vol) {
    scene.musicVolume = Math.round(vol * 10) / 10;
    scene.bgMusic.setVolume(scene.musicVolume);
    if (scene.gameSettings) {
        scene.gameSettings.musicVolume = scene.musicVolume;
        scene.gameSettings.muted = false;
        scene.sound.mute = false;
        saveGameSettings(scene.gameSettings);
    }
    updateVolHUD(scene); // defined in HUD.js
}

function eveToggleMute(scene) {
    if (!scene.sound.mute) {
        scene._preMuteVolume = scene.musicVolume;
        scene.sound.mute = true;
        if (scene.gameSettings) {
            scene.gameSettings.muted = true;
            saveGameSettings(scene.gameSettings);
        }
    } else {
        scene.sound.mute = false;
        if (scene.gameSettings) {
            scene.gameSettings.muted = false;
            saveGameSettings(scene.gameSettings);
        }
    }
}

// ── Utility ───────────────────────────────────────────────────────────────────
function eveAnimKey(sprite) {
    if (sprite && sprite.anims && sprite.anims.currentAnim) {
        return sprite.anims.currentAnim.key;
    }
    return '';
}
