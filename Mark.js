// =============================================================================
//  Mark.js — Mark Grayson: animations, movement, combo, dash attack, block
//  All functions accept (scene) and operate on scene.character
//  Mirrors the pattern used in Eve.js so both characters can share
//  InvincibleGame.js, EnemyAI.js and HUD.js.
// =============================================================================

// ── Create Mark's animations ───────────────────────────────────────────────────
function createMarkAnims(scene) {

    scene.anims.create({
        key: 'markIdleAnim',
        frames: [
            { key: 'Markidle1' }, { key: 'Markidle2' }, { key: 'Markidle3' },
            { key: 'Markidle2' }, { key: 'Markidle1' }
        ],
        frameRate: 4,
        repeat: -1
    });

    scene.anims.create({
        key: 'markWalkAnim',
        frames: [{ key: 'Markwalk1' }, { key: 'Markwalk2' }, { key: 'Markwalk3' }],
        frameRate: 6,
        repeat: -1
    });

    // Light attack combo — 3 stages, H / H / H
    scene.anims.create({
        key: 'markHitAnim1',
        frames: [{ key: 'Markhit1' }, { key: 'Markhit2' }],
        frameRate: 8,
        repeat: 0
    });

    scene.anims.create({
        key: 'markHitAnim2',
        frames: [{ key: 'Markhit3' }, { key: 'Markhit4' }],
        frameRate: 8,
        repeat: 0
    });

    scene.anims.create({
        key: 'markHitAnim3',
        frames: [{ key: 'Markhit5' }, { key: 'Markhit6' }],
        frameRate: 9,
        repeat: 0
    });

    // Dash attack — K + LEFT/RIGHT held
    scene.anims.create({
        key: 'markDashAnim',
        frames: [{ key: 'Markdash1' }, { key: 'Markdash2' }],
        frameRate: 10,
        repeat: 0
    });

    // Rage mode Effects
    scene.anims.create({
        key: 'markRageAnim',
        frames: [{ key: 'Markrage1' }, { key: 'Markrage2' }, { key: 'Markrage3' }],
        frameRate: 4,
        repeat: -1
    });

    // Heavy attack — U. High damage, must play out fully.
    scene.anims.create({
        key: 'markHeavyAnim',
        frames: [{ key: 'Markheavy1' }, { key: 'Markheavy2' }, { key: 'Markheavy3' }],
        frameRate: 6,
        repeat: 0
    });

    // Block — single held pose, no animation needed but kept as an anim
    // for consistency with play()/currentAnim checks elsewhere.
    scene.anims.create({
        key: 'markBlockAnim',
        frames: [{ key: 'Markblock1' }],
        frameRate: 1,
        repeat: -1
    });
}

// ── Spawn Mark sprite and bind anim-complete callbacks ─────────────────────────
function createMark(scene) {
    scene.character = scene.physics.add.sprite(400, 600, 'Markidle1').setScale(3);
    scene.character.setDepth(10);
    scene.character.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
    scene.character.play('markIdleAnim');
    scene.character.setCollideWorldBounds(true);

    // Generic damage entry point — EnemyAI.js calls scene.takeDamage(dmg)
    // so it doesn't need to know which character is active.
    scene.takeDamage = (dmg) => markTakeDamage(scene, dmg);

    scene.character.on('animationcomplete', (animation) => {
        if (animation.key === 'markHitAnim3') {
            scene.comboStage = 0;
            scene.isRecovering = true;
            scene.time.delayedCall(150, () => { scene.isRecovering = false; });
        }
        if (animation.key === 'markHeavyAnim') {
            scene.isHeavyAttacking = false;
            if (scene.character.active) { scene.character.play('markIdleAnim', true); }
        }
    });
}

