if [ "$1" = "clean" ]
then
    echo "Building gateway..."
    cd gateway
    docker build -t pranay/gateway .
    cd ..

    echo "Building exec..."
    cd exec
    docker build -t pranay/exec .
    cd ..

    echo "Building ui..."
    cd ui
    docker build -t pranay/ui .
    cd ..
fi

echo "Bringing up environment..."
docker-compose up
