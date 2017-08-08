echo "Building gateway..."
cd gateway
docker build -t pranay/gateway .
cd ..

echo "Building exec..."
cd exec
docker build -t pranay/exec .
cd ..

echo "Bringing up environment..."
docker-compose up
