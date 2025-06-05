# Nasa Visualizador Ateroid Api - Simulador De % De Inpacto Librerias De La Nasa

Este proyecto es una aplicación web interactiva que utiliza la **API de Asteroides Cercanos a la Tierra de la NASA (NeoWs)** para visualizar asteroides en función de su proximidad a la Tierra, velocidad y tamaño. La visualización se realiza mediante un lienzo HTML5 (`canvas`) que simula el entorno espacial alrededor de la Tierra, destacando visualmente los asteroides según su riesgo potencial.

---

## 🚀 ¿Para qué sirve?

- Visualizar en tiempo real los asteroides cercanos a la Tierra usando datos oficiales de la NASA.
- Ver el riesgo estimado de impacto de cada asteroide según su velocidad, tamaño y distancia.
- Simular cuántas vueltas dará la Tierra antes de que un asteroide potencialmente impacte (si el riesgo es alto).
- Aprender sobre astronomía y amenazas espaciales de manera didáctica y visual.

---

## 🎨 Funcionalidades principales

- 🌍 Representación visual de la Tierra y su atmósfera.
- ☄️ Representación de asteroides con colores según proximidad:
  - 🔴 **Rojo**: Muy cercano.
  - 🟠 **Naranja**: A media distancia.
  - 🟡 **Amarillo**: Lejano.
- 🖱️ Al hacer clic en un asteroide, se muestra:
  - Nombre.
  - Distancia en millones de km.
  - Velocidad en km/s.
  - Tamaño estimado.
  - Tiempo estimado hasta el posible impacto.
  - Probabilidad de impacto.
  - Zona estimada de impacto según la rotación de la Tierra.
- 🔄 Simulación animada de vueltas de la Tierra hasta el posible impacto (si el riesgo supera el 50%).

---

## 📦 Tecnologías utilizadas

- HTML5 + CSS3
- JavaScript (Vanilla)
- API REST de NASA NEO (Near Earth Object Web Service)
- Font Awesome (para íconos)
- `<canvas>` para renderización 2D en tiempo real

---

## 🔧 Cómo usarlo

1. Abre el archivo HTML en tu navegador.
2. Haz clic en el botón `Cargar asteroides` para obtener los datos más recientes de la NASA.
3. Observa los asteroides rodeando la Tierra en el panel central.
4. Haz clic sobre cualquier asteroide para ver detalles en el panel derecho.
5. Si el riesgo es alto, aparecerá un botón para simular la trayectoria hasta el impacto.

---

## 🌐 Enlaces útiles

- [🌐 API de la NASA](https://api.nasa.gov/)
- [📁 Web ](https://toolapikey.foroactivo.com/h22-nasa) 

---

## 📌 Nota

Este proyecto es solo una **simulación educativa**. Los cálculos de impacto son aproximados y con fines visuales, **no representan predicciones reales de impacto astronómico**.
