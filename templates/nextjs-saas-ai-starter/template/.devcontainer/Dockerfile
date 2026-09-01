# Next.js SaaS AI Template Development Container
# Based on Node.js 22 LTS (Debian Bookworm)

FROM mcr.microsoft.com/devcontainers/javascript-node:1-22-bookworm

# Install pnpm globally
RUN npm install -g pnpm@9

# Install additional tools including direnv
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
        # PostgreSQL client for database operations
        postgresql-client \
        # direnv for automatic environment loading
        direnv \
        # Useful utilities
        jq \
        curl \
        wget \
        unzip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install MinIO client (mc) for bucket management
RUN curl -fsSL https://dl.min.io/client/mc/release/linux-amd64/mc -o /usr/local/bin/mc \
    && chmod +x /usr/local/bin/mc

# Install AWS CLI v2
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" \
    && unzip awscliv2.zip \
    && ./aws/install \
    && rm -rf aws awscliv2.zip

# Set pnpm environment
ENV PNPM_HOME="/home/node/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Create necessary directories for node user with proper permissions
# This includes direnv data directory and pnpm home
RUN mkdir -p /home/node/.local/share/direnv \
    && mkdir -p /home/node/.local/share/pnpm \
    && chown -R node:node /home/node/.local

# Configure direnv hook for bash and zsh
RUN echo 'eval "$(direnv hook bash)"' >> /home/node/.bashrc \
    && echo 'eval "$(direnv hook zsh)"' >> /home/node/.zshrc || true

# Switch to non-root user
USER node

# Set working directory
WORKDIR /workspaces

# Health check for the dev container (keeps container healthy signal alive)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node --version || exit 1
