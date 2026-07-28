// =============================================================================
//  EnemyAI.js — Thug_01 & Thug_02 animations, spawning, AI, and combat logic
// =============================================================================

// ── Create enemy animations ───────────────────────────────────────────────────
function createEnemyAnims(scene) {

    // ── Thug 1 Animations ────────────────────────────────────────────────────
    scene.anims.create({
        key: 'thugIdleAnim',
        frames: [{ key: 'thug_idle1' }, { key: 'thug_idle2' }],
        frameRate: 3,
        repeat: -1
    });

    scene.anims.create({
        key: 'thugWalkAnim',
        frames: [
            { key: 'thug_walk1' }, { key: 'thug_walk2' },
            { key: 'thug_walk3' }, { key: 'thug_walk4' }
        ],
        frameRate: 6,
        repeat: -1
    });

    scene.anims.create({
        key: 'thugStun',
        frames: [{ key: 'thug_stun1' }, { key: 'thug_stun2' }, { key: 'thug_stun1' }],
        frameRate: 2,
        repeat: 0
    });

    scene.anims.create({
        key: 'thugAttackAnim',
        frames: [{ key: 'thug_hit1' }, { key: 'thug_hit2' }, { key: 'thug_hit3' }],
        frameRate: 9,
        repeat: 0
    });

    // ── Thug 2 Animations ────────────────────────────────────────────────────
    scene.anims.create({
        key: 'thug02IdleAnim',
        frames: [{ key: 'thug02_idle1' }, { key: 'thug02_idle2' }, { key: 'thug02_idle3' }],
        frameRate: 4,
        repeat: -1
    });

    scene.anims.create({
        key: 'thug02WalkAnim',
        frames: [{ key: 'thug02_walk1' }, { key: 'thug02_walk2' }, { key: 'thug02_walk3' }],
        frameRate: 6,
        repeat: -1
    });

    scene.anims.create({
        key: 'thug02Stun',
        frames: [{ key: 'thug02_stun1' }, { key: 'thug02_stun2' }, { key: 'thug02_stun1' }],
        frameRate: 2,
        repeat: 0
    });

    scene.anims.create({
        key: 'thug02AttackAnim',
        frames: [{ key: 'thug02_hit1' }, { key: 'thug02_hit2' }, { key: 'thug02_hit3' }],
        frameRate: 9,
        repeat: 0
    });

    // Enemy throwing action (played by Thug_02 body)
    scene.anims.create({
        key: 'thug02ThrowAnim',
        frames: [{ key: 'thug02_pro1' }, { key: 'thug02_pro2' }, { key: 'thug02_pro3' }],
        frameRate: 6,
        repeat: 0
    });

    // Flying projectile animation (played by the thrown orb/blast)
    scene.anims.create({
        key: 'thug02Projectile',
        frames: [{ key: 'thug02_blast1' }, { key: 'thug02_blast2' }, { key: 'thug02_blast3' }],
        frameRate: 6,
        repeat: -1
    });
}

// ── Spawn Thug_01 ─────────────────────────────────────────────────────────────
function spawnThug(scene, x, y) {
    const thug = scene.enemyGroup.create(x, y, 'thug_idle1');
    thug.setScale(3);
    thug.setCollideWorldBounds(true);
    thug.play('thugIdleAnim');
    thug.setFlipX(x > scene.character.x);

    thug.setData('type',            'thug1');
    thug.setData('hp',              60);
    thug.setData('damageReduction',  3);
    thug.setData('armor',           13);
    thug.setData('speed',           80);
    thug.setData('meleeRange',      90);
    thug.setData('isStunned',       false);
    thug.setData('isAttacking',     false);
    thug.setData('isDying',         false);
    thug.setData('attackCooldown',  1500);
    thug.setData('lastAttackTime',  0);
    thug.setData('attackDamage',    10);
    thug.setData('idleAnim',        'thugIdleAnim');
    thug.setData('walkAnim',        'thugWalkAnim');
    thug.setData('attackAnim',      'thugAttackAnim');
    thug.setData('stunAnim',        'thugStun');
}

