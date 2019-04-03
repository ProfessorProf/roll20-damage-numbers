/* Damage Numbers script
 * Generates Final Fantasy-style damage numbers whenever a token's health increases or decreases.
 * Works for any system.
 * 
 * Created by Quinn Gordon
 * Roll20: https://app.roll20.net/users/42042/prof
 * Github: https://github.com/ProfessorProf
 */

// Config:
state.damageNumbers = {
    enabled: true,              // Set to false to disable script
    font: 'Contrail One',       // Choices: 'Arial', 'Patrick Hand', 'Contrail One', 'Shadows Into Light', 'Candal'
    damageColor: 'black',       // Color of damage numbers
    healingColor: 'green',      // Color of healing numbers
    healthBar: 1,               // Which bar is the health bar?
    displayHealing: true,       // Show green numbers when health increases
    requireMaxHealth: false,    // Only show damage numbers if the token has a maximum health
    requirePlayerPage: true     // Only show damage numbers on the active player page
}

// Generate damage/healing numbers
on('change:graphic', function(obj, prev) {
    if(state.damageNumbers.enabled) {
        let oldHp = 0;
        let newHp = 0;
        let oldHpMax = 0;
        let newHpMax = 0;
        
        switch(state.damageNumbers.healthBar) {
            case 1:
                oldHp = parseInt(prev.bar1_value);
                oldHpMax = parseInt(prev.bar1_max);
                newHp = parseInt(obj.get('bar1_value'));
                newHpMax = parseInt(obj.get('bar1_max'));
                break;
            case 2:
                oldHp = parseInt(prev.bar2_value);
                oldHpMax = parseInt(prev.bar2_max);
                newHp = parseInt(obj.get('bar2_value'));
                newHpMax = parseInt(obj.get('bar2_max'));
                break;
            case 3:
                oldHp = parseInt(prev.bar3_value);
                oldHpMax = parseInt(prev.bar3_max);
                newHp = parseInt(obj.get('bar3_value'));
                newHpMax = parseInt(obj.get('bar3_max'));
                break;
        }
        
        // Do nothing if the bar value didn't change
        if(oldHp && newHp && oldHp == newHp) {
            return;
        }
        
        if(state.damageNumbers.requirePlayerPage) {
            // Do nothing if it was a token on another page
            let page = Campaign().get('playerpageid');
            if(obj.get('_pageid') != page) {
                return;
            }
        }
        
        damageNumber(obj, oldHp, newHp, oldHpMax, newHpMax);
    }
});

// Display damage number for a token
function damageNumber(token, oldHp, newHp, oldHpMax, newHpMax) {
    if(oldHp != oldHp || newHp != newHp || 
        (oldHpMax == oldHpMax && newHpMax == newHpMax && oldHpMax != newHpMax) || 
        oldHp - newHp == oldHpMax - newHpMax) {
        // NaN values or max HP changed, don't show a number
        return;
    }

    let hpChange = newHp - oldHp;

    if(!state.damageNumbers.displayHealing && hpChange > 0) {
        // Do nothing if it's a healing value and healing numbers are disabled
        return;
    }

    if(state.damageNumbers.requireMaxHealth && !newHpMax) {
        // Do nothing if there's no max HP and require max health is enabled
        return;
    }

    let number = createObj('text', {
        _pageid: token.get('_pageid'),
        layer: token.get('layer'),
        left: token.get('left') - token.get('width') * 0.4 + Math.floor(Math.random() * (token.get('width') * 0.8)),
        top: token.get('top') - token.get('height') / 2 + Math.floor(Math.random() * 20),
        text: Math.abs(hpChange).toString(),
        width: 50,
        height: 25.6,
        font_family: state.damageNumbers.font,
        color: hpChange > 0 ? state.damageNumbers.healingColor : state.damageNumbers.damageColor
    });

    log(`Created damage number for ${Math.abs(hpChange)} ${hpChange > 0 ? 'healing' : 'damage'} to token ${token.get('name') ? token.get('name') : token.get('_id')}.`);

    updateDamageNumber(number, number.get('top') - 50, 20)
}

// Move the number upwards slightly every 50ms, then delete it
function updateDamageNumber(number, targetTop, steps) {
    if(steps <= 0) {
        number.remove();
        return;
    }

    let top = number.get('top');
    top += (targetTop - top) * 0.3;
    number.set('top', top);
    setTimeout(function () {
        updateDamageNumber(number, targetTop, steps - 1);
    }, 50);
}