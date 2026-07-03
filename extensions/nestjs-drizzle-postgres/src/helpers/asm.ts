import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';

let secretsManagerClient: SecretsManagerClient;

export const getSecretsManagerClient = () => {
  if (!secretsManagerClient) {
    secretsManagerClient = new SecretsManagerClient({ region: process.env.AWS_REGION });
  }
  return secretsManagerClient;
};

export const getSecretValue = async (secretName: string) => {
  const client = getSecretsManagerClient();
  const command = new GetSecretValueCommand({
    SecretId: secretName,
    // VersionStage defaults to AWSCURRENT if unspecified
    VersionStage: 'AWSCURRENT',
  });
  const response = await client.send(command);
  return response.SecretString;
};
