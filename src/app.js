const express = require('express');
const cors = require('cors');

const { uuid } = require('uuidv4');

const githubRegex = /http(s)?:\/\/github\.com\/(\w+)\/(\w+)/;

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

app.get('/repositories', (request, response) => {
  return response.json(repositories);
});

app.post('/repositories', (request, response) => {
  const { title, url, techs } = request.body;

  if (!githubRegex.test(url)) {
    return response.status(400).json({
      message: "'url' is not a github repository",
    });
  }

  const repository = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0,
  };

  repositories.push(repository);

  return response.json(repository);
});

app.put('/repositories/:id', (request, response) => {
  const repositoryIndex = repositories.findIndex(
    (repo) => repo.id === request.params.id
  );

  if (repositoryIndex < 0) {
    return response.status(400).json({
      message: 'Repository not found',
    });
  }

  const repository = repositories[repositoryIndex];

  const { title, url, techs } = request.body;

  if (title) {
    repository.title = title;
  }

  if (url && githubRegex.test(url)) {
    repository.url = url;
  }

  if (techs && Array.isArray(techs) && techs.length > 0) {
    repository.techs = techs;
  }

  repositories[repositoryIndex] = repository;

  return response.json(repository);
});

app.delete('/repositories/:id', (request, response) => {
  const repositoryIndex = repositories.findIndex(
    (repo) => repo.id === request.params.id
  );

  if (repositoryIndex < 0) {
    return response.status(400).json({
      message: 'Repository not found',
    });
  }

  repositories.splice(repositoryIndex, 1);

  return response.status(204).send();
});

app.post('/repositories/:id/like', (request, response) => {
  const repositoryIndex = repositories.findIndex(
    (repo) => repo.id === request.params.id
  );

  if (repositoryIndex < 0) {
    return response.status(400).json({
      message: 'Repository not found',
    });
  }

  const repository = repositories[repositoryIndex];

  repository.likes += 1;

  repositories[repositoryIndex] = repository;

  return response.json({
    likes: repository.likes,
  });
});

module.exports = app;
