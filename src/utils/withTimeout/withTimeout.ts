/** Rejects with a labeled error when the promise does not settle within `timeoutMs`. */
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number, label: string) =>
  new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`${label} timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    promise
      .then((value) => {
        clearTimeout(timeoutId);
        resolve(value);
      })
      .catch((error: unknown) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });

export { withTimeout };
