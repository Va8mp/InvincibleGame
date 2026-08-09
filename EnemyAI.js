// =============================================================================
//  EnemyAI.js — enemy animations, spawning, AI, and combat logic
// =============================================================================

const LORD_BUG_BOSS_INTERVAL = 1000;
const ENERGY_RESTORE_INTERVAL = 500;
const WAVE_NOTICE_INTERVAL = 250;
const FINAL_WAVE_NOTICE_SCORE = 1250;
const SUPPLY_DROP_INTERVAL = 250;
const LORD_BUG_BEHAVIOR_INTERVAL = 4000;
const LORD_BUG_SECOND_PROJECTILE_DELAY = 700;

// ── Create enemy animations ───────────────────────────────────────────────────
function createEnemyAnims(scene) {

    // Phaser's AnimationManager belongs to the whole game, not one scene run.
    // A restart keeps these animations, so never register the set twice.
    if (scene.anims.exists('lordBugStunAnim')) { return; }

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

    // ── Thug 3 Animations ────────────────────────────────────────────────────
    scene.anims.create({
        key: 'thug03IdleAnim',
        frames: [{ key: 'thug03_idle1' }, { key: 'thug03_idle2' }, { key: 'thug03_idle3' }],
        frameRate: 4,
        repeat: -1
    });

    scene.anims.create({
        key: 'thug03WalkAnim',
        frames: [{ key: 'thug03_walk1' }, { key: 'thug03_walk2' }, { key: 'thug03_walk3' }],
        frameRate: 6,
        repeat: -1
    });

    scene.anims.create({
        key: 'thug03AttackAnim',
        frames: [{ key: 'thug03_attack1' }, { key: 'thug03_attack2' }, { key: 'thug03_attack3' }],
        frameRate: 9,
        repeat: 0
    });

    scene.anims.create({
        key: 'thug03RollAnim',
        frames: [{ key: 'thug03_roll1' }, { key: 'thug03_roll2' }, { key: 'thug03_roll3' }],
        frameRate: 12,
        repeat: -1
    });

    scene.anims.create({
        key: 'thug03Stun',
        frames: [{ key: 'thug03_stun1' }, { key: 'thug03_stun2' }, { key: 'thug03_stun1' }],
        frameRate: 2,
        repeat: 0
    });

    // ── Lord Bug boss animations ────────────────────────────────────────────
    scene.anims.create({
        key: 'lordBugIdleAnim',
        frames: [{ key: 'lordBug_idle1' }, { key: 'lordBug_idle2' }, { key: 'lordBug_idle3' }],
        frameRate: 4, repeat: -1
    });
    scene.anims.create({
        key: 'lordBugWalkAnim',
        frames: [
            { key: 'lordBug_walk1' }, { key: 'lordBug_walk2' }, { key: 'lordBug_walk3' }
        ],
        frameRate: 9, repeat: -1
    });
    scene.anims.create({
        key: 'lordBugThrowAnim',
        frames: [
            { key: 'lordBug_throw1' }, { key: 'lordBug_throw2' },
            { key: 'lordBug_throw3' }, { key: 'lordBug_throw4' }
        ],
        frameRate: 7, repeat: 0
    });
    scene.anims.create({
        key: 'lordBugDashStartAnim',
        frames: [{ key: 'lordBug_dashStart' }, { key: 'lordBug_dash1' }],
        frameRate: 9, repeat: 0
    });
    scene.anims.create({
        key: 'lordBugDashLoopAnim',
        frames: [{ key: 'lordBug_dash1' }, { key: 'lordBug_dash2' }],
        frameRate: 12, repeat: -1
    });
    scene.anims.create({
        key: 'lordBugDashRecoverAnim',
        frames: [{ key: 'lordBug_dashRecover1' }, { key: 'lordBug_dashRecover2' }],
        frameRate: 7, repeat: 0
    });
    scene.anims.create({
        key: 'lordBugMeleeAnim',
        frames: [
            { key: 'lordBug_melee1' }, { key: 'lordBug_melee2' },
            { key: 'lordBug_melee3' }, { key: 'lordBug_melee4' },
            { key: 'lordBug_melee5' }
        ],
        frameRate: 10, repeat: 0
    });
    scene.anims.create({
        key: 'lordBugBlockAnim',
        frames: [
            { key: 'lordBug_block1' }, { key: 'lordBug_block2' },
            { key: 'lordBug_block3' }, { key: 'lordBug_block4' },
            { key: 'lordBug_block5' }
        ],
        frameRate: 7, repeat: -1
    });
    scene.anims.create({
        key: 'lordBugStunAnim',
        frames: [{ key: 'lordBug_hit1' }, { key: 'lordBug_hit2' }, { key: 'lordBug_hit1' }],
        frameRate: 3, repeat: 0
    });
    scene.anims.create({
        key: 'lordBugProjectileAnim',
        frames: [
            { key: 'lordBug_projectile1' }, { key: 'lordBug_projectile2' },
            { key: 'lordBug_projectile3' }
        ],
        frameRate: 12, repeat: -1
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
    thug.setData('hp',              70);
    thug.setData('damageReduction',  3);
    thug.setData('armor',           15);
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
    thug.setData('hp',              50);
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

// ── Spawn Thug_03 ─────────────────────────────────────────────────────────────
function spawnThug3(scene, x, y) {
    const thug = scene.enemyGroup.create(x, y, 'thug03_idle1');
    thug.setScale(3);
    thug.setCollideWorldBounds(true);
    thug.play('thug03IdleAnim');
    thug.setFlipX(x > scene.character.x);

    thug.setData('type',            'thug3');
    thug.setData('hp',              65);
    thug.setData('damageReduction',  2);
    thug.setData('armor',           10);
    thug.setData('speed',           95);
    thug.setData('meleeRange',      90);
    thug.setData('isStunned',       false);
    thug.setData('isAttacking',     false);
    thug.setData('isRolling',       false);
    thug.setData('rollHitPlayer',   false);
    thug.setData('isDying',         false);
    thug.setData('attackCooldown',  1700);
    thug.setData('lastAttackTime',  0);
    thug.setData('attackDamage',    11);
    thug.setData('rollDamage',      15);
    thug.setData('rollSpeed',       400);
    thug.setData('rollDuration',    2500);
    thug.setData('aiMode',          'chase');
    thug.setData('nextDecisionTime', scene.time.now + Phaser.Math.Between(700, 1400));
    thug.setData('idleAnim',        'thug03IdleAnim');
    thug.setData('walkAnim',        'thug03WalkAnim');
    thug.setData('attackAnim',      'thug03AttackAnim');
    thug.setData('rollAnim',        'thug03RollAnim');
    thug.setData('stunAnim',        'thug03Stun');
}

// ── Spawn Lord Bug ──────────────────────────────────────────────────────────
function spawnLordBug(scene, x, y) {
    const boss = scene.enemyGroup.create(x, y, 'lordBug_idle1');
    boss.setScale(3.5);
    boss.setCollideWorldBounds(true);
    boss.setDepth(8);
    boss.play('lordBugIdleAnim');
    boss.setFlipX(x > scene.character.x);
    if (boss.body && boss.body.setSize) boss.body.setSize(72, 112, true);

    boss.setData('type', 'lordBug');
    boss.setData('hp', 350);
    boss.setData('maxHP', 350);
    boss.setData('damageReduction', 6);
    boss.setData('armor', 35);
    boss.setData('speed', 88);
    boss.setData('meleeRange', 110);
    boss.setData('isStunned', false);
    boss.setData('isAttacking', false);
    boss.setData('isDashing', false);
    boss.setData('dashHitPlayer', false);
    boss.setData('isBlocking', false);
    boss.setData('recentHits', 0);
    boss.setData('lastBlockTime', -10000);
    boss.setData('blockCooldown', 3500);
    boss.setData('lastDamageTime', -10000);
    boss.setData('damageInvulnerability', 220);
    boss.setData('isDying', false);
    boss.setData('attackCooldown', 1700);
    boss.setData('lastAttackTime', 0);
    boss.setData('attackDamage', 16);
    boss.setData('dashDamage', 22);
    boss.setData('dashSpeed', 1000);
    boss.setData('dashDuration', 3000);
    boss.setData('aiMode', 'melee');
    boss.setData('lastBehavior', 'melee');
    boss.setData('nextBehaviorTime', scene.time.now + LORD_BUG_BEHAVIOR_INTERVAL);
    boss.setData('idleAnim', 'lordBugIdleAnim');
    boss.setData('walkAnim', 'lordBugWalkAnim');
    boss.setData('attackAnim', 'lordBugMeleeAnim');
    boss.setData('stunAnim', 'lordBugStunAnim');

    scene.lordBugBoss = boss;
    createLordBugBossHUD(scene);
}

function createLordBugBossHUD(scene) {
    scene.lordBugBossPanel = scene.add.rectangle(960, 965, 720, 70, 0x000000, 0.82)
        .setScrollFactor(0).setDepth(40);
    scene.lordBugBossBarBG = scene.add.rectangle(660, 980, 600, 20, 0x3d1111)
        .setOrigin(0, 0.5).setScrollFactor(0).setDepth(41);
    scene.lordBugBossBar = scene.add.rectangle(660, 980, 600, 20, 0x2475d9)
        .setOrigin(0, 0.5).setScrollFactor(0).setDepth(42);
    scene.lordBugBossText = scene.add.text(960, 944, 'LORD BUG', {
        fontFamily: 'Pixelated', fontSize: '26px', color: '#ffffff'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(42);
}

function updateLordBugBossHUD(scene) {
    const boss = scene.lordBugBoss;
    if (!boss || !boss.active || !scene.lordBugBossBar) return;
    const pct = Phaser.Math.Clamp((boss.getData('hp') || 0) / (boss.getData('maxHP') || 350), 0, 1);
    scene.lordBugBossBar.setSize(600 * pct, 20);
}

function hideLordBugBossHUD(scene) {
    [scene.lordBugBossPanel, scene.lordBugBossBarBG, scene.lordBugBossBar, scene.lordBugBossText]
        .forEach((item) => { if (item) item.setVisible(false); });
}

// Apply score-based rewards and wave announcements exactly once per milestone.
// The while loops keep the rules correct even if a future enemy awards enough
// points to cross more than one threshold at a time.
function processScoreMilestones(scene) {
    while (scene.totalScore >= scene.nextEnergyRestoreScore) {
        scene.currentEnergy = Math.min(scene.maxEnergy, scene.currentEnergy + 30);
        scene.nextEnergyRestoreScore += ENERGY_RESTORE_INTERVAL;
    }

    let crossedWaveNotice = false;
    while (scene.nextWaveNoticeScore <= FINAL_WAVE_NOTICE_SCORE &&
           scene.totalScore >= scene.nextWaveNoticeScore) {
        crossedWaveNotice = true;
        scene.nextWaveNoticeScore += WAVE_NOTICE_INTERVAL;
    }
    if (crossedWaveNotice) showNextWaveText(scene);

    while (scene.totalScore >= scene.nextSupplyDropScore) {
        spawnSkySupplyDrop(scene);
        scene.nextSupplyDropScore += SUPPLY_DROP_INTERVAL;
    }
}

function showNextWaveText(scene) {
    if (scene.nextWaveText) scene.nextWaveText.destroy();
    const waveText = scene.add.text(960, 330, 'Next Wave Start', {
        fontFamily: 'Pixelated',
        fontSize: '48px',
        color: '#ffffff',
        stroke: '#111111',
        strokeThickness: 7
    }).setOrigin(0.5).setScrollFactor(0).setDepth(60);
    scene.nextWaveText = waveText;

    scene.tweens.add({
        targets: waveText,
        alpha: 0,
        delay: 1500,
        duration: 500,
        onComplete: () => {
            waveText.destroy();
            if (scene.nextWaveText === waveText) {
                scene.nextWaveText = null;
            }
        }
    });
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

    // Lord Bug first appears at the configured score (10), then every 1000
    // points. An active boss blocks another boss from spawning.
    if (scene.lordBugBoss && scene.lordBugBoss.active) return;
    if (scene.totalScore >= scene.nextLordBugScore) {
        scene.nextLordBugScore += LORD_BUG_BOSS_INTERVAL;
        const bossCorner = corners[Phaser.Math.Between(0, corners.length - 1)];
        spawnLordBug(scene, bossCorner.x, bossCorner.y);
        return;
    }

    // Determine how many enemies spawn per wave based on totalScore
    let enemyCount = 1; // Base rate
    if (scene.totalScore >= 1250) {
        enemyCount = 5; // Wave 1250 and later
    } else if (scene.totalScore >= 1000) {
        enemyCount = 4; // Tier 3 difficulty at 1000 points
    } else if (scene.totalScore >= 500) {
        enemyCount = 3; // Tier 2 difficulty at 500 points
    } else if (scene.totalScore >= 250) {
        enemyCount = 2; // Tier 1 difficulty at 250 points
    }

    for (let i = 0; i < enemyCount; i++) {
        const corner = corners[Phaser.Math.Between(0, corners.length - 1)];
        const enemyType = Phaser.Math.Between(1, 3);
        if (enemyType === 1) {
            spawnThug(scene, corner.x, corner.y);
        } else if (enemyType === 2) {
            spawnThug2(scene, corner.x, corner.y);
        } else {
            spawnThug3(scene, corner.x, corner.y);
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
    // During a scene restart Phaser destroys the old physics group's internal
    // Set before the next run creates its replacement. Ignore that stale frame.
    if (!isUsablePhysicsGroup(scene.enemyGroup)) { return; }

    if (!scene.enemyProjectiles) {
        scene.enemyProjectiles = scene.physics.add.group();
    }
    updateLordBugBossHUD(scene);

    scene.enemyGroup.getChildren().forEach((thug) => {
        if (!thug.active || thug.getData('isDying')) { return; }

        if (thug.getData('isDashing')) {
            const dashDistance = Phaser.Math.Distance.Between(thug.x, thug.y, scene.character.x, scene.character.y);
            if (!thug.getData('dashHitPlayer') && dashDistance <= 80) {
                thug.setData('dashHitPlayer', true);
                scene.takeDamage(thug.getData('dashDamage') || 22);
                if (scene.sdBoxBreak) scene.sdBoxBreak.play();
            }
            return;
        }

        if (thug.getData('isBlocking')) {
            thug.setVelocity(0);
            return;
        }

        // A roll keeps its locked horizontal direction for the full attack.
        if (thug.getData('isRolling')) {
            const hitDistance = Phaser.Math.Distance.Between(
                thug.x, thug.y, scene.character.x, scene.character.y
            );
            if (!thug.getData('rollHitPlayer') && hitDistance <= 65) {
                thug.setData('rollHitPlayer', true);
                scene.takeDamage(thug.getData('rollDamage') || 15);
                if (scene.sdBoxBreak) scene.sdBoxBreak.play();
            }
            return;
        }

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

        // ── LORD BUG: commit to a different behavior every four seconds ──────
        if (thug.getData('type') === 'lordBug') {
            if (time >= (thug.getData('nextBehaviorTime') || 0)) {
                chooseLordBugBehavior(scene, thug, time);
            }
            if (thug.getData('isBlocking')) return;

            const aiMode = thug.getData('aiMode') || 'melee';
            if (aiMode === 'projectiles' || aiMode === 'dash') {
                const laneDifference = scene.character.y - thug.y;
                if (Math.abs(laneDifference) > 28) {
                    thug.setVelocityX(0);
                    thug.setVelocityY(Math.sign(laneDifference) * speed);
                    if (eveAnimKey(thug) !== walkAnim) thug.play(walkAnim, true);
                } else if (aiMode === 'projectiles') {
                    lordBugThrowProjectileVolley(scene, thug, time);
                } else {
                    startLordBugDash(scene, thug, time);
                }
                return;
            }
        }

        // ── THUG 03: sometimes line up vertically, then roll horizontally ───
        if (thug.getData('type') === 'thug3') {
            let aiMode = thug.getData('aiMode') || 'chase';
            const nextDecisionTime = thug.getData('nextDecisionTime') || 0;

            if (time >= nextDecisionTime && aiMode === 'chase' && dist > meleeRange) {
                // Most decisions stay with normal pursuit; some prepare a roll.
                aiMode = Math.random() < 0.4 ? 'alignForRoll' : 'chase';
                thug.setData('aiMode', aiMode);
                thug.setData('nextDecisionTime', time + Phaser.Math.Between(1400, 2600));
            }

            if (aiMode === 'alignForRoll') {
                const laneDifference = scene.character.y - thug.y;
                if (Math.abs(laneDifference) > 25) {
                    thug.setVelocityX(0);
                    thug.setVelocityY(Math.sign(laneDifference) * speed);
                    if (eveAnimKey(thug) !== walkAnim) { thug.play(walkAnim, true); }
                } else {
                    startThug3Roll(scene, thug, time);
                }
                return;
            }
        }

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
        if (distToEve <= (proj.getData('hitRadius') || 45)) {
            showImpact(scene, scene.character.x, scene.character.y); // impact flash on Eve
            scene.takeDamage(proj.getData('damage') || 15);
            proj.destroy();
        } else if (proj.x < -300 || proj.x > 2400) {
            proj.destroy();
        }
    });
}

function chooseLordBugBehavior(scene, boss, time) {
    const choices = ['melee', 'projectiles', 'dash', 'block']
        .filter((choice) => choice !== boss.getData('lastBehavior'));
    const behavior = choices[Phaser.Math.Between(0, choices.length - 1)];
    boss.setData('lastBehavior', behavior);
    boss.setData('aiMode', behavior);
    boss.setData('nextBehaviorTime', time + LORD_BUG_BEHAVIOR_INTERVAL);
    if (behavior === 'block') startLordBugBlock(scene, boss);
}

// Fire twice down one locked lane; releases are exactly 700ms apart.
function lordBugThrowProjectileVolley(scene, boss, time) {
    const direction = scene.character.x < boss.x ? -1 : 1;
    const lockedY = boss.y;
    boss.setData('isAttacking', true);
    boss.setData('lastAttackTime', time);
    boss.setData('aiMode', 'melee');
    boss.setFlipX(direction < 0);
    boss.setVelocity(0);
    boss.play('lordBugThrowAnim', true);

    const firstReleaseDelay = 300;
    scene.time.delayedCall(firstReleaseDelay, () => launchLordBugProjectile(scene, boss, direction, lockedY));
    scene.time.delayedCall(firstReleaseDelay + LORD_BUG_SECOND_PROJECTILE_DELAY, () => {
        if (!boss.active || boss.getData('isDying') || boss.getData('isStunned')) return;
        boss.play('lordBugThrowAnim', true);
        launchLordBugProjectile(scene, boss, direction, lockedY);
    });
    scene.time.delayedCall(firstReleaseDelay + LORD_BUG_SECOND_PROJECTILE_DELAY + 650, () => {
        if (!boss.active || boss.getData('isDying') || boss.getData('isStunned')) return;
        boss.setData('isAttacking', false);
        boss.play(boss.getData('idleAnim'), true);
    });
}

function launchLordBugProjectile(scene, boss, direction, lockedY) {
    if (!boss.active || boss.getData('isDying') || boss.getData('isStunned')) return;
    const projectile = scene.enemyProjectiles.create(
        boss.x + direction * 150, lockedY, 'lordBug_projectile1'
    );
    projectile.setScale(1.25);
    projectile.setFlipX(direction < 0);
    projectile.setData('damage', 14);
    projectile.setData('hitRadius', 64);
    projectile.setVelocity(direction * 520, 0);
    projectile.play('lordBugProjectileAnim', true);
    if (scene.sdRocket) scene.sdRocket.play();
}

// ── LordBug's fast horizontal dash remains active for exactly 3 seconds ─────
function startLordBugDash(scene, boss, time) {
    const direction = scene.character.x < boss.x ? -1 : 1;
    boss.setData('isDashing', false);
    boss.setData('isAttacking', true);
    boss.setData('dashHitPlayer', false);
    boss.setData('lastAttackTime', time);
    boss.setData('aiMode', 'melee');
    boss.setFlipX(direction < 0);
    boss.setVelocity(0);
    boss.play('lordBugDashStartAnim', true);

    // Commit to the dash only after the two startup poses have played.
    scene.time.delayedCall(225, () => {
        if (!boss.active || boss.getData('isDying') || boss.getData('isStunned')) return;
        boss.setData('isDashing', true);
        boss.setVelocity(direction * (boss.getData('dashSpeed') || 620), 0);
        boss.play('lordBugDashLoopAnim', true);
    });

    scene.time.delayedCall(225 + (boss.getData('dashDuration') || 3000), () => {
        if (!boss.active || boss.getData('isDying') || boss.getData('isStunned')) return;
        boss.setData('isDashing', false);
        boss.setVelocity(0);
        boss.play('lordBugDashRecoverAnim', true);

        scene.time.delayedCall(300, () => {
            if (!boss.active || boss.getData('isDying') || boss.getData('isStunned')) return;
            boss.setData('isAttacking', false);
            boss.play(boss.getData('idleAnim'), true);
        });
    });
}

function startLordBugBlock(scene, boss) {
    if (!boss.active || boss.getData('isDying') || boss.getData('isAttacking')) return;
    boss.setData('isBlocking', true);
    boss.setData('recentHits', 0);
    boss.setData('lastBlockTime', scene.time.now);
    boss.setVelocity(0);
    boss.play('lordBugBlockAnim', true);
    scene.time.delayedCall(900, () => {
        if (!boss.active || boss.getData('isDying')) return;
        boss.setData('isBlocking', false);
        boss.setData('aiMode', 'melee');
        // His melee cooldown is ready immediately, allowing a real counterattack.
        boss.setData('lastAttackTime', scene.time.now - (boss.getData('attackCooldown') || 1700));
        boss.play(boss.getData('idleAnim'), true);
    });
}

// ── Thug_03 rolls horizontally toward the player's lined-up position ─────────
function startThug3Roll(scene, thug, time) {
    const direction = scene.character.x < thug.x ? -1 : 1;
    thug.setData('isRolling', true);
    thug.setData('isAttacking', true);
    thug.setData('rollHitPlayer', false);
    thug.setData('lastAttackTime', time);
    thug.setData('aiMode', 'chase');
    thug.setFlipX(direction < 0);
    thug.setVelocity(direction * (thug.getData('rollSpeed') || 400), 0);
    thug.play(thug.getData('rollAnim'), true);

    scene.time.delayedCall(thug.getData('rollDuration') || 2500, () => {
        if (!thug.active || thug.getData('isDying')) { return; }
        // A heavy hit may have interrupted the roll and put the thug in stun.
        // Let the stun animation/recovery callback retain control in that case.
        if (thug.getData('isStunned')) { return; }
        thug.setData('isRolling', false);
        thug.setData('isAttacking', false);
        thug.setData('nextDecisionTime', scene.time.now + Phaser.Math.Between(1200, 2200));
        thug.setVelocity(0);
        thug.play(thug.getData('idleAnim'), true);
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

    if (enemy.getData('type') === 'lordBug' && enemy.getData('isBlocking')) {
        if (scene.sdBoxBreak) scene.sdBoxBreak.play();
        return;
    }

    // LordBug never enters hit-stun. A tiny damage gate prevents a single
    // overlapping hitbox from draining him every rendered frame.
    if (enemy.getData('type') === 'lordBug') {
        const sinceLastDamage = scene.time.now - (enemy.getData('lastDamageTime') || -10000);
        if (sinceLastDamage < (enemy.getData('damageInvulnerability') || 220)) return;
        enemy.setData('lastDamageTime', scene.time.now);
    }

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

    if (enemy.getData('type') === 'lordBug') {
        const hitCount = (enemy.getData('recentHits') || 0) + 1;
        enemy.setData('recentHits', hitCount);
        const blockReady = scene.time.now - (enemy.getData('lastBlockTime') || -10000) >=
            (enemy.getData('blockCooldown') || 5500);
        if (hitCount >= 3 && blockReady &&
            !enemy.getData('isAttacking') && !enemy.getData('isDashing')) {
            startLordBugBlock(scene, enemy);
            return;
        }

        // Taking a hit does not interrupt his current action or animation. If
        // he is free, make his melee response immediately available.
        if (!enemy.getData('isAttacking') && !enemy.getData('isDashing')) {
            enemy.setData('lastAttackTime', scene.time.now - (enemy.getData('attackCooldown') || 1700));
            enemy.setData('nextBehaviorTime', scene.time.now);
            enemy.setData('aiMode', 'melee');
        }
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
        enemy.setData('isRolling', false);
        enemy.setData('isDashing', false);
        enemy.setData('isBlocking', false);
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
    enemy.setData('isDashing', false);
    enemy.setData('isBlocking', false);

    enemy.play(enemy.getData('stunAnim'), true);
    if (scene.sdExplosion) scene.sdExplosion.play();

    enemy.setCollideWorldBounds(false);

    const launchDirection = enemy.x < scene.character.x ? -1 : 1;
    const throwSpeedX = launchDirection * Phaser.Math.Between(700, 900);
    const throwSpeedY = Phaser.Math.Between(-400, -200);

    enemy.setVelocity(throwSpeedX, throwSpeedY);

    scene.totalScore += enemy.getData('type') === 'lordBug' ? 100 : 10;
    scene.currentEnergy = Math.min(scene.maxEnergy, scene.currentEnergy + 5);
    processScoreMilestones(scene);
    if (enemy.getData('type') === 'lordBug') hideLordBugBossHUD(scene);

    // ── Item drops — 35% chance each, independent rolls ───────────────────────
    if (Math.random() < 0.35) {
        spawnItemDrop(scene, enemy.x - 20, enemy.y, 'Steak', 'hp');
    }
    if (Math.random() < 0.35) {
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
    if (!isUsablePhysicsGroup(scene.projectiles)) { return; }
    scene.projectiles.getChildren().forEach((orb) => {
        if (orb.active && (orb.x < -400 || orb.x > 2500)) { orb.destroy(); }
    });
}

function isUsablePhysicsGroup(group) {
    return !!(group && group.children && typeof group.getChildren === 'function');
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

// Every 250 score, four guaranteed supplies fall to fixed left/right floor
// positions: one HP and one Energy pickup on each side of the arena.
function spawnSkySupplyDrop(scene) {
    const floorY = 850;
    const supplies = [
        { x: 430,  texture: 'Steak',     effect: 'hp' },
        { x: 680,  texture: 'Milkshake', effect: 'energy' },
        { x: 1240, texture: 'Milkshake', effect: 'energy' },
        { x: 1490, texture: 'Steak',     effect: 'hp' }
    ];

    supplies.forEach((supply) => {
        spawnFallingItem(scene, supply.x, 360, floorY, supply.texture, supply.effect);
    });
}

function spawnFallingItem(scene, x, startY, floorY, textureKey, effect) {
    ensureItemPickupsGroup(scene);

    const item = scene.itemPickups.create(x, startY, textureKey);
    item.setScale(1.2);
    item.setDepth(9);
    item.setData('effect', effect);

    scene.tweens.add({
        targets: item,
        y: floorY,
        duration: 1100,
        ease: 'Bounce.easeOut',
        onComplete: () => {
            if (!item.active) { return; }
            scene.tweens.add({
                targets: item,
                y: floorY - 12,
                yoyo: true,
                repeat: -1,
                duration: 600,
                ease: 'Sine.easeInOut'
            });
        }
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
