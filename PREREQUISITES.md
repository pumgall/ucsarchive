docker run -d --name mongodb --restart always -v $HOME/mongodb:/data/db -p 27017:27017 mongo:4.2
