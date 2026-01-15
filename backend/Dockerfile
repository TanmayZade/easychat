FROM eclipse-temurin:21-jdk-alpine

WORKDIR /app

COPY pom.xml mvnw ./
COPY .mvn .mvn
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline

# Copy source
COPY src src

# Build app
RUN ./mvnw clean package -DskipTests

# Expose port
EXPOSE 8080

# Run Spring Boot on Render's assigned port
CMD ["sh", "-c", "java -Dspring.main.lazy-initialization=true -Dserver.port=$PORT -jar target/*.jar"]
