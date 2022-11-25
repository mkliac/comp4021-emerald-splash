const Arrow = function(ctx, x, y, direction) {

    const sequences = {
        up:  { x: 0, y: 112, width: 16, height: 16, count: 1, timing: 50, loop: true },
        right:  { x: 16, y: 112, width: 16, height: 16, count: 1, timing: 50, loop: true },
        down:  { x: 32, y: 112, width: 16, height: 16, count: 1, timing: 50, loop: true },
        left:  { x: 48, y: 112, width: 16, height: 16, count: 1, timing: 50, loop: true },
    };

    const sprite = Sprite(ctx, x, y);
    const speed = 1000;
    const birthTime = performance.now();

    sprite.setSequence(sequences[direction])
          .setScale(2)
          .setShadowScale({ x: 0.75, y: 0.2 })
          .useSheet("resources/object_sprites.png");

    const update = function(time) {
        let { x, y } = sprite.getXY();
        switch (direction) {
            case "up": y -= speed / 60; break;
            case "right": x += speed / 60; break;
            case "down": y += speed / 60; break;
            case "left": x -= speed / 60; break;
        }
        sprite.setXY(x, y);
        sprite.update(time);
    };

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
        update: update
    };
};
