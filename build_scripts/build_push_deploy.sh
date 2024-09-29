cd ..

docker buildx build --platform linux/amd64,linux/arm64 . -t wdoyle123/tescodle:1.2 --push --no-cache

cd manifests

kubectl delete -f .
kubectl apply -f .

