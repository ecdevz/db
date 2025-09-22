import { ConnectionStatus, OperationResult } from '../types';

describe('Types and Interfaces', () => {
  describe('ConnectionStatus', () => {
    it('should have correct enum values', () => {
      expect(ConnectionStatus.DISCONNECTED).toBe('disconnected');
      expect(ConnectionStatus.CONNECTING).toBe('connecting');
      expect(ConnectionStatus.CONNECTED).toBe('connected');
      expect(ConnectionStatus.RECONNECTING).toBe('reconnecting');
      expect(ConnectionStatus.ERROR).toBe('error');
    });
  });

  describe('OperationResult', () => {
    it('should create successful operation result', () => {
      const result: OperationResult<string> = {
        success: true,
        data: 'test data'
      };

      expect(result.success).toBe(true);
      expect(result.data).toBe('test data');
    });

    it('should create failed operation result', () => {
      const error = new Error('Test error');
      const result: OperationResult<string> = {
        success: false,
        error: error,
        message: 'Operation failed'
      };

      expect(result.success).toBe(false);
      expect(result.error).toBe(error);
      expect(result.message).toBe('Operation failed');
    });
  });
});