// ── Spawn Thug_02 ─────────────────────────────────────────────────────────────
function spawnThug2(scene, x, y) {
    const thug = scene.enemyGroup.create(x, y, 'thug02_idle1');
    thug.setScale(3);
    thug.setCollideWorldBounds(true);
    thug.play('thug02IdleAnim');
    thug.setFlipX(x > scene.character.x);

    thug.setData('type',            'thug2');
    thug.setData('hp',              40);
    thug.setData('damageReduction',  0);
    thug.setData('armor',           0);
    thug.setData('speed',           90);
    thug.setData('meleeRange',      90);
    thug.setData('isStunned',       false);
    thug.setData('isAttacking',     false);
    thug.setData('isDying',         false);
    thug.setData('attackCooldown',  2200);
    thug.setData('lastAttackTime',  0);
    thug.setData('attackDamage',    14);
    thug.setData('idleAnim',        'thug02IdleAnim');
    thug.setData('walkAnim',        'thug02WalkAnim');
    thug.setData('attackAnim',      'thug02AttackAnim');
    thug.setData('stunAnim',        'thug02Stun');
}

// ── Spawn a random enemy type from a random corner wave ──────────────────────
// Inside EnemyAI.js
function spawnWave(scene) {
    const corners = [
        { x: -200, y: 700 },
        { x: 2100, y: 700 },
        { x: -200, y: 900 },
        { x: 2100, y: 900 }
    ];

    // Determine how many enemies spawn per wave based on totalScore
    let enemyCount = 1; // Base rate
    if (scene.totalScore >= 1000) {
        enemyCount = 4; // Tier 3 difficulty at 1000 points
    } else if (scene.totalScore >= 500) {
        enemyCount = 3; // Tier 2 difficulty at 500 points
    } else if (scene.totalScore >= 250) {
        enemyCount = 2; // Tier 1 difficulty at 250 points
    }

    for (let i = 0; i < enemyCount; i++) {
        const corner = corners[Phaser.Math.Between(0, corners.length - 1)];
        if (Math.random() < 0.5) {
            spawnThug(scene, corner.x, corner.y);
        } else {
            spawnThug2(scene, corner.x, corner.y);
        }
    }
}

// ── Check if an enemy has line of sight to the player character ───────────────
function hasLineOfSight(enemy, character, maxDistance = 700, maxLaneDiff = 40) {
    const diffY = Math.abs(enemy.y - character.y);
    const dist  = Phaser.Math.Distance.Between(enemy.x, enemy.y, character.x, character.y);

    // 1. Must be in the same horizontal lane (Y axis)
    if (diffY > maxLaneDiff) return false;

    // 2. Must be within effective ranged distance
    if (dist < 150 || dist > maxDistance) return false;

    // 3. Must be facing toward the player
    const isPlayerOnLeft = character.x < enemy.x;
    const isEnemyFacingLeft = enemy.flipX; // setFlipX(true) means facing left

    return isPlayerOnLeft === isEnemyFacingLeft;
}

// ── Per-frame AI tick — call from update() ────────────────────────────────────
function updateEnemies(scene, time) {
    if (!scene.enemyProjectiles) {
        scene.enemyProjectiles = scene.physics.add.group();
    }

    scene.enemyGroup.getChildren().forEach((thug) => {
        if (!thug.active || thug.getData('isDying')) { return; }
        if (thug.getData('isStunned') || thug.getData('isAttacking')) { 
            thug.setVelocity(0); 
            return; 
        }

        const dist       = Phaser.Math.Distance.Between(thug.x, thug.y, scene.character.x, scene.character.y);
        const meleeRange = thug.getData('meleeRange') || 90;
        const speed      = thug.getData('speed')      || 80;
        const walkAnim   = thug.getData('walkAnim');
        const idleAnim   = thug.getData('idleAnim');
        const lastAttack = thug.getData('lastAttackTime') || 0;
        const cooldown   = thug.getData('attackCooldown')  || 1500;

        // Turn enemy toward Eve if moving/targeting
        thug.setFlipX(scene.character.x < thug.x);

        // ── LINE OF SIGHT CHECK FOR RANGED THUG 02 ────────────────────────────
        if (thug.getData('type') === 'thug2' && hasLineOfSight(thug, scene.character)) {
            if (time - lastAttack >= cooldown) {
                thug2ShootProjectile(scene, thug, time);
                return;
            }
        }

        if (dist > meleeRange) {
            // Walk toward Eve
            const angle = Phaser.Math.Angle.Between(thug.x, thug.y, scene.character.x, scene.character.y);
            thug.setVelocityX(Math.cos(angle) * speed);
            thug.setVelocityY(Math.sin(angle) * speed);
            if (eveAnimKey(thug) !== walkAnim) { thug.play(walkAnim, true); }
        } else {
            // In melee range — idle or attack
            thug.setVelocity(0);

            if (time - lastAttack >= cooldown) {
                thugAttack(scene, thug, time);
                if (scene.sdBoxBreak) scene.sdBoxBreak.play();
            } else {
                if (eveAnimKey(thug) !== idleAnim) { thug.play(idleAnim, true); }
            }
        }
    });

    // ── Update active enemy projectiles and hit detection ─────────────────────
    scene.enemyProjectiles.getChildren().forEach((proj) => {
        if (!proj.active) return;

        const distToEve = Phaser.Math.Distance.Between(proj.x, proj.y, scene.character.x, scene.character.y);
        if (distToEve <= 45) {
            showImpact(scene, scene.character.x, scene.character.y); // impact flash on Eve
            scene.takeDamage(proj.getData('damage') || 15);
            proj.destroy();
        } else if (proj.x < -300 || proj.x > 2400) {
            proj.destroy();
        }
    });
}

