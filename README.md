This is a simple server that serves as the backend for drawDB. It has 2 functions:

1. Send bug reports via email
2. Handle interfacing with the GitHub REST API

### Getting Started

Set up the environment variables by following `.env.sample`

```bash
git clone https://github.com/drawdb-io/drawdb-server.git
cd drawdb-server
npm install
npm start
```

### Docker Compose run in dev

```bash
docker compose up -d
```