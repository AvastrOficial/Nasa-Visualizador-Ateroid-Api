const API_KEY = 'DEMO_KEY';
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoDiv = document.getElementById('info');
const earth = { x:300, y:300, r:30 };
const atmosphereLayers = [100,150,200,250];
let asteroids = [];
  

// convierte distancia real a distancia visual
function mapDistance(dist) {
  const [minD,maxD,minPx,maxPx]=[2,75,90,250];
  return minPx + ((dist-minD)/(maxD-minD)) * (maxPx-minPx);
}

// color según distancia
function getColor(dist) {
  if (dist<5) return '#f00';
  if (dist<30) return '#fa0';
  return '#ff0';
}

// dibuja todo
function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  atmosphereLayers.forEach((r,i)=>{
    ctx.beginPath();
    ctx.arc(earth.x,earth.y,r,0,2*Math.PI);
    ctx.strokeStyle=`rgba(0,255,255,${0.1 + i*0.1})`;
    ctx.stroke();
  });
  ctx.beginPath();
  ctx.arc(earth.x,earth.y, earth.r, 0, 2*Math.PI);
  ctx.fillStyle = '#0af';
  ctx.fill();

  asteroids.forEach(a=>{
    a.angle += a.v/5e4;
    a.x = earth.x + Math.cos(a.angle)*a.visualDist;
    a.y = earth.y + Math.sin(a.angle)*a.visualDist;
    ctx.beginPath();
    ctx.arc(a.x,a.y,a.size,0,2*Math.PI);
    ctx.fillStyle = getColor(a.dist);
    ctx.fill();
  });
  requestAnimationFrame(draw);
}

async function loadAsteroids() {
  try {
    const today = new Date();
    const start = today.toISOString().split('T')[0];
    const end = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const res = await fetch(`https://api.nasa.gov/neo/rest/v1/feed?start_date=${start}&end_date=${end}&api_key=${API_KEY}`);

    if (!res.ok) {
      throw new Error(`Error HTTP: ${res.status}`);
    }

    const data = await res.json();
    console.log('Respuesta API:', data);

    let list = [];
    for (const day in data.near_earth_objects) {
      list = list.concat(data.near_earth_objects[day]);
    }
    console.log(`Asteroides totales cargados: ${list.length}`);

    asteroids = list.map(n => {
      const c = n.close_approach_data[0];
      const dist = parseFloat(c.miss_distance.kilometers) / 1e6;
      const vel = parseFloat(c.relative_velocity.kilometers_per_second);
      return {
        name: n.name,
        dist,
        v: vel,
        visualDist: mapDistance(dist),
        size: 3 + Math.random() * 2,
        angle: Math.random() * Math.PI * 2
      };
    });

    infoDiv.innerHTML = 'Selecciona un asteroide...';

  } catch (error) {
    console.error('Error al cargar asteroides:', error);
    infoDiv.innerHTML = 'Error al cargar asteroides. Revisa la consola.';
  }
}

canvas.addEventListener('click', async e => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left, my = e.clientY - rect.top;

  for (let a of asteroids) {
    const d = Math.hypot(mx - a.x, my - a.y);
    if (d < a.size + 2) {

      let risk = 0;
      if (a.dist < 5) risk = 90 - a.dist * 10 + a.v / 3;
      else if (a.dist < 30) risk = 30 - a.dist / 2 + a.v / 4;
      else risk = 1 + Math.random();
      risk = Math.min(Math.max(risk, 0), 99.9);

      const realSize = Math.round(a.size * 25 + a.v * 3);

      let sizeDesc = "";
      if (realSize > 300) sizeDesc = "más grande que un rascacielos";
      else if (realSize > 100) sizeDesc = "más grande que un edificio promedio";
      else if (realSize > 20) sizeDesc = "más grande que un camión";
      else sizeDesc = "más pequeño que un camión";

      const tiempoHoras = (a.dist * 1e6) / (a.v * 3600);
      const rotacionTerrestre = (tiempoHoras * 15) % 360;

      let zonaImpacto = "";
      if (rotacionTerrestre < 45) zonaImpacto = "América del Sur";
      else if (rotacionTerrestre < 90) zonaImpacto = "Océano Atlántico";
      else if (rotacionTerrestre < 135) zonaImpacto = "África Occidental";
      else if (rotacionTerrestre < 180) zonaImpacto = "Europa Central";
      else if (rotacionTerrestre < 225) zonaImpacto = "Asia Occidental";
      else if (rotacionTerrestre < 270) zonaImpacto = "India / Himalayas";
      else if (rotacionTerrestre < 315) zonaImpacto = "Pacífico Occidental";
      else zonaImpacto = "América del Norte";

      infoDiv.innerHTML = `
        <h3>☄️ ${a.name}</h3>
        <p><strong>Distancia:</strong> ${a.dist.toFixed(3)} M km</p>
        <p><strong>Velocidad:</strong> ${a.v.toFixed(1)} km/s</p>
        <p><strong>Tamaño estimado:</strong> ${realSize} m<br>(${sizeDesc})</p>
        <p><strong>Tiempo estimado hasta impacto:</strong> ${Math.round(tiempoHoras)} horas</p>
        <p><strong>Posible zona de impacto:</strong> ${zonaImpacto}</p>
        <p><strong>Probabilidad de impacto:</strong> <span style="color:${risk > 50 ? '#f00' : '#fa0'}">${risk.toFixed(1)}%</span></p>
      `;

      const oldBtn = document.getElementById('simBtn');
      if (oldBtn) oldBtn.remove();

      if (risk >= 50) {
        const simBtn = document.createElement('button');
        simBtn.id = 'simBtn';
        simBtn.textContent = 'Simular vueltas hasta impacto';
        infoDiv.appendChild(simBtn);

        simBtn.addEventListener('click', () => {
          startSimulation(tiempoHoras);
        });
      }

      break;
    }
  }
});


