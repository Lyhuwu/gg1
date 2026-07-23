const VELOCIDAD = {
  MUY_LENTA: 0.25,
  LENTA: 0.5,
  MEDIA: 0.75,
  NORMAL: 1,
  RAPIDA: 2,
};

const objetos = [
  {
    nombre: "ventana",
    archivos: ["img/2-ventana1.png", "img/2-ventana2.png", "img/2-ventana3.png"],
    velocidad: VELOCIDAD.LENTA,
    capa: 2,
    interactivo: true,
    tipo: "ambos",
    foto: "img/ventana.jpg", 
    carta: "Esta es la fecha en la que empezó todo. ¡Te quiero muchísimo, Sofi!",
    hitbox: { left: 30, top: 10, width: 40, height: 20 }
  },
  {
    nombre: "florero",
    archivos: ["img/4-florero1.png", "img/4-florero2.png"],
    velocidad: VELOCIDAD.RAPIDA,
    capa: 4,
    interactivo: false,
  },
  {
    nombre: "marco",
    archivos: ["img/4-marco1.png", "img/4-marco2.png", "img/4-marco3.png", "img/4-marco4.png"],
    velocidad: VELOCIDAD.MUY_LENTA,
    capa: 4,
    interactivo: true,
    tipo: "ambos",
    foto: "img/marco.jpg", 
    carta: "Esta es la fecha en la que empezó todo. ¡Te quiero muchísimo, Sofi!",
    hitbox: { left: 10, top: 40, width: 15, height: 10 }
  },
  {
    nombre: "pinwi",
    archivos: ["img/4-pinwi1.png", "img/4-pinwi2.png"],
    velocidad: VELOCIDAD.LENTA,
    capa: 4,
    interactivo: true,
    tipo: "ambos",
    foto: "img/pinwi.jpg", 
    carta: "Esta es la fecha en la que empezó todo. ¡Te quiero muchísimo, Sofi!",
    hitbox: { left: 60, top: 45, width: 20, height: 15 }
  },
  {
    nombre: "planta",
    archivos: ["img/4-planta1.png", "img/4-planta2.png"],
    velocidad: VELOCIDAD.LENTA,
    capa: 4,
    interactivo: false,
  },
  {
    nombre: "plantas",
    archivos: ["img/4-plantas1.png", "img/4-plantas2.png"],
    velocidad: VELOCIDAD.LENTA,
    capa: 4,
    interactivo: false,
  },
  {
    nombre: "pollito",
    archivos: ["img/4-pollito1.png", "img/4-pollito2.png", "img/4-pollito3.png", "img/4-pollito4.png"],
    velocidad: VELOCIDAD.RAPIDA,
    capa: 4,
    interactivo: true,
    tipo: "ambos",
    foto: "img/pollito.jpg", 
    carta: "Esta es la fecha en la que empezó todo. ¡Te quiero muchísimo, Sofi!",
    hitbox: { left: 40, top: 60, width: 15, height: 10 }
  },
  {
    nombre: "poster",
    archivos: ["img/4-poster1.png", "img/4-poster2.png", "img/4-poster3.png"],
    velocidad: VELOCIDAD.RAPIDA,
    capa: 4,
    interactivo: true,
    tipo: "ambos",
    foto: "img/poster.jpg", 
    carta: "Esta es la fecha en la que empezó todo. ¡Te quiero muchísimo, Sofi!", 
    hitbox: { left: 10, top: 25, width: 20, height: 25 }
  },
  {
    nombre: "calendario",
    archivos: ["img/4-calendario1.png", "img/4-calendario2.png"],
    velocidad: VELOCIDAD.NORMAL,
    capa: 4,
    interactivo: true,
    tipo: "ambos",
    foto: "img/calendario.jpg", 
    carta: "Esta es la fecha en la que empezó todo. ¡Te quiero muchísimo, Sofi!",
    hitbox: { left: 70, top: 70, width: 20, height: 15 }
  },
  {
    nombre: "sobre",
    archivos: ["img/4-sobre1.png", "img/4-sobre2.png", "img/4-sobre3.png"],
    velocidad: VELOCIDAD.LENTA,
    capa: 4,
    interactivo: true,
    tipo: "carta",
    carta: "Escribí acá el texto de la carta que querés mostrar cuando se toca el sobre.",
    hitbox: { left: 70, top: 80, width: 20, height: 10 }
  },
  {
    nombre: "tocadiscos",
    archivos: ["img/10-tocadiscos1.png", "img/10-tocadiscos2.png"],
    velocidad: VELOCIDAD.NORMAL,
    capa: 10,
    interactivo: true,
    hitbox: { left: 10, top: 70, width: 25, height: 15 }
  },
  {
    nombre: "tele",
    archivos: ["img/10-tele1.png", "img/10-tele2.png"],
    velocidad: VELOCIDAD.RAPIDA,
    capa: 10,
    interactivo: true,
    tipo: "ambos",
    foto: "img/tele.jpg", 
    carta: "Esta es la fecha en la que empezó todo. ¡Te quiero muchísimo, Sofi!",
    hitbox: { left: 35, top: 50, width: 30, height: 15 }
  },
];

