// Extension Types and Utilities
export * from './extensionTypes';

// Re-export specific utilities for convenience
export { 
    REGISTRATION_STATUS,
    EXTENSION_STATUS,
    formatCurrency,
    formatDate,
    validateExtensionRequest,
    hasPendingExtension,
    getStatusIcon,
    getStatusColor
} from './extensionTypes';