const Bomb = function(ctx, x, y) {

    const sequences = {
        constant:  { x: 0, y:  0, width: 48, height: 48, count: 15, timing: 80, loop: false },
    };

    const sprite = Sprite(ctx, x, y);
    const birthTime = performance.now();

    sprite.setSequence(sequences.constant)
          .setScale(2)
          .setOffset(32)
          .setShadowScale({ x: 0.25, y: 0.08 })
          .useSheet("resources/bomb_sprites.png");

    const getAge = function(now) {
        return now - birthTime;
    };

    // The methods are returned as an object here.
    return {
        getXY: sprite.getXY,
        setXY: sprite.setXY,
        getAge: getAge,
        getBoundingBox: sprite.getBoundingBox,
        draw: sprite.draw,
        update: sprite.update
    };
};
