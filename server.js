import readline from "readline";
import fetch from "node-fetch";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

rl.question("Qual CEP deseja procurar? ", async (cepDigitado) => {
    // Verifica se o CEP é válido (somente números e com 8 dígitos)
    if (!/^\d{8}$/.test(cepDigitado)) {
      console.log("Por favor, insira um CEP válido com 8 dígitos. Exemplo: 01001000");
      rl.close();
      return;
    }
  
    try {
      // Monta a URL para a API do ViaCEP
      const url = `https://viacep.com.br/ws/${cepDigitado}/json/`;
  
      // Faz a requisição para a API
      const response = await fetch(url);
      const data = await response.json();
  
      // Exibe o resultado
      if (data.erro) {
        console.log("CEP não encontrado.");
      } else {
        console.log("Resultado da consulta:");
        console.log(data);
      }
    } catch (error) {
      console.error("Erro ao consultar o CEP:", error.message);
    } finally {
      rl.close();
    }
  });