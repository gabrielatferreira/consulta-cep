document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("cepForm");
    const cepInput = document.getElementById("cep");
    const resultadoDiv = document.getElementById("resultado");
    const cache = new Map();

    form.addEventListener("submit", async function (e) {
        e.preventDefault();
        
        const cep = cepInput.value.trim();
        resultadoDiv.innerHTML = "";

        if (!/^\d{8}$/.test(cep)) {
            resultadoDiv.innerHTML = `<p class="error-msg">Por favor, insira um CEP válido (8 dígitos).</p>`;
            return;
        }

        if (cache.has(cep)) {
            return exibirResultado(cache.get(cep));
        }

        try {
            resultadoDiv.innerHTML = `<p class="loading">Buscando informações...</p>`;
            const response = await fetch(`/consultar/${cep}`);
            const data = await response.json();

            if (data.error) {
                resultadoDiv.innerHTML = `<p class="error-msg">${data.error}</p>`;
            } else {
                cache.set(cep, data);
                exibirResultado(data);
            }
        } catch (error) {
            resultadoDiv.innerHTML = `<p class="error-msg">Erro ao consultar o CEP. Tente novamente mais tarde.</p>`;
        }
    });

    function exibirResultado(data) {
        const enderecoCompleto = `${data.logradouro || ""}, ${data.bairro || ""}, ${data.localidade || ""}, ${data.uf || ""}`;
        const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(enderecoCompleto)}`;

        resultadoDiv.innerHTML = `
            <p><strong>CEP:</strong> ${data.cep}</p>
            <p><strong>Logradouro:</strong> ${data.logradouro || "Não disponível"}</p>
            <p><strong>Bairro:</strong> ${data.bairro || "Não disponível"}</p>
            <p><strong>Cidade:</strong> ${data.localidade}</p>
            <p><strong>Estado:</strong> ${data.uf}</p>
            <a href="${googleMapsLink}" target="_blank" class="btn-maps">Abrir no Google Maps</a>
        `;
    }
});
  