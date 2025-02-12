const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d');

const G = 1; // Gravitational constant
const masses = [
    { x: 200, y: 300, vx: 0, vy: 2, mass: 10, trail: [] },
    { x: 400, y: 300, vx: 0, vy: -2, mass: 10, trail: [] },
    { x: 600, y: 300, vx: 0, vy: 2, mass: 10, trail: [] }
];

function distance(m1, m2) {
    return Math.sqrt((m1.x - m2.x) ** 2 + (m1.y - m2.y) ** 2);
}

function gravitationalForce(m1, m2) {
    const dist = distance(m1, m2);
    const force = (G * m1.mass * m2.mass) / (dist ** 2);
    const angle = Math.atan2(m2.y - m1.y, m2.x - m1.x);
    return { fx: force * Math.cos(angle), fy: force * Math.sin(angle) };
}

function updatePositions() {
    for (let i = 0; i < masses.length; i++) {
        let fx = 0;
        let fy = 0;
        for (let j = 0; j < masses.length; j++) {
            if (i !== j) {
                const force = gravitationalForce(masses[i], masses[j]);
                fx += force.fx;
                fy += force.fy;
            }
        }
        masses[i].vx += fx / masses[i].mass;
        masses[i].vy += fy / masses[i].mass;
    }

    for (let i = 0; i < masses.length; i++) {
        masses[i].x += masses[i].vx;
        masses[i].y += masses[i].vy;
        masses[i].trail.push({ x: masses[i].x, y: masses[i].y });
        if (masses[i].trail.length > 50) {
            masses[i].trail.shift();
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const mass of masses) {
        ctx.beginPath();
        ctx.arc(mass.x, mass.y, mass.mass, 0, 2 * Math.PI);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(mass.trail[0].x, mass.trail[0].y);
        for (const point of mass.trail) {
            ctx.lineTo(point.x, point.y);
        }
        ctx.stroke();
    }
}

function animate() {
    updatePositions();
    draw();
    requestAnimationFrame(animate);
}

canvas.addEventListener('mousedown', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    for (const mass of masses) {
        const dist = distance({ x: mouseX, y: mouseY }, mass);
        if (dist < mass.mass) {
            canvas.addEventListener('mousemove', onMouseMove);
            canvas.addEventListener('mouseup', onMouseUp);

            function onMouseMove(event) {
                mass.x = event.clientX - rect.left;
                mass.y = event.clientY - rect.top;
            }

            function onMouseUp() {
                canvas.removeEventListener('mousemove', onMouseMove);
                canvas.removeEventListener('mouseup', onMouseUp);
            }
            break;
        }
    }
});

animate();
