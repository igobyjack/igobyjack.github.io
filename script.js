const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();

window.addEventListener('resize', resizeCanvas);

const G = 0.3; 
const masses = [
    { x: 750, y: 300, vx: -0.3, vy: 0.1, mass: 250, trail: [], color: '#228B22', isDragging: false }, // Forest Green
    { x: 1000, y: 600, vx: 0, vy: -0.1, mass: 250, trail: [], color: '#4682B4', isDragging: false }, // Soft Blue
    { x: 600, y: 600, vx: 0.15, vy: -0.1, mass: 250, trail: [], color: '#CD5C5C', isDragging: false }  // Soft Red
];

const borderThreshold = 20;
const trailResumeDelay = 1; 

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
    const currentTime = Date.now();
    
    for (let i = 0; i < masses.length; i++) {
        if (!masses[i].isDragging) {
            let fx = 0, fy = 0;
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
    }

    for (let i = 0; i < masses.length; i++) {
        const prevX = masses[i].x;
        const prevY = masses[i].y;
        const oldX = masses[i].x;

        if (!masses[i].isDragging) {
            masses[i].x += masses[i].vx;
            masses[i].y += masses[i].vy;
        }

        let wrapped = false;
        if (masses[i].x < 0) {
            masses[i].x = canvas.width;
            wrapped = true;
            masses[i].lastWrapTime = currentTime;
        } else if (masses[i].x > canvas.width) {
            masses[i].x = 0;
            wrapped = true;
            masses[i].lastWrapTime = currentTime;
        }
        if (masses[i].y < 0) {
            masses[i].y = canvas.height;
            wrapped = true;
            masses[i].lastWrapTime = currentTime;
        } else if (masses[i].y > canvas.height) {
            masses[i].y = 0;
            wrapped = true;
            masses[i].lastWrapTime = currentTime;
        }

        const nearEdge = masses[i].x < borderThreshold || masses[i].x > canvas.width - borderThreshold ||
                         masses[i].y < borderThreshold || masses[i].y > canvas.height - borderThreshold;
        if (nearEdge) {
            masses[i].lastNearEdgeTime = currentTime;
        }

        const timeElapsedSinceWrap = currentTime - (masses[i].lastWrapTime || 0);
        const timeElapsedSinceEdge = currentTime - (masses[i].lastNearEdgeTime || 0);
        const canDrawTrail = timeElapsedSinceWrap > trailResumeDelay && 
                             timeElapsedSinceEdge > trailResumeDelay;

        if (!wrapped && !nearEdge && canDrawTrail && 
            (masses[i].x !== prevX || masses[i].y !== prevY)) {
            const dx = masses[i].x - oldX;
            if (Math.abs(dx) < canvas.width / 2) {
                masses[i].trail.push({ x: masses[i].x, y: masses[i].y });
            }
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const mass of masses) {
        ctx.beginPath();
        ctx.arc(mass.x, mass.y, 30, 0, 2 * Math.PI);
        ctx.fillStyle = mass.color;
        ctx.fill();

        if (mass.trail.length > 0) {
            ctx.beginPath();
            ctx.moveTo(mass.trail[0].x, mass.trail[0].y);
            for (let i = 1; i < mass.trail.length; i++) {
                const prevPoint = mass.trail[i - 1];
                const currPoint = mass.trail[i];
                if (Math.abs(prevPoint.x - currPoint.x) > canvas.width / 2 ||
                    Math.abs(prevPoint.y - currPoint.y) > canvas.height / 2) {
                    ctx.moveTo(currPoint.x, currPoint.y);
                } else {
                    ctx.lineTo(currPoint.x, currPoint.y);
                }
            }
            ctx.strokeStyle = mass.color;
            ctx.stroke();
        }
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
        if (dist < 17.5) { 
            mass.vx = 0; 
            mass.vy = 0;
            mass.isDragging = true; 
            function onMouseMove(event) {
                mass.x = event.clientX - rect.left;
                mass.y = event.clientY - rect.top;
                if (
                    mass.trail.length === 0 ||
                    distance(mass.trail[mass.trail.length - 1], { x: mass.x, y: mass.y }) > 2
                ) {
                    mass.trail.push({ x: mass.x, y: mass.y });
                }
            }

            function onMouseUp() {
                mass.isDragging = false; 
                canvas.removeEventListener('mousemove', onMouseMove);
                canvas.removeEventListener('mouseup', onMouseUp);
            }

            canvas.addEventListener('mousemove', onMouseMove);
            canvas.addEventListener('mouseup', onMouseUp);
            break;
        }
    }
});

document.getElementById('reset-button').addEventListener('click', () => {
    location.reload(); // reloads the page to reset the simulation
});

animate();
