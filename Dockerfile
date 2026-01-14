# Use lightweight Java
FROM eclipse-temurin:21-jdk-alpine

# Set working directory
WORKDIR /app

# Copy build files
COPY . .

# Build the app
RUN ./mvnw clean package -DskipTests

# Expose Render port
EXPOSE 8080

# Run app
CMD ["java", "-jar", "target/*.jar"]