function startSimulation(tiempoHoras) {
  // Parámetros y configuración
  const vueltasTotales = tiempoHoras / 24;
  let vueltasActuales = 0;

  // Velocidad de rotación (ángulo por frame)
  const velocidadRotacion = 0.02;

  // Crear canvas o usar existente
  let simCanvas = document.getElementById('simCanvas');
  if (!simCanvas) {
    simCanvas = document.createElement('canvas');
    simCanvas.id = 'simCanvas';
    simCanvas.width = 300;
    simCanvas.height = 300;
    simCanvas.style.border = '1px solid #ccc';
    simCanvas.style.display = 'block';
    simCanvas.style.margin = '10px auto';
    infoDiv.appendChild(simCanvas);
  }
  const ctx = simCanvas.getContext('2d');

  // Tierra - centro y radio
  const earth = {
    x: simCanvas.width / 2,
    y: simCanvas.height / 2,
    r: 50
  };

  // Anillos atmósfera (radios mayores que la Tierra)
  const atmosphereLayers = [60, 75, 90];

  // Asteroide con parámetros: ángulo inicial, distancia real, tamaño y distancia visual (pixeles)
  let asteroid = {
    angle: 0,
    dist: 20, // distancia en escala arbitraria
    size: 6,
    visualDist: 0
  };

  // Función para mapear distancia real a distancia visual (pixeles)
  function mapDistance(dist) {
    const [minD, maxD, minPx, maxPx] = [2, 75, 70, 120];
    if (dist < minD) dist = minD;
    if (dist > maxD) dist = maxD;
    return minPx + ((dist - minD) / (maxD - minD)) * (maxPx - minPx);
  }
  asteroid.visualDist = mapDistance(asteroid.dist);

  // Función para obtener color según distancia
  function getColor(dist) {
    if (dist < 5) return '#f00';      // rojo muy cerca
    if (dist < 30) return '#fa0';     // naranja medio
    return '#ff0';                    // amarillo lejos
  }

  let anguloRotacion = 0;

  function animate() {
    ctx.clearRect(0, 0, simCanvas.width, simCanvas.height);

    // Dibujar atmósfera: varios anillos con transparencia variable
    atmosphereLayers.forEach((r, i) => {
      ctx.beginPath();
      ctx.arc(earth.x, earth.y, r, 0, 2 * Math.PI);
      ctx.strokeStyle = `rgba(0, 170, 255, ${0.1 + i * 0.15})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Dibujar Tierra (bola azul)
    ctx.beginPath();
    ctx.arc(earth.x, earth.y, earth.r, 0, 2 * Math.PI);
    ctx.fillStyle = '#0af';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#08c';
    ctx.stroke();

    if (vueltasActuales < vueltasTotales) {
      // Simulación en curso: actualizar posición orbitando
      asteroid.angle += velocidadRotacion;
      if (asteroid.angle > 2 * Math.PI) asteroid.angle -= 2 * Math.PI;

      asteroid.x = earth.x + Math.cos(asteroid.angle) * asteroid.visualDist;
      asteroid.y = earth.y + Math.sin(asteroid.angle) * asteroid.visualDist;
    } else {
      // Simulación terminada: acercar suavemente asteroide al centro de la Tierra
      const lerpSpeed = 0.05;
      asteroid.x += (earth.x - asteroid.x) * lerpSpeed;
      asteroid.y += (earth.y - asteroid.y) * lerpSpeed;

      // Forzar posición fija si está cerca para evitar movimiento residual
      if (Math.abs(asteroid.x - earth.x) < 0.5 && Math.abs(asteroid.y - earth.y) < 0.5) {
        asteroid.x = earth.x;
        asteroid.y = earth.y;
      }
    }

    // Dibujar asteroide
    ctx.beginPath();
    ctx.arc(asteroid.x, asteroid.y, asteroid.size, 0, 2 * Math.PI);
    ctx.fillStyle = getColor(asteroid.dist);
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#333';
    ctx.stroke();

    // Dibujar línea desde centro a asteroide (órbita visible)
    ctx.beginPath();
    ctx.moveTo(earth.x, earth.y);
    ctx.lineTo(asteroid.x, asteroid.y);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Mostrar info vueltas, días y años
    ctx.fillStyle = '#cceeff';
    ctx.font = '14px Arial';
    ctx.fillText(`Vueltas: ${vueltasActuales.toFixed(2)}`, 10, 20);
   const totalDias = vueltasActuales;  
   const años = Math.floor(totalDias / 365);
   const diasRestantes = totalDias % 365;
   const meses = Math.floor(diasRestantes / 30);
   const dias = Math.floor(diasRestantes % 30);

ctx.fillText(`Total: ${años} años, ${meses} meses, ${dias} días`, 10, 60);

    // Incrementar vueltas cuando la Tierra completa una rotación
    anguloRotacion += velocidadRotacion;
    if (anguloRotacion >= 2 * Math.PI) {
      anguloRotacion -= 2 * Math.PI;
      vueltasActuales++;
    }

    // Continuar animación mientras no se haya completado la simulación o mientras el asteroide no esté centrado
    if (vueltasActuales < vueltasTotales || (asteroid.x !== earth.x || asteroid.y !== earth.y)) {
      requestAnimationFrame(animate);
    } else {
      // Simulación completada y asteroide centrado: mostrar mensaje
      ctx.fillStyle = '#0f0';
      ctx.font = '16px Arial';
      ctx.fillText('Simulación completada', 60, simCanvas.height - 30);
    }
  }

  animate();
}




document.getElementById('load').addEventListener('click', loadAsteroids);
draw();
