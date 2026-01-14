FROM eclipse-temurin:21-jdk-alpine

WORKDIR /app

# Copy only required files first (better caching)
COPY pom.xml mvnw ./
COPY .mvn .mvn
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline

# Copy source
COPY src src

# Build app
RUN ./mvnw clean package -DskipTests

# Expose Render port
EXPOSE 8080

# Run the jar (Spring Boot produces ONE jar)
CMD ["sh", "-c", "java -jar target/*.jar"]