// ── Thug_02 fires a projectile straight down his line of sight ────────────────
function thug2ShootProjectile(scene, thug, time) {
    thug.setData('isAttacking', true);
    thug.setData('lastAttackTime', time);
    thug.setVelocity(0);

    const isFacingLeft = scene.character.x < thug.x;
    thug.setFlipX(isFacingLeft);

    // Play throwing animation on Thug
    thug.play('thug02ThrowAnim', true);
    if (scene.sdRocket) scene.sdRocket.play();

    // Spawn and launch projectile mid-throw frame
    scene.time.delayedCall(250, () => {
        if (!thug.active || thug.getData('isDying')) return;

        const projX = isFacingLeft ? thug.x - 40 : thug.x + 40;
        const proj = scene.enemyProjectiles.create(projX, thug.y, 'thug02_blast1');
        
        proj.setScale(2.5);
        proj.setFlipX(isFacingLeft);
        proj.setData('damage', 15);
        proj.play('thug02Projectile', true);

        // Velocity travels directly along the X axis
        const projSpeed = isFacingLeft ? -435 : 435;
        proj.setVelocity(projSpeed, 0);
    });

    // Reset state upon completing the THROW animation
    thug.once('animationcomplete', (anim) => {
        if (anim.key === 'thug02ThrowAnim' && thug.active) {
            thug.setData('isAttacking', false);
            thug.play(thug.getData('idleAnim'), true);
        }
    });
}

// ── Enemy performs a melee attack ─────────────────────────────────────────────
function thugAttack(scene, thug, time) {
    const attackAnim = thug.getData('attackAnim');
    thug.setData('isAttacking', true);
    thug.setData('lastAttackTime', time);
    thug.play(attackAnim, true);

    scene.time.delayedCall(200, () => {
        if (!thug.active || thug.getData('isDying')) { return; }
        const dist = Phaser.Math.Distance.Between(thug.x, thug.y, scene.character.x, scene.character.y);
        if (dist <= (thug.getData('meleeRange') || 90)) {
            scene.takeDamage(thug.getData('attackDamage') || 11);
        }
    });

    thug.once('animationcomplete', (anim) => {
        if (anim.key === attackAnim && thug.active) {
            thug.setData('isAttacking', false);
            thug.play(thug.getData('idleAnim'), true);
        }
    });
}

// ── Apply damage to an enemy ──────────────────────────────────────────────────
function enemyTakeHit(scene, enemy, rawDamage) {
    if (!enemy.active || enemy.getData('isStunned') || enemy.getData('isDying')) { return; }

    // Thug_02 vertical hitbox guard — hits that land more than 55px above
    // his centre are treated as going over his head and deal no damage.
    if (enemy.getData('type') === 'thug2') {
        const attackerY = scene.character ? scene.character.y : enemy.y;
        const verticalDiff = enemy.y - attackerY; // positive = attacker is above enemy
        if (verticalDiff > 55) {
            // Hit passed over Thug_02's head — ignore it
            return;
        }
    }

    const dmg   = Math.max(0, rawDamage - (enemy.getData('damageReduction') || 0));
    const newHP = (enemy.getData('hp') || 0) - dmg;
    enemy.setData('hp', newHP);

    if (newHP <= 0) {
        enemyDie(scene, enemy);
        return;
    }

    // Enter stun state
    let armor = enemy.getData('armor') || 0;
    armor -= 5; 
    enemy.setData('armor', armor); // Reduce armor by 5 on each hit

    const stunAnim = enemy.getData('stunAnim');
    const idleAnim = enemy.getData('idleAnim');

    if (armor <= 0) {
        enemy.setData('isStunned', true);
        enemy.setData('isAttacking', false);
        enemy.setVelocity(0);
        enemy.play(stunAnim, true);
        if (scene.sdExplosion) scene.sdExplosion.play();
    }

    enemy.once('animationcomplete', (anim) => {
        if (anim.key === stunAnim && enemy.active && !enemy.getData('isDying')) {
            scene.time.delayedCall(300, () => {
                if (enemy.active && !enemy.getData('isDying')) {
                    enemy.setData('isStunned', false);
                    // Grace period: restart its attack cooldown so it can't swing
                    // the instant it recovers — it still takes damage normally though.
                    enemy.setData('lastAttackTime', scene.time.now);
                    enemy.play(idleAnim, true);
                }
            });
        }
    });
}

