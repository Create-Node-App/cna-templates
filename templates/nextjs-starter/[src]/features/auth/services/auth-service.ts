interface LoginCredentials {
  email: string;
  password: string;
}

export const login = async (credentials: LoginCredentials): Promise<void> => {
  // This is a mock implementation
  // In a real app, this would make an API call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (credentials.email === 'test@example.com' && credentials.password === 'password') {
        resolve();
      } else {
        reject(new Error('Invalid credentials'));
      }
    }, 1000);
  });
};
