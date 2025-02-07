document.getElementById("cepForm").addEventListener("submit", async function (e) {
    e.preventDefault();
  
    const cep = document.getElementById("cep").value.trim();
    const resultadoDiv = document.getElementById("resultado");
  
    resultadoDiv.innerHTML = "";
  
    if (!/^\d{8}$/.test(cep)) {
      resultadoDiv.innerHTML = `<p style="color: red;">Por favor, insira um CEP válido (8 dígitos).</p>`;
      return;
    }
  
    try {
      const response = await fetch(`/consultar/${cep}`);
      const data = await response.json();
  
      if (data.error) {
        resultadoDiv.innerHTML = `<p style="color: red;">${data.error}</p>`;
      } else {
        const enderecoCompleto = `${data.logradouro || ""}, ${data.bairro || ""}, ${data.localidade || ""}, ${data.uf || ""}`;
        const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(enderecoCompleto)}`;
  
        resultadoDiv.innerHTML = `
            <p><strong>CEP:</strong> ${data.cep}</p>
            <p><strong>Logradouro:</strong> ${data.logradouro || "Não disponível"}</p>
            <p><strong>Bairro:</strong> ${data.bairro || "Não disponível"}</p>
            <p><strong>Cidade:</strong> ${data.localidade}</p>
            <p><strong>Estado:</strong> ${data.uf}</p>
            
            <a href="${googleMapsLink}" target="_blank" class="btn-maps">Abrir no Google Maps</a>

            <style>
                .btn-maps {
                    display: inline-block;
                    margin-top: 10px;
                    padding: 10px 20px;
                    background-color: #0072c6;
                    color: #ffffff;
                    text-decoration: none;
                    border-radius: 5px;
                    font-weight: bold;
                    transition: background-color 0.3s ease;
                }
                
                .btn-maps:hover {
                    background-color: #005ba1;
                }
            </style>
        `;
      }
    } catch (error) {
      resultadoDiv.innerHTML = `<p style="color: red;">Erro ao consultar o CEP. Tente novamente mais tarde.</p>`;
    }
});
  