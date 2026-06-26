export function isRecoverablePrismaConnectionError(error: unknown) {
  if (typeof error !== 'object' || error === null) {
    return false;
  }

  const errorLike = error as {
    code?: string;
    name?: string;
    message?: string;
  };

  const message = errorLike.message?.toLowerCase() || '';

  return (
    errorLike.code === 'P1017' ||
    errorLike.code === 'P2021' ||
    errorLike.name === 'PrismaClientInitializationError' ||
    message.includes('server has closed the connection') ||
    message.includes('database server has closed the connection')
  );
}
