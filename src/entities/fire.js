import { CELL_SIZE } from '../world/grid.js';

export class Fire {
    constructor(x, y, direction) {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.width = CELL_SIZE * 2;
        this.height = CELL_SIZE;
        this.active = true;
        this.timer = 0;
        this.duration = 1000; // 1 second
    }

    update() {
        if (this.active) {
            this.timer += 1000/60;
            if (this.timer > this.duration) {
                this.active = false;
            }
        }
    }

    render(ctx) {
        if (this.active) {
            ctx.save();
            
            const time = Date.now();
            const flickerX = Math.sin(time / 50) * 2;
            const flickerY = Math.cos(time / 40) * 2;
            
            let drawX = this.direction === 'left' ? this.x - this.width : this.x;
            
            // Fire Gradients
            let outerGrad = ctx.createLinearGradient(drawX, this.y, drawX + this.width, this.y);
            let innerGrad = ctx.createLinearGradient(drawX, this.y, drawX + this.width, this.y);
            
            if (this.direction === 'left') {
                outerGrad.addColorStop(0, 'rgba(255, 0, 0, 0)');
                outerGrad.addColorStop(0.5, 'rgba(255, 80, 0, 0.8)');
                outerGrad.addColorStop(1, 'rgba(255, 200, 0, 1)');
                
                innerGrad.addColorStop(0, 'rgba(255, 255, 0, 0)');
                innerGrad.addColorStop(0.6, 'rgba(255, 255, 0, 0.9)');
                innerGrad.addColorStop(1, 'rgba(255, 255, 255, 1)');
            } else {
                outerGrad.addColorStop(0, 'rgba(255, 200, 0, 1)');
                outerGrad.addColorStop(0.5, 'rgba(255, 80, 0, 0.8)');
                outerGrad.addColorStop(1, 'rgba(255, 0, 0, 0)');
                
                innerGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
                innerGrad.addColorStop(0.4, 'rgba(255, 255, 0, 0.9)');
                innerGrad.addColorStop(1, 'rgba(255, 255, 0, 0)');
            }

            // Draw outer fire
            ctx.fillStyle = outerGrad;
            ctx.beginPath();
            if (this.direction === 'left') {
                ctx.moveTo(drawX + this.width, this.y + 4);
                ctx.bezierCurveTo(drawX + this.width/2, this.y - 4 + flickerY, drawX, this.y + 4 + flickerX, drawX, this.y + this.height/2);
                ctx.bezierCurveTo(drawX, this.y + this.height - 4 - flickerX, drawX + this.width/2, this.y + this.height + 4 - flickerY, drawX + this.width, this.y + this.height - 4);
            } else {
                ctx.moveTo(drawX, this.y + 4);
                ctx.bezierCurveTo(drawX + this.width/2, this.y - 4 + flickerY, drawX + this.width, this.y + 4 + flickerX, drawX + this.width, this.y + this.height/2);
                ctx.bezierCurveTo(drawX + this.width, this.y + this.height - 4 - flickerX, drawX + this.width/2, this.y + this.height + 4 - flickerY, drawX, this.y + this.height - 4);
            }
            ctx.fill();

            // Draw inner core
            ctx.fillStyle = innerGrad;
            ctx.beginPath();
            if (this.direction === 'left') {
                ctx.moveTo(drawX + this.width, this.y + 8);
                ctx.quadraticCurveTo(drawX + this.width/3, this.y + 4 + flickerY, drawX + 10 + flickerX, this.y + this.height/2);
                ctx.quadraticCurveTo(drawX + this.width/3, this.y + this.height - 4 - flickerY, drawX + this.width, this.y + this.height - 8);
            } else {
                ctx.moveTo(drawX, this.y + 8);
                ctx.quadraticCurveTo(drawX + this.width*0.66, this.y + 4 + flickerY, drawX + this.width - 10 + flickerX, this.y + this.height/2);
                ctx.quadraticCurveTo(drawX + this.width*0.66, this.y + this.height - 4 - flickerY, drawX, this.y + this.height - 8);
            }
            ctx.fill();

            ctx.restore();
        }
    }
}
