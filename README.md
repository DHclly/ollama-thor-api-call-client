# ollama api client


## Docker

```
docker stop ollama-api-client
docker rm ollama-api-client
docker build --tag dhclly/ollama-api-client:v2 .
docker run -d -p 5046:80 -p 11434:11434 --hostname=ollama-api-client --name ollama-api-client  --network=ollama-network dhclly/ollama-api-client:v2
```