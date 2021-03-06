echo "Stopping all containers..."
docker-compose down
docker stop -t=0 `docker ps -aq`

echo "Removing stale containers..."
docker rm `docker ps -aq`

if [ "$1" = "clean" ]
then
    echo "Removing untagged images..."
    docker rmi $(docker images -a | grep "^<none>" | awk '{print $3}')
fi
