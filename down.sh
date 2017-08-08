docker stop -t=0 `docker ps -aq`
docker rm `docker ps -aq`
docker rmi $(docker images -a | grep "^<none>" | awk '{print $3}')