const LIENZO_ANCHO = 1080;
const LIENZO_ALTO = 1920;
const DURACION_BASE_FRAME = 700;
const UMBRAL_ALFA = 20;

const barraCarga = document.getElementById("barra-carga");
const pantallaCarga = document.getElementById("pantalla-carga");

function listaDeRutasAPrecargar() {
  const rutas = new Set(["img/fondoestatico.png"]);
  objetos.forEach((obj) => obj.archivos.forEach((a) => rutas.add(a)));
  return Array.from(rutas);
}

const cacheImagenes = new Map();

function precargarTodo() {
  const rutas = listaDeRutasAPrecargar();
  let cargadas = 0;

  const promesas = rutas.map(
    (ruta) =>
      new Promise((resolve) => {
        const img = new Image();
        img.decoding = "async";
        img.onload = async () => {
          try {
            if (img.decode) await img.decode();
          } catch (e) {}
          cacheImagenes.set(ruta, img);
          cargadas++;
          barraCarga.style.width = `${Math.round((cargadas / rutas.length) * 100)}%`;
          resolve();
        };
        img.onerror = () => {
          console.error(`No se pudo cargar: ${ruta}`);
          cargadas++;
          resolve();
        };
        img.src = ruta;
      })
  );

  return Promise.all(promesas);
}

const capaObjetos = document.getElementById("capa-objetos");
const estadoObjetos = [];

function construirEscena() {
  objetos.forEach((obj) => {
    const el = document.createElement("img");
    el.className = "objeto" + (obj.interactivo ? " es-interactivo" : "");
    el.style.zIndex = String(obj.capa);
    el.draggable = false;
    el.alt = "";
    el.decoding = "async";

    if (obj.region) {
      el.style.left = `${obj.region.x}%`;
      el.style.top = `${obj.region.y}%`;
      el.style.width = `${obj.region.w}%`;
      el.style.height = `${obj.region.h}%`;
      el.style.inset = "auto";
    }

    const frameInicial = Math.floor(Math.random() * obj.archivos.length);
    const imgInicial = cacheImagenes.get(obj.archivos[frameInicial]);
    el.src = imgInicial ? imgInicial.src : obj.archivos[frameInicial];

    capaObjetos.appendChild(el);

    estadoObjetos.push({
      config: obj,
      el,
      frameActual: frameInicial,
      tiempoAcumulado: Math.random() * (DURACION_BASE_FRAME / obj.velocidad),
      duracionFrame: DURACION_BASE_FRAME / obj.velocidad,
    });
  });
}

let ultimoTimestamp = null;
let animando = true;
let idAnimacion = null;

function paso(timestamp) {
  if (!animando) return;
  if (ultimoTimestamp === null) ultimoTimestamp = timestamp;
  const dt = timestamp - ultimoTimestamp;
  ultimoTimestamp = timestamp;

  for (const estado of estadoObjetos) {
    estado.tiempoAcumulado += dt;
    while (estado.tiempoAcumulado >= estado.duracionFrame) {
      estado.tiempoAcumulado -= estado.duracionFrame;
      avanzarFrame(estado);
    }
  }

  idAnimacion = requestAnimationFrame(paso);
}

