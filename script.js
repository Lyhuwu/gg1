/* ================================================================
   SALA INTERACTIVA — script.js
   ================================================================
   Todo el comportamiento vive en este único archivo:
     1) Configuración declarativa de los dibujos (el único lugar
        que tendrás que tocar para agregar un dibujo nuevo).
     2) Precarga de imágenes.
     3) Motor de animación único, basado en deltaTime.
     4) Ajuste responsive del escenario (nunca se recorta ni deforma).
     5) Detección de toques "pixel-perfect" usando el canal alfa.
     6) Ventana modal elegante (foto / carta).

   SUPUESTO IMPORTANTE sobre los PNG animados
   -------------------------------------------------------------
   Dijiste: "Cada PNG únicamente contiene la parte que cambia. Todo
   lo demás ya está dentro de fondoestatico.png." Por eso este
   script asume, por defecto, que cada frame es un PNG del MISMO
   tamaño que el fondo (1080x1920), con todo transparente salvo el
   trocito que dibuja. Así, cada frame se puede colocar cubriendo
   TODO el escenario (inset: 0) sin necesitar coordenadas x/y.

   Si alguno de tus dibujos en realidad es un recorte más chico
   (no del tamaño completo del lienzo), simplemente agrégale un
   campo "region" a ese objeto (ver ejemplo comentado más abajo) y
   el motor lo posicionará ahí en vez de a pantalla completa.
   ================================================================ */


/* ----------------------------------------------------------------
   1) CONFIGURACIÓN — el único lugar que necesitas editar
   ----------------------------------------------------------------
   Campos de cada objeto:
     nombre      -> solo identificador interno
     archivos    -> lista de frames, en orden de animación
     velocidad   -> multiplicador de velocidad (1 = normal).
                    Los valores ya están elegidos según lo que
                    pediste (muy lenta / lenta / normal / media /
                    rápida). Podés afinar cada número libremente.
     capa        -> el prefijo numérico de tus archivos (2, 4, 10...)
                    se usa tal cual como z-index: así el orden de
                    apilado sale solo de tu propia nomenclatura y
                    no hay que mantenerlo a mano en ningún lado.
     interactivo -> true/false. Si es true, hace falta "tipo" y el
                    contenido (foto y/o carta).
     tipo        -> "foto" | "carta" | "ambos"
     foto        -> ruta a la imagen que se muestra en el modal
     carta       -> texto de la carta (podés usar \n para saltos
                    de línea, o directamente escribir el texto
                    entre backticks en varias líneas)
     region      -> OPCIONAL. Si el PNG no cubre el lienzo completo
                    sino que es un recorte, definí acá su caja en
                    porcentaje del lienzo 1080x1920:
                    { x: 10, y: 20, w: 30, h: 15 }
                    Si no lo definís, se asume pantalla completa.

   Marqué como interactivos "sobre", "marco" y "poster" a modo de
   ejemplo (parecen buenos candidatos para carta/foto por lo que
   representan). Cambiá "interactivo" a true/false en cualquiera
   según lo que corresponda en tu escena, y completá las rutas de
   foto/carta reales.
   ---------------------------------------------------------------- */

// Multiplicadores de velocidad con nombre, tal como los pediste.
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
    archivos: ["2-ventana1.png", "2-ventana2.png", "2-ventana3.png"],
    velocidad: VELOCIDAD.MUY_LENTA,
    capa: 2,
    interactivo: false,
  },
  {
    nombre: "florero",
    archivos: ["4-florero1.png", "4-florero2.png"],
    velocidad: VELOCIDAD.LENTA,
    capa: 4,
    interactivo: false,
  },
  {
    nombre: "marco",
    archivos: ["4-marco1.png", "4-marco2.png", "4-marco3.png", "4-marco4.png"],
    velocidad: VELOCIDAD.MUY_LENTA,
    capa: 4,
    interactivo: true,
    tipo: "foto",
    foto: "fotos/marco-1.jpg", // <- reemplazá por tu imagen real
  },
  {
    nombre: "pinwi",
    archivos: ["4-pinwi1.png", "4-pinwi2.png"],
    velocidad: VELOCIDAD.NORMAL,
    capa: 4,
    interactivo: false,
  },
  {
    nombre: "pollito",
    archivos: ["4-pollito1.png", "4-pollito2.png", "4-pollito3.png", "4-pollito4.png"],
    velocidad: VELOCIDAD.RAPIDA,
    capa: 4,
    interactivo: false,
  },
  {
    nombre: "poster",
    archivos: ["4-poster1.png", "4-poster2.png", "4-poster3.png"],
    velocidad: VELOCIDAD.LENTA,
    capa: 4,
    interactivo: true,
    tipo: "foto",
    foto: "fotos/poster-1.jpg", // <- reemplazá por tu imagen real
  },
  {
    nombre: "sobre",
    archivos: ["4-sobre1.png", "4-sobre2.png", "4-sobre3.png"],
    velocidad: VELOCIDAD.LENTA,
    capa: 4,
    interactivo: true,
    tipo: "carta",
    carta: "Escribí acá el texto de la carta que querés mostrar cuando se toca el sobre.",
  },
  {
    nombre: "tocadiscos",
    archivos: ["10-tocadiscos1.png", "10-tocadiscos2.png"],
    velocidad: VELOCIDAD.MEDIA,
    capa: 10,
    interactivo: false,
  },
  {
    nombre: "tele",
    archivos: ["10-tele1.png", "10-tele2.png"],
    velocidad: VELOCIDAD.NORMAL,
    capa: 10,
    interactivo: false,
  },
];

