echo "Stopping all containers..."
docker stop -t=0 `docker ps -aq`

echo "Removing stale containers..."
docker rm `docker ps -aq`

echo "Removing untagged images..."
docker rmi $(docker images -a | grep "^<none>" | awk '{print $3}')
