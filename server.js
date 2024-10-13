import express from 'express';
import { existsSync, mkdirSync } from 'fs';
import fs from 'fs/promises'; // Use o módulo promises
import path from 'path';
import { format } from 'date-fns';
import { deleteImagesTimeOut } from './delete-files.js';

const app = express();
const port = 8080;
deleteImagesTimeOut();

app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ extended: true, limit: "200mb" }));

const dataDir = 'data'; // diretório para armazenar arquivos
if (!existsSync(dataDir)) {
  mkdirSync(dataDir);
}

// Endpoint para receber imagens
const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  // Formata a data para DD-MM-AA HH-MM-SS
  return format(date, 'dd-MM-yy HH-mm-ss');
};

// Endpoint para receber imagens
app.post('/upload-image', async (req, res) => {
  const { ip, image, timestamp } = req.body;

  if (!ip || !image || !timestamp) {
    return res.status(400).send({ message: 'IP, imagem e timestamp são obrigatórios.' });
  }

  // Cria o diretório para o IP se não existir
  const ipDir = path.join(dataDir, ip);
  if (!existsSync(ipDir)) {
    mkdirSync(ipDir, { recursive: true });
  }

  // Converte a imagem Base64 de volta para um Buffer
  const imageBuffer = Buffer.from(image, 'base64');

  // Usa o timestamp formatado na gravação
  const formattedTimestamp = formatDate(timestamp);
  const filePath = path.join(ipDir, `${formattedTimestamp}.png`);

  try {
    // Salva a imagem no servidor
    await fs.writeFile(filePath, imageBuffer);
    console.log(`Imagem recebida e salva: ${filePath}`);
    res.send({ message: 'Imagem enviada e salva com sucesso!', filePath });
  } catch (err) {
    console.error(`Erro ao salvar o arquivo: ${err}`);
    res.status(500).send({ message: 'Erro ao salvar o arquivo' });
  }
});



// Endpoint para salvar dados
app.post('/save-data', async (req, res) => {
  const data = req.body;
  const ip = data.ip; // extrai o IP do corpo da requisição
  console.log(data);
  const fileName = path.join(dataDir, ip, `${ip}.json`); // Salva na pasta do IP

  try {
    // Tenta ler o arquivo existente
    let existingData;
    if (existsSync(fileName)) {
      existingData = await fs.readFile(fileName, 'utf-8'); // Use fs.promises
    }

    // Se o arquivo não existir, cria um novo
    const newData = existingData ? JSON.parse(existingData) : [];
    newData.push(data);

    // Salva os dados no arquivo
    await fs.writeFile(fileName, JSON.stringify(newData, null, 2)); // Use fs.promises
    console.log(`Arquivo salvo: ${fileName}`);
    res.send({ message: 'Dados salvos com sucesso' });
  } catch (error) {
    console.error(`Erro ao salvar o arquivo: ${error}`);
    res.status(500).send({ message: 'Erro ao salvar o arquivo' });
  }
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor ouvindo na porta ${port}`);
});
