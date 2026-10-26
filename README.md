# ✈️ Viatiko — Diseña tu Viaje Soñado y Personalizado con IA

[![Live Demo](https://img.shields.io/badge/Demo-Live%20on%20GitHub%20Pages-success?style=for-the-badge&logo=github)](https://alexisef23.github.io/viatiko/)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/es/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/es/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/es/docs/Web/JavaScript)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

> **Viatiko** es una plataforma web interactiva y vanguardista diseñada para planificar viajes completos y personalizados en menos de 60 segundos. Combina curaduría de itinerarios inteligentes, filtros anti-trampas de turistas, estimación presupuestaria en tiempo real multimoneda y herramientas de exportación para grupos de viaje.

---

## 🌟 Características Principales

### 🧠 1. Planificador Interactivo en 5 Pasos
- **Paso 1: Destino Inteligente**: Selección entre destinos de tendencia (*Oaxaca, Tokio, Bali, Roma, Nueva York, Medellín*) o generación dinámica para cualquier ciudad del mundo con autocompletado instantáneo.
- **Paso 2: Tipo de Compañía**: Adapta los ritmos y actividades según viajes *En Solitario (Mochilero)*, *En Pareja (Romance)*, *Con Amigos (Aventura & Fiesta)* o *En Familia (Confort & Seguridad)*.
- **Paso 3: Duración y Estacionalidad**: Selector de días con presets (3, 5, 7, 10, 14 días) o barra deslizante interactiva, además de selección de época climática (Primavera, Verano, Otoño, Invierno).
- **Paso 4: Presupuesto y Estilo**: Tiers calculados (*Mochilero*, *Equilibrado* y *Lujo VIP*) con simulador en tiempo real.
- **Paso 5: Vibra e Intereses**: Selección múltiple de intereses (*Gastronomía, Aventura, Cultura, Relax, Vida Nocturna, Naturaleza, Fotografía, Shopping*) y campo de notas o restricciones.

---

### 🗺️ 2. Itinerario Integral y Multisección
- **Cronograma Día a Día**: Línea de tiempo cronológica por jornada dividida en bloques (Mañana ☀️, Mediodía/Tarde 🍽️, Atardecer 🌅 y Noche 🌙) con:
  - Título y descripción detallada de cada parada.
  - Consejos de locales (*Insider Tips*).
  - Enlaces directos de ubicación en **Google Maps**.
  - Checkbox interactivo para marcar actividades realizadas con feedback sonoro.
  - Botón de alternancia rápida entre **Día Individual** y **Ver Todos los Días**.
- **Dónde Hospedarte**: Alojamientos verificados con estrellas, puntuación (+9.0), rango de precios en divisa activa y enlaces directos para verificar disponibilidad.
- **Gastronomía Imperdible**: Joyas de cocina local, fondas tradicionales, mercados gastronómicos y restaurantes de autor sin sobreprecios turísticos.
- **Desglose de Gastos & Calculadora de Grupo**:
  - Gasto diario por persona.
  - Total individual para la estancia completa.
  - **Widget contador de viajeros interactivo (+ / -)** con cálculo instantáneo para grupos de 1 a 20 personas.
  - Gráfico visual de distribución porcentual (Hospedaje, Alimentos, Tours, Transporte y Extras).
- **Checklist para Maleta**: Lista de empaque interactiva con casillas de verificación para marcar pertenencias mientras empacas.
- **Pronóstico y Temporadas Ideales**: Panel meteorológico con temperaturas promedio, condiciones típicas de la estación, índices de lluvia y mejores horas del día para visitas.

---

### 📤 3. Herramientas de Exportación y Compartición
- **📅 Exportación a Calendario (.ics)**: Genera y descarga un archivo iCalendar estándar compatible con **Google Calendar**, **Apple Calendar** y **Outlook**, programando todas las actividades del itinerario con sus respectivos horarios y ubicaciones.
- **📄 Dossier de Viaje en PDF / Imprimir**: Hoja de estilos de impresión `@media print` optimizada para generar documentos PDF limpios en formato A4 sin elementos de navegación ni distracciones web.
- **💬 Compartir en WhatsApp**: Genera un mensaje formateado con el resumen del viaje y enlace directo para coordinar en grupos.
- **🔗 Enlace Compartible**: Copia una URL con parámetros de consulta (`?dest=...&days=...`) para que otros viajeros abran el mismo plan instantáneamente.
- **🎲 Destino Sorpresa (Ruleta Viajera)**: Para quienes buscan inspiración espontánea, un clic selecciona un destino al azar y configura el planificador automáticamente.
- **💱 Conversor de Divisa en Tiempo Real**: Soporte dinámico para **MXN ($)**, **USD ($)** y **EUR (€)** en todos los precios del sistema.
- **🔊 Gamificación Sonora con Web Audio API**: Sonidos sutiles de clic, selección y victoria generados proceduralmente en el navegador (se pueden silenciar en cualquier momento con memoria local).

---

## 🎨 Estética y Diseño

- **Dark Luxury UI**: Fondo oscuro cinematográfico (`#080C14`) con orbes ambientales de luz difusa y gradientes vibrantes (*Coral, Índigo y Cian*).
- **Glassmorphism**: Tarjetas con `backdrop-filter: blur(20px)` y bordes translúcidos de alta fidelidad.
- **Tipografía Moderna**: Encabezados en **Outfit** y cuerpo de texto en **Plus Jakarta Sans** optimizadas para lectura y jerarquía visual.
- **100% Responsivo**: Adaptado milimétricamente para móviles, tablets y escritorios, incluyendo un menú lateral deslizante (*drawer*) para pantallas pequeñas.

---

## 📁 Estructura del Proyecto

```plaintext
viatiko/
├── index.html          # Estructura semántica, accesibilidad y metadatos OpenGraph
├── style.css           # Sistema de diseño, tokens CSS, componentes y estilos @media print
├── app.js              # Lógica de estados, síntesis dinámica de planes, Web Audio y exportación .ics
├── assets/
│   ├── favicon.svg     # Isotipo vectorial de brújula con gradiente
│   ├── hero.jpg        # Fotografía de alta resolución para portada
│   ├── oaxaca.jpg      # Fotografía temática de Oaxaca
│   └── tokyo.jpg       # Fotografía temática de Tokio
├── .gitignore          # Exclusiones de archivos del sistema y temporales
└── README.md           # Documentación completa del proyecto
```

---

## 🚀 Puesta en Marcha Local

No se requieren dependencias pesadas ni compiladores. Puedes ejecutarlo con cualquier servidor estático local:

### Opción 1: Con Python
```bash
python -m http.server 3000
```
Luego abre tu navegador en [http://localhost:3000](http://localhost:3000).

### Opción 2: Con Node.js
```bash
npx serve .
```

### Opción 3: Abrir directamente
Haz doble clic sobre el archivo `index.html` en tu explorador de archivos.

---

## 🌐 Demo en Vivo

Puedes acceder a la versión desplegada en **GitHub Pages**:
🔗 **[https://alexisef23.github.io/viatiko/](https://alexisef23.github.io/viatiko/)**

---

## 📄 Licencia

Este proyecto está bajo la Licencia **MIT** — puedes utilizarlo, modificarlo y compartirlo libremente.

---

*Desarrollado con dedicación para hacer que explorar el mundo sea accesible, inteligente y memorable.*