function avanzarFrame(estado) {
  const archivos = estado.config.archivos;
  estado.frameActual = (estado.frameActual + 1) % archivos.length;
  const siguiente = cacheImagenes.get(archivos[estado.frameActual]);
  estado.el.src = siguiente ? siguiente.src : archivos[estado.frameActual];
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    animando = false;
    if (idAnimacion) cancelAnimationFrame(idAnimacion);
  } else {
    animando = true;
    ultimoTimestamp = null;
    idAnimacion = requestAnimationFrame(paso);
  }
});

const stageWrapper = document.getElementById("stage-wrapper");
const stage = document.getElementById("stage");

function ajustarEscenario() {
  const anchoDisponible = stageWrapper.clientWidth;
  const altoDisponible = stageWrapper.clientHeight;
  const proporcionLienzo = LIENZO_ANCHO / LIENZO_ALTO;
  const proporcionDisponible = anchoDisponible / altoDisponible;

  let anchoFinal, altoFinal;
  if (proporcionDisponible > proporcionLienzo) {
    altoFinal = altoDisponible;
    anchoFinal = altoDisponible * proporcionLienzo;
  } else {
    anchoFinal = anchoDisponible;
    altoFinal = anchoDisponible / proporcionLienzo;
  }

  stage.style.width = `${anchoFinal}px`;
  stage.style.height = `${altoFinal}px`;
}

let resizeTimeout = null;
function pedirAjuste() {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(ajustarEscenario, 60);
}
window.addEventListener("resize", pedirAjuste);
window.addEventListener("orientationchange", pedirAjuste);

const canvasAlfa = document.createElement("canvas");
const ctxAlfa = canvasAlfa.getContext("2d", { willReadFrequently: true });

function alfaEnPunto(img, xImagen, yImagen) {
  const ancho = img.naturalWidth;
  const alto = img.naturalHeight;
  if (!ancho || !alto) return 0;
  if (xImagen < 0 || yImagen < 0 || xImagen >= ancho || yImagen >= alto) return 0;

  if (canvasAlfa.width !== ancho || canvasAlfa.height !== alto) {
    canvasAlfa.width = ancho;
    canvasAlfa.height = alto;
  }
  ctxAlfa.clearRect(0, 0, ancho, alto);
  ctxAlfa.drawImage(img, 0, 0, ancho, alto);

  const datos = ctxAlfa.getImageData(Math.floor(xImagen), Math.floor(yImagen), 1, 1).data;
  return datos[3];
}

const interactivosOrdenados = () =>
  estadoObjetos
    .filter((e) => e.config.interactivo)
    .sort((a, b) => b.config.capa - a.config.capa);

function manejarToque(clientX, clientY) {
  const rect = stage.getBoundingClientRect();
  const xRel = (clientX - rect.left) / rect.width;
  const yRel = (clientY - rect.top) / rect.height;
  if (xRel < 0 || xRel > 1 || yRel < 0 || yRel > 1) return;

  const clickPorcX = xRel * 100;
  const clickPorcY = yRel * 100;

  if (modoDebug) mostrarInfoDebug(clickPorcX, clickPorcY);

  for (const estado of interactivosOrdenados()) {
    if (estado.config.hitbox) {
      const hb = estado.config.hitbox;
      if (clickPorcX >= hb.left && clickPorcX <= (hb.left + hb.width) &&
          clickPorcY >= hb.top && clickPorcY <= (hb.top + hb.height)) {
        abrirModal(estado.config, xRel, yRel);
        return; 
      }
      continue; 
    }

    const dx = xRel * LIENZO_ANCHO;
    const dy = yRel * LIENZO_ALTO;
    
    const region = estado.config.region || { x: 0, y: 0, w: 100, h: 100 };
    const cajaX = (region.x / 100) * LIENZO_ANCHO;
    const cajaY = (region.y / 100) * LIENZO_ALTO;
    const cajaAncho = (region.w / 100) * LIENZO_ANCHO;
    const cajaAlto = (region.h / 100) * LIENZO_ALTO;

    if (dx < cajaX || dx > cajaX + cajaAncho || dy < cajaY || dy > cajaY + cajaAlto) {
      continue;
    }

    const xImagen = ((dx - cajaX) / cajaAncho) * estado.el.naturalWidth;
    const yImagen = ((dy - cajaY) / cajaAlto) * estado.el.naturalHeight;

    if (alfaEnPunto(estado.el, xImagen, yImagen) >= UMBRAL_ALFA) {
      abrirModal(estado.config, xRel, yRel);
      return;
    }
  }
}