// ── Death: Launches enemy far away in the opposite direction ─────────────────
function enemyDie(scene, enemy) {
    enemy.setData('isDying', true);
    enemy.setData('isStunned', true);
    enemy.setData('isAttacking', false);

    enemy.play(enemy.getData('stunAnim'), true);
    if (scene.sdExplosion) scene.sdExplosion.play();

    enemy.setCollideWorldBounds(false);

    const launchDirection = enemy.x < scene.character.x ? -1 : 1;
    const throwSpeedX = launchDirection * Phaser.Math.Between(700, 900);
    const throwSpeedY = Phaser.Math.Between(-400, -200);

    enemy.setVelocity(throwSpeedX, throwSpeedY);

    scene.totalScore += 10;
    scene.currentEnergy += 5; //Killing an enemy grants +5 Energy and +10 Score to Eve.

    // ── Item drops — 20% chance each, independent rolls ───────────────────────
    if (Math.random() < 0.2) {
        spawnItemDrop(scene, enemy.x - 20, enemy.y, 'Steak', 'hp');
    }
    if (Math.random() < 0.2) {
        spawnItemDrop(scene, enemy.x + 20, enemy.y, 'Milkshake', 'energy');
    }

    scene.tweens.add({
        targets: enemy,
        angle: launchDirection * 360,
        alpha: 0,
        duration: 600,
        ease: 'Quad.easeOut',
        onComplete: () => {
            if (enemy.active) {
                enemy.destroy();
            }
        }
    });
}

// ── Destroy orbs that fly off-screen ─────────────────────────────────────────
function cleanProjectiles(scene) {
    scene.projectiles.getChildren().forEach((orb) => {
        if (orb.active && (orb.x < -400 || orb.x > 2500)) { orb.destroy(); }
    });
}

// =============================================================================
//  Item drops — Steak (+10 HP) and Milkshake (+10 Energy)
// =============================================================================

// Creates the pickup group and the overlap that collects items, the first
// time it's needed (character isn't guaranteed to exist before this point).
function ensureItemPickupsGroup(scene) {
    if (scene.itemPickups) { return; }

    scene.itemPickups = scene.physics.add.group({ allowGravity: false });

    scene.physics.add.overlap(scene.character, scene.itemPickups, (character, item) => {
        collectItem(scene, item);
    });
}

// Drops a pickup at (x, y) that sits in place — bobbing gently — until picked up.
function spawnItemDrop(scene, x, y, textureKey, effect) {
    ensureItemPickupsGroup(scene);

    const item = scene.itemPickups.create(x, y, textureKey);
    item.setScale(1.2);
    item.setDepth(9);
    item.setData('effect', effect); // 'hp' or 'energy'

    scene.tweens.add({
        targets: item,
        y: y - 12,
        yoyo: true,
        repeat: -1,
        duration: 600,
        ease: 'Sine.easeInOut'
    });
}

// Called on overlap with the player character — grants the effect and removes the item.
function collectItem(scene, item) {
    if (!item.active) { return; }

    const effect = item.getData('effect');
    if (effect === 'hp') {
        scene.currentHP = Math.min(scene.maxHP, scene.currentHP + 10);
    } else if (effect === 'energy') {
        scene.currentEnergy = Math.min(scene.maxEnergy, scene.currentEnergy + 10);
    }

    if (scene.sdAbility) scene.sdAbility.play();
    item.destroy();
}

// ── Impact flash — shown on the enemy whenever a projectile connects ──────────
// Spawns Impact_00.png centred on the target for 500ms then destroys itself.
function showImpact(scene, x, y) {
    const flash = scene.add.image(x, y, 'Enemyimpact1');
    flash.setScale(3);
    flash.setDepth(15);   // always in front of enemies

    // Play the impact sound effect if available
    scene.sdRocket.play();

    // Slight random rotation each hit so repeated hits look varied
    flash.setAngle(Phaser.Math.Between(0, 359));

    scene.time.delayedCall(500, () => {
        if (flash && flash.active) { flash.destroy(); }
    });
}
