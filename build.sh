read -p "Version (x.x.x): " version

docker build -t "quiz-web:v$version" .
