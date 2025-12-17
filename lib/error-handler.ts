// Error types for better error handling
export enum SolanaErrorType {
  INSUFFICIENT_BALANCE = "INSUFFICIENT_BALANCE",
  TRANSACTION_FAILED = "TRANSACTION_FAILED",
  WALLET_NOT_CONNECTED = "WALLET_NOT_CONNECTED",
  USER_REJECTED = "USER_REJECTED",
  NETWORK_ERROR = "NETWORK_ERROR",
  UNKNOWN = "UNKNOWN",
}

export interface SolanaError {
  type: SolanaErrorType
  message: string
  originalError?: Error
}

export function parseSolanaError(error: unknown): SolanaError {
  if (error instanceof Error) {
    const message = error.message.toLowerCase()

    // Check for insufficient balance
    if (message.includes("insufficient") || message.includes("balance")) {
      return {
        type: SolanaErrorType.INSUFFICIENT_BALANCE,
        message: "Insufficient balance for this transaction",
        originalError: error,
      }
    }

    // Check for user rejection
    if (message.includes("user rejected") || message.includes("user cancelled")) {
      return {
        type: SolanaErrorType.USER_REJECTED,
        message: "Transaction was cancelled",
        originalError: error,
      }
    }

    // Check for network errors
    if (message.includes("network") || message.includes("timeout") || message.includes("fetch")) {
      return {
        type: SolanaErrorType.NETWORK_ERROR,
        message: "Network error. Please check your connection and try again",
        originalError: error,
      }
    }

    // Check for transaction failures
    if (message.includes("transaction") || message.includes("simulate")) {
      return {
        type: SolanaErrorType.TRANSACTION_FAILED,
        message: "Transaction failed. Please try again with different settings",
        originalError: error,
      }
    }

    return {
      type: SolanaErrorType.UNKNOWN,
      message: error.message || "An unknown error occurred",
      originalError: error,
    }
  }

  return {
    type: SolanaErrorType.UNKNOWN,
    message: "An unknown error occurred",
  }
}

export function getUserFriendlyError(error: unknown): string {
  const solanaError = parseSolanaError(error)
  return solanaError.message
}
