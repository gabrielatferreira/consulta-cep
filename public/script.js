document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("cepForm");
    const cepInput = document.getElementById("cep");
    const resultadoDiv = document.getElementById("resultado");
    const cache = new Map();
    let buscandoCep = false;

    cepInput.setAttribute("autocomplete", "off");

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        if (buscandoCep) return;
        buscandoCep = true;
        
        const cep = cepInput.value.trim();
        resultadoDiv.innerHTML = "";

        if (!/^\d{8}$/.test(cep)) {
            resultadoDiv.textContent = "Por favor, insira um CEP válido (8 dígitos numéricos).";
            resultadoDiv.classList.add("error-msg");
            buscandoCep = false;
            return;
        }

        if (cache.has(cep)) {
            exibirResultado(cache.get(cep));
            buscandoCep = false;
            return;
        }

        try {
            resultadoDiv.innerHTML = `<p class="loading">Buscando informações...</p>`;
            
            const response = await fetch(`/consultar/${encodeURIComponent(cep)}`, {
                method: "GET",
                headers: {
                    "Accept": "application/json",
                }
            });

            if (!response.ok) throw new Error("Erro ao consultar o CEP.");
            
            const data = await response.json();

            if (data.error) {
                resultadoDiv.textContent = data.error;
                resultadoDiv.classList.add(error-msg);
            } else {
                cache.set(cep, data);
                exibirResultado(data);
            }
        } catch (error) {
            resultadoDiv.textContent = "Erro ao consultar o CEP. Tente novamente mais tarde.";
            resultadoDiv.classList.add("error-msg");
        } finally {
            buscandoCep = false;
        }
    });

    function exibirResultado(data) {
        const enderecoCompleto = `${data.logradouro || ""}, ${data.bairro || ""}, ${data.localidade || ""}, ${data.uf || ""}`;
        const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(enderecoCompleto)}`;

        resultadoDiv.innerHTML = "";

        const resultadoHTML = document.createElement("div");

        resultadoHTML.innerHTML = `
            <p><strong>CEP:</strong> <span>${escapeHTML(data.cep)}</span></p>
            <p><strong>Logradouro:</strong> <span>${escapeHTML(data.logradouro || "Não disponível")}</span></p>
            <p><strong>Bairro:</strong> <span>${escapeHTML(data.bairro || "Não disponível")}</span></p>
            <p><strong>Cidade:</strong> <span>${escapeHTML(data.localidade)}</span></p>
            <p><strong>Estado:</strong> <span>${escapeHTML(data.uf)}</span></p>
            <a href="${googleMapsLink}" target="_blank" rel="noopener noreferrer" class="btn-maps">Abrir no Google Maps</a>
        `;
        
        resultadoDiv.appendChild(resultadoHTML);
    }

    function escapeHTML(str) {
        return str.replace(/[&<>"']/g, function(match) {
            const escapeChars = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
            return escapeChars[match];
        });
    }
});
  