// Tamaño de diseño del fondo. No cambiar salvo que cambies el PNG.
const LIENZO_ANCHO = 1080;
const LIENZO_ALTO = 1920;

// Duración base de un frame (ms) antes de aplicar el multiplicador
// de "velocidad" de cada objeto. Bajalo para que todo se mueva más
// rápido en general, subilo para que todo se mueva más lento.
const DURACION_BASE_FRAME = 700;

// Por debajo de este valor de alfa (0-255) se considera "transparente"
// y por lo tanto el toque lo atraviesa sin activar nada.
const UMBRAL_ALFA = 20;


/* ----------------------------------------------------------------
   2) PRECARGA
   ---------------------------------------------------------------- */

const barraCarga = document.getElementById("barra-carga");
const pantallaCarga = document.getElementById("pantalla-carga");

// Reunimos en un solo listado todas las rutas a precargar: el fondo
// más cada frame de cada objeto. Evitamos duplicados por si acaso.
function listaDeRutasAPrecargar() {
  const rutas = new Set(["fondoestatico.png"]);
  objetos.forEach((obj) => obj.archivos.forEach((a) => rutas.add(a)));
  return Array.from(rutas);
}

// Guardamos cada <img> ya cargada en un mapa ruta -> elemento, para
// no volver a crear ni descargar nada durante la animación.
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
          // Forzamos la decodificación completa AHORA (durante la
          // pantalla de carga) en vez de dejar que el navegador la
          // haga la primera vez que se pinte cada frame. Así, cuando
          // el motor cambie el src de un <img> en pleno vuelo, el
          // navegador ya tiene el bitmap listo y solo repinta esa
          // región, sin decodificar nada nuevo.
          try {
            if (img.decode) await img.decode();
          } catch (e) {
            /* si decode() falla igual seguimos: el navegador decodificará al pintar */
          }
          cacheImagenes.set(ruta, img);
          cargadas++;
          barraCarga.style.width = `${Math.round((cargadas / rutas.length) * 100)}%`;
          resolve();
        };
        img.onerror = () => {
          // No frenamos toda la escena por una imagen faltante:
          // avisamos en consola y seguimos.
          console.error(`No se pudo cargar: ${ruta}`);
          cargadas++;
          resolve();
        };
        img.src = ruta;
      })
  );

  return Promise.all(promesas);
}


/* ----------------------------------------------------------------
   3) CONSTRUCCIÓN DEL DOM A PARTIR DE LA CONFIGURACIÓN
   ---------------------------------------------------------------- */

const capaObjetos = document.getElementById("capa-objetos");

// Guardamos acá el estado "vivo" de cada objeto (frame actual,
// tiempo acumulado, elementos DOM) para que el loop de animación
// no tenga que recalcular nada innecesariamente.
const estadoObjetos = [];

