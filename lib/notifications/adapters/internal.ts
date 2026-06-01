import { NotificationAdapter, AdapterSendResult } from '../types';

export class InternalAdapter implements NotificationAdapter {
  async send(recipient: string, message: string): Promise<AdapterSendResult> {
    // Internal system log skeleton.
    console.log(`[INTERNAL] System dispatch log registered to: ${recipient}`);

    return {
      success: true,
      sentAt: new Date(),
    };
  }
}

export const internalAdapter = new InternalAdapter();