// ── Handle all Mark input — call from update() ─────────────────────────────────
function updateMark(scene, time) {

    // Rage overlay follows Mark while active
    if (scene.activeRage && scene.activeRage.active) {
        scene.activeRage.setPosition(scene.character.x, scene.character.y);
        scene.activeRage.setDepth(scene.character.depth + 1);
    }

    // Locked into an uninterruptible action — hold position until it resolves.
    if (scene.isDashAttacking || scene.isHeavyAttacking) {
        scene.character.setVelocity(0);
        return;
    }

    // Y + LEFT/RIGHT (held) → Dash Attack, charges forward a few steps
    // (same values as before — 20 energy, hasShield-gated, 260px charge)
    if (Phaser.Input.Keyboard.JustDown(scene.keys.shield) && (scene.keys.left.isDown || scene.keys.right.isDown) && (scene.hasShield == true) && (scene.currentEnergy >= 20)) {
        markTriggerDash(scene);
        return;
    }

    // K → Block, held for as long as the key is down. Released → block ends immediately.
    // NOTE: JustDown()/JustUp() consume their "just pressed/released" flag the
    // moment they're called, so we read each one exactly once per frame and
    // reuse the result.
    const dodgeJustDown = Phaser.Input.Keyboard.JustDown(scene.keys.dodge);
    const dodgeJustUp   = Phaser.Input.Keyboard.JustUp(scene.keys.dodge);

    if (dodgeJustDown) {
        scene.isBlocking = true;
        scene.character.play('markBlockAnim', true);
        scene.character.setVelocity(0);
    }
    if (dodgeJustUp) {
        scene.isBlocking = false;
        scene.character.play('markIdleAnim', true);
    }

    if (scene.isBlocking) {
        scene.character.setVelocity(0);
        return;
    }

    // Combo timeout reset
    if (scene.comboStage > 0 && time - scene.lastHitTime > scene.comboTimeout) {
        scene.comboStage = 0;
    }

    const currentKey = markAnimKey(scene.character);

    const lightAttacking = scene.character.anims.isPlaying &&
        (currentKey === 'markHitAnim1' || currentKey === 'markHitAnim2' || currentKey === 'markHitAnim3');

    if (lightAttacking) {
        scene.character.setVelocity(0);
        return;
    }

    // U → heavy attack. High damage, no canceling — must play out before anything else.
    if (scene.currentEnergy >= 20) {
        if (Phaser.Input.Keyboard.JustDown(scene.keys.heavy)) {
            markTriggerHeavy(scene);
            return;
        }
    }

    // I → Rage mode, if unlocked
    if (scene.hasHealing == true && !scene.isRaging && scene.currentEnergy >= 25) {
        if (Phaser.Input.Keyboard.JustDown(scene.keys.healing)) {
            markTriggerRage(scene);
            return;
        }
    }

    // H → light attack combo. Stage 2 and 3 only unlock if the previous swing landed.
    // A mandatory 300ms gap between hits stops button-mashing through the combo.
    if (!scene.markComboLocked && Phaser.Input.Keyboard.JustDown(scene.keys.hit)) {
        scene.lastHitTime = time;
        scene.markComboLocked = true;
        scene.time.delayedCall(300, () => { scene.markComboLocked = false; });

        if (scene.comboStage === 0) {
            scene.character.play('markHitAnim1', true);
            scene.sdSound.play();
            const landed = markCheckLightAttackHit(scene, 1);
            scene.comboStage = landed ? 1 : 0;
        } else if (scene.comboStage === 1) {
            scene.character.play('markHitAnim2', true);
            const landed = markCheckLightAttackHit(scene, 2);
            scene.comboStage = landed ? 2 : 0;
        } else if (scene.comboStage === 2) {
            scene.character.play('markHitAnim3', true);
            scene.sdExplosion02.play();
            markCheckLightAttackHit(scene, 3);
            scene.comboStage = 0;
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
        if (currentKey !== 'markWalkAnim') { scene.character.play('markWalkAnim'); }
    } else {
        if (currentKey !== 'markIdleAnim') { scene.character.play('markIdleAnim'); }
    }
}

// ── Combat helpers ────────────────────────────────────────────────────────────

// K + held direction — charges forward a few steps and hits anything in the way.
function markTriggerDash(scene) {
    scene.isDashAttacking = true;

    const direction = scene.keys.left.isDown ? -1 : 1;
    scene.character.setFlipX(direction === -1);
    scene.character.play('markDashAnim', true);
    if (scene.sdRocket) scene.sdRocket.play();
    scene.character.setVelocity(0);

    // Consume energy for the dash attack
    scene.currentEnergy = Math.max(0, scene.currentEnergy - 10);

    const dashDistance = 260; // a couple of steps forward
    scene.tweens.add({
        targets: scene.character,
        x: scene.character.x + direction * dashDistance,
        duration: 250,
        ease: 'Quad.easeOut',
        onComplete: () => {
            scene.isDashAttacking = false;
            if (scene.character.active) { scene.character.play('markIdleAnim', true); }
        }
    });

    // Hit check partway through the dash
    scene.time.delayedCall(120, () => {
        if (!scene.character.active) { return; }
        markCheckLightAttackHit(scene, 'dash');
    });
}

// U — a slow, high-damage swing. Control is locked until the animation completes
// (see the isHeavyAttacking check at the top of updateMark and the
// animationcomplete handler in createMark).
function markTriggerHeavy(scene) {
    scene.isHeavyAttacking = true;
    scene.currentEnergy = Math.max(0, scene.currentEnergy - 20);

    scene.character.play('markHeavyAnim', true);
    scene.character.setVelocity(0);
    if (scene.sdRocket) scene.sdRocket.play();

    // Hit registers partway through the swing
    scene.time.delayedCall(180, () => {
        if (!scene.character.active) { return; }
        markCheckLightAttackHit(scene, 'heavy');
    });
}

// Returns true if at least one enemy was struck — used to gate combo stages 2 & 3.
function markCheckLightAttackHit(scene, stage) {
    let reach, minDmg, maxDmg;
    if (stage === 'dash') {
        reach = 150; minDmg = 23; maxDmg = 32;
    } else if (stage === 'heavy') {
        reach = 140; minDmg = 40; maxDmg = 55;
    } else {
        reach = 140; minDmg = 17; maxDmg = 26;
    }

    const faceDir = scene.character.flipX ? -1 : 1;
    const hbX     = scene.character.x + faceDir * (reach / 2);
    const hbY     = scene.character.y;

    let landed = false;
    scene.enemyGroup.getChildren().forEach((enemy) => {
        if (!enemy.active) { return; }
        if (Phaser.Math.Distance.Between(hbX, hbY, enemy.x, enemy.y) <= reach) {
            let dmg = Phaser.Math.Between(minDmg, maxDmg);
            if (scene.isRaging) { dmg += 5; } // Rage — deal more damage
            enemyTakeHit(scene, enemy, dmg);
            landed = true;

            // Heavy attack has a slight knockback on hit
            if (stage === 'heavy' && enemy.active) {
                const knockDir = enemy.x < scene.character.x ? -1 : 1;
                scene.tweens.add({
                    targets: enemy,
                    x: enemy.x + knockDir * 70,
                    duration: 180,
                    ease: 'Quad.easeOut'
                });
            }
        }
    });
    return landed;
}

// Apply damage to Mark — called via scene.takeDamage() from EnemyAI.js
function markTakeDamage(scene, rawAmount) {
    if (scene.isGameOver) { return; }

    // Blocking soaks up most of the hit
    let dr = 7;
    if (scene.isBlocking) { dr += 7; }
    if (scene.isRaging)   { dr -= 3; } // Rage — takes more damage per hit
    dr = Math.max(0, dr);

    const finalDamage = Math.max(0, rawAmount - dr);
    scene.currentHP   = Math.max(0, scene.currentHP - finalDamage);

    if (!scene.isBlocking) {
        scene.character.setTint(0xff0000);
        scene.time.delayedCall(150, () => {
            if (scene.character.active && !scene.isRaging) { scene.character.clearTint(); }
        });
    }

    if (scene.currentHP <= 0) { triggerGameOver(scene); }
}

// I — 10 seconds of Rage: +5 damage dealt, -3 extra damage taken per hit,
// blinking red tint, and a looping effect sprite that follows Mark.
function markTriggerRage(scene) {
    scene.isRaging = true;
    scene.currentEnergy = Math.max(0, scene.currentEnergy - 25);

    if (scene.sdAbility) scene.sdAbility.play();

    // Effect sprite that follows Mark (tracked each frame in updateMark)
    scene.activeRage = scene.add.sprite(scene.character.x, scene.character.y, 'Markrage1');
    scene.activeRage.setScale(3.5);
    scene.activeRage.setDepth(scene.character.depth + 1);
    scene.activeRage.play('markRageAnim');

    // Blinking red tint for the duration
    scene.rageBlinkEvent = scene.time.addEvent({
        delay: 150,
        loop: true,
        callback: () => {
            if (!scene.character.active) { return; }
            if (scene.character.tintTopLeft === 0xff0000) {
                scene.character.clearTint();
            } else {
                scene.character.setTint(0xff0000);
            }
        }
    });

    scene.time.delayedCall(10000, () => {
        scene.isRaging = false;
        if (scene.rageBlinkEvent) { scene.rageBlinkEvent.remove(); }
        if (scene.character.active) { scene.character.clearTint(); }
        if (scene.activeRage && scene.activeRage.active) { scene.activeRage.destroy(); }
    });
}

// ── Utility ───────────────────────────────────────────────────────────────────
function markAnimKey(sprite) {
    if (sprite && sprite.anims && sprite.anims.currentAnim) {
        return sprite.anims.currentAnim.key;
    }
    return '';
}
