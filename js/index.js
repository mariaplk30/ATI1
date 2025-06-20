function formatearLista(list) {
    if (!list || list.length === 0) return '';
    if (list.length === 1) return list[0];
    const last = list.pop();
    return list.join(", ") + " y " + last;
}

function configurarEstructura(config) {
    const titulo = document.querySelector(".titulo");
    if (titulo) {
        titulo.innerHTML = `${config.sitio[0]}<span>${config.sitio[1]}</span> ${config.sitio[2]}`;
    }

    const saludo = document.querySelector(".texto-centro");
    if (saludo) saludo.textContent = config.saludo + ", ";

    const inputNombre = document.querySelector('input[type="text"]');
    if (inputNombre) inputNombre.placeholder = config.nombre + "...";

    const botonBuscar = document.querySelector('input[type="submit"]');
    if (botonBuscar) botonBuscar.value = config.buscar;

    const footer = document.querySelector("footer");
    if (footer) footer.textContent = config.copyRight;
}

function cargarIndex(config, lang) {
    document.body.className = "index";
    configurarEstructura(config);

    const section = document.querySelector("section");
    section.innerHTML = '<ul class="estudiantes"></ul>';
    const lista = section.querySelector(".estudiantes");

    fetch("./datos/index.json")
        .then(response => response.json())
        .then(perfiles => {
            mostrarEstudiantes(perfiles);

            const campoBusqueda = document.querySelector('input[type="text"]');
            campoBusqueda.addEventListener("input", (e) => {
                const query = e.target.value.trim().toLowerCase();
                const filtrados = perfiles.filter(est =>
                    est.nombre.toLowerCase().includes(query)
                );
                mostrarEstudiantes(filtrados, query);
            });

            function mostrarEstudiantes(estudiantesFiltrados, query = "") {
                const mensajeAnterior = document.querySelector(".mensaje-no-coincidencias");
                if (mensajeAnterior) mensajeAnterior.remove();

                lista.innerHTML = "";

                if (estudiantesFiltrados.length === 0) {
                    const contenedorMensaje = document.createElement("div");
                    contenedorMensaje.classList.add("mensaje-no-coincidencias", "sin-coincidencias");
                    contenedorMensaje.textContent = config.noCoincidencias.replace("[query]", query);
                    lista.parentNode.insertBefore(contenedorMensaje, lista.nextSibling);
                    return;
                }

                estudiantesFiltrados.forEach(est => {
                    const li = document.createElement("li");
                    li.classList.add("estudiante-item");
                    li.innerHTML = `
                        <img src="${est.imagen}" alt="Foto de ${est.nombre}">
                        <p>${est.nombre}</p>
                    `;
                    li.addEventListener("click", () => {
                        history.pushState(null, "", `?ci=${est.ci}&lang=${lang}`);
                        cargarPerfil(config, lang, est.ci);
                    });
                    li.style.cursor = "pointer";
                    lista.appendChild(li);
                });
            }
        });
}

function cargarPerfil(config, lang, ci) {
    document.body.className = "perfil";

    // Ocultar encabezado y sección previa
    const header = document.querySelector("header");
    const section = document.querySelector("section");
    const footer = document.querySelector("footer");

    if (header) header.style.display = "none";
    if (footer) footer.style.display = "none";
    if (section) section.remove();

    // Crear nuevo contenedor para el perfil
    const contenedor = document.createElement("div");
    contenedor.className = "contenedor";
    document.body.appendChild(contenedor);

    fetch(`/ATI/${ci}/perfil.json`)
        .then(response => {
            if (!response.ok) throw new Error("No se pudo cargar el perfil.");
            return response.json();
        })
        .then(perfil => {
            contenedor.innerHTML = `
                <div class="contenedor-foto">
                <picture>
                <img
                    id="foto-perfil"
                    src="./${ci}/${ci}.jpg"
                    alt="Foto del estudiante"
                    onerror="this.onerror=null;this.src='./${ci}/${ci}.png'"
                    style="display: block; width: 200px;"
                >
                </picture>
                </div>
                <div class="info-contenedor">
                    <div class="nombre" id="nombre-perfil">${perfil.nombre}</div>
                    <p class="bio" id="bio-perfil">${perfil.descripcion}</p>
                    <div class="preferencias">
                        <div id="lbl-color">${config.color}</div><div id="pref-color">${perfil.color}</div>
                        <div id="lbl-libro">${config.libro}</div><div id="pref-libro">${perfil.libro}</div>
                        <div id="lbl-musica">${config.musica}</div><div id="pref-musica">${formatearLista(perfil.musica)}</div>
                        <div id="lbl-videojuego">${config.video_juego}</div><div id="pref-videojuego">${formatearLista(perfil.video_juego)}</div>
                        <div id="lbl-lenguajes"><b>${config.lenguajes}</b></div><div id="pref-lenguajes"><b>${formatearLista(perfil.lenguajes)}</b></div>
                    </div>
                    <div class="contacto" id="contacto-texto">
                        ${config.email.replace("[email]", `<a id="email-perfil" href="mailto:${perfil.email}">${perfil.email}</a>`)}
                    </div>
                </div>
            `;
        })
        .catch(error => {
            console.error("Error al cargar el perfil:", error);
            contenedor.innerHTML = "<p>Error al cargar el perfil del estudiante.</p>";
        });
}

window.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const lang = params.get("lang") || "es";
    const ci = params.get("ci");
    const configPath = `./conf/config${lang.toUpperCase()}.json`;

    fetch(configPath)
        .then(res => res.json())
        .then(config => {
            if (ci) {
                cargarPerfil(config, lang, ci);
            } else {
                cargarIndex(config, lang);
            }
        });
});

// Detectar navegación atrás/adelante y actualizar la vista
window.addEventListener("popstate", () => {
    const params = new URLSearchParams(window.location.search);
    const lang = params.get("lang") || "es";
    const ci = params.get("ci");

    fetch(`./conf/config${lang.toUpperCase()}.json`)
        .then(res => res.json())
        .then(config => {
            limpiarVista();

            if (ci) {
                cargarPerfil(config, lang, ci);
            } else {
                mostrarLayoutBase(); // restaura <header>, <footer>, etc.
                cargarIndex(config, lang);
            }
        });
});

function limpiarVista() {
    // Limpia perfil si está cargado
    const perfilContenedor = document.querySelector(".contenedor");
    if (perfilContenedor) perfilContenedor.remove();

    // Limpia section duplicada si existe
    const section = document.querySelector("section");
    if (section) section.remove();
}

function mostrarLayoutBase() {
    const header = document.querySelector("header");
    const footer = document.querySelector("footer");
    if (header) header.style.display = "";
    if (footer) footer.style.display = "";

    const nuevaSeccion = document.createElement("section");
    nuevaSeccion.innerHTML = '<ul class="estudiantes"></ul>';
    document.body.insertBefore(nuevaSeccion, footer);
}
