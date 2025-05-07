fetch("./conf/configES.json")
    .then(response => {
        if (!response.ok) throw new Error("Error al cargar configuración");
        return response.json(); 
    })
    .then(config => {
        console.log("Configuración cargada:", config);

        document.querySelector(".titulo").innerHTML = `
            ${config.sitio[0]}<span>${config.sitio[1]}</span> ${config.sitio[2]}
        `;
        document.querySelector(".texto-centro").textContent = config.saludo + ", ";
        document.querySelector('input[type="text"]').placeholder = config.nombre + "...";
        document.querySelector('input[type="submit"]').value = config.buscar;
        document.querySelector("footer").textContent = config.copyRight;
    })
    .catch(error => {
        console.error("Error:", error);
    });

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

            lista.appendChild(li);
        });
    })
    .catch(error => {
        console.error("Error al cargar estudiantes:", error);
    });

