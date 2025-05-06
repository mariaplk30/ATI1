fetch("./conf/configES.json")
    .then(response => {
        if (!response.ok) throw new Error("Error al cargar configuración");
        return response.json(); 
    })
    .then(config => {
        console.log("Configuración cargada:", config);

        document.querySelector(".titulo").innerHTML = `
            ${config.sitio[0]} <span>${config.sitio[1]}</span> ${config.sitio[2]}
        `;
        document.querySelector(".texto-centro").textContent = config.saludo + ", ";
        document.querySelector('input[type="text"]').placeholder = config.nombre + "...";
        document.querySelector('input[type="submit"]').value = config.buscar;
        document.querySelector("footer").textContent = config.copyRight;
    })
    .catch(error => {
        console.error("Error:", error);
    });