function construirEscena() {
  objetos.forEach((obj) => {
    // Un único <img> por dibujo. Todos sus frames ya están precargados
    // y decodificados en cacheImagenes; durante la animación solo se
    // reasigna la propiedad .src de ESTE MISMO elemento (más abajo, en
    // avanzarFrame), nunca se crea ni se destruye ningún <img>.
    const el = document.createElement("img");
    el.className = "objeto" + (obj.interactivo ? " es-interactivo" : "");
    el.style.zIndex = String(obj.capa);
    el.draggable = false;
    el.alt = "";
    el.decoding = "async";

    // Si el objeto define una región propia (recorte más chico que
    // el lienzo completo), lo posicionamos ahí; si no, cubre todo.
    if (obj.region) {
      el.style.left = `${obj.region.x}%`;
      el.style.top = `${obj.region.y}%`;
      el.style.width = `${obj.region.w}%`;
      el.style.height = `${obj.region.h}%`;
      el.style.inset = "auto";
    }

    // Frame inicial aleatorio, para que no todos arranquen mostrando
    // el mismo fotograma.
    const frameInicial = Math.floor(Math.random() * obj.archivos.length);
    const imgInicial = cacheImagenes.get(obj.archivos[frameInicial]);
    el.src = imgInicial ? imgInicial.src : obj.archivos[frameInicial];

    capaObjetos.appendChild(el);

    estadoObjetos.push({
      config: obj,
      el,
      frameActual: frameInicial,
      // Desfase de tiempo aleatorio (0 a la duración de un frame)
      // para que los cambios de frame no queden sincronizados entre
      // dibujos distintos.
      tiempoAcumulado: Math.random() * (DURACION_BASE_FRAME / obj.velocidad),
      duracionFrame: DURACION_BASE_FRAME / obj.velocidad,
    });
  });
}


/* ----------------------------------------------------------------
   4) MOTOR DE ANIMACIÓN (único, basado en deltaTime)
   ---------------------------------------------------------------- */

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

    // "while" (no "if") por si el dispositivo tuvo un frame largo
    // y hay que saltar más de un frame de golpe para no acumular
    // atraso.
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
  // Reasignamos el src del MISMO <img> a un frame ya precargado y
  // decodificado: el navegador reutiliza el bitmap que ya tiene en su
  // caché de imágenes decodificadas, así que esto es solo un repintado
  // puntual del elemento, no una descarga ni una decodificación nueva.
  const siguiente = cacheImagenes.get(archivos[estado.frameActual]);
  estado.el.src = siguiente ? siguiente.src : archivos[estado.frameActual];
}

// Pausa automática al ocultar la pestaña, y reanudación limpia
// (sin "saltos" por el tiempo transcurrido mientras estaba oculta).
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


/* ----------------------------------------------------------------
   5) AJUSTE RESPONSIVE DEL ESCENARIO
   ----------------------------------------------------------------
   El CSS ya deja el escenario bien encaminado con aspect-ratio,
   pero calculamos el tamaño exacto en píxeles a mano para
   garantizar el mismo resultado ("contain", sin recortes ni
   deformación) en todos los navegadores, incluyendo Safari/iOS
   en distintas versiones. Solo corre al iniciar y al rotar/cambiar
   tamaño de ventana, nunca dentro del loop de animación.
   ---------------------------------------------------------------- */

const stageWrapper = document.getElementById("stage-wrapper");
const stage = document.getElementById("stage");

function ajustarEscenario() {
  const anchoDisponible = stageWrapper.clientWidth;
  const altoDisponible = stageWrapper.clientHeight;
  const proporcionLienzo = LIENZO_ANCHO / LIENZO_ALTO;
  const proporcionDisponible = anchoDisponible / altoDisponible;

  let anchoFinal, altoFinal;
  if (proporcionDisponible > proporcionLienzo) {
    // La pantalla es relativamente más ancha que el lienzo: el alto manda.
    altoFinal = altoDisponible;
    anchoFinal = altoDisponible * proporcionLienzo;
  } else {
    // La pantalla es relativamente más angosta (o más "vertical"): el ancho manda.
    anchoFinal = anchoDisponible;
    altoFinal = anchoDisponible / proporcionLienzo;
  }

  stage.style.width = `${anchoFinal}px`;
  stage.style.height = `${altoFinal}px`;
}

let resizeTimeout = null;
function pedirAjuste() {
  // pequeño debounce: evita recalcular decenas de veces durante un
  // gesto de rotación o un resize arrastrado
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(ajustarEscenario, 60);
}
window.addEventListener("resize", pedirAjuste);
window.addEventListener("orientationchange", pedirAjuste);


/* ----------------------------------------------------------------
   6) DETECCIÓN DE TOQUES "PIXEL-PERFECT" (canal alfa)
   ----------------------------------------------------------------
   Ningún <img> recibe eventos de puntero (ver pointer-events:none
   en el CSS); en cambio, un único listener en el escenario calcula
   en qué punto del lienzo de diseño (0-1080 x 0-1920) cayó el toque,
   y recorre los objetos interactivos de capa más alta a más baja
   preguntando "¿el píxel tocado de tu frame actual es opaco?".
   El primero que responda que sí gana el toque; si ninguno responde
   que sí, el toque no hace nada (cayó en una zona transparente).
   ---------------------------------------------------------------- */