stage.addEventListener(
  "pointerdown",
  (ev) => {
    if (modalAbierto) return;
    manejarToque(ev.clientX, ev.clientY);
  },
  { passive: true }
);

const overlayOscuro = document.getElementById("overlay-oscuro");
const modal = document.getElementById("modal");
const modalContenido = document.getElementById("modal-contenido");
const modalFoto = document.getElementById("modal-foto");
const modalCartaTexto = document.getElementById("modal-carta-texto");
const modalCerrar = document.getElementById("modal-cerrar");
const modalFondo = document.getElementById("modal-fondo");

let modalAbierto = false;

function abrirModal(configObjeto, xRel, yRel) {
  modalAbierto = true;
  stage.style.transformOrigin = `${xRel * 100}% ${yRel * 100}%`;
  stage.classList.add("zoom");
  overlayOscuro.classList.add("visible");

  modalContenido.classList.remove("modo-foto", "modo-carta");
  if (configObjeto.tipo === "foto" || configObjeto.tipo === "ambos") {
    modalContenido.classList.add("modo-foto");
    modalFoto.src = configObjeto.foto || "";
  }
  if (configObjeto.tipo === "carta" || configObjeto.tipo === "ambos") {
    modalContenido.classList.add("modo-carta");
    modalCartaTexto.textContent = configObjeto.carta || "";
  }

  modal.classList.add("abierto");
  modal.setAttribute("aria-hidden", "false");
}

function cerrarModal() {
  modalAbierto = false;
  modal.classList.remove("abierto");
  modal.setAttribute("aria-hidden", "true");
  stage.classList.remove("zoom");
  overlayOscuro.classList.remove("visible");
}

modalCerrar.addEventListener("click", cerrarModal);
modalFondo.addEventListener("click", cerrarModal);
document.addEventListener("keydown", (ev) => {
  if (ev.key === "Escape") cerrarModal();
});

const modoDebug = new URLSearchParams(location.search).has("debug");
let panelDebug = null;

function mostrarInfoDebug(porcX, porcY) {
  if (!panelDebug) {
    panelDebug = document.createElement("div");
    panelDebug.id = "debug-info";
    document.body.appendChild(panelDebug);
  }
  panelDebug.textContent = `TOCASTE EN:\nleft: ${porcX.toFixed(1)}%\ntop: ${porcY.toFixed(1)}%`;
}

// ===== ASISTENTE VISUAL DE HITBOXES =====
function activarContornosDebug() {
  document.querySelectorAll(".objeto").forEach((el) => el.classList.add("debug-contorno"));

  // Dibuja las cajas rojas en pantalla basándose en tu configuración
  objetos.forEach(obj => {
    if (obj.hitbox) {
      const cajaRoja = document.createElement("div");
      cajaRoja.style.position = "absolute";
      cajaRoja.style.left = obj.hitbox.left + "%";
      cajaRoja.style.top = obj.hitbox.top + "%";
      cajaRoja.style.width = obj.hitbox.width + "%";
      cajaRoja.style.height = obj.hitbox.height + "%";
      cajaRoja.style.backgroundColor = "rgba(255, 0, 0, 0.4)";
      cajaRoja.style.border = "2px solid red";
      cajaRoja.style.zIndex = "999";
      cajaRoja.style.pointerEvents = "none"; 
      
      const etiqueta = document.createElement("span");
      etiqueta.textContent = obj.nombre;
      etiqueta.style.color = "white";
      etiqueta.style.backgroundColor = "black";
      etiqueta.style.fontSize = "12px";
      etiqueta.style.padding = "2px";
      etiqueta.style.position = "absolute";
      etiqueta.style.top = "0";
      etiqueta.style.left = "0";
      
      cajaRoja.appendChild(etiqueta);
      stage.appendChild(cajaRoja);
    }
  });
}

precargarTodo().then(() => {
  construirEscena();
  ajustarEscenario();
  if (modoDebug) activarContornosDebug();

  pantallaCarga.classList.add("oculta");
  ultimoTimestamp = null;
  idAnimacion = requestAnimationFrame(paso);
});
