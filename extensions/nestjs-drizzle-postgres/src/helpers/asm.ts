import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';
let secretsManagerClient: SecretsManagerClient;
export const getSecretsManagerClient = () => {
  if (!secretsManagerClient) {
    secretsManagerClient = new SecretsManagerClient({ region: 'us-east-1' });
  }
  return secretsManagerClient;
};
export const getSecretValue = async (secretName: string) => {
  const client = getSecretsManagerClient();
  try {
    const command = new GetSecretValueCommand({
      SecretId: secretName,
      // VersionStage defaults to AWSCURRENT if unspecified
      VersionStage: 'AWSCURRENT',
    });
    const response = await client.send(command);
    return response.SecretString;
  } catch (error) {
    // For a list of exceptions thrown, see
    // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
    throw error;
  }
};