// Canvas único y reutilizado para no crear/destruir canvases en cada toque.
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
  return datos[3]; // canal alfa
}

// Interactivos ordenados de capa más alta a más baja: el que está
// "más arriba" visualmente debe ganar el toque si hay superposición.
const interactivosOrdenados = () =>
  estadoObjetos
    .filter((e) => e.config.interactivo)
    .sort((a, b) => b.config.capa - a.config.capa);

function manejarToque(clientX, clientY) {
  const rect = stage.getBoundingClientRect();
  const xRel = (clientX - rect.left) / rect.width; // 0..1
  const yRel = (clientY - rect.top) / rect.height; // 0..1
  if (xRel < 0 || xRel > 1 || yRel < 0 || yRel > 1) return;

  const dx = xRel * LIENZO_ANCHO; // coordenada en el lienzo de diseño
  const dy = yRel * LIENZO_ALTO;

  if (modoDebug) mostrarInfoDebug(dx, dy);

  for (const estado of interactivosOrdenados()) {
    const region = estado.config.region || { x: 0, y: 0, w: 100, h: 100 };
    const cajaX = (region.x / 100) * LIENZO_ANCHO;
    const cajaY = (region.y / 100) * LIENZO_ALTO;
    const cajaAncho = (region.w / 100) * LIENZO_ANCHO;
    const cajaAlto = (region.h / 100) * LIENZO_ALTO;

    if (dx < cajaX || dx > cajaX + cajaAncho || dy < cajaY || dy > cajaY + cajaAlto) {
      continue; // el toque ni siquiera cae en la caja de este objeto
    }

    // estado.el es un único <img> que en todo momento muestra el frame
    // actual de este objeto, así que sus dimensiones/contenido ya
    // corresponden al fotograma que el usuario está viendo y tocando.
    const xImagen = ((dx - cajaX) / cajaAncho) * estado.el.naturalWidth;
    const yImagen = ((dy - cajaY) / cajaAlto) * estado.el.naturalHeight;

    if (alfaEnPunto(estado.el, xImagen, yImagen) >= UMBRAL_ALFA) {
      abrirModal(estado.config, xRel, yRel);
      return; // encontramos el objeto opaco más arriba: listo
    }
  }
  // Si llegamos hasta acá, el toque cayó en zona transparente: no pasa nada.
}

stage.addEventListener(
  "pointerdown",
  (ev) => {
    // Ignoramos toques mientras el modal está abierto (los maneja el modal).
    if (modalAbierto) return;
    manejarToque(ev.clientX, ev.clientY);
  },
  { passive: true }
);


/* ----------------------------------------------------------------
   7) MODAL (foto / carta)
   ---------------------------------------------------------------- */

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

  // El zoom del escenario se orienta hacia el punto exacto tocado.
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


/* ----------------------------------------------------------------
   8) MODO DEBUG (opcional)
   ----------------------------------------------------------------
   Agregá "?debug" al final de la URL (ej: index.html?debug) para:
     - ver un contorno punteado sobre cada objeto
     - ver en pantalla las coordenadas de diseño (0-1080 / 0-1920)
       de cada toque, para calibrar regiones si algún dibujo no es
       de pantalla completa.
   ---------------------------------------------------------------- */

const modoDebug = new URLSearchParams(location.search).has("debug");
let panelDebug = null;

function mostrarInfoDebug(dx, dy) {
  if (!panelDebug) {
    panelDebug = document.createElement("div");
    panelDebug.id = "debug-info";
    document.body.appendChild(panelDebug);
  }
  panelDebug.textContent = `toque en lienzo: x=${dx.toFixed(0)}  y=${dy.toFixed(0)}`;
}

function activarContornosDebug() {
  document.querySelectorAll(".objeto").forEach((el) => el.classList.add("debug-contorno"));
}


/* ----------------------------------------------------------------
   9) ARRANQUE
   ---------------------------------------------------------------- */

precargarTodo().then(() => {
  construirEscena();
  ajustarEscenario();
  if (modoDebug) activarContornosDebug();

  pantallaCarga.classList.add("oculta");
  ultimoTimestamp = null;
  idAnimacion = requestAnimationFrame(paso);
});
