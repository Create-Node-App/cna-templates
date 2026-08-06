export const doSomething = async (value: string): Promise<void> => {
  // This is a mock implementation
  // In a real app, this would make an API call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (value.length > 0) {
        resolve();
      } else {
        reject(new Error('Value cannot be empty'));
      }
    }, 1000);
  });
};
