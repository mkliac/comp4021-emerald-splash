const Item = function(ctx, x, y, type) {

    const sequences = {
        speed: { x: 144, y: 48, width: 16, height: 16, count: 1, timing: 200, loop: true },
        double: { x: 192, y: 64, width: 16, height: 16, count: 4, timing: 200, loop: true },
        slow: { x: 80, y: 0, width: 16, height: 16, count: 1, timing: 200, loop: true },
        shield: { x: 16, y: 0, width: 16, height: 16, count: 1, timing: 200, loop: true },
        zombie: { x: 96, y: 48, width: 16, height: 16, count: 1, timing: 200, loop: true },
        fire: { x: 0, y: 160, width: 16, height: 16, count: 1, timing: 200, loop: true },
        bomb: { x: 128, y: 48, width: 16, height: 16, count: 1, timing: 200, loop: true },
        arrow: { x: 0, y: 48, width: 16, height: 16, count: 1, timing: 200, loop: true }
    };

    let curType = type;

    const sprite = Sprite(ctx, x, y);

    sprite.setSequence(sequences[type])
          .setScale(2)
          .setShadowScale({ x: 0.75, y: 0.2 })
          .useSheet("resources/object_sprites.png");

    let birthTime = performance.now();

    const getType = function(){
        return curType;
    }

    const setType = function(type) {
        sprite.setSequence(sequences[type]);
        birthTime = performance.now();
        curType = type;
    };

    const getAge = function(now) {
        return now - birthTime;
    };

    const randomize = function(area) {
        const types = ["speed","double","slow","shield","zombie","fire"];
        //const types = ["fire"];
        setType(types[Math.floor(Math.random() * 6)]);
        /* Randomize the position */
        const {x, y} = area.randomPoint();
        sprite.setXY(x, y);
    };

    // The methods are returned as an object here.
    return {
        getXY: sprite.getXY,
        setXY: sprite.setXY,
        getType: getType,
        setType: setType,
        getAge: getAge,
        getBoundingBox: sprite.getBoundingBox,
        randomize: randomize,
        draw: sprite.draw,
        update: sprite.update
    };
};
