import fs from 'fs/promises'; // Use o módulo promises
import path from 'path';
import { existsSync, mkdirSync } from 'fs';

const dataDir = 'data'; // diretório para armazenar arquivos
if (!existsSync(dataDir)) {
  mkdirSync(dataDir);
}

// Função para apagar imagens
const deleteImages = async () => {
  try {
    const ipDirs = await fs.readdir(dataDir); // Pega os diretórios de IPs
    for (const ipDir of ipDirs) {
      const fullPath = path.join(dataDir, ipDir);
      const files = await fs.readdir(fullPath); // Pega todos os arquivos de imagem
      for (const file of files) {
        const filePath = path.join(fullPath, file);
        if (file.endsWith('.png')) {
          await fs.unlink(filePath); // Apaga o arquivo
          console.log(`Imagem deletada: ${filePath}`);
        }
      }
    }
  } catch (err) {
    console.error(`Erro ao deletar imagens: ${err}`);
  }
};

// Executa a função de deletar imagens a cada 1 minuto (60000 ms)
const deleteImagesTimeOut = () => setInterval(deleteImages, 60000);

export { deleteImagesTimeOut };