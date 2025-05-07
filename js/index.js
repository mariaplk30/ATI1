function formatearLista(list) {
    if (list.length <= 1) {
        return list.join(", ");
    } else {
        const lastElement = list.pop();
        return list.join(", ") + " y " + lastElement;
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    const lang = params.get("lang") || "es";
    const configPath = `./conf/config${lang.toUpperCase()}.json`;
    let config = null;

    // Cargar configuración
    fetch(configPath)
        .then(response => {
            if (!response.ok) throw new Error("Error al cargar configuración");
            return response.json();
        })
        .then(json => {
            config = json;
            console.log("Configuración cargada:", config);

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

            // Si estamos en perfil.html, continúa con la carga del perfil
            if (window.location.pathname.includes("perfil.html")) {
                cargarPerfil(config, lang);
            }
        })
        .catch(error => {
            console.error("Error al cargar configuración:", error);
        });

    // Cargar estudiantes en index.html
    if (window.location.pathname.includes("index.html") || window.location.pathname.endsWith("/")) {
        fetch("./datos/index.json")
            .then(response => {
                if (!response.ok) throw new Error("Error al cargar estudiantes");
                return response.json();
            })
            .then(perfiles => {
                const lista = document.querySelector(".estudiantes");

                perfiles.forEach(est => {
                    const li = document.createElement("li");
                    li.classList.add("estudiante-item");

                    li.innerHTML = `
                        <img src="${est.imagen}" alt="Foto de ${est.nombre}">
                        <p>${est.nombre}</p>
                    `;

                    li.addEventListener("click", () => {
                        window.location.href = `perfil.html?ci=${est.ci}&lang=${lang}`;
                    });

                    li.style.cursor = "pointer";
                    lista.appendChild(li);
                });
            })
            .catch(error => {
                console.error("Error al cargar estudiantes:", error);
            });
    }
});

function cargarPerfil(config, lang) {
    const params = new URLSearchParams(window.location.search);
    const ci = params.get("ci");

    if (!ci) {
        const infoContenedor = document.querySelector(".info-contenedor");
        if (infoContenedor) {
            infoContenedor.innerHTML = "<p>No se especificó un perfil válido.</p>";
        }
        return;
    }

    fetch(`./${ci}/perfil.json`)
        .then(response => {
            if (!response.ok) throw new Error("No se pudo cargar el perfil.");
            return response.json();
        })
        .then(perfil => {
            console.log("Perfil cargado:", perfil);

            function buscarImagen(imageElement, ci) {
                const imagePath = `${ci}/${ci}`;
                imageElement.src = `${imagePath}.png`;
                imageElement.onerror = () => {
                    imageElement.src = `${imagePath}.jpg`;
                };
            }

            buscarImagen(document.getElementById("foto-perfil"), ci);
            buscarImagen(document.getElementById("img-lg"), ci);
            buscarImagen(document.getElementById("img-sm"), ci);

            // Textos dinámicos
            const setText = (id, text) => {
                const el = document.getElementById(id);
                if (el) el.textContent = text;
            };

            setText("nombre-perfil", perfil.nombre);
            setText("bio-perfil", perfil.descripcion);
            setText("pref-color", perfil.color);
            setText("pref-libro", perfil.libro);
            setText("pref-musica", formatearLista(perfil.musica || []));
            setText("pref-videojuego", formatearLista(perfil.video_juego || []));
            const lenguajesDiv = document.getElementById("pref-lenguajes");
            if (lenguajesDiv) lenguajesDiv.innerHTML = `<b>${formatearLista(perfil.lenguajes || [])}</b>`;

            const emailLink = document.getElementById("email-perfil");
            if (emailLink) {
                emailLink.href = `mailto:${perfil.email}`;
                emailLink.textContent = perfil.email;
            }

            // Insertar etiquetas según idioma
            const setLabel = (id, text, isBold = false) => {
                const el = document.getElementById(id);
                if (el) el.innerHTML = isBold ? `<b>${text}</b>` : text;
            };

            setLabel("lbl-color", config.color);
            setLabel("lbl-libro", config.libro);
            setLabel("lbl-musica", config.musica);
            setLabel("lbl-videojuego", config.video_juego);
            setLabel("lbl-lenguajes", config.lenguajes, true);

            const contacto = document.getElementById("contacto-texto");
            if (contacto) {
                const emailHTML = `<a id="email-perfil" href="mailto:${perfil.email}">${perfil.email}</a>`;
                contacto.innerHTML = config.email.replace("[email]", emailHTML);
            }
            
        })
        .catch(error => {
            console.error("Error al cargar el perfil:", error);
            const infoContenedor = document.querySelector(".info-contenedor");
            if (infoContenedor) {
                infoContenedor.innerHTML = "<p>Error al cargar el perfil del estudiante.</p>";
            }
        });
}
