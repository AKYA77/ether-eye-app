# Dockerfile

# First stage: Build the Rust application
FROM rust:latest AS builder

WORKDIR /usr/src/app
COPY . .

# Build for release
RUN cargo build --release


# Second stage: Setup runtime environment
FROM debian:slim

# Install OpenSSL
RUN apt-get update && apt-get install -y openssl && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy the Rust binary and static files from the builder stage
COPY --from=builder /usr/src/app/target/release/your_binary_name /usr/local/bin/your_binary_name
COPY --from=builder /usr/src/app/static /usr/local/bin/static

# Set runtime environment variables if needed
# ENV SOME_VAR=value

# Expose the application port
EXPOSE 8080

# Run the application
CMD ["/usr/local/bin/your_binary_name"]